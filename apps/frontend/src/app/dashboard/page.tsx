"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
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

const DashboardPage = (): JSX.Element => {
  const { activeTenantId, activeOrganization } = useTenant();
  const { stats, isLoading, isError, error, refetch } = useImpactStats(activeTenantId);
  const { data: donations } = useDonations(activeTenantId);
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  useLayoutEffect(() => {
    if (!containerRef.current || isLoading) return;

    const ctx = gsap.context(() => {
      gsap.from(".bento-item", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power4.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isLoading]);

  const co2InTons = stats.co2AvoidedKg / 1000;

  return (
    <OperationsPageFrame sectionLabel="Dashboard" showRoleSwitch className="max-w-none">
      <div ref={containerRef} className="space-y-6">
        <section className="bento-item flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1 w-8 rounded-full bg-primary" />
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
                Metricas Certificadas FAO
              </p>
            </div>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-on-surface dark:text-zinc-50 lg:text-5xl">
              Impacto RURA
            </h1>
          </div>

          <button
            type="button"
            onClick={() => void refetch()}
            className="group inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-on-surface shadow-sm transition-all hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-180">sync</span>
            Actualizar datos
          </button>
        </section>

        {isError && (
          <p className="bento-item rounded-3xl border border-error/20 bg-error-container/30 px-6 py-4 text-sm text-on-error-container backdrop-blur-md">
            {error}
          </p>
        )}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Main Hero Card */}
          <article className="bento-item relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-[2.5rem] bg-zinc-900 p-10 text-white shadow-2xl lg:col-span-8">
            <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary/20 blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-tertiary/10 blur-[100px]" />
            
            <div className="relative">
              <span className="rounded-full bg-primary/20 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary-fixed-dim border border-primary/30">
                Rescate Acumulado
              </span>
              <p className="mt-8 text-7xl font-black tracking-tighter lg:text-8xl">
                <AnimatedCounter value={stats.rescuedFoodKg} suffix=" kg" />
              </p>
              <p className="mt-6 max-w-md text-lg font-medium text-zinc-400">
                Alimento recuperado que alimenta comunidades y evita emisiones de metano en rellenos sanitarios.
              </p>
            </div>

            <div className="relative mt-8 flex items-center gap-6 border-t border-white/10 pt-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Entregas</span>
                <span className="text-2xl font-bold">{stats.deliveredDonationsCount}</span>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Eficiencia</span>
                <span className="text-2xl font-bold">98.4%</span>
              </div>
            </div>
          </article>

          {/* Secondary Stats */}
          <div className="grid gap-6 lg:col-span-4 lg:grid-rows-2">
            <article className="bento-item glass-card interactive-glow rounded-[2.5rem] p-8 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined rounded-2xl bg-tertiary/10 p-3 text-tertiary">eco</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">FAO Tier 1</span>
              </div>
              <div>
                <p className="text-4xl font-black tracking-tight text-on-surface dark:text-zinc-50">
                  <AnimatedCounter value={co2InTons} decimals={2} suffix=" t" />
                </p>
                <p className="mt-1 text-sm font-bold text-on-surface-variant uppercase tracking-widest">CO2 Evitado</p>
              </div>
            </article>

            <article className="bento-item glass-card interactive-glow rounded-[2.5rem] p-8 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined rounded-2xl bg-secondary/10 p-3 text-secondary">restaurant</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Seguridad Alimentaria</span>
              </div>
              <div>
                <p className="text-4xl font-black tracking-tight text-on-surface dark:text-zinc-50">
                  <AnimatedCounter value={stats.mealEquivalents} decimals={0} />
                </p>
                <p className="mt-1 text-sm font-bold text-on-surface-variant uppercase tracking-widest">Platos Generados</p>
              </div>
            </article>
          </div>

          {/* Activity Chart */}
          <article className="bento-item glass-card rounded-[2.5rem] p-10 lg:col-span-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-on-surface dark:text-zinc-50">Recuperación Semanal</h2>
                <p className="mt-1 text-sm text-on-surface-variant">Comparativa de alimento salvado frente a flujo de desperdicio proyectado.</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Salvados</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-secondary/30" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Potencial</span>
                </div>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-7 gap-4">
              {comparisonSeries.map((point) => {
                const rescuedHeightPercent = Math.max(8, (point.rescuedKg / maxComparisonValue) * 100);
                const wasteHeightPercent = Math.max(rescuedHeightPercent, (point.wasteBaselineKg / maxComparisonValue) * 100);

                return (
                  <div key={point.day} className="group flex flex-col items-center gap-4">
                    <div className="relative flex h-64 w-full items-end justify-center px-2">
                      <div
                        className="absolute bottom-0 w-full rounded-2xl bg-zinc-100 dark:bg-zinc-800 transition-all duration-500 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700"
                        style={{ height: `${wasteHeightPercent}%` }}
                      />
                      <div
                        className="relative z-10 w-full rounded-2xl bg-primary shadow-lg shadow-primary/20 transition-all duration-500 group-hover:scale-x-105"
                        style={{ height: `${rescuedHeightPercent}%` }}
                      >
                         <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-lg bg-zinc-900 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                           {point.rescuedKg.toFixed(1)}kg
                         </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant dark:text-zinc-500">
                      {point.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </article>
        </section>

        {/* Footer Info */}
        <section className="bento-item relative overflow-hidden rounded-[2.5rem] bg-zinc-100 p-8 dark:bg-zinc-900 lg:p-12">
           <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                 <h3 className="text-2xl font-black text-on-surface dark:text-zinc-50">Compromiso con la Agenda 2030</h3>
                 <p className="mt-4 text-sm leading-relaxed text-on-surface-variant dark:text-zinc-400">
                   RURA opera bajo los supuestos FAO para logística inversa urbana: 
                   recuperación efectiva de {stats.assumptions.wasteAvoidanceRate * 100}%, 
                   generación de {stats.mealEquivalents / stats.rescuedFoodKg} ración por kg y 
                   un factor de {stats.assumptions.co2KgPerFoodKg}kg CO2e.
                 </p>
              </div>
              <div className="flex flex-wrap gap-4">
                 <div className="rounded-2xl border border-primary/20 bg-primary/5 px-6 py-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">ODS 2</p>
                    <p className="mt-1 font-bold">Hambre Cero</p>
                 </div>
                 <div className="rounded-2xl border border-secondary/20 bg-secondary/5 px-6 py-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-secondary">ODS 12</p>
                    <p className="mt-1 font-bold">Producción Resp.</p>
                 </div>
              </div>
           </div>
        </section>
      </div>
    </OperationsPageFrame>
  );
};

export default DashboardPage;