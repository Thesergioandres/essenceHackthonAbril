import { Donation } from "@/domain/models/Donation";

interface SurplusCardProps {
  donation: Donation;
}

const statusTone: Record<Donation["status"], string> = {
  pending: "bg-amber-100 text-amber-700",
  in_transit: "bg-emerald-100 text-emerald-700",
  delivered: "bg-slate-200 text-slate-600"
};

const statusLabel: Record<Donation["status"], string> = {
  pending: "Pending",
  in_transit: "In Transit",
  delivered: "Delivered"
};

export const SurplusCard = ({ donation }: SurplusCardProps): JSX.Element => {
  return (
    <article
      data-surplus-card
      className="rounded-3xl border border-slate-900/10 bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.1)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-lg font-semibold text-ink">{donation.title}</h4>
          <p className="mt-1 text-sm text-slate-600">{donation.originName}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[donation.status]}`}>
          {statusLabel[donation.status]}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div className="rounded-2xl bg-slate-50 px-3 py-2">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Quantity</p>
          <p className="mt-1 text-base font-semibold text-ink">{donation.quantity} kg</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-2">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Expires</p>
          <p className="mt-1 text-base font-semibold text-ink">
            {new Date(donation.expirationDate).toLocaleDateString("es-AR")}
          </p>
        </div>
      </div>
    </article>
  );
};
