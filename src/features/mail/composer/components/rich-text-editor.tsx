"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Outdent,
  Indent,
  Quote,
  Link as LinkIcon,
  RemoveFormatting,
  Undo,
  Redo,
  ChevronDown,
  Check,
  Paperclip,
} from "lucide-react";

export interface RichTextEditorProps {
  initialHtml?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (html: string, plainText: string) => void;
  className?: string;
  minHeight?: string;
  onAttach?: () => void;
}

export interface FontFamilyOption {
  label: string;
  value: string;
  previewFamily: string;
}

const FONT_FAMILIES: FontFamilyOption[] = [
  { label: "Sans Serif", value: "Arial, Helvetica, sans-serif", previewFamily: "Arial, Helvetica, sans-serif" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif", previewFamily: "Georgia, serif" },
  { label: "Cố định (Fixed Width)", value: "'Courier New', Courier, monospace", previewFamily: "'Courier New', monospace" },
  { label: "Rộng (Wide)", value: "'Arial Black', Gadget, sans-serif", previewFamily: "'Arial Black', sans-serif" },
  { label: "Hẹp (Narrow)", value: "'Arial Narrow', Arial, sans-serif", previewFamily: "'Arial Narrow', sans-serif" },
  { label: "Comic Sans MS", value: "'Comic Sans MS', cursive, sans-serif", previewFamily: "'Comic Sans MS', cursive" },
  { label: "Garamond", value: "Garamond, 'Hoefler Text', serif", previewFamily: "Garamond, serif" },
  { label: "Georgia", value: "Georgia, serif", previewFamily: "Georgia, serif" },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif", previewFamily: "Tahoma, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', Helvetica, sans-serif", previewFamily: "'Trebuchet MS', sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif", previewFamily: "Verdana, sans-serif" },
  { label: "Roboto / Inter", value: "'Inter', 'Roboto', sans-serif", previewFamily: "'Inter', 'Roboto', sans-serif" },
];

const FONT_SIZES = [
  { label: "Nhỏ (Small)", value: "1", px: "10px" },
  { label: "Bình thường (Normal)", value: "3", px: "13px" },
  { label: "Lớn (Large)", value: "5", px: "18px" },
  { label: "Rất lớn (Huge)", value: "7", px: "24px" },
];

// Gmail-style color palettes
const COLOR_PALETTE = [
  ["#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff"],
  ["#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff"],
  ["#e6b8af", "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#c9daf8", "#cfe2f3", "#d9d2e9", "#ead1dc"],
  ["#dd7e6b", "#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#a4c2f4", "#9fc5e8", "#b4a7d6", "#d5a6bd"],
  ["#cc4125", "#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6d9eeb", "#6fa8dc", "#8e7cc3", "#c27ba0"],
  ["#a61c00", "#cc0000", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3c78d8", "#3d85c6", "#674ea7", "#a64d79"],
  ["#5b0f00", "#660000", "#783f04", "#7f6000", "#274e13", "#0c343d", "#1155cc", "#073763", "#20124d", "#4c1130"],
];

export function RichTextEditor({
  initialHtml = "",
  placeholder = "Nhập nội dung thư...",
  disabled = false,
  onChange,
  className = "",
  minHeight = "min-h-[220px]",
  onAttach,
}: RichTextEditorProps): React.JSX.Element {
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeFont, setActiveFont] = useState<FontFamilyOption>(FONT_FAMILIES[0]);
  const [activeSize, setActiveSize] = useState(FONT_SIZES[1]);

  // Dropdown states
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showAlignMenu, setShowAlignMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Active color tab (text vs background)
  const [colorTab, setColorTab] = useState<"text" | "background">("text");

  // Sync initial HTML
  useEffect(() => {
    if (editorRef.current && initialHtml !== undefined && editorRef.current.innerHTML !== initialHtml) {
      editorRef.current.innerHTML = initialHtml;
    }
  }, [initialHtml]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowFontMenu(false);
        setShowSizeMenu(false);
        setShowColorMenu(false);
        setShowAlignMenu(false);
        setShowMoreMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const plainText = editorRef.current.innerText;
    onChange?.(html, plainText);
  }, [onChange]);

  const exec = useCallback(
    (command: string, value: string | undefined = undefined) => {
      if (disabled) return;
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      handleInput();
    },
    [disabled, handleInput],
  );

  const insertLink = useCallback(() => {
    const url = prompt("Nhập địa chỉ liên kết (URL):", "https://");
    if (url && url.trim() && url !== "https://") {
      exec("createLink", url.trim());
    }
  }, [exec]);

  const closeAllMenus = () => {
    setShowFontMenu(false);
    setShowSizeMenu(false);
    setShowColorMenu(false);
    setShowAlignMenu(false);
    setShowMoreMenu(false);
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col rounded-lg border border-slate-200 bg-white shadow-xs focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 ${className}`}
    >
      {/* Gmail-style Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50/90 px-2 py-1 text-slate-700 select-none overflow-x-visible">
        {/* Undo / Redo */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => exec("undo")}
          className="rounded p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-40 transition-colors"
          title="Hoàn tác (Undo - Ctrl+Z)"
        >
          <Undo className="size-3.5" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => exec("redo")}
          className="rounded p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-40 transition-colors"
          title="Làm lại (Redo - Ctrl+Y)"
        >
          <Redo className="size-3.5" />
        </button>

        <div className="mx-1 h-4 w-[1px] bg-slate-300" />

        {/* Font Family Dropdown */}
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              const next = !showFontMenu;
              closeAllMenus();
              setShowFontMenu(next);
            }}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-40 transition-colors"
            title="Kiểu chữ (Font)"
          >
            <span className="max-w-[85px] truncate" style={{ fontFamily: activeFont.value }}>
              {activeFont.label}
            </span>
            <ChevronDown className="size-3 text-slate-500" />
          </button>

          {showFontMenu && (
            <div className="absolute top-full left-0 z-50 mt-1 max-h-64 w-52 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
              {FONT_FAMILIES.map((font) => (
                <button
                  key={font.value}
                  type="button"
                  onClick={() => {
                    setActiveFont(font);
                    exec("fontName", font.value);
                    setShowFontMenu(false);
                  }}
                  style={{ fontFamily: font.previewFamily }}
                  className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-slate-100 ${
                    activeFont.value === font.value ? "bg-blue-50 font-bold text-blue-700" : "text-slate-800"
                  }`}
                >
                  <span className="truncate">{font.label}</span>
                  {activeFont.value === font.value && <Check className="size-3 text-blue-600 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size Dropdown */}
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              const next = !showSizeMenu;
              closeAllMenus();
              setShowSizeMenu(next);
            }}
            className="flex items-center gap-0.5 rounded px-1.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-40 transition-colors"
            title="Cỡ chữ (Size)"
          >
            <span className="flex items-baseline font-serif font-bold text-slate-700">
              <span className="text-xs">T</span>
              <span className="text-[10px]">T</span>
            </span>
            <ChevronDown className="size-3 text-slate-500" />
          </button>

          {showSizeMenu && (
            <div className="absolute top-full left-0 z-50 mt-1 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
              {FONT_SIZES.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => {
                    setActiveSize(size);
                    exec("fontSize", size.value);
                    setShowSizeMenu(false);
                  }}
                  className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-slate-100 ${
                    activeSize.value === size.value ? "bg-blue-50 font-bold text-blue-700" : "text-slate-800"
                  }`}
                >
                  <span>{size.label}</span>
                  {activeSize.value === size.value && <Check className="size-3 text-blue-600 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mx-1 h-4 w-[1px] bg-slate-300" />

        {/* Bold */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => exec("bold")}
          className="rounded p-1.5 font-serif font-bold text-slate-800 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-40 transition-colors"
          title="In đậm (Bold - Ctrl+B)"
        >
          <Bold className="size-3.5" />
        </button>

        {/* Italic */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => exec("italic")}
          className="rounded p-1.5 font-serif italic text-slate-800 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-40 transition-colors"
          title="In nghiêng (Italic - Ctrl+I)"
        >
          <Italic className="size-3.5" />
        </button>

        {/* Underline */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => exec("underline")}
          className="rounded p-1.5 font-serif underline text-slate-800 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-40 transition-colors"
          title="Gạch chân (Underline - Ctrl+U)"
        >
          <Underline className="size-3.5" />
        </button>

        {/* Text / Background Color Dropdown */}
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              const next = !showColorMenu;
              closeAllMenus();
              setShowColorMenu(next);
            }}
            className="flex items-center gap-0.5 rounded px-1.5 py-1 text-xs text-slate-800 hover:bg-slate-200 disabled:opacity-40 transition-colors"
            title="Màu chữ và Màu nền (Color)"
          >
            <span className="flex flex-col items-center">
              <span className="font-serif font-bold text-xs leading-none">A</span>
              <span className="mt-0.5 h-[3px] w-3 rounded-full bg-slate-800" />
            </span>
            <ChevronDown className="size-3 text-slate-500" />
          </button>

          {showColorMenu && (
            <div className="absolute top-full left-0 z-50 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-2xl">
              {/* Color tabs: Background vs Text */}
              <div className="flex border-b border-slate-100 pb-2 mb-2 gap-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setColorTab("text")}
                  className={`flex-1 rounded-md py-1 text-center transition-colors ${
                    colorTab === "text"
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Màu chữ
                </button>
                <button
                  type="button"
                  onClick={() => setColorTab("background")}
                  className={`flex-1 rounded-md py-1 text-center transition-colors ${
                    colorTab === "background"
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Màu nền
                </button>
              </div>

              {/* Color Swatch Grid */}
              <div className="space-y-1">
                {COLOR_PALETTE.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex gap-1 justify-between">
                    {row.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          if (colorTab === "text") {
                            exec("foreColor", color);
                          } else {
                            exec("hiliteColor", color);
                          }
                          setShowColorMenu(false);
                        }}
                        style={{ backgroundColor: color }}
                        className="size-5 rounded border border-slate-300 transition-transform hover:scale-125 hover:z-10 hover:shadow-md"
                        title={color}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mx-1 h-4 w-[1px] bg-slate-300" />

        {/* Alignment Dropdown */}
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              const next = !showAlignMenu;
              closeAllMenus();
              setShowAlignMenu(next);
            }}
            className="flex items-center gap-0.5 rounded px-1.5 py-1 text-xs text-slate-700 hover:bg-slate-200 disabled:opacity-40 transition-colors"
            title="Căn lề (Align)"
          >
            <AlignLeft className="size-3.5" />
            <ChevronDown className="size-3 text-slate-500" />
          </button>

          {showAlignMenu && (
            <div className="absolute top-full left-0 z-50 mt-1 flex gap-1 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  exec("justifyLeft");
                  setShowAlignMenu(false);
                }}
                className="rounded p-1.5 text-slate-700 hover:bg-slate-100"
                title="Căn trái (Align Left)"
              >
                <AlignLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  exec("justifyCenter");
                  setShowAlignMenu(false);
                }}
                className="rounded p-1.5 text-slate-700 hover:bg-slate-100"
                title="Căn giữa (Align Center)"
              >
                <AlignCenter className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  exec("justifyRight");
                  setShowAlignMenu(false);
                }}
                className="rounded p-1.5 text-slate-700 hover:bg-slate-100"
                title="Căn phải (Align Right)"
              >
                <AlignRight className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  exec("justifyFull");
                  setShowAlignMenu(false);
                }}
                className="rounded p-1.5 text-slate-700 hover:bg-slate-100"
                title="Căn đều hai bên (Justify)"
              >
                <AlignJustify className="size-4" />
              </button>
            </div>
          )}
        </div>

        {/* Lists */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => exec("insertOrderedList")}
          className="rounded p-1.5 text-slate-700 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-40 transition-colors"
          title="Danh sách đánh số (Numbered List)"
        >
          <ListOrdered className="size-3.5" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => exec("insertUnorderedList")}
          className="rounded p-1.5 text-slate-700 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-40 transition-colors"
          title="Danh sách gạch đầu dòng (Bulleted List)"
        >
          <List className="size-3.5" />
        </button>

        {/* Indent / Outdent */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => exec("outdent")}
          className="rounded p-1.5 text-slate-700 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-40 transition-colors"
          title="Giảm thụt lề (Decrease Indent)"
        >
          <Outdent className="size-3.5" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => exec("indent")}
          className="rounded p-1.5 text-slate-700 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-40 transition-colors"
          title="Tăng thụt lề (Increase Indent)"
        >
          <Indent className="size-3.5" />
        </button>

        <div className="mx-1 h-4 w-[1px] bg-slate-300" />

        {/* Link */}
        <button
          type="button"
          disabled={disabled}
          onClick={insertLink}
          className="rounded p-1.5 text-slate-700 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-40 transition-colors"
          title="Chèn liên kết (Insert Link - Ctrl+K)"
        >
          <LinkIcon className="size-3.5" />
        </button>

        {/* Attach File Button in Toolbar */}
        {onAttach && (
          <button
            type="button"
            disabled={disabled}
            onClick={onAttach}
            className="rounded p-1.5 text-slate-700 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-40 transition-colors"
            title="Đính kèm tệp (Attach files)"
            aria-label="Đính kèm tệp"
          >
            <Paperclip className="size-3.5" />
          </button>
        )}

        {/* More formatting tools dropdown (Gmail-style arrow) */}
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              const next = !showMoreMenu;
              closeAllMenus();
              setShowMoreMenu(next);
            }}
            className="flex items-center rounded p-1.5 text-slate-700 hover:bg-slate-200 disabled:opacity-40 transition-colors"
            title="Tùy chọn định dạng khác (More formatting options)"
          >
            <ChevronDown className="size-3.5 text-slate-600" />
          </button>

          {showMoreMenu && (
            <div className="absolute top-full right-0 z-50 mt-1 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  exec("strikeThrough");
                  setShowMoreMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-100"
              >
                <Strikethrough className="size-3.5" />
                <span>Gạch ngang (Strikethrough)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  exec("formatBlock", "<blockquote>");
                  setShowMoreMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-100"
              >
                <Quote className="size-3.5" />
                <span>Khối trích dẫn (Quote)</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                onClick={() => {
                  exec("removeFormat");
                  setShowMoreMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-xs text-rose-600 hover:bg-rose-50"
              >
                <RemoveFormatting className="size-3.5" />
                <span>Xóa định dạng (Clear formatting)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Editable Body Area */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        className={`${minHeight} max-h-[440px] overflow-y-auto p-3.5 text-sm text-slate-800 outline-none leading-relaxed select-text focus:ring-0 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none prose prose-sm max-w-none`}
        style={{
          fontFamily: activeFont.value,
        }}
      />
    </div>
  );
}
