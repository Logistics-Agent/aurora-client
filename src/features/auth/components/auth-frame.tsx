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
    <main className="min-h-screen bg-background lg:grid lg:grid-cols-[minmax(420px,46%)_1fr]">
      <section className="hidden min-h-screen bg-[#eaf4ff] p-10 lg:flex lg:flex-col">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg bg-primary font-bold text-white">
            L
          </div>
          <span className="text-xl font-semibold">LogiSphere</span>
        </div>
        <p className="mt-16 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          AI Control Tower
        </p>
        <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight">
          Move freight with clarity.
          <br />
          Act before exceptions become delays.
        </h1>
        <p className="mt-6 max-w-lg text-base text-muted-foreground">
          Live multimodal visibility, predictive exceptions, and compliant
          decisions in one calm workspace.
        </p>
        <div className="mt-14 flex-1 rounded-2xl border border-sky-200 bg-[#dcefff] opacity-80" />
        <p className="mt-6 text-xs text-muted-foreground">
          © 2026 LogiSphere · Enterprise Logistics Intelligence
        </p>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[520px] rounded-2xl border border-border bg-card p-7 shadow-[0_12px_32px_rgba(15,31,51,0.1)] sm:p-12">
          <div className="flex items-center gap-3">
            <div className="grid size-8 place-items-center rounded-lg bg-primary font-bold text-white">
              L
            </div>
            <span className="text-xl font-semibold">LogiSphere</span>
          </div>
          <h2 className="mt-10 text-3xl font-semibold">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          {children}
        </div>
      </section>
    </main>
  );
}
