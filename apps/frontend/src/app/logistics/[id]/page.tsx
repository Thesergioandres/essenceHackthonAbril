"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { DonationStatus } from "@/domain/models/Donation";
import { useDonations } from "@/application/hooks/useDonations";
import { useTenant } from "@/application/hooks/useTenant";
import { LogisticsMap } from "@/infrastructure/ui/components/LogisticsMap";
import { OperationsPageFrame } from "@/infrastructure/ui/layouts/OperationsPageFrame";

const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000;
const ONE_SECOND_IN_MS = 1000;

const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("No se pudo leer el archivo"));
    };

    reader.onerror = () => {
      reject(new Error("No se pudo leer el archivo"));
    };

    reader.readAsDataURL(file);
  });
};

const formatTimeLeft = (remainingMs: number): string => {
  if (remainingMs <= 0) {
    return "00:00:00";
  }

  const totalSeconds = Math.floor(remainingMs / ONE_SECOND_IN_MS);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

const toStatusLabel = (status: DonationStatus): string => {
  if (status === "requested") {
    return "Solicitud asignada";
  }

  if (status === "picked_up") {
    return "Recogida en curso";
  }

  return "Entrega finalizada";
};

const LogisticsDetailPage = (): JSX.Element => {
  const params = useParams<{ id: string }>();
  const donationId = params.id;

  const { activeTenantId, activeOrganization } = useTenant();
  const { data, isLoading, isError, error, updateStatus, refetch } = useDonations(activeTenantId);

  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const donation = useMemo(() => {
    return data.find((item) => item.id === donationId);
  }, [data, donationId]);

  const assignedAtTimestamp = useMemo(() => {
    if (donation?.assignedAt) {
      const parsed = new Date(donation.assignedAt).getTime();

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    return Date.now();
  }, [donation?.assignedAt]);

  const deadlineTimestamp = assignedAtTimestamp + TWO_HOURS_IN_MS;
  const remainingMs = deadlineTimestamp - nowTimestamp;

  const guaranteeClassName =
    remainingMs <= 0
      ? "text-error"
      : remainingMs < 30 * 60 * 1000
        ? "text-secondary"
        : "text-primary";

  const routeDestination = useMemo(() => {
    const origin = activeOrganization.location;
    const donationHash = donationId
      .split("")
      .reduce((accumulator, currentChar) => accumulator + currentChar.charCodeAt(0), 0);

    const latShift = ((donationHash % 25) - 12) / 2000;
    const lngShift = ((donationHash % 31) - 15) / 2000;

    return {
      lat: origin.lat + latShift,
      lng: origin.lng + lngShift,
      addressString: "Fundacion receptora"
    };
  }, [activeOrganization.location, donationId]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowTimestamp(Date.now());
    }, ONE_SECOND_IN_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const handlePhotoStatusUpdate = async (
    event: ChangeEvent<HTMLInputElement>,
    status: DonationStatus
  ): Promise<void> => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile || !donation) {
      return;
    }

    setActionError(null);
    setIsActionLoading(true);

    try {
      const base64Photo = await fileToBase64(selectedFile);

      await updateStatus({
        donationId: donation.id,
        status,
        photoBase64: base64Photo
      });

      await refetch();
    } catch (requestError: unknown) {
      const message = requestError instanceof Error ? requestError.message : "No se pudo actualizar estado";
      setActionError(message);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <OperationsPageFrame sectionLabel="Detalle de ruta" showRoleSwitch>
      <div className="mb-5 flex items-center justify-between gap-3">
        <Link
          href="/logistics"
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-on-surface"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Volver al feed
        </Link>

        <Link
          href="/offline"
          className="inline-flex items-center gap-2 rounded-full border border-tertiary/20 bg-tertiary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-tertiary"
        >
          <span className="material-symbols-outlined text-[18px]">cloud_off</span>
          Cola offline
        </Link>
      </div>

      {isError ? (
        <p className="mb-4 rounded-2xl border border-error/20 bg-error-container px-4 py-3 text-sm text-on-error-container">
          {error}
        </p>
      ) : null}

      {actionError ? (
        <p className="mb-4 rounded-2xl border border-error/20 bg-error-container px-4 py-3 text-sm text-on-error-container">
          {actionError}
        </p>
      ) : null}

      {isLoading ? (
        <p className="rounded-2xl bg-white/90 px-4 py-5 text-sm text-on-surface-variant shadow-sm">
          Cargando detalle de ruta...
        </p>
      ) : null}

      {!isLoading && !donation ? (
        <p className="rounded-2xl bg-white/90 px-4 py-5 text-sm text-on-surface-variant shadow-sm">
          No se encontro la donacion solicitada.
        </p>
      ) : null}

      {!isLoading && donation ? (
        <section className="space-y-6">
          <LogisticsMap
            origin={activeOrganization.location}
            destination={routeDestination}
            routeLabel={`${donation.title} - ${toStatusLabel(donation.status)}`}
          />

          <article className="rounded-[2rem] border border-slate-900/10 bg-white/95 p-6 shadow-[0_18px_44px_rgba(15,23,42,0.1)]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">Modulo de garantia</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-on-surface">
              Tiempo limite de entrega
            </h2>

            <p className={`mt-3 text-5xl font-extrabold ${guaranteeClassName}`}>
              {formatTimeLeft(remainingMs)}
            </p>

            <p className="mt-2 text-sm text-on-surface-variant">
              Si superas 02:00:00 se activa penalizacion de confiabilidad para esta unidad.
            </p>

            {remainingMs <= 0 ? (
              <p className="mt-3 rounded-xl bg-error-container px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-on-error-container">
                Tiempo excedido: reporta incidencia o reasigna la ruta.
              </p>
            ) : null}
          </article>

          <article className="rounded-[2rem] border border-slate-900/10 bg-white/95 p-6 shadow-[0_18px_44px_rgba(15,23,42,0.1)]">
            <h3 className="text-2xl font-extrabold text-on-surface">Acciones de evidencia</h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              Captura de camara obligatoria para cada hito logistico.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label
                className={`cursor-pointer rounded-2xl px-4 py-4 text-sm font-bold uppercase tracking-[0.12em] transition ${
                  donation.status === "requested"
                    ? "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
                    : "cursor-not-allowed bg-surface-container-low text-on-surface-variant/60"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                  Capturar recogida
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  disabled={donation.status !== "requested" || isActionLoading}
                  onChange={(event) => {
                    void handlePhotoStatusUpdate(event, "picked_up");
                  }}
                />
              </label>

              <label
                className={`cursor-pointer rounded-2xl px-4 py-4 text-sm font-bold uppercase tracking-[0.12em] transition ${
                  donation.status === "picked_up"
                    ? "bg-primary text-on-primary hover:brightness-110"
                    : "cursor-not-allowed bg-surface-container-low text-on-surface-variant/60"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
                  Confirmar entrega
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  disabled={donation.status !== "picked_up" || isActionLoading}
                  onChange={(event) => {
                    void handlePhotoStatusUpdate(event, "delivered");
                  }}
                />
              </label>
            </div>

            {isActionLoading ? (
              <p className="mt-4 text-sm font-semibold text-primary">Procesando evidencia...</p>
            ) : null}

            {donation.status === "delivered" ? (
              <p className="mt-4 rounded-xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
                Ruta finalizada con evidencia validada.
              </p>
            ) : null}
          </article>
        </section>
      ) : null}
    </OperationsPageFrame>
  );
};

export default LogisticsDetailPage;
