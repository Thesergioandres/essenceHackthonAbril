import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import GlobalAnimationLayout from "@/infrastructure/ui/layouts/GlobalAnimationLayout";
import "./globals.css";

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
  description: "Frontend base with Clean Architecture, Tailwind and GSAP."
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps): JSX.Element => {
  return (
    <html lang="es" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1"
        />
      </head>
      <body className="min-h-screen bg-surface text-ink antialiased">
        <GlobalAnimationLayout>{children}</GlobalAnimationLayout>
      </body>
    </html>
  );
};

export default RootLayout;