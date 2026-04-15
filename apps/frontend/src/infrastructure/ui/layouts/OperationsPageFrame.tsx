"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTenant } from "@/application/hooks/useTenant";
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
  const router = useRouter();
  const pathname = usePathname();
  const { hasSession } = useTenant();

  useEffect(() => {
    if (hasSession) {
      return;
    }

    const encodedNext = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
    router.replace(`/register${encodedNext}`);
  }, [hasSession, pathname, router]);

  if (!hasSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-10">
        <p className="rounded-2xl border border-slate-900/10 bg-white/90 px-5 py-3 text-sm font-semibold text-on-surface shadow-sm">
          Preparando contexto de sesion...
        </p>
      </div>
    );
  }

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
