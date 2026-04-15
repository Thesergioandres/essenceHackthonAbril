"use client";

import Link from "next/link";
import { useBackendHealth } from "@/application/hooks/useBackendHealth";
import { HealthCheckCard } from "@/infrastructure/ui/components/HealthCheckCard";

const HealthPage = (): JSX.Element => {
  const { data, isLoading, error, refresh } = useBackendHealth();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-10 text-zinc-900 dark:text-zinc-50 lg:px-10 lg:py-14">
      <header data-rura-stagger className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
            System Readiness
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-ink dark:text-zinc-50 lg:text-4xl">
            Backend Health Check
          </h1>
        </div>

        <Link
          href="/"
          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          Back to Home
        </Link>
      </header>

      <HealthCheckCard
        data={data}
        isLoading={isLoading}
        error={error}
        onRefresh={refresh}
      />
    </main>
  );
};

export default HealthPage;