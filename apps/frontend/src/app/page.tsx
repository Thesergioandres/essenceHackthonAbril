import Link from "next/link";

const actions = [
  {
    href: "/logistics",
    label: "Open Logistics Dashboard"
  },
  {
    href: "/health",
    label: "Open Health Check"
  },
  {
    href: "https://railway.app",
    label: "Railway Dashboard"
  }
];

const HomePage = (): JSX.Element => {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 lg:px-10 lg:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 right-8 h-52 w-52 rounded-full bg-accent/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-14 left-6 h-40 w-40 rounded-full bg-ember/20 blur-2xl"
      />

      <section
        data-rura-stagger
        className="rounded-[2rem] border border-slate-900/10 bg-white/80 p-8 shadow-[0_26px_80px_rgba(15,23,42,0.12)] backdrop-blur lg:p-12"
      >
        <p className="font-display text-xs uppercase tracking-[0.24em] text-slate-500">
          RURA Foundation Scaffold
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-ink lg:text-6xl">
          Monorepo listo para SaaS multi-tenant con fronteras limpias entre capas.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-slate-700 lg:text-lg">
          Frontend en Next.js con App Router, Tailwind y GSAP. Backend en Node con
          Arquitectura Hexagonal, TypeScript estricto y health check conectado por API.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {actions.map((action) => {
            const isExternal = action.href.startsWith("http");

            if (isExternal) {
              return (
                <a
                  key={action.href}
                  href={action.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-slate-900/10 bg-white px-5 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                >
                  {action.label}
                </a>
              );
            }

            return (
              <Link
                key={action.href}
                href={action.href}
                className="rounded-full border border-accent/30 bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent/90"
              >
                {action.label}
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default HomePage;