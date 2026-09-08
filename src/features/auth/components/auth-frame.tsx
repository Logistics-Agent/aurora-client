import { AuroraGalaxyCanvas } from "./aurora-galaxy-canvas";

export function AuthFrame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#edf5fd] px-4 py-12 selection:bg-sky-500/20 selection:text-sky-900">
      {/* ── 3D Interactive Aurora, Logistics Network & Galaxy Canvas ─────────── */}
      <AuroraGalaxyCanvas />

      {/* ── Dynamic Animated Cool / Icy Background ───────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Animated Arctic Aurora Blob 1 */}
        <div className="absolute -top-[15%] -left-[10%] size-[650px] rounded-full bg-gradient-to-br from-cyan-300/40 via-sky-200/35 to-blue-300/30 blur-[130px] animate-pulse duration-[8000ms]" />
        
        {/* Animated Arctic Aurora Blob 2 */}
        <div className="absolute -bottom-[15%] -right-[10%] size-[700px] rounded-full bg-gradient-to-tl from-teal-200/35 via-cyan-200/40 to-indigo-200/30 blur-[140px] animate-pulse duration-[10000ms]" />
        
        {/* Center Cool Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[550px] rounded-full bg-sky-200/30 blur-[110px]" />

        {/* Crisp Geometric Grid Mesh */}
        <div 
          className="absolute inset-0 opacity-[0.4]" 
          style={{
            backgroundImage: `radial-gradient(rgba(14, 165, 233, 0.18) 1px, transparent 1px), radial-gradient(rgba(59, 130, 246, 0.12) 1px, transparent 1px)`,
            backgroundSize: `40px 40px, 80px 80px`,
            backgroundPosition: `0 0, 20px 20px`
          }}
        />

        {/* Ambient floating orbital rings SVG */}
        <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cool-orbit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.25" />
            </linearGradient>
          </defs>
          <circle cx="50%" cy="50%" r="380" fill="none" stroke="url(#cool-orbit-grad)" strokeWidth="1.2" strokeDasharray="6 14" className="animate-[spin_70s_linear_infinite] origin-center" />
          <circle cx="50%" cy="50%" r="520" fill="none" stroke="url(#cool-orbit-grad)" strokeWidth="1.2" strokeDasharray="8 18" className="animate-[spin_110s_linear_infinite_reverse] origin-center" />
        </svg>
      </div>

      {/* ── Centered Frosted Glacier Glass Card ───────────────────────────────── */}
      <div className="relative z-10 w-full max-w-[480px]">
        {/* Glowing Glacier Border Wrap */}
        <div className="relative rounded-[28px] p-[1.5px] bg-gradient-to-b from-white via-white/80 to-sky-100 shadow-[0_20px_60px_rgba(186,215,248,0.5),0_4px_16px_rgba(14,165,233,0.12)]">
          <div className="rounded-[26.5px] bg-white/85 backdrop-blur-2xl p-7 sm:p-10 border border-white/90 shadow-inner">
            {/* Header / Brand Emblem */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 opacity-60 blur-md animate-pulse" />
                <div className="relative grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-cyan-500 text-white font-bold text-xl shadow-[0_4px_14px_rgba(2,132,199,0.35)]">
                  L
                </div>
              </div>
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-[11px] font-semibold text-sky-800 mb-3 shadow-2xs">
                <span className="size-1.5 rounded-full bg-sky-500 animate-ping" />
                LogiSphere AI Control Tower
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {title}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-sm">
                {description}
              </p>
            </div>

            {/* Dynamic Form Content */}
            <div className="mt-6">
              {children}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400">
                © 2026 LogiSphere · Enterprise Logistics Intelligence
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


