"use client";

import { useEffect, useMemo, useState } from "react";
import { OperationsPageFrame } from "@/infrastructure/ui/layouts/OperationsPageFrame";

type QueueItemStatus = "pending" | "failed" | "syncing";

interface SyncQueueItem {
  id: string;
  title: string;
  type: "photo" | "status" | "document";
  sizeLabel: string;
  createdAt: string;
  status: QueueItemStatus;
}

const SYNC_QUEUE_KEY = "rura.syncQueue";

const FALLBACK_QUEUE: SyncQueueItem[] = [
  {
    id: "queue-photo-402",
    title: "Evidencia de entrega #402",
    type: "photo",
    sizeLabel: "2.4 MB",
    createdAt: new Date().toISOString(),
    status: "failed"
  },
  {
    id: "queue-status-12B",
    title: "Cambio de estado Ruta 12B",
    type: "status",
    sizeLabel: "3 KB",
    createdAt: new Date().toISOString(),
    status: "pending"
  },
  {
    id: "queue-report-weekly",
    title: "Reporte semanal de mermas",
    type: "document",
    sizeLabel: "12 KB",
    createdAt: new Date().toISOString(),
    status: "pending"
  }
];

const loadQueueFromStorage = (): SyncQueueItem[] => {
  if (typeof window === "undefined") {
    return FALLBACK_QUEUE;
  }

  const raw = window.localStorage.getItem(SYNC_QUEUE_KEY);

  if (!raw) {
    return FALLBACK_QUEUE;
  }

  try {
    const parsed = JSON.parse(raw) as SyncQueueItem[];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return FALLBACK_QUEUE;
    }

    return parsed;
  } catch {
    return FALLBACK_QUEUE;
  }
};

const persistQueue = (queue: SyncQueueItem[]): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
};

const toTypeLabel = (type: SyncQueueItem["type"]): string => {
  if (type === "photo") {
    return "Imagen";
  }

  if (type === "status") {
    return "Estado";
  }

  return "Documento";
};

const toStatusLabel = (status: QueueItemStatus): string => {
  if (status === "failed") {
    return "Error de red";
  }

  if (status === "syncing") {
    return "Subiendo";
  }

  return "En espera";
};

const statusTone: Record<QueueItemStatus, string> = {
  pending: "bg-surface-container-high text-on-surface-variant",
  failed: "bg-secondary-container/20 text-secondary",
  syncing: "bg-tertiary/15 text-tertiary"
};

const OfflineQueuePage = (): JSX.Element => {
  const [queue, setQueue] = useState<SyncQueueItem[]>(() => loadQueueFromStorage());
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator === "undefined") {
      return false;
    }

    return navigator.onLine;
  });

  useEffect(() => {
    const onOnline = (): void => {
      setIsOnline(true);
    };

    const onOffline = (): void => {
      setIsOnline(false);
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    persistQueue(queue);
  }, [queue]);

  const progressPercent = useMemo(() => {
    if (queue.length === 0) {
      return 100;
    }

    const doneLikeItems = queue.filter((item) => item.status === "syncing").length;
    return Math.round((doneLikeItems / queue.length) * 100);
  }, [queue]);

  const triggerSyncAll = (): void => {
    if (!isOnline) {
      return;
    }

    setQueue((currentQueue) =>
      currentQueue.map((item) => ({
        ...item,
        status: "syncing"
      }))
    );
  };

  const retryItem = (itemId: string): void => {
    if (!isOnline) {
      return;
    }

    setQueue((currentQueue) =>
      currentQueue.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        return {
          ...item,
          status: "syncing"
        };
      })
    );
  };

  return (
    <OperationsPageFrame sectionLabel="Sincronizacion offline" showRoleSwitch>
      <section className="mb-6 rounded-[2rem] border border-tertiary/25 bg-tertiary-container/20 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-tertiary">Estado de red</p>
            <h1 className="mt-1 text-3xl font-extrabold text-on-surface">
              {isOnline ? "Conectado" : "Modo offline activo"}
            </h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              {isOnline
                ? "Tu app puede sincronizar evidencias y cambios pendientes."
                : "Los cambios quedan en cola local hasta recuperar conexion."}
            </p>
          </div>

          <button
            type="button"
            onClick={triggerSyncAll}
            disabled={!isOnline || queue.length === 0}
            className="rounded-xl bg-primary px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-on-primary transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sincronizar ahora
          </button>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-container-high">
          <div className="h-full bg-tertiary transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
      </section>

      <section className="space-y-3">
        {queue.map((item) => (
          <article
            key={item.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-900/10 bg-white/95 px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-base font-bold text-on-surface">{item.title}</p>
              <p className="mt-1 text-xs text-on-surface-variant">
                {toTypeLabel(item.type)} - {item.sizeLabel} - {new Date(item.createdAt).toLocaleTimeString("es-CO")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${statusTone[item.status]}`}>
                {toStatusLabel(item.status)}
              </span>

              {item.status === "failed" ? (
                <button
                  type="button"
                  onClick={() => {
                    retryItem(item.id);
                  }}
                  disabled={!isOnline}
                  className="rounded-full border border-tertiary/20 bg-tertiary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-tertiary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reintentar
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </OperationsPageFrame>
  );
};

export default OfflineQueuePage;
