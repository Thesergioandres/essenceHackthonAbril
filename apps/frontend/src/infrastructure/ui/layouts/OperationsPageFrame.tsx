"use client";

import { ReactNode } from "react";
import { OperationsBottomNav } from "@/infrastructure/ui/components/OperationsBottomNav";
import { OperationsTopBar } from "@/infrastructure/ui/components/OperationsTopBar";

interface OperationsPageFrameProps {
  sectionLabel: string;
  children: ReactNode;
  showRoleSwitch?: boolean;
  hideBottomNav?: boolean;
  hideNotificationBell?: boolean;
  sidebar?: ReactNode;
  className?: string;
}

export const OperationsPageFrame = ({
  sectionLabel,
  children,
  showRoleSwitch = false,
  hideBottomNav = false,
  hideNotificationBell = false,
  sidebar,
  className
}: OperationsPageFrameProps): JSX.Element => {
  return (
    <div className="relative min-h-screen bg-surface">
      <OperationsTopBar
        sectionLabel={sectionLabel}
        showRoleSwitch={showRoleSwitch}
        hideNotificationBell={hideNotificationBell}
      />

      <main
        className={`mx-auto max-w-7xl px-4 pb-28 pt-28 sm:px-6 lg:pb-32 ${
          className ?? ""
        }`}
      >
        {sidebar ? (
          <div className="grid gap-6 lg:grid-cols-12">
            <aside className="hidden lg:col-span-3 lg:block">
              <div className="sticky top-28">{sidebar}</div>
            </aside>
            <section className="lg:col-span-9">{children}</section>
          </div>
        ) : (
          children
        )}
      </main>

      {!hideBottomNav ? <OperationsBottomNav /> : null}
    </div>
  );
};
