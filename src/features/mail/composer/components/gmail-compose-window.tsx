"use client";

import { useRef, useState } from "react";
import {
  Minus,
  Maximize2,
  Minimize2,
  X,
  Paperclip,
  Trash2,
  Send,
  Sparkles,
  Link as LinkIcon,
  FileText,
  Loader2,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { MailMailbox } from "../../types";
import type { RealAttachmentItem } from "../types";
import { RichTextEditor } from "./rich-text-editor";

export interface GmailComposeWindowProps {
  isOpen: boolean;
  onClose: () => void;
  mailboxes: readonly MailMailbox[];
  onSend: (message: {
    senderAddress: string;
    recipientAddresses: string[];
    ccAddresses?: string[];
    bccAddresses?: string[];
    subject: string;
    bodyText: string;
    bodyHtml: string;
    attachments?: RealAttachmentItem[];
  }) => Promise<void> | void;
}

type WindowState = "normal" | "maximized" | "minimized";

const LOGISTICS_LEAD_TEMPLATES = [
  {
    title: "📢 Chào giá cước vận tải biển (Ocean Freight Quotation)",
    subject: "Báo giá cước vận tải biển tuyến Châu Á - Bắc Mỹ | Aurora Freight",
    html: `<p>Kính gửi <strong>Quý Khách hàng / Đối tác</strong>,</p>
<p>Công ty Aurora Logistics xin trân trọng gửi tới Quý công ty bảng chào giá cước vận chuyển đường biển (FCL/LCL) tốt nhất trong tháng cho tuyến <strong>Việt Nam - Cảng Bờ Tây/Bờ Đông Hoa Kỳ</strong>:</p>
<ul>
  <li><strong>Cảng đi (POL):</strong> Cát Lái / Cái Mép (VNHCM)</li>
  <li><strong>Cảng đến (POD):</strong> Los Angeles (USLAX) / Long Beach (USLGB)</li>
  <li><strong>Giá cước tham khảo:</strong> $1,750 / 20'DC | $2,250 / 40'HC (All-in)</li>
  <li><strong>Thời gian vận chuyển (Transit time):</strong> 16 - 19 ngày</li>
  <li><strong>Miễn phí lưu bãi/vỏ (Free time):</strong> 14 ngày Demurrage/Detention tại cảng đến</li>
</ul>
<p>Chúng tôi cam kết đảm bảo chỗ và vỏ container ổn định trong mùa cao điểm. Rất mong có cơ hội được hợp tác cùng Quý công ty.</p>
<p>Trân trọng,<br/><strong>Phòng Dịch vụ Khách hàng & Sales</strong><br/>Aurora Logistics Network</p>`,
  },
  {
    title: "🤝 Giới thiệu dịch vụ Logistics trọn gói & Hải quan",
    subject: "Thư chào dịch vụ Forwarding & Thủ tục Hải quan trọn gói - Aurora Logistics",
    html: `<p>Kính gửi <strong>Ban Lãnh đạo / Phòng Xuất Nhập Khẩu</strong>,</p>
<p>Aurora Logistics là đơn vị chuyên cung cấp giải pháp chuỗi cung ứng toàn diện, bao gồm:</p>
<ol>
  <li>Vận tải quốc tế Đa phương thức (Đường biển, Đường hàng không, Đường bộ xuyên biên giới).</li>
  <li>Dịch vụ khai thuê Hải quan điện tử, kiểm tra chuyên ngành và cấp C/O nhanh chóng.</li>
  <li>Hệ thống kho bãi ngoại quan & phân phối đạt chuẩn quốc tế.</li>
</ol>
<p>Nếu Quý công ty đang có nhu cầu tối ưu hóa chi phí logistics hoặc cần tư vấn lịch trình cho các lô hàng sắp tới, xin vui lòng phản hồi email này để đội ngũ chuyên gia của chúng tôi hỗ trợ ngay lập tức.</p>
<p>Trân trọng cảm ơn,<br/><strong>Đội ngũ Chăm sóc Khách hàng</strong></p>`,
  },
  {
    title: "⏱️ Theo dõi & Cập nhật tình trạng chứng từ lô hàng",
    subject: "Cập nhật chứng từ vận tải & Thông báo phát hành Vận đơn (Bill of Lading)",
    html: `<p>Kính gửi <strong>Quý Khách hàng</strong>,</p>
<p>Chúng tôi xin thông báo chứng từ vận chuyển cho lô hàng của Quý công ty đã được phát hành và kiểm tra hợp lệ.</p>
<p>Xin vui lòng kiểm tra tệp đính kèm để đối chiếu thông tin <em>Draft B/L</em> và xác nhận lại trước 17:00 hôm nay để kịp phát hành bản chính thức.</p>
<p>Mọi yêu cầu chỉnh sửa xin phản hồi trực tiếp qua email này.</p>
<p>Trân trọng,<br/><strong>Bộ phận Chứng từ Logistics</strong></p>`,
  },
];

export function GmailComposeWindow({
  isOpen,
  onClose,
  mailboxes,
  onSend,
}: GmailComposeWindowProps): React.JSX.Element | null {
  const [windowState, setWindowState] = useState<WindowState>("normal");
  const [senderMailboxId, setSenderMailboxId] = useState(mailboxes[0]?.id || "");
  const [toInput, setToInput] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [attachments, setAttachments] = useState<RealAttachmentItem[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAddRecipient = (email: string) => {
    const trimmed = email.trim().replace(/[,;]$/, "");
    if (trimmed && !recipients.includes(trimmed)) {
      setRecipients([...recipients, trimmed]);
      setToInput("");
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter((r) => r !== email));
  };

  const handleToKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      handleAddRecipient(toInput);
    } else if (e.key === "Backspace" && !toInput && recipients.length > 0) {
      setRecipients(recipients.slice(0, -1));
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: RealAttachmentItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const base64 = await readFileAsBase64(file);
        newItems.push({
          id: `att-${Date.now()}-${i}-${file.name}`,
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          contentBase64: base64,
        });
      } catch {
        setErrorMessage(`Lỗi khi đọc tệp ${file.name}`);
      }
    }

    setAttachments((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const applyTemplate = (tpl: typeof LOGISTICS_LEAD_TEMPLATES[0]) => {
    setSubject(tpl.subject);
    setBodyHtml(tpl.html);
    setShowTemplates(false);
  };

  const handleSend = async () => {
    const allRecipients = [...recipients];
    if (toInput.trim() && !allRecipients.includes(toInput.trim())) {
      allRecipients.push(toInput.trim());
    }

    if (allRecipients.length === 0) {
      setErrorMessage("Vui lòng nhập ít nhất một địa chỉ người nhận (Đến).");
      return;
    }

    if (!subject.trim()) {
      setErrorMessage("Vui lòng nhập tiêu đề email.");
      return;
    }

    const senderMailbox = mailboxes.find((m) => m.id === senderMailboxId) || mailboxes[0];
    if (!senderMailbox) {
      setErrorMessage("Vui lòng chọn hòm thư gửi.");
      return;
    }

    setIsSending(true);
    setErrorMessage(null);

    try {
      const ccList = ccInput.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
      const bccList = bccInput.split(/[,;]/).map((s) => s.trim()).filter(Boolean);

      await onSend({
        senderAddress: senderMailbox.senderAddress,
        recipientAddresses: allRecipients,
        ccAddresses: ccList.length > 0 ? ccList : undefined,
        bccAddresses: bccList.length > 0 ? bccList : undefined,
        subject,
        bodyText: bodyText || bodyHtml.replace(/<[^>]*>/g, " "),
        bodyHtml: bodyHtml || `<p>${bodyText}</p>`,
        attachments,
      });

      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gửi thư thất bại";
      setErrorMessage(msg);
    } finally {
      setIsSending(false);
    }
  };

  // Minimized state bar
  if (windowState === "minimized") {
    return (
      <div
        onClick={() => setWindowState("normal")}
        className="fixed bottom-0 right-4 md:right-8 z-50 w-72 h-10 px-3.5 flex items-center justify-between bg-slate-900 text-white rounded-t-xl shadow-2xl cursor-pointer hover:bg-slate-800 transition-colors select-none"
      >
        <span className="text-xs font-semibold truncate">
          {subject || "Thư mới (Đang soạn...)"}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setWindowState("normal");
            }}
            className="p-1 hover:bg-slate-700 rounded"
            title="Mở rộng"
          >
            <Maximize2 className="size-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 hover:bg-slate-700 rounded"
            title="Đóng"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    );
  }

  const containerClasses =
    windowState === "maximized"
      ? "fixed inset-2 md:inset-6 z-50 shadow-2xl rounded-xl border border-slate-300 bg-white flex flex-col overflow-hidden"
      : "fixed inset-0 md:inset-auto md:bottom-0 md:right-8 z-50 w-full md:w-[620px] lg:w-[680px] h-full md:h-[640px] shadow-2xl md:rounded-t-xl border border-slate-300 bg-white flex flex-col overflow-hidden";

  return (
    <div className={containerClasses} role="dialog" aria-label="Soạn thư mới">
      {/* Window Header */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-slate-100/90 border-b border-slate-200 select-none">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">Thư mới (New Message)</span>
          <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
            · Tiếp cận khách hàng & Gửi báo giá
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-600">
          <button
            type="button"
            onClick={() => setWindowState("minimized")}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-600"
            title="Thu nhỏ"
          >
            <Minus className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setWindowState(windowState === "maximized" ? "normal" : "maximized")}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hidden md:inline-block"
            title={windowState === "maximized" ? "Thu vừa" : "Phóng to"}
          >
            {windowState === "maximized" ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-600"
            title="Đóng"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto p-3.5 space-y-2.5">
        {/* From shared mailbox */}
        <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 text-xs">
          <span className="w-12 text-slate-500 font-medium shrink-0">Từ:</span>
          <select
            value={senderMailboxId}
            onChange={(e) => setSenderMailboxId(e.target.value)}
            className="flex-1 bg-transparent text-slate-800 font-medium outline-none cursor-pointer py-1"
          >
            {mailboxes.map((mb) => (
              <option key={mb.id} value={mb.id}>
                {mb.displayName} ({mb.senderAddress})
              </option>
            ))}
          </select>
        </div>

        {/* To input with chip badges */}
        <div className="flex flex-wrap items-center gap-1.5 pb-1.5 border-b border-slate-100 text-xs min-h-[36px]">
          <span className="w-12 text-slate-500 font-medium shrink-0">Đến:</span>
          <div className="flex-1 flex flex-wrap items-center gap-1.5">
            {recipients.map((email) => (
              <span
                key={email}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-medium text-xs"
              >
                <span>{email}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRecipient(email)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
            <input
              type="email"
              value={toInput}
              onChange={(e) => setToInput(e.target.value)}
              onKeyDown={handleToKeyDown}
              onBlur={() => handleAddRecipient(toInput)}
              placeholder={recipients.length === 0 ? "Nhập địa chỉ email người nhận (Enter hoặc phẩy)..." : ""}
              className="flex-1 min-w-[160px] bg-transparent outline-none text-xs text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-2 text-slate-500 font-medium shrink-0">
            {!showCc && (
              <button
                type="button"
                onClick={() => setShowCc(true)}
                className="hover:text-primary transition-colors"
              >
                Cc
              </button>
            )}
            {!showBcc && (
              <button
                type="button"
                onClick={() => setShowBcc(true)}
                className="hover:text-primary transition-colors"
              >
                Bcc
              </button>
            )}
          </div>
        </div>

        {/* Optional CC */}
        {showCc && (
          <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 text-xs">
            <span className="w-12 text-slate-500 font-medium shrink-0">Cc:</span>
            <input
              type="text"
              value={ccInput}
              onChange={(e) => setCcInput(e.target.value)}
              placeholder="Email nhận bản sao..."
              className="flex-1 bg-transparent outline-none text-xs text-slate-800"
            />
            <button
              type="button"
              onClick={() => {
                setShowCc(false);
                setCcInput("");
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="size-3" />
            </button>
          </div>
        )}

        {/* Optional BCC */}
        {showBcc && (
          <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 text-xs">
            <span className="w-12 text-slate-500 font-medium shrink-0">Bcc:</span>
            <input
              type="text"
              value={bccInput}
              onChange={(e) => setBccInput(e.target.value)}
              placeholder="Email nhận bản sao ẩn danh..."
              className="flex-1 bg-transparent outline-none text-xs text-slate-800"
            />
            <button
              type="button"
              onClick={() => {
                setShowBcc(false);
                setBccInput("");
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="size-3" />
            </button>
          </div>
        )}

        {/* Subject */}
        <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 text-xs">
          <span className="w-12 text-slate-500 font-medium shrink-0">Tiêu đề:</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Tiêu đề email..."
            className="flex-1 bg-transparent outline-none text-xs font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400"
          />
        </div>

        {/* AI Templates Pill Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-primary/30 bg-primary/5 text-primary text-xs font-semibold hover:bg-primary/10 transition-colors"
          >
            <Sparkles className="size-3.5 text-primary" />
            <span>Mẫu email Logistics & Chào hàng AI</span>
            <ChevronDown className="size-3" />
          </button>

          {showTemplates && (
            <div className="absolute left-0 top-full mt-1.5 z-40 w-full md:w-[480px] rounded-xl border border-slate-200 bg-white p-2 shadow-xl space-y-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1">
                Chọn mẫu thư có sẵn để điền nhanh:
              </p>
              {LOGISTICS_LEAD_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
                >
                  <p className="font-semibold text-xs text-slate-900 group-hover:text-primary">
                    {tpl.title}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {tpl.subject}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Rich Text Editor */}
        <div className="flex-1 min-h-[220px]">
          <RichTextEditor
            initialHtml={bodyHtml}
            placeholder="Kính gửi Quý Khách hàng / Đối tác,..."
            onChange={(html, text) => {
              setBodyHtml(html);
              setBodyText(text);
            }}
          />
        </div>

        {/* Real Attachments Display */}
        {attachments.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] font-semibold text-slate-600">Tệp đính kèm ({attachments.length}):</p>
            <div className="flex flex-wrap gap-2">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs shadow-3xs"
                >
                  <FileText className="size-3.5 text-primary shrink-0" />
                  <span className="font-medium text-slate-800 max-w-[200px] truncate" title={att.fileName}>
                    {att.fileName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({formatFileSize(att.sizeBytes)})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="text-slate-400 hover:text-rose-600 font-bold ml-1"
                    aria-label={`Remove ${att.fileName}`}
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {errorMessage && (
          <p role="alert" className="text-xs font-medium text-destructive bg-destructive/10 p-2 rounded-lg">
            {errorMessage}
          </p>
        )}
      </div>

      {/* Footer / Action Bar */}
      <footer className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-t border-slate-200 bg-slate-50/70 select-none">
        <div className="flex items-center gap-2">
          {/* Main Send Button */}
          <Button
            type="button"
            disabled={isSending}
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-8 px-4 gap-1.5 shadow-sm rounded-lg"
          >
            {isSending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="size-3.5" />
                Gửi (Send)
              </>
            )}
          </Button>

          {/* Attachment Input */}
          <input
            type="file"
            ref={fileInputRef}
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="compose-file-upload"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-600"
            title="Đính kèm tệp (Attach files)"
          >
            <Paperclip className="size-4" />
          </button>
        </div>

        {/* Right tools: Discard */}
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 hover:bg-slate-200 rounded text-slate-500 hover:text-destructive transition-colors"
          title="Hủy / Xóa bản nháp"
        >
          <Trash2 className="size-4" />
        </button>
      </footer>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const base64 = res.includes(",") ? res.split(",")[1] : res;
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
