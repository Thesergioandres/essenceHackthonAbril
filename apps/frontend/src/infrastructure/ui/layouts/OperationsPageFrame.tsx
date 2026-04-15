"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DesktopSidebar } from "@/infrastructure/ui/components/DesktopSidebar";
import { OperationsBottomNav } from "@/infrastructure/ui/components/OperationsBottomNav";
import { OperationsTopBar } from "@/infrastructure/ui/components/OperationsTopBar";
import { useTenant } from "@/application/hooks/useTenant";

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
  const router = useRouter();
  const pathname = usePathname();
  const { hasSession, isHydrated } = useTenant();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isReady = mounted && isHydrated && hasSession;

  useEffect(() => {
    if (!isHydrated || hasSession) {
      return;
    }

    const encodedNext = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
    router.replace(`/register${encodedNext}`);
  }, [hasSession, isHydrated, pathname, router]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-10 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-semibold text-on-surface dark:text-zinc-50">
            Preparando contexto...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-surface dark:bg-zinc-950">
      <DesktopSidebar />

      <div className="lg:ml-72 flex flex-col min-h-screen">
        <OperationsTopBar
          sectionLabel={sectionLabel}
          showRoleSwitch={showRoleSwitch}
          hideNotificationBell={hideNotificationBell}
        />

        <main
          className={`flex-1 mx-auto w-full max-w-5xl px-4 pb-32 pt-6 sm:px-6 lg:pb-12 ${
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
      </div>

      {!hideBottomNav ? (
        <div className="lg:hidden">
          <OperationsBottomNav />
        </div>
      ) : null}
    </div>
  );
};
