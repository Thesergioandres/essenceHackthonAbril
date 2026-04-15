"use client";

import { useMemo } from "react";
import { useNotifications } from "@/application/hooks/useNotifications";
import { useTenant } from "@/application/hooks/useTenant";
import { NotificationSeverity } from "@/domain/models/Notification";
import { OperationsPageFrame } from "@/infrastructure/ui/layouts/OperationsPageFrame";

const severityBadgeTone: Record<NotificationSeverity, string> = {
  info: "bg-tertiary/15 text-tertiary",
  warning: "bg-secondary-container/25 text-secondary",
  critical: "bg-error-container text-on-error-container"
};

const severityCardTone: Record<NotificationSeverity, string> = {
  info: "border-tertiary/25 bg-white",
  warning: "border-secondary-container/35 bg-secondary-container/5",
  critical: "border-error/35 bg-error-container/45"
};

const NotificationsPage = (): JSX.Element => {
  const { activeTenantId, activeUser } = useTenant();
  const { notifications, unreadCount, isLoading, isError, error, refetch, markAsRead } =
    useNotifications(activeTenantId, activeUser.id);

  const criticalCount = useMemo(() => {
    return notifications.filter((notification) => notification.severity === "critical").length;
  }, [notifications]);

  return (
    <OperationsPageFrame
      sectionLabel="Centro de notificaciones"
      showRoleSwitch
      hideNotificationBell
      sidebar={
        <aside className="rounded-[1.75rem] border border-slate-900/10 bg-white/90 p-5 shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
          <h2 className="text-lg font-extrabold text-on-surface">Panel lateral</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Filtros y estado de red logistica.</p>

          <div className="mt-5 space-y-2">
            <div className="rounded-xl bg-surface-container-low px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                Pendientes
              </p>
              <p className="mt-1 text-xl font-extrabold text-on-surface">{unreadCount}</p>
            </div>

            <div className="rounded-xl bg-surface-container-low px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                Criticas
              </p>
              <p className="mt-1 text-xl font-extrabold text-on-surface">{criticalCount}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              void refetch();
            }}
            className="mt-5 w-full rounded-xl bg-primary px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-on-primary"
          >
            Actualizar panel
          </button>
        </aside>
      }
    >
      <section className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Tiempo real</p>
          <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-on-surface">
            Centro de notificaciones
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Eventos de entrega, urgencias cercanas y confirmaciones de rescate.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            void Promise.all(
              notifications
                .filter((notification) => !notification.isRead)
                .map(async (notification) => markAsRead(notification.id))
            );
          }}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-on-surface"
        >
          Marcar todo leido
        </button>
      </section>

      {isError ? (
        <p className="mb-4 rounded-2xl border border-error/20 bg-error-container px-4 py-3 text-sm text-on-error-container">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="rounded-2xl bg-white/90 px-4 py-5 text-sm text-on-surface-variant shadow-sm">
          Cargando notificaciones...
        </p>
      ) : null}

      {!isLoading && notifications.length === 0 ? (
        <p className="rounded-2xl bg-white/90 px-4 py-5 text-sm text-on-surface-variant shadow-sm">
          No hay alertas en este momento.
        </p>
      ) : null}

      <section className="space-y-3">
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className={`rounded-[1.5rem] border px-5 py-4 shadow-sm ${severityCardTone[notification.severity]}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-on-surface">{notification.title}</h2>
                <p className="mt-1 text-sm text-on-surface-variant">{notification.message}</p>
              </div>

              <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${severityBadgeTone[notification.severity]}`}>
                {notification.severity}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-on-surface-variant">
                {new Date(notification.createdAt).toLocaleString("es-CO")}
              </p>

              {!notification.isRead ? (
                <button
                  type="button"
                  onClick={() => {
                    void markAsRead(notification.id);
                  }}
                  className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary"
                >
                  Marcar leida
                </button>
              ) : (
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                  Leida
                </span>
              )}
            </div>
          </article>
        ))}
      </section>
    </OperationsPageFrame>
  );
};

export default NotificationsPage;
