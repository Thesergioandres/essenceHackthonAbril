export const LogisticsMap = (): JSX.Element => {
  const steps = ["Rescue", "Transit", "Sorting", "Delivery"];

  return (
    <section className="rounded-3xl border border-slate-900/10 bg-white/90 p-6 shadow-[0_18px_44px_rgba(15,23,42,0.1)] backdrop-blur">
      <p className="font-display text-xs uppercase tracking-[0.22em] text-slate-500">
        Active Logistics Traces
      </p>

      <div className="relative mt-5 grid grid-cols-4 gap-4">
        <div className="pointer-events-none absolute left-6 right-6 top-4 h-px bg-slate-200" />

        {steps.map((step, index) => {
          const isCurrentOrDone = index < 2;

          return (
            <div key={step} className="relative flex flex-col items-center gap-2 text-center">
              <div
                className={`h-8 w-8 rounded-full border-2 ${
                  isCurrentOrDone
                    ? "border-accent bg-accent shadow-[0_0_0_8px_rgba(15,118,110,0.12)]"
                    : "border-slate-300 bg-slate-100"
                }`}
              />
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${
                  isCurrentOrDone ? "text-accent" : "text-slate-400"
                }`}
              >
                {step}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <p className="text-sm font-semibold text-ink">Driver: Marcus J.</p>
        <p className="mt-1 text-xs text-slate-500">Estimated arrival: 14:20</p>
      </div>
    </section>
  );
};
