import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import GlobalAnimationLayout from "@/infrastructure/ui/layouts/GlobalAnimationLayout";
import { ThemeProvider } from "@/infrastructure/ui/theme/ThemeProvider";
import "./globals.css";

const themeInitializerScript = `
(() => {
  try {
    const storageKey = "rura-theme";
    const storedTheme = window.localStorage.getItem(storageKey);
    const hasStoredTheme = storedTheme === "light" || storedTheme === "dark";
    const resolvedTheme = hasStoredTheme
      ? storedTheme
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;

    if (!hasStoredTheme) {
      window.localStorage.setItem(storageKey, resolvedTheme);
    }
  } catch (error) {
    // Ignore initialization failures from restricted browser storage contexts.
  }
})();
`;

const displayFont = Manrope({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display"
});

const bodyFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "RURA | Red Urbana de Rescate Alimentario",
  description: "Frontend base with Clean Architecture, Tailwind and GSAP.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg"
  }
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps): JSX.Element => {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${displayFont.variable} ${bodyFont.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializerScript }} />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1"
        />
      </head>
      <body className="min-h-screen bg-surface text-ink antialiased">
        <ThemeProvider>
          <GlobalAnimationLayout>{children}</GlobalAnimationLayout>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;