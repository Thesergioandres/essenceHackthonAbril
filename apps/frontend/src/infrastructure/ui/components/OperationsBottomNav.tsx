"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  matches: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Impacto",
    icon: "dashboard",
    matches: (pathname) => pathname === "/"
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

export const OperationsBottomNav = (): JSX.Element => {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-900/10 bg-white/90 pb-safe backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-2xl items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.matches(pathname);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-14 flex-col items-center justify-center rounded-xl px-2 py-1.5 transition ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-slate-500 hover:text-primary"
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
              >
                {item.icon}
              </span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
