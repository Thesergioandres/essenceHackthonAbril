"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { CreateUrgentNeedPayload, createUrgentNeed, getUrgentNeeds } from "@/infrastructure/network/urgentNeedsApi";
import { UrgentNeed } from "@/domain/models/UrgentNeed";
import { useDonations } from "@/application/hooks/useDonations";
import { useTenant } from "@/application/hooks/useTenant";
import { BusinessSelector } from "@/infrastructure/ui/components/BusinessSelector";
import { LogisticsMap } from "@/infrastructure/ui/components/LogisticsMap";
import { NotificationBell } from "@/infrastructure/ui/components/NotificationBell";
import { SurplusCard } from "@/infrastructure/ui/components/SurplusCard";

interface UrgentNeedFormState {
  title: string;
  details: string;
  quantityNeededKg: number;
  neededBefore: string;
  priority: CreateUrgentNeedPayload["priority"];
  linkedDonationId: string;
}

const toDateTimeLocalValue = (date: Date): string => {
  const timezoneOffsetInMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffsetInMs).toISOString().slice(0, 16);
};

const buildInitialUrgentNeedForm = (): UrgentNeedFormState => {
  const dateInSixHours = new Date(Date.now() + 6 * 60 * 60 * 1000);

  return {
    title: "",
    details: "",
    quantityNeededKg: 20,
    neededBefore: toDateTimeLocalValue(dateInSixHours),
    priority: "high",
    linkedDonationId: ""
  };
};

const LogisticsPage = (): JSX.Element => {
  const rootRef = useRef<HTMLElement | null>(null);
  const { activeTenantId, activeOrganization, activeUser, activeUserType } = useTenant();
  const { data, isLoading, isError, error, refetch, updateStatus } = useDonations(activeTenantId);

  const [urgentNeeds, setUrgentNeeds] = useState<UrgentNeed[]>([]);
  const [isUrgentNeedsLoading, setIsUrgentNeedsLoading] = useState<boolean>(true);
  const [urgentNeedsError, setUrgentNeedsError] = useState<string | null>(null);
  const [isSubmittingUrgentNeed, setIsSubmittingUrgentNeed] = useState<boolean>(false);
  const [urgentNeedForm, setUrgentNeedForm] = useState<UrgentNeedFormState>(
    buildInitialUrgentNeedForm
  );
  const [pendingActionDonationId, setPendingActionDonationId] = useState<string | null>(null);

  const rescuedQuantity = useMemo(() => data.reduce((acc, donation) => acc + donation.quantity, 0), [data]);
  const isFoundationView = activeUserType === "foundation";
  const isVolunteerView = activeUserType === "volunteer";

  const actionableDonations = useMemo(() => {
    if (isFoundationView) {
      return data.filter((donation) => donation.status === "available");
    }

    if (isVolunteerView) {
      return data.filter((donation) => donation.status === "requested");
    }

    return [];
  }, [data, isFoundationView, isVolunteerView]);

  const actionLabel = isFoundationView ? "Solicitar" : "Iniciar Transporte";

  const actionDescription = isFoundationView
    ? "Donaciones disponibles para solicitar"
    : "Solicitudes listas para iniciar traslado";

  const openUrgentNeeds = useMemo(() => {
    return urgentNeeds.filter((urgentNeed) => urgentNeed.status !== "closed");
  }, [urgentNeeds]);

  const urgentNeedByDonationId = useMemo(() => {
    const map = new Map<string, UrgentNeed>();

    openUrgentNeeds.forEach((urgentNeed) => {
      if (urgentNeed.linkedDonationId) {
        map.set(urgentNeed.linkedDonationId, urgentNeed);
      }
    });

    return map;
  }, [openUrgentNeeds]);

  const refetchUrgentNeeds = useCallback(async (): Promise<void> => {
    setIsUrgentNeedsLoading(true);
    setUrgentNeedsError(null);

    try {
      const response = await getUrgentNeeds(activeTenantId);
      setUrgentNeeds(response);
    } catch (requestError: unknown) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to fetch urgent needs";

      setUrgentNeedsError(message);
      setUrgentNeeds([]);
    } finally {
      setIsUrgentNeedsLoading(false);
    }
  }, [activeTenantId]);

  useEffect(() => {
    void refetchUrgentNeeds();
  }, [refetchUrgentNeeds]);

  const handleDonationAction = useCallback(
    async (donationId: string): Promise<void> => {
      setPendingActionDonationId(donationId);

      try {
        if (isFoundationView) {
          await updateStatus({
            donationId,
            status: "requested",
            requestedByUserId: activeUser.id
          });
        }

        if (isVolunteerView) {
          await updateStatus({
            donationId,
            status: "picked_up",
            requestedByUserId: activeUser.id
          });
        }
      } finally {
        setPendingActionDonationId(null);
      }
    },
    [activeUser.id, isFoundationView, isVolunteerView, updateStatus]
  );

  const handleUrgentNeedInput = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = event.target;

    setUrgentNeedForm((currentForm) => {
      if (name === "quantityNeededKg") {
        return {
          ...currentForm,
          quantityNeededKg: Math.max(1, Number(value) || 1)
        };
      }

      return {
        ...currentForm,
        [name]: value
      };
    });
  };

  const handleUrgentNeedSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!isFoundationView) {
      return;
    }

    setIsSubmittingUrgentNeed(true);
    setUrgentNeedsError(null);

    try {
      await createUrgentNeed(
        {
          title: urgentNeedForm.title,
          details: urgentNeedForm.details,
          quantityNeededKg: urgentNeedForm.quantityNeededKg,
          neededBefore: new Date(urgentNeedForm.neededBefore).toISOString(),
          priority: urgentNeedForm.priority,
          ...(urgentNeedForm.linkedDonationId
            ? { linkedDonationId: urgentNeedForm.linkedDonationId }
            : {})
        },
        activeTenantId
      );

      setUrgentNeedForm(buildInitialUrgentNeedForm());
      await refetchUrgentNeeds();
    } catch (requestError: unknown) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to create urgent need";

      setUrgentNeedsError(message);
    } finally {
      setIsSubmittingUrgentNeed(false);
    }
  };

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

      gsap.to("[data-urgent-badge]", {
        scale: 1.04,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }, rootRef);

    return () => {
      context.revert();
    };
  }, [activeTenantId, actionableDonations.length, openUrgentNeeds.length]);

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
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
              Perfil activo: {isFoundationView ? "Fundacion" : "Voluntario"}
            </p>
          </div>

          <div className="flex w-full max-w-xl flex-col items-end gap-3">
            <NotificationBell />
            <BusinessSelector />
          </div>
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
            <p className="mt-4 text-5xl font-semibold leading-none text-ink">{actionableDonations.length}</p>
            <p className="mt-3 text-sm text-slate-600">{actionDescription}</p>
            <button
              type="button"
              onClick={() => {
                void refetch();
                void refetchUrgentNeeds();
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

        {urgentNeedsError ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {urgentNeedsError}
          </p>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-ink">
                {isFoundationView ? "Donaciones disponibles" : "Solicitudes pendientes"}
              </h2>
              <span className="text-sm text-slate-500">
                {isLoading ? "Loading..." : `${actionableDonations.length} operaciones`}
              </span>
            </div>

            {!isLoading && !isError && actionableDonations.length === 0 ? (
              <p className="rounded-2xl border border-slate-900/10 bg-white px-4 py-6 text-center text-sm text-slate-500">
                No hay donaciones disponibles para este perfil.
              </p>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              {actionableDonations.map((donation) => (
                <SurplusCard
                  key={donation.id}
                  donation={donation}
                  actionLabel={actionLabel}
                  isActionLoading={pendingActionDonationId === donation.id}
                  urgentLabel={urgentNeedByDonationId.get(donation.id)?.title}
                  onAction={(donationId) => {
                    void handleDonationAction(donationId);
                  }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-5 lg:col-span-4">
            {isFoundationView ? (
              <form
                data-urgent-form
                onSubmit={(event) => {
                  void handleUrgentNeedSubmit(event);
                }}
                className="rounded-3xl border border-red-200 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.1)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-xs uppercase tracking-[0.2em] text-red-600">
                    Modulo de urgencias
                  </p>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    {isUrgentNeedsLoading ? "..." : `${openUrgentNeeds.length} activas`}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <input
                    name="title"
                    value={urgentNeedForm.title}
                    onChange={handleUrgentNeedInput}
                    required
                    placeholder="Titulo de necesidad"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                  />

                  <textarea
                    name="details"
                    value={urgentNeedForm.details}
                    onChange={handleUrgentNeedInput}
                    required
                    rows={3}
                    placeholder="Contexto y justificacion"
                    className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      min={1}
                      name="quantityNeededKg"
                      value={urgentNeedForm.quantityNeededKg}
                      onChange={handleUrgentNeedInput}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                    />

                    <select
                      name="priority"
                      value={urgentNeedForm.priority}
                      onChange={handleUrgentNeedInput}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <input
                    type="datetime-local"
                    name="neededBefore"
                    value={urgentNeedForm.neededBefore}
                    onChange={handleUrgentNeedInput}
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                  />

                  <select
                    name="linkedDonationId"
                    value={urgentNeedForm.linkedDonationId}
                    onChange={handleUrgentNeedInput}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                  >
                    <option value="">Sin vincular a una donacion</option>
                    {data.map((donation) => (
                      <option key={donation.id} value={donation.id}>
                        {donation.title}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingUrgentNeed}
                  className="mt-4 w-full rounded-xl border border-red-300 bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingUrgentNeed ? "Guardando..." : "Declarar Urgencia"}
                </button>
              </form>
            ) : null}

            <LogisticsMap />
          </div>
        </section>
      </div>
    </main>
  );
};

export default LogisticsPage;
