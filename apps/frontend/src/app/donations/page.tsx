"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useDonations } from "@/application/hooks/useDonations";
import { useTenant } from "@/application/hooks/useTenant";
import { CountdownTimer } from "@/infrastructure/ui/components/CountdownTimer";
import { OperationsPageFrame } from "@/infrastructure/ui/layouts/OperationsPageFrame";

const DonationsDashboardPage = (): JSX.Element => {
  const { activeTenantId, activeOrganization } = useTenant();
  const { data, isLoading, isError, error, refetch } = useDonations(activeTenantId);

  const activeDonations = useMemo(() => {
    return data.filter((donation) => donation.status !== "delivered");
  }, [data]);

  const deliveredDonations = useMemo(() => {
    return data.filter((donation) => donation.status === "delivered");
  }, [data]);

  return (
    <OperationsPageFrame sectionLabel="Donaciones" showRoleSwitch>
      <section className="grid gap-6 lg:grid-cols-12">
        <article className="glass-card premium-shadow rounded-[2.5rem] p-8 lg:col-span-8">
          <div className="flex items-center gap-2">
            <span className="h-1 w-8 rounded-full bg-primary" />
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
              Gestor de Excedentes
            </p>
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-on-surface dark:text-zinc-50 lg:text-5xl">
            Tu Red Urbana de Rescate
          </h1>
          <p className="mt-3 text-sm text-on-surface-variant dark:text-zinc-400">
            Optimizando la logística inversa para {activeOrganization.name}.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/donations/new"
              className="inline-flex items-center gap-3 rounded-2xl bg-primary px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-on-primary shadow-xl shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[22px]">add_circle</span>
              Donar ahora
            </Link>

            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-on-surface border border-zinc-200 shadow-sm transition-all hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
            >
              <span className="material-symbols-outlined text-[22px]">refresh</span>
              Sincronizar
            </button>
          </div>
        </article>

        <article className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900 p-8 text-white shadow-2xl lg:col-span-4 flex flex-col justify-between">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Resumen Operativo
          </p>
          <div className="mt-6 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-sm font-medium text-zinc-400">Activas</span>
              <span className="text-3xl font-black">{activeDonations.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">Histórico</span>
              <span className="text-3xl font-black text-primary-fixed-dim">{deliveredDonations.length}</span>
            </div>
          </div>
        </article>
      </section>

      {isError && (
        <p className="mt-6 rounded-[2rem] border border-error/20 bg-error-container/30 px-6 py-4 text-sm text-on-error-container backdrop-blur-md">
          {error}
        </p>
      )}

      <section className="mt-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <h2 className="text-2xl font-black tracking-tight text-on-surface dark:text-zinc-50">Operaciones en curso</h2>
             <span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-black text-zinc-500 dark:bg-zinc-800">
               {activeDonations.length} total
             </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            {isLoading ? "Consultando backend..." : "Estado: En línea"}
          </span>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="text-sm font-bold text-zinc-400">Cargando portafolio de donaciones...</p>
          </div>
        ) : activeDonations.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900/50">
            <span className="material-symbols-outlined text-4xl text-zinc-300">inventory_2</span>
            <p className="mt-2 text-sm font-bold text-zinc-400">No hay operaciones activas en este momento.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {activeDonations.map((donation) => (
              <article
                key={donation.id}
                className="glass-card interactive-glow rounded-[2rem] p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-on-surface dark:text-zinc-50 leading-tight">{donation.title}</h3>
                    <p className="mt-1 text-sm font-bold text-primary">{donation.quantity} kg disponibles</p>
                  </div>

                  <span className="rounded-full bg-zinc-100 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {donation.status}
                  </span>
                </div>

                <div className="mt-6 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900/40">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Tiempo para caducidad
                  </p>
                  <CountdownTimer expirationDate={donation.expirationDate} />
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">ID: {donation.id.slice(0, 8)}</p>
                  <Link
                    href={`/logistics/${donation.id}`}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:underline"
                  >
                    Detalles
                    <span className="material-symbols-outlined text-[18px]">trending_flat</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </OperationsPageFrame>
  );
};

export default DonationsDashboardPage;
