"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useDonations } from "@/application/hooks/useDonations";
import { useTenant } from "@/application/hooks/useTenant";
import { UrgentNeed } from "@/domain/models/UrgentNeed";
import { CountdownTimer } from "@/infrastructure/ui/components/CountdownTimer";
import { getUrgentNeeds } from "@/infrastructure/network/urgentNeedsApi";
import { OperationsPageFrame } from "@/infrastructure/ui/layouts/OperationsPageFrame";

const LogisticsPage = (): JSX.Element => {
  const { activeTenantId, activeOrganization, activeUserType } = useTenant();
  const { data, isLoading, isError, error } = useDonations(activeTenantId);

  const [urgentNeeds, setUrgentNeeds] = useState<UrgentNeed[]>([]);
  const [urgentError, setUrgentError] = useState<string | null>(null);

  const requestedDonations = useMemo(() => {
    return data
      .filter((donation) => donation.status === "requested")
      .sort((leftDonation, rightDonation) => {
        return (
          new Date(leftDonation.expirationDate).getTime() -
          new Date(rightDonation.expirationDate).getTime()
        );
      });
  }, [data]);

  const urgentByDonation = useMemo(() => {
    const map = new Map<string, UrgentNeed>();

    urgentNeeds.forEach((urgentNeed) => {
      if (urgentNeed.status === "closed" || !urgentNeed.linkedDonationId) {
        return;
      }

      map.set(urgentNeed.linkedDonationId, urgentNeed);
    });

    return map;
  }, [urgentNeeds]);

  useEffect(() => {
    const fetchUrgentNeeds = async (): Promise<void> => {
      setUrgentError(null);

      try {
        const needs = await getUrgentNeeds(activeTenantId);
        setUrgentNeeds(needs);
      } catch (requestError: unknown) {
        const message = requestError instanceof Error ? requestError.message : "No se pudieron cargar urgencias";
        setUrgentNeeds([]);
        setUrgentError(message);
      }
    };

    void fetchUrgentNeeds();
  }, [activeTenantId]);

  return (
    <OperationsPageFrame sectionLabel="Logística" showRoleSwitch>
      {activeUserType !== "volunteer" && (
        <section className="mb-6 rounded-3xl border border-secondary/20 bg-secondary-container/10 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
             <span className="material-symbols-outlined text-secondary">error</span>
             <p className="text-sm font-bold text-on-secondary-container">
               Modo Visualización: Cambia a "Voluntario" para asignar rutas e iniciar entregas.
             </p>
          </div>
        </section>
      )}

      <section className="mb-8 grid gap-6 lg:grid-cols-12">
        <article className="glass-card premium-shadow rounded-[2.5rem] p-8 lg:col-span-8 overflow-hidden relative">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="flex items-center gap-2">
            <span className="h-1 w-8 rounded-full bg-primary" />
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
              Control de Transporte
            </p>
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-on-surface dark:text-zinc-50 lg:text-5xl">Operaciones de Ruta</h1>
          <p className="mt-3 text-sm text-on-surface-variant dark:text-zinc-400">
            Gestionando la red de logística inversa para {activeOrganization.name}.
          </p>
        </article>

        <article className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900 p-8 text-white shadow-2xl lg:col-span-4 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Pendientes de Recogida</p>
          <p className="mt-6 text-5xl font-black text-primary-fixed-dim">{requestedDonations.length}</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Sistema en línea</p>
          </div>
        </article>
      </section>

      {urgentError && (
        <p className="mb-6 rounded-3xl border border-error/20 bg-error-container/30 px-6 py-4 text-sm text-on-error-container backdrop-blur-md">
          {urgentError}
        </p>
      )}

      {isError && (
        <p className="mb-6 rounded-3xl border border-error/20 bg-error-container/30 px-6 py-4 text-sm text-on-error-container backdrop-blur-md">
          {error}
        </p>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight text-on-surface dark:text-zinc-50">Solicitudes Activas</h2>
        {isLoading && <span className="animate-pulse text-[10px] font-bold uppercase tracking-widest text-primary">Sincronizando...</span>}
      </div>

      {!isLoading && requestedDonations.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
           <span className="material-symbols-outlined text-4xl text-zinc-300">local_shipping</span>
           <p className="mt-4 text-sm font-bold text-zinc-400 tracking-wide">No hay rutas asignadas para transporte en este momento.</p>
        </div>
      ) : (
        <section className="space-y-6">
          {requestedDonations.map((donation) => {
            const urgentNeed = urgentByDonation.get(donation.id);

            return (
              <article
                key={donation.id}
                className="glass-card interactive-glow rounded-[2.5rem] p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="flex-1 min-w-[280px]">
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                          urgentNeed
                            ? "bg-secondary text-white"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {urgentNeed ? "Urgencia Crítica" : "Propuesta Estandar"}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        #{donation.id.slice(0, 8)}
                      </span>
                    </div>

                    <h2 className="mt-4 text-2xl font-black text-on-surface dark:text-zinc-50 leading-tight">
                      {donation.title}
                    </h2>
                    <p className="mt-1 text-sm font-bold text-primary">{donation.quantity} kg listos para recogida</p>
                  </div>

                  <Link
                    href={`/logistics/${donation.id}`}
                    className="flex h-12 items-center gap-3 rounded-2xl bg-zinc-900 px-6 text-xs font-black uppercase tracking-widest text-white transition-transform hover:scale-105 active:scale-95 dark:bg-white dark:text-zinc-900 shadow-lg"
                  >
                    Abrir Ruta
                    <span className="material-symbols-outlined text-[18px]">near_me</span>
                  </Link>
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[1.75rem] bg-zinc-50 p-6 dark:bg-black/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ventana de Caducidad</p>
                    <div className="mt-2">
                      <CountdownTimer expirationDate={donation.expirationDate} />
                    </div>
                  </div>
                  <div className="rounded-[1.75rem] border border-secondary/10 bg-secondary-container/5 p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary/60">Garantía de Entrega</p>
                    <p className="mt-3 text-sm font-black text-on-secondary-container tracking-tight">Recogida Verificada &lt; 120 min</p>
                  </div>
                </div>

                {urgentNeed && (
                  <div className="mt-4 rounded-2xl bg-secondary/5 border border-secondary/10 px-6 py-3">
                     <p className="text-xs font-bold text-secondary italic">
                        Nota del Receptor: {urgentNeed.title} ({urgentNeed.priority.toUpperCase()})
                     </p>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </OperationsPageFrame>
  );
};

export default LogisticsPage;
