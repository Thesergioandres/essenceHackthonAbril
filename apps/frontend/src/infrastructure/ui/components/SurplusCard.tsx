"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Donation } from "@/domain/models/Donation";
import { CountdownTimer } from "@/infrastructure/ui/components/CountdownTimer";

interface SurplusCardProps {
  donation: Donation;
  updateStatus: (
    donationId: string,
    status: Donation["status"],
    photoBase64: string
  ) => Promise<Donation | null>;
}

const statusTone: Record<Donation["status"], string> = {
  pending: "bg-amber-100 text-amber-700",
  in_transit: "bg-emerald-100 text-emerald-700",
  delivered: "bg-slate-200 text-slate-600"
};

const statusLabel: Record<Donation["status"], string> = {
  pending: "Pending",
  in_transit: "In Transit",
  delivered: "Delivered"
};

const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (): void => {
      if (typeof reader.result !== "string") {
        reject(new Error("Unable to process image file"));
        return;
      }

      const [, base64] = reader.result.split(",");
      resolve(base64 ?? reader.result);
    };

    reader.onerror = (): void => {
      reject(reader.error ?? new Error("Unable to read image file"));
    };

    reader.readAsDataURL(file);
  });
};

export const SurplusCard = ({ donation, updateStatus }: SurplusCardProps): JSX.Element => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [captureTargetStatus, setCaptureTargetStatus] = useState<Donation["status"] | null>(null);
  const [isProcessingCapture, setIsProcessingCapture] = useState<boolean>(false);

  const openCameraForStatus = (targetStatus: Donation["status"]): void => {
    setCaptureTargetStatus(targetStatus);

    if (!fileInputRef.current) {
      return;
    }

    fileInputRef.current.value = "";
    fileInputRef.current.click();
  };

  const handleFileCapture = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];

    if (!file || !captureTargetStatus || isProcessingCapture) {
      return;
    }

    setIsProcessingCapture(true);

    try {
      const photoBase64 = await toBase64(file);
      await updateStatus(donation.id, captureTargetStatus, photoBase64);
    } finally {
      setIsProcessingCapture(false);
      setCaptureTargetStatus(null);
      event.target.value = "";
    }
  };

  const isDelivered = donation.status === "delivered";
  const actionLabel = donation.status === "pending" ? "Iniciar Recolección" : "Confirmar Entrega";
  const actionStatus: Donation["status"] = donation.status === "pending" ? "in_transit" : "delivered";

  return (
    <article
      data-surplus-card
      className="rounded-3xl border border-slate-900/10 bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.1)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-lg font-semibold text-ink">{donation.title}</h4>
          <p className="mt-1 text-sm text-slate-600">Tenant: {donation.tenantId}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[donation.status]}`}>
          {statusLabel[donation.status]}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div className="rounded-2xl bg-slate-50 px-3 py-2">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Quantity</p>
          <p className="mt-1 text-base font-semibold text-ink">{donation.quantity} kg</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-2">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Expires</p>
          <CountdownTimer expirationDate={donation.expirationDate} />
        </div>
      </div>

      <div className="mt-5">
        {isDelivered ? (
          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Completado
          </span>
        ) : (
          <button
            type="button"
            onClick={() => {
              openCameraForStatus(actionStatus);
            }}
            disabled={isProcessingCapture}
            className="rounded-full border border-accent/35 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isProcessingCapture ? "Procesando..." : actionLabel}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => {
            void handleFileCapture(event);
          }}
        />
      </div>
    </article>
  );
};
