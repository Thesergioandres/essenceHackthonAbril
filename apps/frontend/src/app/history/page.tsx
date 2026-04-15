"use client";

import { useMemo, useState } from "react";
import { useTenant } from "@/application/hooks/useTenant";
import { ReceiptLog } from "@/domain/models/ReceiptLog";
import { getReceiptHistory } from "@/infrastructure/network/historyApi";
import { OperationsPageFrame } from "@/infrastructure/ui/layouts/OperationsPageFrame";
import { useEffect } from "react";

const HistoryPage = (): JSX.Element => {
  const { activeTenantId, activeOrganization } = useTenant();
  const [logs, setLogs] = useState<ReceiptLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const fetchLogs = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const receiptLogs = await getReceiptHistory(activeTenantId);
        setLogs(receiptLogs);
      } catch (requestError: unknown) {
        const message = requestError instanceof Error ? requestError.message : "No se pudo cargar historial";
        setLogs([]);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchLogs();
  }, [activeTenantId]);

  const filteredLogs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (normalizedSearch.length === 0) {
      return logs;
    }

    return logs.filter((log) => {
      const haystack = `${log.donationTitle} ${log.receivedBy}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [logs, search]);

  const totalReceivedKg = useMemo(() => {
    return filteredLogs.reduce((accumulator, log) => accumulator + log.quantityKg, 0);
  }, [filteredLogs]);

  return (
    <OperationsPageFrame sectionLabel="Historial auditable" showRoleSwitch>
      <section className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Recepcion verificada</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-on-surface">
          Historial de recepcion
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">Tenant activo: {activeOrganization.name}</p>
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl bg-surface-container-low p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">Total recibido</p>
          <p className="mt-2 text-4xl font-extrabold text-on-surface">{totalReceivedKg.toFixed(1)} kg</p>
        </article>

        <article className="rounded-2xl bg-surface-container-low p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-tertiary">Registros</p>
          <p className="mt-2 text-4xl font-extrabold text-on-surface">{filteredLogs.length}</p>
        </article>

        <article className="rounded-2xl bg-surface-container-low p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-secondary">Auditoria</p>
          <p className="mt-2 text-sm font-semibold text-on-surface">Trazabilidad por donacion y receptor.</p>
        </article>
      </section>

      <section className="mb-5 rounded-2xl border border-slate-900/10 bg-white/90 p-4 shadow-sm">
        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">
            Buscar por origen o receptor
          </span>
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            placeholder="Panaderia, mercado, receptor..."
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-on-surface outline-none focus:border-primary"
          />
        </label>
      </section>

      {error ? (
        <p className="mb-4 rounded-2xl border border-error/20 bg-error-container px-4 py-3 text-sm text-on-error-container">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="rounded-2xl bg-white/90 px-4 py-5 text-sm text-on-surface-variant shadow-sm">
          Cargando historial...
        </p>
      ) : null}

      {!isLoading && filteredLogs.length === 0 ? (
        <p className="rounded-2xl bg-white/90 px-4 py-5 text-sm text-on-surface-variant shadow-sm">
          No hay registros de recepcion para los filtros aplicados.
        </p>
      ) : null}

      {!isLoading && filteredLogs.length > 0 ? (
        <section className="overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white/95 shadow-[0_16px_36px_rgba(15,23,42,0.09)]">
          <div className="hidden grid-cols-12 gap-3 border-b border-slate-100 bg-surface-container-low px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant md:grid">
            <span className="col-span-4">Origen</span>
            <span className="col-span-2">Cantidad</span>
            <span className="col-span-3">Recibido por</span>
            <span className="col-span-3">Fecha</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <article key={log.id} className="px-5 py-4">
                <div className="grid gap-2 md:grid-cols-12 md:items-center">
                  <div className="md:col-span-4">
                    <p className="font-bold text-on-surface">{log.donationTitle}</p>
                    <p className="text-xs text-on-surface-variant">ID: {log.donationId.slice(0, 8)}</p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-sm font-semibold text-on-surface">{log.quantityKg} kg</p>
                  </div>

                  <div className="md:col-span-3">
                    <p className="text-sm text-on-surface">{log.receivedBy}</p>
                  </div>

                  <div className="md:col-span-3">
                    <p className="text-xs text-on-surface-variant">
                      {new Date(log.deliveredAt).toLocaleString("es-CO")}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </OperationsPageFrame>
  );
};

export default HistoryPage;
