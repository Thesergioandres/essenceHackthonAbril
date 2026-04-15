"use client";

import Link from "next/link";
import { ChangeEvent, useMemo, useState } from "react";
import { useDonations } from "@/application/hooks/useDonations";
import { useTenant } from "@/application/hooks/useTenant";
import { OrganizationLocation } from "@/domain/models/Organization";
import { LocationPickerMap } from "@/infrastructure/ui/components/LocationPickerMap";
import { OperationsPageFrame } from "@/infrastructure/ui/layouts/OperationsPageFrame";

interface DonationFormState {
  photoBase64: string;
  title: string;
  quantityKg: number;
  expirationHours: number;
  location: OrganizationLocation;
}

const STEP_LABELS = ["Evidencia", "Detalles", "Geolocalizacion"];

const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("No se pudo leer la imagen"));
    };

    reader.onerror = () => {
      reject(new Error("No se pudo leer la imagen"));
    };

    reader.readAsDataURL(file);
  });
};

const NewDonationPage = (): JSX.Element => {
  const { activeTenantId, activeOrganization, activeUser } = useTenant();
  const { create, isError, error } = useDonations(activeTenantId);

  const [step, setStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [wasCreated, setWasCreated] = useState<boolean>(false);
  const [formState, setFormState] = useState<DonationFormState>({
    photoBase64: "",
    title: "",
    quantityKg: 15,
    expirationHours: 4,
    location: activeOrganization.location
  });

  const expirationDatePreview = useMemo(() => {
    const date = new Date(Date.now() + formState.expirationHours * 60 * 60 * 1000);
    return date.toLocaleString("es-CO");
  }, [formState.expirationHours]);

  const canProceed = useMemo(() => {
    if (step === 0) {
      return formState.photoBase64.length > 0;
    }

    if (step === 1) {
      return formState.title.trim().length >= 4 && formState.quantityKg > 0;
    }

    return true;
  }, [formState.photoBase64.length, formState.quantityKg, formState.title, step]);

  const handlePhotoSelected = async (
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    try {
      const base64 = await fileToBase64(selectedFile);
      setFormState((currentForm) => ({
        ...currentForm,
        photoBase64: base64
      }));
    } catch (photoError: unknown) {
      const message = photoError instanceof Error ? photoError.message : "No se pudo cargar la foto";
      setSubmitError(message);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const expirationDate = new Date(
        Date.now() + formState.expirationHours * 60 * 60 * 1000
      ).toISOString();

      const createdDonation = await create({
        donorId: activeUser.id,
        title: formState.title.trim(),
        quantity: formState.quantityKg,
        expirationDate,
        donorPhoto: formState.photoBase64
      });

      if (!createdDonation) {
        setSubmitError("No fue posible registrar la donacion. Intenta de nuevo.");
        return;
      }

      setWasCreated(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (wasCreated) {
    return (
      <OperationsPageFrame sectionLabel="Donacion registrada" showRoleSwitch>
        <section className="mx-auto max-w-2xl rounded-[2rem] border border-primary/20 bg-white/95 p-8 text-center shadow-[0_18px_44px_rgba(15,23,42,0.1)]">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Exito</p>
          <h1 className="mt-3 text-3xl font-extrabold text-on-surface">Donacion publicada</h1>
          <p className="mt-3 text-sm text-on-surface-variant">
            Tu evidencia y detalles ya quedaron en la red de rescate para asignacion logistica.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/donations"
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-on-primary"
            >
              Ver donaciones
            </Link>
            <Link
              href="/foundation"
              className="rounded-2xl border border-primary/20 bg-primary/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-primary"
            >
              Ir a fundacion
            </Link>
          </div>
        </section>
      </OperationsPageFrame>
    );
  }

  return (
    <OperationsPageFrame sectionLabel="Nueva donacion" showRoleSwitch>
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-[0_20px_48px_rgba(15,23,42,0.1)] sm:p-8">
        <div className="mb-7">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Paso {step + 1} de 3
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
              {STEP_LABELS[step]}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {STEP_LABELS.map((stepLabel, index) => (
              <div
                key={stepLabel}
                className={`h-1.5 rounded-full ${
                  index <= step ? "bg-primary" : "bg-surface-container-high"
                }`}
              />
            ))}
          </div>
        </div>

        {step === 0 ? (
          <section>
            <h2 className="text-2xl font-bold text-on-surface">Evidencia fotografica</h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Captura una foto nativa desde camara para validar el estado del alimento.
            </p>

            <label className="mt-5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-primary/35 bg-surface-container-low px-5 py-10 text-center transition hover:border-primary hover:bg-primary/5">
              <span className="material-symbols-outlined text-5xl text-primary">photo_camera</span>
              <span className="text-sm font-semibold text-on-surface">
                {formState.photoBase64 ? "Cambiar fotografia" : "Tomar fotografia"}
              </span>
              <span className="text-xs text-on-surface-variant">Se recomienda luz natural y plano cercano.</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) => {
                  void handlePhotoSelected(event);
                }}
              />
            </label>

            {formState.photoBase64 ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-900/10">
                <img src={formState.photoBase64} alt="Vista previa de evidencia" className="h-64 w-full object-cover" />
              </div>
            ) : null}
          </section>
        ) : null}

        {step === 1 ? (
          <section className="space-y-5">
            <h2 className="text-2xl font-bold text-on-surface">Datos del excedente</h2>

            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                Titulo
              </span>
              <input
                value={formState.title}
                onChange={(event) => {
                  setFormState((currentForm) => ({
                    ...currentForm,
                    title: event.target.value
                  }));
                }}
                placeholder="Ej: Excedente de panaderia artesanal"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-on-surface outline-none focus:border-primary"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                  Kilogramos estimados
                </span>
                <input
                  type="number"
                  min={1}
                  value={formState.quantityKg}
                  onChange={(event) => {
                    setFormState((currentForm) => ({
                      ...currentForm,
                      quantityKg: Math.max(1, Number(event.target.value) || 1)
                    }));
                  }}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-on-surface outline-none focus:border-primary"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                  Caducidad
                </span>
                <select
                  value={formState.expirationHours}
                  onChange={(event) => {
                    setFormState((currentForm) => ({
                      ...currentForm,
                      expirationHours: Number(event.target.value)
                    }));
                  }}
                  className="w-full rounded-2xl border border-secondary/25 bg-secondary-container/10 px-4 py-3 text-sm font-semibold text-secondary outline-none focus:border-secondary"
                >
                  <option value={2}>2 horas</option>
                  <option value={4}>4 horas</option>
                  <option value={6}>6 horas</option>
                  <option value={12}>12 horas</option>
                </select>
              </label>
            </div>

            <p className="rounded-xl bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant">
              Tiempo estimado de vencimiento: {expirationDatePreview}
            </p>
          </section>
        ) : null}

        {step === 2 ? (
          <section>
            <h2 className="text-2xl font-bold text-on-surface">Punto de recoleccion</h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Ajusta el marcador para definir donde se recogera el alimento.
            </p>

            <LocationPickerMap
              className="mt-4"
              selectedLocation={formState.location}
              onLocationSelect={(location) => {
                setFormState((currentForm) => ({
                  ...currentForm,
                  location
                }));
              }}
            />
          </section>
        ) : null}

        {submitError || isError ? (
          <p className="mt-4 rounded-xl border border-error/25 bg-error-container px-4 py-3 text-sm text-on-error-container">
            {submitError ?? error}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setStep((currentStep) => Math.max(0, currentStep - 1));
            }}
            disabled={step === 0}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-on-surface transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Atras
          </button>

          {step < 2 ? (
            <button
              type="button"
              onClick={() => {
                if (!canProceed) {
                  return;
                }

                setStep((currentStep) => Math.min(2, currentStep + 1));
              }}
              disabled={!canProceed}
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-on-primary transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                void handleSubmit();
              }}
              disabled={isSubmitting}
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-on-primary transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Registrando..." : "Publicar donacion"}
            </button>
          )}
        </div>
      </section>
    </OperationsPageFrame>
  );
};

export default NewDonationPage;
