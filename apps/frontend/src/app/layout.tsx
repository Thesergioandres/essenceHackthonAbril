import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display"
});

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "RURA | Red Urbana de Rescate Alimentario",
  description: "Frontend base with Clean Architecture, Tailwind and GSAP."
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps): JSX.Element => {
  return (
    <html lang="es" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="min-h-screen bg-surface text-ink antialiased">{children}</body>
    </html>
  );
};

export default RootLayout;