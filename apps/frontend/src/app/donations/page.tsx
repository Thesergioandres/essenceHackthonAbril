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
    <OperationsPageFrame sectionLabel="Flujo Donante" showRoleSwitch>
      <section className="grid gap-5 lg:grid-cols-12">
        <article className="rounded-[2rem] border border-slate-900/10 bg-surface-container-low p-7 shadow-[0_20px_48px_rgba(15,23,42,0.1)] lg:col-span-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Dashboard de Donaciones
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-on-surface">
            Gestiona tus excedentes en tiempo real
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Tenant activo: {activeOrganization.name}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/donations/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-on-primary shadow-[0_16px_32px_rgba(0,109,55,0.3)] transition hover:brightness-110"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              + Donar alimento
            </Link>

            <button
              type="button"
              onClick={() => {
                void refetch();
              }}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-on-surface transition hover:border-primary hover:text-primary"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
              Actualizar
            </button>
          </div>
        </article>

        <article className="rounded-[2rem] bg-primary-container p-6 text-on-primary shadow-[0_20px_50px_rgba(39,174,96,0.32)] lg:col-span-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-fixed-dim">
            Estado rapido
          </p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl bg-white/15 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-100">
                Activas
              </p>
              <p className="mt-1 text-3xl font-extrabold">{activeDonations.length}</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-100">
                Entregadas
              </p>
              <p className="mt-1 text-3xl font-extrabold">{deliveredDonations.length}</p>
            </div>
          </div>
        </article>
      </section>

      {isError ? (
        <p className="mt-5 rounded-2xl border border-error/25 bg-error-container px-4 py-3 text-sm text-on-error-container">
          {error}
        </p>
      ) : null}

      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-on-surface">Donaciones activas</h2>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
            {isLoading ? "Cargando..." : `${activeDonations.length} operaciones`}
          </span>
        </div>

        {isLoading ? (
          <p className="rounded-2xl bg-white/90 px-4 py-5 text-sm text-on-surface-variant shadow-sm">
            Cargando donaciones...
          </p>
        ) : null}

        {!isLoading && activeDonations.length === 0 ? (
          <p className="rounded-2xl bg-white/90 px-4 py-5 text-sm text-on-surface-variant shadow-sm">
            No hay donaciones activas para este tenant.
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {activeDonations.map((donation) => (
            <article
              key={donation.id}
              className="rounded-[1.5rem] border border-slate-900/10 bg-white/95 p-5 shadow-[0_16px_36px_rgba(15,23,42,0.09)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-on-surface">{donation.title}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">{donation.quantity} kg estimados</p>
                </div>

                <span className="rounded-full bg-tertiary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-tertiary">
                  {donation.status}
                </span>
              </div>

              <div className="mt-4 rounded-2xl bg-surface-container-low px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                  Caducidad
                </p>
                <CountdownTimer expirationDate={donation.expirationDate} />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-on-surface-variant">ID: {donation.id.slice(0, 8)}</p>
                <Link
                  href="/foundation"
                  className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-primary transition hover:bg-primary hover:text-on-primary"
                >
                  Ver red
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </OperationsPageFrame>
  );
};

export default DonationsDashboardPage;
