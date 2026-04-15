"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDonations } from "@/application/hooks/useDonations";
import { useTenant } from "@/application/hooks/useTenant";
import { UrgentNeed } from "@/domain/models/UrgentNeed";
import { CountdownTimer } from "@/infrastructure/ui/components/CountdownTimer";
import { createUrgentNeed, getUrgentNeeds } from "@/infrastructure/network/urgentNeedsApi";
import { OperationsPageFrame } from "@/infrastructure/ui/layouts/OperationsPageFrame";

const FoundationPage = (): JSX.Element => {
  const { activeTenantId, activeOrganization, activeUser, activeUserType, users } = useTenant();
  const { data, isLoading, isError, error, refetch, updateStatus } = useDonations(activeTenantId);

  const [urgentNeeds, setUrgentNeeds] = useState<UrgentNeed[]>([]);
  const [isUrgentLoading, setIsUrgentLoading] = useState<boolean>(true);
  const [urgentError, setUrgentError] = useState<string | null>(null);
  const [isDeclaringCritical, setIsDeclaringCritical] = useState<boolean>(false);
  const [pendingDonationId, setPendingDonationId] = useState<string | null>(null);

  const isFoundationView = activeUserType === "foundation";

  const availableDonations = useMemo(() => {
    return data
      .filter((donation) => donation.status === "available")
      .sort((leftDonation, rightDonation) => {
        return (
          new Date(leftDonation.expirationDate).getTime() -
          new Date(rightDonation.expirationDate).getTime()
        );
      });
  }, [data]);

  const defaultVolunteer = useMemo(() => {
    return users.find(
      (user) => user.type === "volunteer" && user.tenantIds.includes(activeTenantId)
    );
  }, [activeTenantId, users]);

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

  const loadUrgentNeeds = useCallback(async (): Promise<void> => {
    setIsUrgentLoading(true);
    setUrgentError(null);

    try {
      const needs = await getUrgentNeeds(activeTenantId);
      setUrgentNeeds(needs);
    } catch (requestError: unknown) {
      const message = requestError instanceof Error ? requestError.message : "No se pudo cargar urgencias";
      setUrgentNeeds([]);
      setUrgentError(message);
    } finally {
      setIsUrgentLoading(false);
    }
  }, [activeTenantId]);

  useEffect(() => {
    void loadUrgentNeeds();
  }, [loadUrgentNeeds]);

  const handleRequest = async (
    donationId: string,
    mode: "request" | "self"
  ): Promise<void> => {
    const assignedVolunteerId =
      mode === "self" ? activeUser.id : defaultVolunteer?.id ?? activeUser.id;

    setPendingDonationId(donationId);

    try {
      await updateStatus({
        donationId,
        status: "requested",
        assignedVolunteerId
      });

      await refetch();
      await loadUrgentNeeds();
    } finally {
      setPendingDonationId(null);
    }
  };

  const declareCriticalUrgency = async (): Promise<void> => {
    if (availableDonations.length === 0) {
      setUrgentError("No hay donaciones disponibles para marcar urgencia critica.");
      return;
    }

    setIsDeclaringCritical(true);
    setUrgentError(null);

    try {
      const priorityDonation = availableDonations[0];

      await createUrgentNeed(
        {
          title: `Urgencia critica - ${priorityDonation.title}`,
          details: "Priorizacion inmediata para evitar desperdicio por vencimiento.",
          quantityNeededKg: Math.max(1, priorityDonation.quantity),
          neededBefore: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          priority: "critical",
          linkedDonationId: priorityDonation.id
        },
        activeTenantId
      );

      await loadUrgentNeeds();
    } catch (requestError: unknown) {
      const message = requestError instanceof Error ? requestError.message : "No se pudo declarar urgencia";
      setUrgentError(message);
    } finally {
      setIsDeclaringCritical(false);
    }
  };

  return (
    <OperationsPageFrame sectionLabel="Flujo Fundacion" showRoleSwitch>
      {!isFoundationView ? (
        <section className="mb-6 rounded-2xl border border-error/20 bg-error-container px-4 py-4 text-sm text-on-error-container">
          Cambia a modo Fundacion para gestionar solicitudes y urgencias de la red.
        </section>
      ) : null}

      <section className="relative mb-6 overflow-hidden rounded-[2rem] border border-red-200 bg-error-container px-6 py-6 shadow-[0_18px_44px_rgba(15,23,42,0.1)]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-error/20 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-error-container">
              Estado critico
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-on-error-container">
              Declarar urgencia critica
            </h1>
            <p className="mt-2 text-sm text-on-error-container/85">
              Tenant activo: {activeOrganization.name}. Eleva prioridad para capturar voluntarios y rutas cercanas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              void declareCriticalUrgency();
            }}
            disabled={isDeclaringCritical || !isFoundationView}
            className="inline-flex items-center gap-2 rounded-xl bg-error px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-on-error shadow-[0_14px_28px_rgba(186,26,26,0.3)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[18px]">campaign</span>
            {isDeclaringCritical ? "Activando..." : "Activar alerta"}
          </button>
        </div>
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

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Donaciones disponibles</h2>
            <p className="text-sm text-on-surface-variant">
              {isLoading ? "Cargando..." : `${availableDonations.length} donaciones en ventana activa`}
            </p>
          </div>

          <Link
            href="/history"
            className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-primary"
          >
            Ir a historial
          </Link>
        </div>

        {isLoading ? (
          <p className="rounded-2xl bg-white/90 px-4 py-5 text-sm text-on-surface-variant shadow-sm">
            Cargando donaciones...
          </p>
        ) : null}

        {!isLoading && availableDonations.length === 0 ? (
          <p className="rounded-2xl bg-white/90 px-4 py-5 text-sm text-on-surface-variant shadow-sm">
            No hay donaciones disponibles por ahora.
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {availableDonations.map((donation) => {
            const urgentNeed = urgentByDonation.get(donation.id);

            return (
              <article
                key={donation.id}
                className="overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white/95 shadow-[0_16px_36px_rgba(15,23,42,0.09)]"
              >
                <div className="border-b border-slate-100 bg-surface-container-low px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-on-surface">{donation.title}</h3>
                      <p className="mt-1 text-xs text-on-surface-variant">{donation.quantity} kg</p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
                        urgentNeed
                          ? "bg-secondary-container text-on-secondary-container"
                          : "bg-tertiary/10 text-tertiary"
                      }`}
                    >
                      {urgentNeed ? "Urgente" : "Disponible"}
                    </span>
                  </div>
                </div>

                <div className="px-5 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                    Cuenta regresiva de caducidad
                  </p>
                  <CountdownTimer expirationDate={donation.expirationDate} />

                  {urgentNeed ? (
                    <p className="mt-2 text-xs font-semibold text-secondary">
                      Prioridad: {urgentNeed.priority.toUpperCase()} - {urgentNeed.title}
                    </p>
                  ) : null}

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        void handleRequest(donation.id, "request");
                      }}
                      disabled={!isFoundationView || pendingDonationId === donation.id}
                      className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {pendingDonationId === donation.id ? "Procesando..." : "Solicitar"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        void handleRequest(donation.id, "self");
                      }}
                      disabled={!isFoundationView || pendingDonationId === donation.id}
                      className="rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm font-bold text-primary transition hover:bg-primary hover:text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Recoger yo mismo
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {!isUrgentLoading && urgentNeeds.length > 0 ? (
          <p className="mt-5 text-xs uppercase tracking-[0.14em] text-on-surface-variant">
            {urgentNeeds.filter((need) => need.status !== "closed").length} urgencias abiertas en este tenant.
          </p>
        ) : null}
      </section>
    </OperationsPageFrame>
  );
};

export default FoundationPage;
