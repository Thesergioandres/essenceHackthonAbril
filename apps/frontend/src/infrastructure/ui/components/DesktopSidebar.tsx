"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTenant } from "@/application/hooks/useTenant";
import { BusinessSelector } from "./BusinessSelector";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  matches: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Impacto",
    icon: "dashboard",
    matches: (pathname) => pathname.startsWith("/dashboard")
  },
  {
    href: "/donations",
    label: "Donaciones",
    icon: "volunteer_activism",
    matches: (pathname) => pathname.startsWith("/donations")
  },
  {
    href: "/foundation",
    label: "Fundacion",
    icon: "groups",
    matches: (pathname) => pathname.startsWith("/foundation")
  },
  {
    href: "/logistics",
    label: "Rutas",
    icon: "local_shipping",
    matches: (pathname) => pathname.startsWith("/logistics")
  },
  {
    href: "/notifications",
    label: "Alertas",
    icon: "notifications",
    matches: (pathname) => pathname.startsWith("/notifications")
  }
];

export const DesktopSidebar = (): JSX.Element => {
  const pathname = usePathname();
  const { clearSession } = useTenant();

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-72 flex-col border-r border-zinc-200/50 bg-white/70 backdrop-blur-2xl dark:border-zinc-800/50 dark:bg-zinc-950/70 lg:flex">
      <div className="flex h-20 items-center border-b border-zinc-100 dark:border-zinc-800 px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[24px] text-white">hub</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-on-surface dark:text-zinc-50">
            RURA
          </span>
        </div>
      </div>

      <div className="mt-6 px-4">
        <BusinessSelector />
      </div>

      <nav className="mt-8 flex-1 space-y-1 px-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item.matches(pathname);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-all duration-300 ${
                isActive
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
              >
                {item.icon}
              </span>
              <span className="text-sm font-bold tracking-wide">
                {item.label}
              </span>
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-100 p-6 dark:border-zinc-800">
        <button
          type="button"
          onClick={clearSession}
          className="flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-zinc-500 transition hover:bg-error/10 hover:text-error dark:text-zinc-400"
        >
          <span className="material-symbols-outlined text-[22px]">logout</span>
          <span className="text-sm font-bold">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};
