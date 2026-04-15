"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ReceiptLog } from "@/domain/models/ReceiptLog";
import { useTenant } from "@/application/hooks/useTenant";
import { getReceiptHistory } from "@/infrastructure/network/historyApi";
import { NotificationBell } from "@/infrastructure/ui/components/NotificationBell";

const HistoryPage = (): JSX.Element => {
  const rootRef = useRef<HTMLElement | null>(null);
  const { activeTenantId, activeOrganization, activeUserType } = useTenant();
  const [logs, setLogs] = useState<ReceiptLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isFoundationView = activeUserType === "foundation";

  const totalReceivedKg = useMemo(() => {
    return logs.reduce((acc, log) => acc + log.quantityKg, 0);
  }, [logs]);

  useEffect(() => {
    const fetchHistory = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const receiptLogs = await getReceiptHistory(activeTenantId);
        setLogs(receiptLogs);
      } catch (requestError: unknown) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Unable to fetch receipt history";

        setError(message);
        setLogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchHistory();
  }, [activeTenantId]);

  useLayoutEffect(() => {
    if (!rootRef.current) {
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-history-item]",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.06,
          ease: "power3.out"
        }
      );
    }, rootRef);

    return () => {
      context.revert();
    };
  }, [logs.length]);

  if (!isFoundationView) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-10 text-center">
        <p className="font-display text-xs uppercase tracking-[0.24em] text-slate-500">Acceso restringido</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Solo fundaciones</h1>
        <p className="mt-2 text-sm text-slate-600">
          Cambia el perfil operativo a Fundacion para ver el historial de recepcion.
        </p>
        <Link
          href="/logistics"
          className="mt-6 rounded-full border border-accent/30 bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent/90"
        >
          Volver a Logistica
        </Link>
      </main>
    );
  }

  return (
    <main ref={rootRef} className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-10">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-slate-900/10 bg-white/80 p-6 shadow-[0_18px_44px_rgba(15,23,42,0.1)]">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.24em] text-slate-500">Historial de recepcion</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Alimentos recibidos</h1>
          <p className="mt-2 text-sm text-slate-600">Organizacion: {activeOrganization.name}</p>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <Link
            href="/logistics"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
          >
            Ir a Logistica
          </Link>
        </div>
      </header>

      <section className="mb-6 rounded-3xl bg-gradient-to-br from-accent to-teal-500 p-6 text-white shadow-[0_24px_56px_rgba(15,118,110,0.35)]">
        <p className="text-xs uppercase tracking-[0.2em] text-teal-100">Recepcion acumulada</p>
        <p className="mt-3 text-5xl font-semibold leading-none">{totalReceivedKg} kg</p>
      </section>

      {error ? (
        <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="rounded-2xl border border-slate-900/10 bg-white px-4 py-6 text-sm text-slate-500">
          Cargando historial...
        </p>
      ) : null}

      {!isLoading && logs.length === 0 ? (
        <p className="rounded-2xl border border-slate-900/10 bg-white px-4 py-6 text-sm text-slate-500">
          No hay registros de recepcion para este tenant.
        </p>
      ) : null}

      {!isLoading && logs.length > 0 ? (
        <>
          <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.08)] md:block">
            <table className="w-full border-collapse text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Donacion</th>
                  <th className="px-4 py-3">Cantidad</th>
                  <th className="px-4 py-3">Recibido por</th>
                  <th className="px-4 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} data-history-item className="border-t border-slate-100 text-sm text-slate-700">
                    <td className="px-4 py-3 font-medium text-ink">{log.donationTitle}</td>
                    <td className="px-4 py-3">{log.quantityKg} kg</td>
                    <td className="px-4 py-3">{log.receivedBy}</td>
                    <td className="px-4 py-3">{new Date(log.deliveredAt).toLocaleString("es-CO")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {logs.map((log) => (
              <article
                key={log.id}
                data-history-item
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]"
              >
                <p className="text-base font-semibold text-ink">{log.donationTitle}</p>
                <p className="mt-1 text-sm text-slate-600">{log.quantityKg} kg</p>
                <p className="mt-2 text-xs text-slate-500">Recibido por: {log.receivedBy}</p>
                <p className="mt-1 text-xs text-slate-500">{new Date(log.deliveredAt).toLocaleString("es-CO")}</p>
              </article>
            ))}
          </div>
        </>
      ) : null}
    </main>
  );
};

export default HistoryPage;