"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useDonations } from "@/application/hooks/useDonations";
import { useImpactStats } from "@/application/hooks/useImpactStats";
import { useTenant } from "@/application/hooks/useTenant";
import { AnimatedCounter } from "@/infrastructure/ui/components/AnimatedCounter";
import { OperationsPageFrame } from "@/infrastructure/ui/layouts/OperationsPageFrame";

interface DailyComparisonPoint {
  day: string;
  rescuedKg: number;
  wasteBaselineKg: number;
}

const DAYS = ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM"];

const buildComparisonSeries = (rescuedFoodKg: number): DailyComparisonPoint[] => {
  const baselinePerDay = rescuedFoodKg > 0 ? rescuedFoodKg / DAYS.length : 0;

  return DAYS.map((day, index) => {
    const modulation = 0.72 + ((index * 19) % 35) / 100;
    const rescuedKg = Math.max(4, baselinePerDay * modulation);
    const wasteBaselineKg = rescuedKg * 1.25;

    return {
      day,
      rescuedKg,
      wasteBaselineKg
    };
  });
};

const HomePage = (): JSX.Element => {
  const { activeTenantId, activeOrganization } = useTenant();
  const { stats, isLoading, isError, error, refetch } = useImpactStats(activeTenantId);
  const { data: donations } = useDonations(activeTenantId);

  const comparisonSeries = useMemo(() => {
    return buildComparisonSeries(stats.rescuedFoodKg);
  }, [stats.rescuedFoodKg]);

  const maxComparisonValue = useMemo(() => {
    return Math.max(
      1,
      ...comparisonSeries.map((item) => Math.max(item.rescuedKg, item.wasteBaselineKg))
    );
  }, [comparisonSeries]);

  const recentDonations = useMemo(() => {
    return [...donations]
      .sort((leftDonation, rightDonation) => {
        const leftTimestamp = new Date(leftDonation.expirationDate).getTime();
        const rightTimestamp = new Date(rightDonation.expirationDate).getTime();
        return rightTimestamp - leftTimestamp;
      })
      .slice(0, 3);
  }, [donations]);

  const co2InTons = stats.co2AvoidedKg / 1000;

  return (
    <OperationsPageFrame sectionLabel="Dashboard de Impacto" showRoleSwitch>
      <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Metricas FAO
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-on-surface">
            Impacto Planetario
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Organizacion activa: {activeOrganization.name}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            void refetch();
          }}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-on-primary transition hover:brightness-110"
        >
          <span className="material-symbols-outlined text-[18px]">sync</span>
          Actualizar
        </button>
      </section>

      {isError ? (
        <p className="mb-5 rounded-2xl border border-error/25 bg-error-container px-4 py-3 text-sm text-on-error-container">
          {error}
        </p>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-12">
        <article className="relative overflow-hidden rounded-[2rem] bg-primary-container p-8 text-on-primary shadow-[0_24px_62px_rgba(39,174,96,0.35)] lg:col-span-6">
          <div className="absolute -bottom-24 -right-20 h-56 w-56 rounded-full bg-primary-fixed-dim/20 blur-3xl" />
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-fixed-dim">
            Kilogramos Rescatados
          </p>
          <p className="mt-5 text-6xl font-extrabold leading-none tracking-tight">
            <AnimatedCounter value={stats.rescuedFoodKg} suffix=" kg" />
          </p>
          <p className="mt-4 max-w-sm text-sm text-emerald-50/95">
            Equivalente al alimento que habria terminado como desperdicio en rutas urbanas sin coordinacion.
          </p>
          <p className="mt-5 text-xs uppercase tracking-[0.14em] text-emerald-50/85">
            {isLoading ? "Sincronizando metricas..." : `${stats.deliveredDonationsCount} entregas verificadas`}
          </p>
        </article>

        <article className="rounded-[2rem] bg-tertiary-container p-7 text-on-tertiary shadow-[0_20px_52px_rgba(0,100,151,0.28)] lg:col-span-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-tertiary-fixed-dim">
            CO2 evitado
          </p>
          <p className="mt-5 text-5xl font-extrabold leading-none">
            <AnimatedCounter value={co2InTons} decimals={2} suffix=" t" />
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
            Escala FAO
          </p>
        </article>

        <article className="rounded-[2rem] bg-secondary-container p-7 text-on-secondary shadow-[0_20px_48px_rgba(252,143,52,0.32)] lg:col-span-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-100">
            Raciones generadas
          </p>
          <p className="mt-5 text-5xl font-extrabold leading-none">
            <AnimatedCounter value={stats.mealEquivalents} decimals={0} />
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-orange-100">
            1 comida cada 0.5kg
          </p>
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-12">
        <article className="rounded-[2rem] border border-slate-900/10 bg-surface-container-lowest p-6 shadow-[0_18px_44px_rgba(15,23,42,0.08)] lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-on-surface">Kg desperdicio vs Kg salvados</h2>
              <p className="text-sm text-on-surface-variant">
                Comparativa semanal de recuperacion y desperdicio evitado.
              </p>
            </div>

            <div className="flex gap-4 text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Salvados
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-secondary" /> Desperdicio
              </span>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-7 gap-2">
            {comparisonSeries.map((point) => {
              const rescuedHeightPercent = Math.max(
                8,
                (point.rescuedKg / maxComparisonValue) * 100
              );
              const wasteHeightPercent = Math.max(
                rescuedHeightPercent,
                (point.wasteBaselineKg / maxComparisonValue) * 100
              );

              return (
                <div key={point.day} className="flex flex-col items-center gap-2">
                  <div className="flex h-48 w-full items-end gap-1 rounded-2xl bg-surface-container-low px-1.5 pb-1.5">
                    <div
                      className="w-1/2 rounded-lg bg-primary"
                      style={{ height: `${rescuedHeightPercent}%` }}
                    />
                    <div
                      className="w-1/2 rounded-lg bg-secondary"
                      style={{ height: `${wasteHeightPercent}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                    {point.day}
                  </p>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-900/10 bg-surface-container-low p-6 shadow-[0_18px_44px_rgba(15,23,42,0.08)] lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-on-surface">Ultimos rescates</h2>
            <Link
              href="/history"
              className="text-xs font-bold uppercase tracking-[0.14em] text-primary"
            >
              Ver historial
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {recentDonations.length === 0 ? (
              <p className="rounded-2xl bg-surface-container-lowest px-4 py-4 text-sm text-slate-500">
                Aun no hay donaciones registradas para este tenant.
              </p>
            ) : (
              recentDonations.map((donation) => (
                <article
                  key={donation.id}
                  className="rounded-2xl bg-surface-container-lowest px-4 py-3 shadow-sm"
                >
                  <p className="text-sm font-bold text-on-surface">{donation.title}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">{donation.quantity} kg</p>
                  <span className="mt-2 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                    {donation.status}
                  </span>
                </article>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="mt-7 overflow-hidden rounded-[2rem] bg-inverse-surface p-7 text-inverse-on-surface shadow-[0_20px_50px_rgba(15,23,42,0.22)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Tu red de rescate esta reduciendo hambre y emisiones.
            </h2>
            <p className="mt-3 text-sm text-slate-200">
              Supuestos FAO aplicados: 100% de desperdicio evitado, {stats.assumptions.co2KgPerFoodKg}kg CO2 por kg rescatado y 1 comida por cada {stats.assumptions.foodKgPerMeal}kg.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-2xl font-extrabold text-primary-fixed-dim">
                <AnimatedCounter value={stats.deliveredDonationsCount} />
              </p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                Entregas verificadas
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-2xl font-extrabold text-orange-200">
                <AnimatedCounter value={stats.assumptions.wasteAvoidanceRate * 100} suffix="%" />
              </p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                Rescate efectivo
              </p>
            </div>
            <div className="col-span-2 rounded-2xl bg-white/10 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">
                Objetivos ODS
              </p>
              <p className="mt-1 text-lg font-bold">ODS 2 Hambre Cero + ODS 12 Produccion Responsable</p>
            </div>
          </div>
        </div>
      </section>
    </OperationsPageFrame>
  );
};

export default HomePage;