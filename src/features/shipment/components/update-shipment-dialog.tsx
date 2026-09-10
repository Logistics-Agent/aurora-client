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
} from "lucide-react";
import {
  shipmentService,
  type ShipmentDto,
  type UpdateShipmentRequest,
} from "@/api/services/shipment.service";
import { toast } from "sonner";
import { toApiError } from "@/lib/api-error";

interface UpdateShipmentDialogProps {
  shipment: ShipmentDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (updatedShipment: ShipmentDto) => void;
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  Created: ["Submitted", "Cancelled"],
  Draft: ["Submitted", "Cancelled"],
  Submitted: ["Planning", "Cancelled"],
  Planning: ["Negotiating", "Cancelled"],
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
}: UpdateShipmentDialogProps) {
  if (!shipment) return null;

  const [activeSubTab, setActiveSubTab] = useState<"general" | "status">("general");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Status Action State
  const currentStatusNorm = shipment.status || "Draft";
  const allowedNext = ALLOWED_TRANSITIONS[currentStatusNorm] || ["Submitted", "Cancelled"];
  const [selectedStatus, setSelectedStatus] = useState(allowedNext[0] || currentStatusNorm);
  const [statusNote, setStatusNote] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const handleUpdateGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: UpdateShipmentRequest = {
        customerName: customerName.trim(),
        destinationAddress: destinationAddress.trim(),
        priority,
        transportMode,
        notes: notes.trim(),
      };

      const updated = await shipmentService.updateShipment(shipment.id, payload);
      toast.success("Cập nhật thông tin vận đơn thành công", {
        description: `Vận đơn ${shipment.shipmentNo || shipment.id} đã được cập nhật.`,
        duration: 4000,
      });
      if (onUpdated) onUpdated(updated || { ...shipment, ...payload });
      onOpenChange(false);
    } catch (err) {
      const apiErr = toApiError(err);
      toast.error("Cập nhật vận đơn thất bại", {
        description: apiErr.message || "Vui lòng kiểm tra lại thông tin.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="size-5 text-primary" />
            Cập nhật Vận đơn: {shipment.shipmentNo || shipment.id}
          </DialogTitle>
          <DialogDescription>
            Chỉnh sửa thông tin vận chuyển, tuyến giao hàng và quy trình trạng thái workflow.
          </DialogDescription>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex border-b border-border text-xs">
          <button
            type="button"
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
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
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeSubTab === "status"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveSubTab("status")}
          >
            Quy trình & Trạng thái Workflow
          </button>
        </div>

        {activeSubTab === "general" && (
          <form onSubmit={handleUpdateGeneral} className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Tên Khách hàng / Doanh nghiệp *</label>
                <input
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Mã đơn hàng / PO</label>
                <input
                  disabled
                  value={shipment.orderId || "ORD-N/A"}
                  className="w-full rounded-md border border-input bg-muted/60 px-2.5 py-1.5 text-xs text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Địa chỉ nhận hàng (Destination) *</label>
              <input
                required
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                placeholder="Ví dụ: Puerto Barrios Terminal, Izabal, Guatemala"
                className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Mức độ ưu tiên (Priority)</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  <option value="Normal">Normal (Bình thường)</option>
                  <option value="High">High (Ưu tiên cao)</option>
                  <option value="Urgent">Urgent (Khẩn cấp)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Phương thức vận chuyển</label>
                <select
                  value={transportMode}
                  onChange={(e) => setTransportMode(e.target.value as any)}
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  <option value="Road">Road (Đường bộ - OSRM Highway)</option>
                  <option value="Multimodal">Multimodal (Đa phương thức)</option>
                  <option value="Ocean">Ocean (Đường biển)</option>
                  <option value="Air">Air (Đường hàng không)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Ghi chú vận chuyển (Notes)</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú thêm về yêu cầu nhiệt độ Reefer, chỉ dẫn giao nhận..."
                className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <RotateCcw className="size-3.5 animate-spin mr-1.5" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Check className="size-3.5 mr-1.5" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {activeSubTab === "status" && (
          <div className="space-y-4 py-2 text-xs">
            <div className="rounded-lg border border-border bg-slate-50/70 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Trạng thái hiện tại:</span>
                <span className="font-semibold text-foreground bg-white px-2 py-0.5 rounded border">
                  {shipment.status}
                </span>
              </div>
              <div className="text-[11px] text-slate-600">
                <span className="font-medium text-slate-700">Bước chuyển hợp lệ tiếp theo: </span>
                {allowedNext.length > 0 ? (
                  <span className="font-mono text-primary">{allowedNext.join(" ➔ ")}</span>
                ) : (
                  <span className="text-amber-700">Trạng thái cuối (Đã đóng / Hủy)</span>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground block">
                Chuyển trạng thái quy trình:
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-md border border-input bg-white px-2.5 py-2 text-xs font-medium focus:outline-none"
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
