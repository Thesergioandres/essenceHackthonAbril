"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useTheme } from "@/infrastructure/ui/theme/ThemeProvider";

export const ThemeToggleButton = (): JSX.Element => {
  const { theme, toggleTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const isDarkMode = theme === "dark";

  const handleToggle = (): void => {
    if (buttonRef.current) {
      gsap.fromTo(
        buttonRef.current,
        { scale: 0.88, rotate: -18 },
        { scale: 1, rotate: 0, duration: 0.35, ease: "back.out(2)" }
      );
    }

    toggleTheme();
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleToggle}
      className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-700 shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition hover:border-emerald-700 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-orange-500 dark:hover:text-orange-400"
      aria-label={isDarkMode ? "Activar modo claro" : "Activar modo oscuro"}
      title={isDarkMode ? "Modo claro" : "Modo oscuro"}
    >
      <span className="material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
        {isDarkMode ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
};
