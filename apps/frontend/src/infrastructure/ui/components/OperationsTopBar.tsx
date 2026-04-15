"use client";

import Link from "next/link";
import { BusinessSelector } from "@/infrastructure/ui/components/BusinessSelector";
import { NotificationBell } from "@/infrastructure/ui/components/NotificationBell";

interface OperationsTopBarProps {
  sectionLabel: string;
  showRoleSwitch?: boolean;
  hideNotificationBell?: boolean;
}

export const OperationsTopBar = ({
  sectionLabel,
  showRoleSwitch = false,
  hideNotificationBell = false
}: OperationsTopBarProps): JSX.Element => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-900/10 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <Link href="/" className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                hub
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-primary">
                RURA
              </span>
            </Link>
            <p className="mt-0.5 truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {sectionLabel}
            </p>
          </div>

          <div className="hidden w-full max-w-md lg:block">
            <BusinessSelector variant="compact" showRoleSwitch={showRoleSwitch} />
          </div>

          <div className="flex items-center gap-2">
            {!hideNotificationBell ? <NotificationBell /> : null}
          </div>
        </div>

        <div className="pb-3 lg:hidden">
          <BusinessSelector variant="compact" showRoleSwitch={showRoleSwitch} />
        </div>
      </div>
    </header>
  );
};
