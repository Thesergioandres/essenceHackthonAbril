"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { AnimatedCounter } from "@/infrastructure/ui/components/AnimatedCounter";

interface ContentCard {
  title: string;
  description: string;
  icon: string;
}

interface ImpactStat {
  value: number;
  decimals: number;
  suffix: string;
  heading: string;
  detail: string;
}

const PROBLEM_CARDS: ContentCard[] = [
  {
    title: "Desperdicio masivo",
    description:
      "Toneladas de alimento apto se pierden diariamente en la ciudad por falta de trazabilidad operativa.",
    icon: "delete"
  },
  {
    title: "Inseguridad alimentaria",
    description:
      "Miles de familias y comedores comunitarios necesitan abastecimiento continuo para mantener sus raciones.",
    icon: "sentiment_stressed"
  },
  {
    title: "Falta de transporte especializado",
    description:
      "Sin red de voluntarios y rutas optimizadas, la ayuda llega tarde o no llega a quienes mas la necesitan.",
    icon: "local_shipping"
  }
];

const FLOW_STEPS: ContentCard[] = [
  {
    title: "1. Donacion (Fotos/IA)",
    description:
      "Los donantes publican excedentes con evidencia visual para validar estado, volumen y urgencia.",
    icon: "add_a_photo"
  },
  {
    title: "2. Solicitud (Fundaciones)",
    description:
      "Fundaciones y comedores activan necesidades reales segun demanda, ubicacion y capacidad de recepcion.",
    icon: "volunteer_activism"
  },
  {
    title: "3. Rescate (Voluntarios Offline)",
    description:
      "Voluntarios coordinan rutas en campo incluso con conectividad intermitente para no frenar la operacion.",
    icon: "signal_wifi_off"
  },
  {
    title: "4. Impacto (FAO Metrics)",
    description:
      "RURA transforma cada entrega en indicadores auditables: kg recuperados, CO2 evitado y raciones servidas.",
    icon: "monitoring"
  }
];

const ROLE_CARDS: ContentCard[] = [
  {
    title: "Donantes",
    description:
      "Empresas, restaurantes y productores que convierten excedentes en oportunidades de alimentacion digna.",
    icon: "storefront"
  },
  {
    title: "Voluntarios",
    description:
      "Equipos de rescate logistico que conectan punto de origen y destino con trazabilidad en tiempo real.",
    icon: "handshake"
  },
  {
    title: "Fundaciones",
    description:
      "Organizaciones que priorizan solicitudes, distribuyen raciones y cierran el circulo de impacto social.",
    icon: "groups"
  }
];

const LIVE_STATS: ImpactStat[] = [
  {
    value: 500,
    decimals: 0,
    suffix: "kg",
    heading: "Rescatados",
    detail: "500kg Rescatados"
  },
  {
    value: 1.2,
    decimals: 1,
    suffix: " Tons",
    heading: "CO2 Evitadas",
    detail: "1.2 Tons CO2 Evitadas"
  },
  {
    value: 2000,
    decimals: 0,
    suffix: "",
    heading: "Raciones Entregadas",
    detail: "2000 Raciones Entregadas"
  }
];

const HomePage = (): JSX.Element => {
  const pageRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (!pageRef.current) {
      return;
    }

    const context = gsap.context(() => {
      const revealTargets = [
        "[data-rura-hero]",
        "[data-rura-problem-card]",
        "[data-rura-step]",
        "[data-rura-stat]",
        "[data-rura-role]",
        "[data-rura-footer-link]"
      ].join(", ");

      gsap.set(revealTargets, { autoAlpha: 0, y: 24 });

      const timeline = gsap.timeline({
        defaults: { duration: 0.75, ease: "power3.out" }
      });

      timeline
        .to("[data-rura-hero]", { autoAlpha: 1, y: 0, stagger: 0.14 })
        .to("[data-rura-problem-card]", { autoAlpha: 1, y: 0, stagger: 0.12 }, "-=0.35")
        .to("[data-rura-step]", { autoAlpha: 1, y: 0, stagger: 0.1 }, "-=0.3")
        .to("[data-rura-stat]", { autoAlpha: 1, y: 0, stagger: 0.1 }, "-=0.25")
        .to("[data-rura-role]", { autoAlpha: 1, y: 0, stagger: 0.1 }, "-=0.2")
        .to("[data-rura-footer-link]", { autoAlpha: 1, y: 0, stagger: 0.08 }, "-=0.15");
    }, pageRef);

    return () => {
      context.revert();
    };
  }, []);

  return (
    <main ref={pageRef} className="relative min-h-screen overflow-hidden text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_8%,rgba(5,150,105,0.2)_0%,transparent_34%),radial-gradient(circle_at_88%_14%,rgba(249,115,22,0.18)_0%,transparent_36%),radial-gradient(circle_at_75%_86%,rgba(30,64,175,0.11)_0%,transparent_34%),linear-gradient(160deg,#f9f9f6_0%,#f2f6f4_46%,#fff7ee_100%)]" />

      <header className="sticky top-0 z-40 border-b border-white/55 bg-white/55 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span
              className="material-symbols-outlined rounded-xl bg-emerald-700/10 p-2 text-emerald-700"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              hub
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700/80">
                RURA
              </p>
              <p className="text-sm font-bold text-slate-900">Red Urbana de Rescate Alimentario</p>
            </div>
          </Link>

          <Link
            href="/register?next=%2Fdashboard"
            className="rounded-full border border-emerald-700/20 bg-white/85 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:text-white"
          >
            Iniciar Sesion / Registro
          </Link>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-7 px-4 pb-8 pt-10 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-10 lg:px-8 lg:pt-14">
        <div
          data-rura-hero
          className="rounded-[2rem] border border-white/60 bg-white/60 p-7 shadow-[0_20px_54px_rgba(15,23,42,0.09)] backdrop-blur-md lg:col-span-7"
        >
          <p className="inline-flex rounded-full bg-orange-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-orange-500">
            Logistica social en tiempo real
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-slate-950 sm:text-5xl">
            RURA: Conectando excedentes con esperanza
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-700 sm:text-lg">
            La red logistica inteligente que combate el hambre y el desperdicio de alimentos en Neiva.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/register?next=%2Fdashboard"
              className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-bold uppercase tracking-[0.13em] text-white shadow-[0_14px_30px_rgba(4,120,87,0.35)] transition hover:-translate-y-0.5 hover:brightness-110"
            >
              Comenzar ahora
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-300 bg-white/90 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-500 hover:text-orange-500"
            >
              Ver dashboard en vivo
            </Link>
          </div>
        </div>

        <div
          data-rura-hero
          className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/55 p-6 shadow-[0_20px_54px_rgba(15,23,42,0.09)] backdrop-blur-md lg:col-span-5"
        >
          <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-emerald-700/20 blur-2xl" />
          <div className="absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-orange-500/25 blur-2xl" />

          <p className="text-xs font-bold uppercase tracking-[0.17em] text-emerald-700">Red de rescate</p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Logistica social coordinada</h2>

          <div className="mt-6 grid gap-3">
            <div className="flex items-center justify-between rounded-2xl bg-white/70 p-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined rounded-lg bg-emerald-700/10 p-2 text-emerald-700">
                  warehouse
                </span>
                <p className="text-sm font-semibold text-slate-800">Donante publica excedente</p>
              </div>
              <span className="text-xs font-bold text-slate-500">10:03</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-white/70 p-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined rounded-lg bg-orange-500/15 p-2 text-orange-500">
                  route
                </span>
                <p className="text-sm font-semibold text-slate-800">Ruta asignada al voluntario</p>
              </div>
              <span className="text-xs font-bold text-slate-500">10:18</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-white/70 p-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined rounded-lg bg-emerald-700/10 p-2 text-emerald-700">
                  favorite
                </span>
                <p className="text-sm font-semibold text-slate-800">Fundacion confirma entrega</p>
              </div>
              <span className="text-xs font-bold text-slate-500">10:41</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">El porque</p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-950">La urgencia en Neiva es real</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {PROBLEM_CARDS.map((card) => (
            <article
              key={card.title}
              data-rura-problem-card
              className="rounded-3xl border border-white/65 bg-white/65 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-md"
            >
              <span className="material-symbols-outlined rounded-xl bg-orange-500/12 p-2 text-orange-500">
                {card.icon}
              </span>
              <h3 className="mt-3 text-xl font-bold text-slate-900">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="mision" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Nuestra solucion</p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-950">Como funciona RURA</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {FLOW_STEPS.map((step, index) => (
            <article
              key={step.title}
              data-rura-step
              className="relative rounded-3xl border border-white/65 bg-white/65 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-md"
            >
              <span className="absolute right-4 top-4 rounded-full bg-emerald-700/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                Paso {index + 1}
              </span>
              <span className="material-symbols-outlined rounded-xl bg-emerald-700/12 p-2 text-emerald-700">
                {step.icon}
              </span>
              <h3 className="mt-3 pr-16 text-lg font-bold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Impacto real</p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-950">Live Stats</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {LIVE_STATS.map((stat) => (
            <article
              key={stat.detail}
              data-rura-stat
              className="rounded-3xl border border-white/65 bg-white/65 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-md"
            >
              <p className="text-4xl font-extrabold leading-none text-emerald-700">
                <AnimatedCounter value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-slate-600">
                {stat.heading}
              </p>
              <p className="mt-2 text-sm text-slate-700">{stat.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">Quienes participan</p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-950">Roles de la red</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {ROLE_CARDS.map((role) => (
            <article
              key={role.title}
              data-rura-role
              className="rounded-3xl border border-white/65 bg-white/65 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-md"
            >
              <span className="material-symbols-outlined rounded-xl bg-emerald-700/12 p-2 text-emerald-700">
                {role.icon}
              </span>
              <h3 className="mt-3 text-xl font-bold text-slate-900">{role.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{role.description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="mt-8 border-t border-white/60 bg-white/60 backdrop-blur-md">
        <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-8 sm:px-6 md:grid-cols-2 lg:px-8">
          <div data-rura-footer-link>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Contacto</p>
            <p className="mt-2 text-sm text-slate-700">Neiva, Huila, Colombia</p>
            <p className="text-sm text-slate-700">hola@rura.red</p>
          </div>

          <div data-rura-footer-link className="md:text-right">
            <div className="flex flex-wrap gap-3 md:justify-end">
              <a
                href="#mision"
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:border-emerald-700 hover:text-emerald-700"
              >
                Mision
              </a>
              <Link
                href="/health"
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:border-orange-500 hover:text-orange-500"
              >
                Estado
              </Link>
            </div>
            <p className="mt-3 text-sm text-slate-700">
              Hecho con {"\u2764\uFE0F"} en Neiva para el mundo
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default HomePage;