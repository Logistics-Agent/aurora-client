import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type LiveMapSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function LiveMapSearch({ value, onChange }: LiveMapSearchProps) {
  return (
    <div className="pointer-events-none absolute inset-x-4 top-4 z-40 flex justify-center">
      <label className="pointer-events-auto relative block w-full max-w-md">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-300" />
        <Input
          aria-label="Search shipment, customer, hub or document"
          placeholder="Search shipment, customer, hub or document…"
          className="h-10 rounded-full border-slate-600/80 bg-slate-900/85 pl-10 pr-4 text-white shadow-lg backdrop-blur-md placeholder:text-slate-300 focus-visible:border-slate-400 focus-visible:ring-slate-300/40"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    </div>
  );
}
