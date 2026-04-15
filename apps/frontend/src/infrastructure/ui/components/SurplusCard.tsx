"use client";

import { Donation } from "@/domain/models/Donation";
import { CountdownTimer } from "@/infrastructure/ui/components/CountdownTimer";

interface SurplusCardProps {
  donation: Donation;
  actionLabel?: string;
  isActionLoading?: boolean;
  urgentLabel?: string;
  onAction?: (donationId: string) => void;
}

const statusTone: Record<Donation["status"], string> = {
  available: "bg-emerald-100 text-emerald-700",
  requested: "bg-amber-100 text-amber-700",
  picked_up: "bg-sky-100 text-sky-700",
  delivered: "bg-slate-200 text-slate-600"
};

const statusLabel: Record<Donation["status"], string> = {
  available: "Disponible",
  requested: "Solicitada",
  picked_up: "En traslado",
  delivered: "Entregada"
};

export const SurplusCard = ({
  donation,
  actionLabel,
  isActionLoading,
  urgentLabel,
  onAction
}: SurplusCardProps): JSX.Element => {
  const isDelivered = donation.status === "delivered";

  return (
    <article
      data-surplus-card
      className="rounded-3xl border border-slate-900/10 bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.1)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-lg font-semibold text-ink">{donation.title}</h4>
          <p className="mt-1 text-sm text-slate-600">Tenant: {donation.tenantId}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[donation.status]}`}>
            {statusLabel[donation.status]}
          </span>
          {urgentLabel ? (
            <span
              data-urgent-badge
              className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-red-600"
            >
              Urgente: {urgentLabel}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div className="rounded-2xl bg-slate-50 px-3 py-2">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Quantity</p>
          <p className="mt-1 text-base font-semibold text-ink">{donation.quantity} kg</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-2">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Expires</p>
          <CountdownTimer expirationDate={donation.expirationDate} />
        </div>
      </div>

      <div className="mt-5">
        {isDelivered ? (
          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Completado
          </span>
        ) : onAction && actionLabel ? (
          <button
            type="button"
            onClick={() => {
              onAction(donation.id);
            }}
            disabled={Boolean(isActionLoading)}
            className="rounded-full border border-accent/35 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isActionLoading ? "Procesando..." : actionLabel}
          </button>
        ) : null}
      </div>
    </article>
  );
};
