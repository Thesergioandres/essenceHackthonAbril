import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { ReactNode } from "react";
import GlobalAnimationLayout from "@/infrastructure/ui/layouts/GlobalAnimationLayout";
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
      <body className="bg-surface text-ink antialiased">
        <GlobalAnimationLayout>{children}</GlobalAnimationLayout>
      </body>
    </html>
  );
};

export default RootLayout;