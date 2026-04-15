"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { NotificationSeverity } from "@/domain/models/Notification";
import { useNotifications } from "@/application/hooks/useNotifications";
import { useTenant } from "@/application/hooks/useTenant";

const severityTone: Record<NotificationSeverity, string> = {
  info: "bg-sky-100 text-sky-700 dark:bg-sky-900/35 dark:text-sky-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/35 dark:text-amber-300",
  critical: "bg-red-100 text-red-700 dark:bg-red-900/35 dark:text-red-300"
};

export const NotificationBell = (): JSX.Element => {
  const { activeTenantId, activeUser } = useTenant();
  const { notifications, unreadCount, isLoading, isError, error, markAsRead, refetch } =
    useNotifications(activeTenantId, activeUser.id);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const onDocumentMouseDown = (event: MouseEvent): void => {
      if (!rootRef.current) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (!rootRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", onDocumentMouseDown);

    return () => {
      window.removeEventListener("mousedown", onDocumentMouseDown);
    };
  }, []);

  const unreadLabel = useMemo(() => {
    if (unreadCount === 0) {
      return "Sin pendientes";
    }

    if (unreadCount === 1) {
      return "1 pendiente";
    }

    return `${unreadCount} pendientes`;
  }, [unreadCount]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setIsOpen((current) => !current);
        }}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-700 shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition hover:border-accent hover:text-accent dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        aria-label="Abrir panel de notificaciones"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className="h-5 w-5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
          <path d="M9.7 20a2.5 2.5 0 0 0 4.6 0" />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-20 mt-3 w-[22rem] rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_24px_64px_rgba(15,23,42,0.18)] dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-display text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                Notificaciones
              </p>
              <p className="mt-1 text-sm font-semibold text-ink dark:text-zinc-50">{unreadLabel}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                void refetch();
              }}
              className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-600 transition hover:border-accent hover:text-accent dark:border-zinc-700 dark:text-zinc-300"
            >
              Actualizar
            </button>
          </div>

          <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
            {isLoading ? (
              <p className="rounded-xl bg-zinc-100 px-3 py-4 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                Cargando notificaciones...
              </p>
            ) : null}

            {isError && !isLoading ? (
              <p className="rounded-xl bg-red-50 px-3 py-4 text-sm text-red-600 dark:bg-red-950/35 dark:text-red-300">{error}</p>
            ) : null}

            {!isLoading && !isError && notifications.length === 0 ? (
              <p className="rounded-xl bg-zinc-100 px-3 py-4 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                No hay notificaciones por ahora.
              </p>
            ) : null}

            {!isLoading && !isError
              ? notifications.map((notification) => {
                  return (
                    <article
                      key={notification.id}
                      className={`rounded-xl border px-3 py-3 ${
                        notification.isRead
                          ? "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                          : "border-amber-200 bg-amber-50/60 dark:border-amber-700/60 dark:bg-amber-900/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-ink dark:text-zinc-50">{notification.title}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${severityTone[notification.severity]}`}
                        >
                          {notification.severity}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{notification.message}</p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {new Date(notification.createdAt).toLocaleString("es-CO")}
                        </span>
                        {!notification.isRead ? (
                          <button
                            type="button"
                            onClick={() => {
                              void markAsRead(notification.id);
                            }}
                            className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent transition hover:bg-accent hover:text-white"
                          >
                            Marcar leida
                          </button>
                        ) : (
                          <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">Leida</span>
                        )}
                      </div>
                    </article>
                  );
                })
              : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};