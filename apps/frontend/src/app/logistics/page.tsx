"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { useDonations } from "@/application/hooks/useDonations";
import { useTenant } from "@/application/hooks/useTenant";
import { BusinessSelector } from "@/infrastructure/ui/components/BusinessSelector";
import { LogisticsMap } from "@/infrastructure/ui/components/LogisticsMap";
import { SurplusCard } from "@/infrastructure/ui/components/SurplusCard";

const LogisticsPage = (): JSX.Element => {
  const rootRef = useRef<HTMLElement | null>(null);
  const { activeTenantId, activeOrganization } = useTenant();
  const { data, isLoading, isError, error, refetch, updateStatus } = useDonations(activeTenantId);

  const rescuedQuantity = useMemo(() => data.reduce((acc, donation) => acc + donation.quantity, 0), [data]);

  const pendingCount = useMemo(
    () => data.filter((donation) => donation.status === "pending").length,
    [data]
  );

  useLayoutEffect(() => {
    if (!rootRef.current) {
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-surplus-card]",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.1
        }
      );
    }, rootRef);

    return () => {
      context.revert();
    };
  }, [activeTenantId, data.length]);

  return (
    <main ref={rootRef} className="min-h-screen bg-surface px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-5 rounded-[2rem] border border-slate-900/10 bg-white/80 p-6 shadow-[0_24px_68px_rgba(15,23,42,0.12)] backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.24em] text-slate-500">
              RURA Logistics Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink lg:text-4xl">
              Coordinacion operativa de rescate alimentario
            </h1>
            <p className="mt-2 text-sm text-slate-600">Organizacion: {activeOrganization.name}</p>
          </div>

          <BusinessSelector />
        </header>

        <section className="grid gap-5 lg:grid-cols-12">
          <article className="rounded-3xl bg-gradient-to-br from-accent to-teal-500 p-7 text-white shadow-[0_28px_72px_rgba(15,118,110,0.35)] lg:col-span-7">
            <p className="text-xs uppercase tracking-[0.2em] text-teal-100">Impact Report</p>
            <p className="mt-4 text-5xl font-semibold leading-none">{rescuedQuantity} kg</p>
            <p className="mt-3 text-sm text-teal-50/95">
              Food rescued this week across the selected tenant.
            </p>
          </article>

          <article className="rounded-3xl border border-amber-200 bg-white p-7 shadow-[0_18px_44px_rgba(15,23,42,0.1)] lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Action Required</p>
            <p className="mt-4 text-5xl font-semibold leading-none text-ink">{pendingCount}</p>
            <p className="mt-3 text-sm text-slate-600">Pending pickups waiting for assignment.</p>
            <button
              type="button"
              onClick={() => {
                void refetch();
              }}
              className="mt-6 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent hover:text-white"
            >
              Refresh data
            </button>
          </article>
        </section>

        {isError ? (
          <p className="rounded-2xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-ember">
            {error}
          </p>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-ink">Recent Donations</h2>
              <span className="text-sm text-slate-500">
                {isLoading ? "Loading..." : `${data.length} operations`}
              </span>
            </div>

            {!isLoading && !isError && data.length === 0 ? (
              <p className="rounded-2xl border border-slate-900/10 bg-white px-4 py-6 text-center text-sm text-slate-500">
                No hay donaciones cargadas para este tenant.
              </p>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              {data.map((donation) => (
                <SurplusCard key={donation.id} donation={donation} updateStatus={updateStatus} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <LogisticsMap />
          </div>
        </section>
      </div>
    </main>
  );
};

export default LogisticsPage;
