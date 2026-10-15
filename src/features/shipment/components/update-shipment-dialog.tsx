"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Package,
  Edit,
  Truck,
  Check,
  AlertTriangle,
  RotateCcw,
  Send,
  XCircle,
  UploadCloud,
  Trash2,
  Plus,
  Pencil,
} from "lucide-react";
import {
  shipmentService,
  type ShipmentDto,
  type CargoItemDto,
  type UpdateShipmentRequest,
} from "@/api/services/shipment.service";
import { documentUploadService, buildPresignedPutHeaders } from "@/api/services/document-upload.service";
import { toast } from "sonner";
import { toApiError } from "@/lib/api-error";

interface UpdateShipmentDialogProps {
  shipment: ShipmentDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (updatedShipment: ShipmentDto) => void;
  initialTab?: "general" | "cargo" | "status";
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  Created: ["Submitted", "Cancelled"],
  Draft: ["Submitted", "Cancelled"],
  Submitted: ["Planning", "Cancelled"],
  Planning: ["Confirmed", "Negotiating", "Cancelled"],
  Negotiating: ["Confirmed", "Cancelled"],
  Confirmed: ["PickedUp", "Cancelled"],
  PickedUp: ["InTransit", "Cancelled"],
  InTransit: ["CustomsProcessing", "Delivered", "Cancelled"],
  CustomsProcessing: ["InTransit", "Delivered", "Cancelled"],
  Delivered: ["Completed"],
  Completed: [],
  Cancelled: [],
};

export function UpdateShipmentDialog({
  shipment,
  open,
  onOpenChange,
  onUpdated,
  initialTab = "general",
}: UpdateShipmentDialogProps) {
  if (!shipment) return null;

  const [activeSubTab, setActiveSubTab] = useState<"general" | "cargo" | "status">(initialTab);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize active tab when opened with specific initialTab
  React.useEffect(() => {
    if (open && initialTab) {
      setActiveSubTab(initialTab);
    }
  }, [open, initialTab]);

  // Cargo Management State
  const [cargoItems, setCargoItems] = useState<CargoItemDto[]>(shipment.cargoItems || []);
  const [isCargoFormOpen, setIsCargoFormOpen] = useState(false);
  const [editingCargoId, setEditingCargoId] = useState<string | null>(null);
  const [cargoName, setCargoName] = useState("");
  const [cargoQuantity, setCargoQuantity] = useState(1);
  const [cargoWeightKg, setCargoWeightKg] = useState(100);
  const [cargoHsCode, setCargoHsCode] = useState("");
  const [isSubmittingCargo, setIsSubmittingCargo] = useState(false);

  React.useEffect(() => {
    if (open && shipment) {
      setCargoItems(shipment.cargoItems || []);
      setCustomerName(shipment.customerName || "");
      setDestinationAddress(shipment.destinationAddress || "");
      setPriority(shipment.priority || "Normal");
      setTransportMode(shipment.transportMode || "Road");
      setNotes(shipment.notes || "");
      setLicensePlate(shipment.vehicleId || shipment.assignedVehicleId || "");
      const vDocs = (shipment.documents || []).filter(
        (d): d is typeof d & { id: string } =>
          Boolean(d.id && (d.documentType === "VehiclePhoto" || d.documentType === "6"))
      );
      setPhotoItems(
        vDocs.map((d) => ({
          id: d.id,
          documentId: d.id,
          previewUrl: d.storageUrl || "",
        }))
      );
      setUploadedDocIds(vDocs.map((d) => d.id));
    }
  }, [open, shipment]);

  const isDeparted = [
    "PickedUp",
    "InTransit",
    "CustomsProcessing",
    "CustomsCleared",
    "Delivered",
    "Completed",
    "Cancelled",
  ].includes(shipment.status || "");

  // Form State
  const [customerName, setCustomerName] = useState(shipment.customerName || "");
  const [destinationAddress, setDestinationAddress] = useState(
    shipment.destinationAddress || ""
  );
  const [priority, setPriority] = useState(shipment.priority || "Normal");
  const [transportMode, setTransportMode] = useState(
    shipment.transportMode || "Road"
  );
  const [notes, setNotes] = useState(shipment.notes || "");

  // Vehicle & Photo State
  const [licensePlate, setLicensePlate] = useState(
    shipment.vehicleId || shipment.assignedVehicleId || ""
  );
  type PhotoItem = {
    id: string;
    file?: File;
    previewUrl: string;
    documentId?: string;
  };
  const [photoItems, setPhotoItems] = useState<PhotoItem[]>(() => {
    return (shipment.documents || [])
      .filter(
        (d): d is typeof d & { id: string } =>
          Boolean(d.id && (d.documentType === "VehiclePhoto" || d.documentType === "6"))
      )
      .map((d) => ({
        id: d.id,
        documentId: d.id,
        previewUrl: d.storageUrl || "",
      }));
  });
  const [uploadedDocIds, setUploadedDocIds] = useState<string[]>(() => {
    return (shipment.documents || [])
      .filter(
        (d): d is typeof d & { id: string } =>
          Boolean(d.id && (d.documentType === "VehiclePhoto" || d.documentType === "6"))
      )
      .map((d) => d.id);
  });
  const [uploadProgressText, setUploadProgressText] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newItems: PhotoItem[] = files.map((file) => ({
      id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPhotoItems((prev) => [...prev, ...newItems]);
  };

  const handleRemovePhoto = (id: string) => {
    setPhotoItems((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item?.file) {
        URL.revokeObjectURL(item.previewUrl);
      }
      if (item?.documentId) {
        setUploadedDocIds((docIds) => docIds.filter((dId) => dId !== item.documentId));
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  // Status Action State
  const currentStatusNorm = shipment.status || "Draft";
  const allowedNext = ALLOWED_TRANSITIONS[currentStatusNorm] || ["Submitted", "Cancelled"];
  const [selectedStatus, setSelectedStatus] = useState(allowedNext[0] || currentStatusNorm);
  const [statusNote, setStatusNote] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const handleUpdateGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadProgressText("");
    try {
      const currentDocIds = [...uploadedDocIds];

      // Step 1: Upload any pending photos that haven't been uploaded yet
      const pendingPhotos = photoItems.filter((p) => !p.documentId && p.file);
      if (pendingPhotos.length > 0) {
        setUploadProgressText(`Đang tải lên ${pendingPhotos.length} ảnh phương tiện...`);
        for (let i = 0; i < pendingPhotos.length; i++) {
          const item = pendingPhotos[i];
          const fileName = item.file!.name;
          const mimeType = item.file!.type || "image/jpeg";
          const sizeBytes = item.file!.size;

          let storageUrl = "";
          let uploadSessionId = "";

          // 1a. Tạo upload session theo Object Key chuẩn của Shipment:
          // Format: tenants/{tenantId}/shipments/{shipmentId}/vehicles/{uploadId}_{fileName}
          try {
            setUploadProgressText(`Đang tạo phiên upload Cloudflare R2 cho ${fileName}...`);
            const session = await shipmentService.createUploadSession(shipment.id, {
              fileName,
              mimeType,
              fileSize: sizeBytes,
              category: "vehicles",
            });
            uploadSessionId = session.uploadId;

            // 1b. Đẩy file binary trực tiếp lên Cloudflare R2 qua Presigned PUT URL
            setUploadProgressText(`Đang tải tệp ${fileName} lên Cloudflare R2...`);
            let directPutSuccess = false;
            try {
              const putHeaders = buildPresignedPutHeaders(
                mimeType,
                session.requiredHeaders,
              );
              const putRes = await fetch(session.writeUrl, {
                method: "PUT",
                body: item.file!,
                headers: putHeaders,
              });
              if (putRes.ok) {
                directPutSuccess = true;
                storageUrl = session.storageReference;
              }
            } catch (putErr) {
              console.warn("Direct R2 PUT failed (CORS/network), trying direct upload via BFF relay:", putErr);
            }

            if (!directPutSuccess) {
              setUploadProgressText(`Đang tải tệp ${fileName} qua cổng BFF an toàn...`);
              const directRes = await shipmentService.uploadDirect(shipment.id, item.file!, "vehicles");
              storageUrl = directRes.storageReference || directRes.storageUrl;
              uploadSessionId = directRes.uploadId;
            }
          } catch (r2Err) {
            console.warn("Lỗi upload session, fallback to direct upload:", r2Err);
            try {
              const directRes = await shipmentService.uploadDirect(shipment.id, item.file!, "vehicles");
              storageUrl = directRes.storageReference || directRes.storageUrl;
              uploadSessionId = directRes.uploadId;
            } catch (relayErr) {
              storageUrl = `tenants/${shipment.tenantId || "default"}/shipments/${shipment.id}/vehicles/${Date.now()}_${encodeURIComponent(fileName)}`;
            }
          }

          const metaJson = JSON.stringify({
            licensePlate: licensePlate.trim(),
            isCurrentVehicle: true,
            assignedAt: new Date().toISOString(),
            uploadId: uploadSessionId || undefined,
            storageUrl,
          });

          const attachRes = await shipmentService.attachDocument(shipment.id, {
            fileName,
            documentType: "VehiclePhoto",
            storageUrl,
            ocrStatus: "NotRequired",
            extractedDataJson: metaJson,
          });

          const newDoc =
            attachRes?.documents?.find(
              (d) => Boolean(d.id && d.fileName === fileName && !currentDocIds.includes(d.id))
            ) || attachRes?.documents?.[attachRes.documents.length - 1];

          if (newDoc?.id) {
            currentDocIds.push(newDoc.id);
            item.documentId = newDoc.id;
            setUploadedDocIds([...currentDocIds]);
          }
        }
      }

      // Step 2: Assign vehicle and link documents
      if (licensePlate.trim()) {
        setUploadProgressText("Đang xác nhận phương tiện và liên kết ảnh...");
        try {
          await shipmentService.assignVehicle(shipment.id, {
            vehicleId: licensePlate.trim(),
            documentIds: currentDocIds,
          });
        } catch (assignErr: any) {
          const apiAssignErr = toApiError(assignErr);
          // If BE deployed endpoint not found yet, don't crash the entire update
          if (apiAssignErr.status === 404) {
            console.warn("Backend assign-vehicle endpoint not yet deployed on server:", apiAssignErr);
          } else {
            throw assignErr;
          }
        }
      }

      // Step 3: Update other general fields
      setUploadProgressText("Đang lưu thông tin chung...");
      const payload: UpdateShipmentRequest = {
        customerName: customerName.trim(),
        destinationAddress: destinationAddress.trim(),
        priority,
        transportMode,
        notes: notes.trim(),
      };

      const updated = await shipmentService.updateShipment(shipment.id, payload);
      toast.success("Cập nhật thông tin vận đơn & phương tiện thành công", {
        description: `Vận đơn ${shipment.shipmentNo || shipment.id} đã được lưu (Xe: ${licensePlate.trim() || "Chưa gán"}).`,
        duration: 4000,
      });

      if (onUpdated) {
        onUpdated({
          ...(updated || shipment),
          vehicleId: licensePlate.trim() || shipment.vehicleId,
          ...payload,
        });
      }
      onOpenChange(false);
    } catch (err) {
      const apiErr = toApiError(err);
      toast.error("Cập nhật thất bại", {
        description:
          apiErr.message ||
          "Đã giữ lại ảnh đã tải lên. Vui lòng kiểm tra lại thông tin và bấm Thử lại.",
        duration: 6000,
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgressText("");
    }
  };

  const handleApplyStatusChange = async () => {
    setIsSubmitting(true);
    try {
      let updated: ShipmentDto;
      if (selectedStatus === "Cancelled") {
        if (!cancelReason.trim()) {
          toast.warning("Vui lòng nhập lý do hủy vận đơn");
          setIsSubmitting(false);
          return;
        }
        updated = await shipmentService.cancelShipment(shipment.id, cancelReason.trim());
        toast.success("Đã hủy vận đơn", { description: cancelReason });
      } else if (selectedStatus === "Submitted" && (shipment.status === "Draft" || shipment.status === "Created")) {
        try {
          updated = await shipmentService.submitShipment(shipment.id);
        } catch (subErr) {
          const apiSubErr = toApiError(subErr);
          if (apiSubErr.message?.includes("locations") || apiSubErr.message?.includes("pickup")) {
            // Auto add default pickup and delivery locations if not yet added
            await shipmentService.addLocation(shipment.id, {
              type: "Pickup",
              name: "Origin Warehouse",
              address: shipment.originAddress || "San José Central Cargo Hub, Costa Rica",
              sequence: 1,
            }).catch(() => {});
            await shipmentService.addLocation(shipment.id, {
              type: "Delivery",
              name: "Destination Hub",
              address: shipment.destinationAddress || "Puerto Barrios Logistics Hub, Guatemala",
              sequence: 2,
            }).catch(() => {});
            updated = await shipmentService.submitShipment(shipment.id);
          } else {
            throw subErr;
          }
        }
        toast.success("Đã submit vận đơn thành công");
      } else {
        updated = await shipmentService.updateShipmentStatus(
          shipment.id,
          selectedStatus,
          statusNote.trim() || undefined
        );
        toast.success(`Đã chuyển trạng thái vận đơn sang ${selectedStatus}`);
      }

      if (onUpdated) onUpdated(updated || { ...shipment, status: selectedStatus });
      onOpenChange(false);
    } catch (err) {
      const apiErr = toApiError(err);
      toast.error("Thay đổi trạng thái thất bại", {
        description: apiErr.message || "Trạng thái không hợp lệ trong quy trình workflow.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartAddCargo = () => {
    setEditingCargoId(null);
    setCargoName("");
    setCargoQuantity(1);
    setCargoWeightKg(100);
    setCargoHsCode("");
    setIsCargoFormOpen(true);
  };

  const handleStartEditCargo = (item: CargoItemDto) => {
    setEditingCargoId(item.id || null);
    setCargoName(item.name || "");
    setCargoQuantity(item.quantity || 1);
    setCargoWeightKg(item.weightKg || 100);
    setCargoHsCode(item.hsCode || "");
    setIsCargoFormOpen(true);
  };

  const handleSaveCargo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cargoName.trim()) {
      toast.warning("Vui lòng nhập tên hàng hóa");
      return;
    }
    if (cargoQuantity <= 0) {
      toast.warning("Số lượng hàng hóa phải lớn hơn 0");
      return;
    }
    if (cargoWeightKg <= 0) {
      toast.warning("Khối lượng hàng hóa phải lớn hơn 0");
      return;
    }

    setIsSubmittingCargo(true);
    try {
      const payload = {
        name: cargoName.trim(),
        quantity: Number(cargoQuantity),
        weightKg: Number(cargoWeightKg),
        hsCode: cargoHsCode.trim() || undefined,
      };

      let updated: ShipmentDto;
      if (editingCargoId) {
        updated = await shipmentService.updateCargoItem(shipment.id, editingCargoId, payload);
        toast.success("Cập nhật mặt hàng thành công", {
          description: `Đã sửa: ${payload.name}`,
        });
      } else {
        updated = await shipmentService.addCargoItem(shipment.id, payload);
        toast.success("Thêm mặt hàng mới thành công", {
          description: `Đã thêm: ${payload.name} (${payload.quantity} kiện, ${payload.weightKg} kg)`,
        });
      }

      if (updated?.cargoItems) {
        setCargoItems(updated.cargoItems);
      } else {
        // Fallback optimistic update
        setCargoItems((prev) => {
          if (editingCargoId) {
            return prev.map((item) => (item.id === editingCargoId ? { ...item, ...payload } : item));
          }
          return [...prev, { id: `cargo-${Date.now()}`, ...payload }];
        });
      }

      setIsCargoFormOpen(false);
      if (onUpdated) onUpdated(updated || shipment);
    } catch (err) {
      const apiErr = toApiError(err);
      toast.error(editingCargoId ? "Cập nhật hàng hóa thất bại" : "Thêm hàng hóa thất bại", {
        description: apiErr.message || "Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmittingCargo(false);
    }
  };

  const handleRemoveCargo = async (itemId: string, itemName?: string) => {
    if (isDeparted) {
      toast.warning("Không thể xóa hàng hóa sau khi xe đã rời kho/cảng.");
      return;
    }

    try {
      const updated = await shipmentService.removeCargoItem(shipment.id, itemId);
      toast.success("Đã xóa mặt hàng khỏi chuyến hàng", {
        description: itemName ? `Mặt hàng "${itemName}" đã bị xóa.` : undefined,
      });

      if (updated?.cargoItems) {
        setCargoItems(updated.cargoItems);
      } else {
        setCargoItems((prev) => prev.filter((item) => item.id !== itemId));
      }

      if (onUpdated) onUpdated(updated || shipment);
    } catch (err) {
      const apiErr = toApiError(err);
      toast.error("Xóa hàng hóa thất bại", {
        description: apiErr.message || "Vui lòng kiểm tra lại trạng thái chuyến hàng.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl lg:max-w-3xl max-h-[92vh] overflow-y-auto p-6">
        <DialogHeader className="pb-2 border-b border-border/80">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <DialogTitle className="flex items-center gap-2.5 text-lg font-bold text-foreground">
                <Edit className="size-5 text-primary" />
                Cập nhật Vận đơn: {shipment.shipmentNo || shipment.id}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Chỉnh sửa thông tin vận chuyển, danh mục hàng hóa và quy trình trạng thái workflow.
              </DialogDescription>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">Trạng thái</span>
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200 shadow-xs">
                ● {shipment.status || "Draft"}
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex border-b border-border text-sm pt-1">
          <button
            type="button"
            className={`px-5 py-2.5 font-medium border-b-2 transition-colors ${
              activeSubTab === "general"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveSubTab("general")}
          >
            Thông tin chung & Giao nhận
          </button>
          <button
            type="button"
            className={`px-5 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeSubTab === "cargo"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveSubTab("cargo")}
          >
            <span>Hàng Hóa Vận Chuyển (Cargo)</span>
            <span className="px-1.5 py-0.2 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
              {cargoItems.length}
            </span>
          </button>
          <button
            type="button"
            className={`px-5 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeSubTab === "status"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveSubTab("status")}
          >
            <span>Quy trình & Trạng thái Workflow</span>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {shipment.status || "Draft"}
            </span>
          </button>
        </div>

        {activeSubTab === "general" && (
          <form onSubmit={handleUpdateGeneral} className="space-y-4 py-3 text-sm">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground text-xs">Tên Khách hàng / Doanh nghiệp *</label>
                <input
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground text-xs">Mã đơn hàng / PO</label>
                <input
                  disabled
                  value={shipment.orderId || "ORD-N/A"}
                  className="w-full rounded-lg border border-input bg-muted/60 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground text-xs">Địa chỉ nhận hàng (Destination) *</label>
              <input
                required
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                placeholder="Ví dụ: Puerto Barrios Terminal, Izabal, Guatemala"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground text-xs">Mức độ ưu tiên (Priority)</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="Normal">Normal (Bình thường)</option>
                  <option value="High">High (Ưu tiên cao)</option>
                  <option value="Urgent">Urgent (Khẩn cấp)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground text-xs">Phương thức vận chuyển</label>
                <select
                  value={transportMode}
                  onChange={(e) => setTransportMode(e.target.value as any)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="Road">Road (Đường bộ - OSRM Highway)</option>
                  <option value="Multimodal">Multimodal (Đa phương thức)</option>
                  <option value="Ocean">Ocean (Đường biển)</option>
                  <option value="Air">Air (Đường hàng không)</option>
                </select>
              </div>
            </div>

            {/* Section: Phương tiện vận chuyển & Đội xe */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wide uppercase">
                  <Truck className="size-4" />
                  <span>Phương tiện vận chuyển & Đội xe</span>
                </div>
                {licensePlate.trim() && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                    {licensePlate.trim()}
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground text-xs">
                  Biển số xe / Phương tiện (License Plate)
                </label>
                <div className="relative">
                  <Truck className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    placeholder="Ví dụ: 51C-889.12 hoặc TRUCK-REEFER-01"
                    className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Nhập biển số hoặc mã định danh của xe vận chuyển cho chuyến hàng này.
                </p>
              </div>

              {/* Upload ảnh chụp xe */}
              <div className="space-y-2">
                <label className="font-semibold text-foreground text-xs flex items-center justify-between">
                  <span>Ảnh chụp xe / Biển số thực tế (Vehicle Photos)</span>
                  <span className="text-[11px] font-normal text-muted-foreground">
                    {photoItems.length} ảnh đã chọn ({uploadedDocIds.length} đã lưu)
                  </span>
                </label>

                {/* Dropzone */}
                <label className="flex flex-col items-center justify-center w-full h-22 border-2 border-dashed border-input hover:border-primary/50 bg-background/60 hover:bg-background rounded-lg cursor-pointer transition-colors p-2 text-center">
                  <UploadCloud className="size-5 text-muted-foreground mb-1" />
                  <span className="text-xs font-medium text-foreground">
                    Kéo thả hoặc bấm để chọn ảnh chụp xe
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Hỗ trợ JPG, PNG, WEBP (Ảnh đầu kéo, thùng xe, biển số thực tế)
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {/* Thumbnails Preview Grid */}
                {photoItems.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                    {photoItems.map((item) => (
                      <div
                        key={item.id}
                        className="group relative aspect-video rounded-lg overflow-hidden border border-border bg-slate-100 shadow-xs flex items-center justify-center"
                      >
                        {/* Fallback Vehicle Badge if image is mock internal URL or fails to load */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center text-slate-400 bg-slate-100 z-0">
                          <Truck className="size-6 text-slate-400 mb-1" />
                          <span className="text-[10px] font-mono text-slate-600 truncate max-w-full px-1">
                            {licensePlate || "Vehicle Photo"}
                          </span>
                        </div>

                        {item.previewUrl && !item.previewUrl.includes("storage.aurora.internal") && (
                          <img
                            src={item.previewUrl}
                            alt="Vehicle"
                            className="relative z-10 w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(item.id)}
                          className="z-20 absolute top-1 right-1 size-5 rounded-full bg-black/60 hover:bg-destructive text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
                          title="Xóa ảnh này"
                        >
                          <Trash2 className="size-3" />
                        </button>
                        <div className="z-20 absolute bottom-0 inset-x-0 bg-black/60 px-1.5 py-0.5 text-[9px] text-white truncate text-center">
                          {item.documentId ? "✓ Đã tải lên" : "Chờ lưu"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground text-xs">Ghi chú vận chuyển (Notes)</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú thêm về yêu cầu nhiệt độ Reefer, chỉ dẫn giao nhận..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <RotateCcw className="size-4 animate-spin mr-2" />
                    {uploadProgressText || "Đang lưu..."}
                  </>
                ) : (
                  <>
                    <Check className="size-4 mr-2" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* CARGO TAB */}
        {activeSubTab === "cargo" && (
          <div className="space-y-4 py-3 text-sm">
            {/* Departure Warning Banner */}
            {isDeparted ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-4 flex items-start gap-3 text-amber-950 shadow-xs">
                <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-xs uppercase tracking-wide">
                    Hàng hóa đã khóa chỉnh sửa (Departure Locked)
                  </p>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Phương tiện vận tải đã nhận hàng và rời kho/cảng xuất phát (Trạng thái hiện tại:{" "}
                    <strong className="underline decoration-amber-400 font-extrabold">{shipment.status}</strong>).
                    Theo quy định logistics & niêm phong hải quan, danh mục hàng hóa không được phép sửa đổi hoặc xóa trong quá trình vận chuyển.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-xs">
                  <span className="text-muted-foreground block text-[11px]">Tổng số mặt hàng</span>
                  <span className="font-bold text-foreground">
                    {cargoItems.length} mặt hàng (
                    {cargoItems.reduce((acc, c) => acc + (Number(c.weightKg) || 0), 0).toLocaleString()} kg)
                  </span>
                </div>
                {!isCargoFormOpen && (
                  <Button
                    type="button"
                    size="sm"
                    className="gap-1.5 text-xs h-8"
                    onClick={handleStartAddCargo}
                  >
                    <Plus className="size-3.5" />
                    <span>Thêm mặt hàng mới</span>
                  </Button>
                )}
              </div>
            )}

            {/* Inline Add / Edit Form */}
            {isCargoFormOpen && !isDeparted && (
              <form
                onSubmit={handleSaveCargo}
                className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Package className="size-4" />
                    {editingCargoId ? "Chỉnh sửa mặt hàng" : "Thêm mặt hàng mới vào vận đơn"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCargoFormOpen(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Đóng
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground text-xs">
                    Tên mặt hàng / Tên sản phẩm *
                  </label>
                  <input
                    required
                    value={cargoName}
                    onChange={(e) => setCargoName(e.target.value)}
                    placeholder="Ví dụ: Thiết bị viễn thông & Bảng mạch điều khiển"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground text-xs">Số lượng *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={cargoQuantity}
                      onChange={(e) => setCargoQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground text-xs">Khối lượng (kg) *</label>
                    <input
                      type="number"
                      required
                      min={0.1}
                      step="any"
                      value={cargoWeightKg}
                      onChange={(e) => setCargoWeightKg(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                      className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground text-xs">Mã HS (Hải quan)</label>
                    <input
                      value={cargoHsCode}
                      onChange={(e) => setCargoHsCode(e.target.value)}
                      placeholder="VD: 8517.62"
                      className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-primary/20">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setIsCargoFormOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    disabled={isSubmittingCargo}
                  >
                    {isSubmittingCargo ? (
                      <>
                        <RotateCcw className="size-3 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Check className="size-3" />
                        {editingCargoId ? "Lưu thay đổi" : "Thêm mặt hàng"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* List of Cargo Items */}
            <div className="space-y-2">
              <span className="font-semibold text-xs text-foreground uppercase tracking-wide block">
                Danh sách các mặt hàng ({cargoItems.length}):
              </span>

              {cargoItems.length > 0 ? (
                <div className="divide-y divide-border border rounded-xl overflow-hidden bg-white shadow-2xs">
                  {cargoItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-3 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-blue-50 text-primary shrink-0 mt-0.5">
                          <Package className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-foreground truncate" title={item.name}>
                            {item.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground mt-0.5">
                            <span>
                              Số lượng: <strong className="text-foreground">{item.quantity}</strong>
                            </span>
                            <span>·</span>
                            <span>
                              Khối lượng:{" "}
                              <strong className="text-foreground font-mono">
                                {Number(item.weightKg).toLocaleString()} kg
                              </strong>
                            </span>
                            {item.hsCode && (
                              <>
                                <span>·</span>
                                <span className="font-mono text-slate-700 bg-slate-100 px-1 py-0.2 rounded text-[10px]">
                                  HS: {item.hsCode}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Item Actions */}
                      {!isDeparted ? (
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="size-7 p-0 text-slate-500 hover:text-primary"
                            onClick={() => handleStartEditCargo(item)}
                            title="Sửa mặt hàng này"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          {item.id && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="size-7 p-0 text-slate-400 hover:text-destructive"
                              onClick={() => handleRemoveCargo(item.id!, item.name)}
                              title="Xóa mặt hàng này"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                          🔒 Đã niêm phong
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center bg-slate-50/50 space-y-2">
                  <Package className="size-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold text-slate-700">Chưa có danh sách mặt hàng chi tiết</p>
                  <p className="text-[11px] text-muted-foreground">
                    Bấm &quot;Thêm mặt hàng mới&quot; ở trên để khai báo mã HS, số lượng và trọng lượng hàng hóa.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Đóng
              </Button>
            </DialogFooter>
          </div>
        )}

        {activeSubTab === "status" && (
          <div className="space-y-5 py-3 text-sm">
            <div className="rounded-xl border border-blue-200/90 bg-gradient-to-r from-blue-50/90 via-slate-50 to-indigo-50/70 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">TRẠNG THÁI HIỆN TẠI</span>
                  <div className="flex items-center gap-2.5 mt-1">
                    <span className="relative flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-600"></span>
                    </span>
                    <span className="text-xl font-bold text-slate-900 tracking-tight">
                      {shipment.status || "Draft"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium block">SHIPMENT NO</span>
                  <span className="font-mono text-sm font-bold text-slate-700">{shipment.shipmentNo || shipment.id}</span>
                </div>
              </div>
              <div className="text-xs text-slate-600 pt-3 border-t border-blue-100 flex items-center justify-between">
                <span className="font-medium text-slate-700">Bước chuyển hợp lệ tiếp theo: </span>
                {allowedNext.length > 0 ? (
                  <span className="font-mono font-semibold text-primary">{allowedNext.join(" ➔ ")}</span>
                ) : (
                  <span className="text-amber-700 font-medium">Trạng thái cuối (Đã hoàn thành / Hủy)</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-foreground text-xs block">
                Chuyển trạng thái quy trình:
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm font-medium focus:outline-none shadow-xs"
              >
                {allowedNext.map((st) => (
                  <option key={st} value={st}>
                    {st === "Submitted" && "1. Submitted (Gửi duyệt & xác thực Pickup/Delivery)"}
                    {st === "Planning" && "2. Planning (Bắt đầu lập lộ trình với OSRM/VROOM)"}
                    {st === "Negotiating" && "3. Negotiating (Đàm phán giá cước & nhà xe)"}
                    {st === "Confirmed" && "4. Confirmed (Đã xác nhận lộ trình & đối tác)"}
                    {st === "PickedUp" && "5. PickedUp (Xe đã nhận hàng tại kho xuất)"}
                    {st === "InTransit" && "6. InTransit (Đang vận chuyển trên hành lang)"}
                    {st === "CustomsProcessing" && "7. CustomsProcessing (Thông quan cửa khẩu)"}
                    {st === "Delivered" && "8. Delivered (Đã giao hàng tại điểm đích)"}
                    {st === "Completed" && "9. Completed (Hoàn tất toàn bộ chu trình)"}
                    {st === "Cancelled" && "Hủy vận đơn (Cancelled)"}
                  </option>
                ))}
                {/* Cho phép chọn lại tất cả nếu cần fallback */}
                <optgroup label="── Các trạng thái khác ──">
                  <option value="Draft">Draft (Bản nháp)</option>
                  <option value="Submitted">Submitted (Đã gửi phê duyệt)</option>
                  <option value="Planning">Planning (Đang lập lộ trình)</option>
                  <option value="Negotiating">Negotiating (Đàm phán giá cước)</option>
                  <option value="Confirmed">Confirmed (Đã xác nhận)</option>
                  <option value="PickedUp">PickedUp (Đã lấy hàng tại kho)</option>
                  <option value="InTransit">InTransit (Đang vận chuyển trên đường)</option>
                  <option value="CustomsProcessing">CustomsProcessing (Thông quan hải quan)</option>
                  <option value="Delivered">Delivered (Đã giao hàng)</option>
                  <option value="Completed">Completed (Hoàn thành)</option>
                  <option value="Cancelled">Cancelled (Hủy vận đơn)</option>
                </optgroup>
              </select>
            </div>

            {selectedStatus === "Cancelled" ? (
              <div className="space-y-1">
                <label className="font-semibold text-red-600 flex items-center gap-1">
                  <AlertTriangle className="size-3.5" />
                  Lý do hủy vận đơn *
                </label>
                <textarea
                  required
                  rows={2}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do khách hàng hủy hoặc vi phạm chính sách..."
                  className="w-full rounded-md border border-red-300 bg-red-50/40 p-2 text-xs focus:outline-none"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Ghi chú mốc thời gian (Note / Log)</label>
                <input
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Ví dụ: Xe đã rời trạm kiểm soát Paso Canoas..."
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>
            )}

            <DialogFooter className="pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button
                type="button"
                size="sm"
                variant={selectedStatus === "Cancelled" ? "destructive" : "default"}
                onClick={handleApplyStatusChange}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RotateCcw className="size-3.5 animate-spin mr-1.5" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Send className="size-3.5 mr-1.5" />
                    Xác nhận chuyển trạng thái
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
