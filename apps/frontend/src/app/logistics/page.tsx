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
    <OperationsPageFrame sectionLabel="Flujo Voluntario" showRoleSwitch>
      {activeUserType !== "volunteer" ? (
        <section className="mb-5 rounded-2xl border border-tertiary/20 bg-tertiary/10 px-4 py-4 text-sm text-tertiary">
          Cambia a modo Voluntario para ejecutar rutas y activar garantia de entrega.
        </section>
      ) : null}

      <section className="mb-6 grid gap-5 lg:grid-cols-12">
        <article className="rounded-[2rem] bg-primary p-7 text-on-primary shadow-[0_22px_56px_rgba(0,109,55,0.35)] lg:col-span-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-fixed-dim">
            Feed de transporte
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Solicitudes en movimiento</h1>
          <p className="mt-2 text-sm text-emerald-100">
            Tenant activo: {activeOrganization.name}. Toma rutas requested y confirma recogida con evidencia.
          </p>
        </article>

        <article className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-[0_18px_44px_rgba(15,23,42,0.1)] lg:col-span-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">Disponibles</p>
          <p className="mt-2 text-4xl font-extrabold text-on-surface">{requestedDonations.length}</p>
          <p className="mt-2 text-sm text-on-surface-variant">
            Donaciones solicitadas pendientes de recogida.
          </p>
        </article>
      </section>

      {urgentError ? (
        <p className="mb-4 rounded-2xl border border-error/20 bg-error-container px-4 py-3 text-sm text-on-error-container">
          {urgentError}
        </p>
      ) : null}

      {isError ? (
        <p className="mb-4 rounded-2xl border border-error/20 bg-error-container px-4 py-3 text-sm text-on-error-container">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="rounded-2xl bg-white/90 px-4 py-5 text-sm text-on-surface-variant shadow-sm">
          Cargando feed de transporte...
        </p>
      ) : null}

      {!isLoading && requestedDonations.length === 0 ? (
        <p className="rounded-2xl bg-white/90 px-4 py-5 text-sm text-on-surface-variant shadow-sm">
          No hay solicitudes requested en este momento.
        </p>
      ) : null}

      <section className="space-y-4">
        {requestedDonations.map((donation) => {
          const urgentNeed = urgentByDonation.get(donation.id);

          return (
            <article
              key={donation.id}
              className="rounded-[1.75rem] border border-slate-900/10 bg-white/95 p-5 shadow-[0_16px_36px_rgba(15,23,42,0.09)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
                        urgentNeed
                          ? "bg-secondary-container text-on-secondary-container"
                          : "bg-tertiary/10 text-tertiary"
                      }`}
                    >
                      {urgentNeed ? "Urgencia" : "Prioridad normal"}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.12em] text-on-surface-variant">
                      #{donation.id.slice(0, 8)}
                    </span>
                  </div>

                  <h2 className="mt-2 text-2xl font-extrabold text-on-surface">{donation.title}</h2>
                  <p className="mt-1 text-sm text-on-surface-variant">{donation.quantity} kg</p>
                </div>

                <Link
                  href={`/logistics/${donation.id}`}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-on-primary"
                >
                  Ver detalle
                </Link>
              </div>

              <div className="mt-4 grid gap-3 rounded-2xl bg-surface-container-low p-4 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                    Caducidad
                  </p>
                  <CountdownTimer expirationDate={donation.expirationDate} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                    Garantia
                  </p>
                  <p className="mt-1 text-sm font-semibold text-secondary">Entrega maxima en 2 horas</p>
                </div>
              </div>

              {urgentNeed ? (
                <p className="mt-3 text-xs font-semibold text-secondary">
                  {urgentNeed.title} - prioridad {urgentNeed.priority.toUpperCase()}
                </p>
              ) : null}
            </article>
          );
        })}
      </section>
    </OperationsPageFrame>
  );
};

export default LogisticsPage;
