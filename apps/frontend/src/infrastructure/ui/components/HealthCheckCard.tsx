"use client";

import { SystemHealth } from "@/domain/models/SystemHealth";

interface HealthCheckCardProps {
  data: SystemHealth | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
}

const resolveBadgeTone = (status: SystemHealth["status"] | null): string => {
  if (status === "ok") {
    return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30";
  }

  if (status === "degraded") {
    return "bg-amber-500/15 text-amber-700 border-amber-500/30";
  }

  return "bg-slate-500/10 text-slate-600 border-slate-400/30";
};

export const HealthCheckCard = ({
  data,
  isLoading,
  error,
  onRefresh
}: HealthCheckCardProps): JSX.Element => {
  const badgeTone = resolveBadgeTone(data?.status ?? null);

  return (
    <section
      data-rura-stagger
      className="rounded-3xl border border-slate-900/10 bg-white/80 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.2em] text-slate-500">
            Backend Diagnostic
          </p>
          <h2 className="mt-2 font-display text-2xl text-ink">/api/health</h2>
        </div>
        <button
          type="button"
          onClick={() => {
            void onRefresh();
          }}
          className="rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent hover:text-white"
        >
          Refresh
        </button>
      </div>

      <div className="mt-6 grid gap-3 text-sm text-slate-700">
        <p>
          {isLoading ? "Checking backend connectivity..." : "Latest backend snapshot loaded."}
        </p>

        <div
          className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badgeTone}`}
        >
          {data ? data.status : "unknown"}
        </div>

        <p>Database: {data ? data.database : "not available"}</p>
        <p>Timestamp: {data ? data.timestamp : "not available"}</p>

        {error ? (
          <p className="rounded-xl border border-ember/25 bg-ember/10 px-3 py-2 text-ember">
            Error: {error}
          </p>
        ) : null}
      </div>
    </section>
  );
};