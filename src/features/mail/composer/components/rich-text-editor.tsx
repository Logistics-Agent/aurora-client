"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Palette,
  Type,
  Undo,
  Redo,
} from "lucide-react";

export interface RichTextEditorProps {
  initialHtml?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (html: string, plainText: string) => void;
  className?: string;
}

const FONT_FAMILIES = [
  { label: "Mặc định (Sans Serif)", value: "Arial, sans-serif" },
  { label: "Serif (Times)", value: "Georgia, serif" },
  { label: "Monospace (Mã)", value: "monospace" },
  { label: "Roboto / Inter", value: "'Inter', 'Roboto', sans-serif" },
];

const FONT_SIZES = [
  { label: "Nhỏ (Small)", value: "1" },
  { label: "Bình thường (Normal)", value: "3" },
  { label: "Lớn (Large)", value: "5" },
  { label: "Rất lớn (Huge)", value: "7" },
];

const TEXT_COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#b7b7b7",
  "#cc0000", "#e69138", "#f1c232", "#6aa84f", "#45818e",
  "#3d85c6", "#674ea7", "#a64d79", "#2563eb", "#059669",
];

const BG_COLORS = [
  "#ffffff", "#f3f4f6", "#fee2e2", "#fef3c7", "#dcfce7",
  "#e0f2fe", "#ede9fe", "#fce7f3", "#f1f5f9", "#e2e8f0",
];

export function RichTextEditor({
  initialHtml = "",
  placeholder = "Viết nội dung email...",
  disabled = false,
  onChange,
  className = "",
}: RichTextEditorProps): React.JSX.Element {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [selectedFont, setSelectedFont] = useState("Arial, sans-serif");
  const [selectedSize, setSelectedSize] = useState("3");

  useEffect(() => {
    if (editorRef.current && initialHtml !== undefined && editorRef.current.innerHTML !== initialHtml) {
      editorRef.current.innerHTML = initialHtml;
    }
  }, [initialHtml]);

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const plainText = editorRef.current.innerText;
    onChange?.(html, plainText);
  };

  const exec = (command: string, value: string | undefined = undefined) => {
    if (disabled) return;
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertLink = () => {
    const url = prompt("Nhập địa chỉ liên kết (URL):", "https://");
    if (url && url !== "https://") {
      exec("createLink", url);
    }
  };

  return (
    <div className={`flex flex-col rounded-lg border border-slate-200 bg-white ${className}`}>
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-slate-700 overflow-x-auto select-none">
        {/* Undo / Redo */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => exec("undo")}
          className="p-1.5 rounded hover:bg-slate-200/80 text-slate-600 disabled:opacity-40"
          title="Hoàn tác (Undo)"
        >
          <Undo className="size-3.5" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => exec("redo")}
          className="p-1.5 rounded hover:bg-slate-200/80 text-slate-600 disabled:opacity-40"
          title="Làm lại (Redo)"
        >
          <Redo className="size-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-slate-300 mx-0.5" />

        {/* Font Family Selector */}
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setShowFontPicker(!showFontPicker);
              setShowColorPicker(false);
              setShowSizePicker(false);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-slate-200/80 text-slate-700 disabled:opacity-40"
            title="Kiểu chữ (Font)"
          >
            <Type className="size-3 text-slate-500" />
            <span className="max-w-[80px] truncate hidden sm:inline">Font</span>
          </button>
          {showFontPicker && (
            <div className="absolute left-0 top-full mt-1 z-30 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
              {FONT_FAMILIES.map((font) => (
                <button
                  key={font.value}
                  type="button"
                  onClick={() => {
                    setSelectedFont(font.value);
                    exec("fontName", font.value);
                    setShowFontPicker(false);
                  }}
                  style={{ fontFamily: font.value }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded hover:bg-slate-100 ${
                    selectedFont === font.value ? "font-bold text-primary bg-primary/5" : ""
                  }`}
                >
                  {font.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size Selector */}
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setShowSizePicker(!showSizePicker);
              setShowColorPicker(false);
              setShowFontPicker(false);
            }}
            className="flex items-center gap-1 px-1.5 py-1 rounded text-xs hover:bg-slate-200/80 text-slate-700 disabled:opacity-40"
            title="Cỡ chữ (Size)"
          >
            <span className="text-[11px] font-semibold">T</span>
            <span className="text-[9px] font-bold">t</span>
          </button>
          {showSizePicker && (
            <div className="absolute left-0 top-full mt-1 z-30 w-36 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
              {FONT_SIZES.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => {
                    setSelectedSize(size.value);
                    exec("fontSize", size.value);
                    setShowSizePicker(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded hover:bg-slate-100 ${
                    selectedSize === size.value ? "font-bold text-primary bg-primary/5" : ""
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-4 w-[1px] bg-slate-300 mx-0.5" />

        {/* Basic Styles */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => exec("bold")}
          className="p-1.5 rounded hover:bg-slate-200/80 text-slate-700 font-bold disabled:opacity-40"
          title="In đậm (Bold - Ctrl+B)"
        >
          <Bold className="size-3.5" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => exec("italic")}
          className="p-1.5 rounded hover:bg-slate-200/80 text-slate-700 italic disabled:opacity-40"
          title="In nghiêng (Italic - Ctrl+I)"
        >
          <Italic className="size-3.5" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => exec("underline")}
          className="p-1.5 rounded hover:bg-slate-200/80 text-slate-700 underline disabled:opacity-40"
          title="Gạch chân (Underline - Ctrl+U)"
        >
          <Underline className="size-3.5" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => exec("strikeThrough")}
          className="p-1.5 rounded hover:bg-slate-200/80 text-slate-700 line-through disabled:opacity-40"
          title="Gạch ngang (Strikethrough)"
        >
          <Strikethrough className="size-3.5" />
        </button>

        {/* Color Palette Popover */}
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowFontPicker(false);
              setShowSizePicker(false);
            }}
            className="p-1.5 rounded hover:bg-slate-200/80 text-slate-700 disabled:opacity-40 flex items-center gap-0.5"
            title="Màu chữ & Màu nền (Color)"
          >
            <Palette className="size-3.5 text-primary" />
          </button>
          {showColorPicker && (
            <div className="absolute left-0 top-full mt-1 z-30 w-56 rounded-lg border border-slate-200 bg-white p-2.5 shadow-lg space-y-2">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Màu chữ</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {TEXT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        exec("foreColor", c);
                        setShowColorPicker(false);
                      }}
                      style={{ backgroundColor: c }}
                      className="size-5 rounded-full border border-slate-300 hover:scale-110 transition-transform"
                      title={c}
                    />
                  ))}
                </div>
              </div>
              <div className="pt-1.5 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Màu nền (Highlight)</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {BG_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        exec("hiliteColor", c);
                        setShowColorPicker(false);
                      }}
                      style={{ backgroundColor: c }}
                      className="size-5 rounded border border-slate-300 hover:scale-110 transition-transform"
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-[1px] bg-slate-300 mx-0.5" />

        {/* Alignments */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => exec("justifyLeft")}
          className="p-1.5 rounded hover:bg-slate-200/80 text-slate-700 disabled:opacity-40"
          title="Căn trái (Align Left)"
        >
          <AlignLeft className="size-3.5" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => exec("justifyCenter")}
          className="p-1.5 rounded hover:bg-slate-200/80 text-slate-700 disabled:opacity-40"
          title="Căn giữa (Align Center)"
        >
          <AlignCenter className="size-3.5" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => exec("justifyRight")}
          className="p-1.5 rounded hover:bg-slate-200/80 text-slate-700 disabled:opacity-40"
          title="Căn phải (Align Right)"
        >
          <AlignRight className="size-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-slate-300 mx-0.5" />

        {/* Lists & Quotes */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => exec("insertUnorderedList")}
          className="p-1.5 rounded hover:bg-slate-200/80 text-slate-700 disabled:opacity-40"
          title="Danh sách gạch đầu dòng (Bullet list)"
        >
          <List className="size-3.5" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => exec("insertOrderedList")}
          className="p-1.5 rounded hover:bg-slate-200/80 text-slate-700 disabled:opacity-40"
          title="Danh sách số (Numbered list)"
        >
          <ListOrdered className="size-3.5" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => exec("formatBlock", "<blockquote>")}
          className="p-1.5 rounded hover:bg-slate-200/80 text-slate-700 disabled:opacity-40"
          title="Khối trích dẫn (Quote)"
        >
          <Quote className="size-3.5" />
        </button>

        {/* Link */}
        <button
          type="button"
          disabled={disabled}
          onClick={insertLink}
          className="p-1.5 rounded hover:bg-slate-200/80 text-slate-700 disabled:opacity-40"
          title="Chèn đường dẫn (Insert Link - Ctrl+K)"
        >
          <LinkIcon className="size-3.5" />
        </button>
      </div>

      {/* Editable Body Area */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        className="min-h-[220px] max-h-[420px] overflow-y-auto p-3.5 text-sm text-slate-800 outline-none leading-relaxed select-text focus:ring-0 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none"
        style={{
          fontFamily: selectedFont,
        }}
      />
    </div>
  );
}
