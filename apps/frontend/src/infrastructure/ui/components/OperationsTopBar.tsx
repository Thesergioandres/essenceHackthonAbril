"use client";

import Link from "next/link";
import { BusinessSelector } from "@/infrastructure/ui/components/BusinessSelector";
import { NotificationBell } from "@/infrastructure/ui/components/NotificationBell";
import { ThemeToggleButton } from "@/infrastructure/ui/components/ThemeToggleButton";
import { useTenant } from "@/application/hooks/useTenant";

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
  const { clearSession } = useTenant();

  return (
    <header className="sticky top-0 z-40 w-full px-4 py-4 lg:px-6">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 rounded-3xl border border-white/20 bg-white/70 px-6 shadow-[0_8px_32px_0_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/70">
        <div className="flex items-center gap-3">
          <div className="lg:hidden grid h-9 w-9 place-items-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[20px] text-white">hub</span>
          </div>
          <div className="flex flex-col">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              RURA / {sectionLabel}
            </p>
            <div className="lg:hidden">
              <BusinessSelector variant="compact" showRoleSwitch={showRoleSwitch} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!hideNotificationBell && (
            <div className="flex items-center gap-2">
              <ThemeToggleButton />
              <NotificationBell />
            </div>
          )}

          <div className="lg:hidden h-8 w-px bg-zinc-200 dark:bg-zinc-800" />

          <button
            onClick={clearSession}
            className="lg:hidden grid h-10 w-10 place-items-center rounded-2xl text-zinc-500 hover:bg-error/10 hover:text-error dark:text-zinc-400"
          >
            <span className="material-symbols-outlined text-[22px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
