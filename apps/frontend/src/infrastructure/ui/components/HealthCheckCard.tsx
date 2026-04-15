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
    return "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";
  }

  if (status === "degraded") {
    return "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
  }

  return "border-zinc-400/30 bg-zinc-500/10 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-300";
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
      className="rounded-3xl border border-zinc-200/80 bg-white/80 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            Backend Diagnostic
          </p>
          <h2 className="mt-2 font-display text-2xl text-ink dark:text-zinc-50">/api/health</h2>
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

      <div className="mt-6 grid gap-3 text-sm text-zinc-700 dark:text-zinc-200">
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
          <p className="rounded-xl border border-ember/25 bg-ember/10 px-3 py-2 text-ember dark:border-ember/45 dark:bg-ember/20 dark:text-orange-300">
            Error: {error}
          </p>
        ) : null}
      </div>
    </section>
  );
};