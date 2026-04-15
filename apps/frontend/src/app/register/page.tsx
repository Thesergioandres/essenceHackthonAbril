"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTenant } from "@/application/hooks/useTenant";
<<<<<<< HEAD
import { OrganizationLocation } from "@/domain/models/Organization";
import { login } from "@/infrastructure/network/authApi";
import { setAuthTokenInRuntime } from "@/infrastructure/network/httpClient";
=======
import type { OrganizationLocation } from "@/domain/models/Organization";
import { LocationPickerMap } from "@/infrastructure/ui/components/LocationPickerMap";
>>>>>>> d1c1be03c3acffac9652993ee06ffb5cf0a93f7a
import { createOrganization } from "@/infrastructure/network/organizationApi";
import { LocationPickerMap } from "@/infrastructure/ui/components/LocationPickerMap";
import { registerUser } from "@/infrastructure/network/userApi";

interface RegisterFormState {
  organizationName: string;
  organizationAddress: string;
  organizationLat: string;
  organizationLng: string;
  userName: string;
  userEmail: string;
  userPassword: string;
  userPasswordConfirmation: string;
  userRole: "foundation" | "volunteer" | "donor";
}

const INITIAL_FORM_STATE: RegisterFormState = {
  organizationName: "",
  organizationAddress: "",
  organizationLat: "2.9273",
  organizationLng: "-75.2819",
  userName: "",
  userEmail: "",
  userPassword: "",
  userPasswordConfirmation: "",
  userRole: "foundation"
};

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const resolveSafeNextPath = (value: string | null): string => {
  if (!value) {
    return "/dashboard";
  }

  const normalized = value.trim();

  if (!normalized.startsWith("/") || normalized.startsWith("//")) {
    return "/dashboard";
  }

  return normalized;
};

const parseCoordinateOrFallback = (value: string, fallback: number): number => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const RegisterPage = (): JSX.Element => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasSession, bootstrapSession } = useTenant();

  const [formState, setFormState] = useState<RegisterFormState>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState<boolean>(false);

  const selectedLocation = useMemo<OrganizationLocation>(() => {
    const lat = parseCoordinateOrFallback(formState.organizationLat, 2.9273);
    const lng = parseCoordinateOrFallback(formState.organizationLng, -75.2819);
    const address = formState.organizationAddress.trim();

    return {
      lat,
      lng,
      ...(address.length > 0 ? { addressString: address } : {})
    };
  }, [formState.organizationAddress, formState.organizationLat, formState.organizationLng]);

  const nextPath = useMemo(() => {
    return resolveSafeNextPath(searchParams.get("next"));
  }, [searchParams]);

  const selectedLocation = useMemo<OrganizationLocation>(() => {
    const organizationLat = Number.parseFloat(formState.organizationLat);
    const organizationLng = Number.parseFloat(formState.organizationLng);
    const organizationAddress = formState.organizationAddress.trim();

    return {
      lat: Number.isFinite(organizationLat) ? organizationLat : 2.9273,
      lng: Number.isFinite(organizationLng) ? organizationLng : -75.2819,
      ...(organizationAddress.length > 0 ? { addressString: organizationAddress } : {})
    };
  }, [formState.organizationAddress, formState.organizationLat, formState.organizationLng]);

  useEffect(() => {
    if (!hasSession) {
      return;
    }

    router.replace(nextPath);
  }, [hasSession, nextPath, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setSubmitError(null);

    const organizationName = formState.organizationName.trim();
    const organizationAddress = formState.organizationAddress.trim();
    const userName = formState.userName.trim();
    const userEmail = formState.userEmail.trim().toLowerCase();
    const userPassword = formState.userPassword.trim();
    const userPasswordConfirmation = formState.userPasswordConfirmation.trim();

    const organizationLat = Number.parseFloat(formState.organizationLat);
    const organizationLng = Number.parseFloat(formState.organizationLng);

    if (organizationName.length < 3) {
      setSubmitError("El nombre de la organizacion debe tener al menos 3 caracteres.");
      return;
    }

    if (!Number.isFinite(organizationLat) || !Number.isFinite(organizationLng)) {
      setSubmitError("Debes ingresar una latitud y longitud validas.");
      return;
    }

    if (userName.length < 3) {
      setSubmitError("El nombre del usuario debe tener al menos 3 caracteres.");
      return;
    }

    if (!userEmail.includes("@")) {
      setSubmitError("Ingresa un correo valido.");
      return;
    }

    if (!PASSWORD_REGEX.test(userPassword)) {
      setSubmitError(
        "La contraseña debe tener al menos 8 caracteres e incluir una letra y un número."
      );
      return;
    }

    if (userPassword !== userPasswordConfirmation) {
      setSubmitError("La confirmación de contraseña no coincide.");
      return;
    }

    setIsSubmitting(true);

    try {
      const organization = await createOrganization({
        name: organizationName,
        location: {
          lat: organizationLat,
          lng: organizationLng,
          ...(organizationAddress.length > 0 ? { addressString: organizationAddress } : {})
        }
      });

      await registerUser({
        tenantId: organization.id,
        name: userName,
        email: userEmail,
        password: userPassword,
        role: formState.userRole,
        profileType: formState.userRole === "donor" ? "natural_person" : "organization"
      });

      const session = await login({
        email: userEmail,
        password: userPassword,
        tenantId: organization.id
      });

      setAuthTokenInRuntime(session.token);
      bootstrapSession({
        organization: session.organization,
        user: session.user
      });
      router.replace(nextPath);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "No fue posible completar el registro.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,#CFF6DE_0%,#F5FAF7_45%,#F2F4F7_100%)] px-6 py-12 dark:bg-[radial-gradient(circle_at_top_right,#0F2A1B_0%,#111827_45%,#09090B_100%)]">
        <p className="rounded-2xl border border-primary/20 bg-white/90 px-5 py-3 text-sm font-semibold text-on-surface shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50">
          Redirigiendo al dashboard operativo...
        </p>
      </main>
    );
  }

  return (
<<<<<<< HEAD
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,#D8FBE6_0%,#F4F7FB_45%,#E9EFF5_100%)] px-6 py-10 dark:bg-[radial-gradient(circle_at_20%_10%,#103923_0%,#111827_45%,#09090B_100%)]">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-12">
        <section className="overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-white/90 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.1)] dark:border-zinc-800 dark:bg-zinc-900/90 lg:col-span-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Onboarding real</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-on-surface dark:text-zinc-50">
            Activa RURA para demo en vivo
          </h1>
          <p className="mt-3 text-sm text-on-surface-variant dark:text-zinc-300">
            Crea la organizacion y el usuario principal en un solo flujo. Al finalizar,
            quedas autenticado en el tenant automaticamente.
          </p>

          <div className="mt-6 space-y-3 text-sm text-on-surface-variant dark:text-zinc-300">
            <p className="rounded-xl bg-surface-container-low px-4 py-3 dark:bg-zinc-800">
              Paso 1: Crear organizacion (tenant).
            </p>
            <p className="rounded-xl bg-surface-container-low px-4 py-3 dark:bg-zinc-800">
              Paso 2: Registrar usuario operativo.
            </p>
            <p className="rounded-xl bg-surface-container-low px-4 py-3 dark:bg-zinc-800">
              Paso 3: Entrar directo al dashboard.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant dark:text-zinc-300">
            <Link
              href="/health"
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-on-surface dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              Ver estado backend
            </Link>
            <span className="rounded-full bg-primary/10 px-4 py-2 text-primary">Sin mocks</span>
          </div>
        </section>

        <section className="rounded-[2rem] border border-zinc-200/80 bg-white/95 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.1)] dark:border-zinc-800 dark:bg-zinc-900/95 lg:col-span-7">
=======
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,#D8FBE6_0%,#F4F7FB_45%,#E9EFF5_100%)] px-6 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <section className="rounded-[2rem] border border-slate-900/10 bg-white/95 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.1)] sm:p-9">
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
            Bienvenido a RURA
          </h1>

>>>>>>> 5b4324e0eab689febaaff0e763d497c243035126
          <form className="space-y-6" onSubmit={(event) => void handleSubmit(event)}>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Organizacion
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant dark:text-zinc-300">
                    Nombre del tenant
                  </span>
                  <input
                    value={formState.organizationName}
                    onChange={(event) => {
                      setFormState((current) => ({
                        ...current,
                        organizationName: event.target.value
                      }));
                    }}
                    placeholder="Ej: Comedor Central Neiva"
                    className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-on-surface outline-none focus:border-primary dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    required
                  />
                </label>

                <label className="sm:col-span-2">
<<<<<<< HEAD
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant dark:text-zinc-300">
=======
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                    Ubicacion en mapa
                  </span>
                  <LocationPickerMap
                    className="mt-2"
                    selectedLocation={selectedLocation}
                    onLocationSelect={(location) => {
                      setFormState((current) => ({
                        ...current,
                        organizationLat: location.lat.toFixed(6),
                        organizationLng: location.lng.toFixed(6),
                        organizationAddress:
                          typeof location.addressString === "string"
                            ? location.addressString
                            : current.organizationAddress
                      }));
                    }}
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
>>>>>>> 5b4324e0eab689febaaff0e763d497c243035126
                    Direccion
                  </span>
                  <input
                    value={formState.organizationAddress}
                    onChange={(event) => {
                      setFormState((current) => ({
                        ...current,
                        organizationAddress: event.target.value
                      }));
                    }}
                    placeholder="Ej: Carrera 5 #14-24, Neiva"
                    className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-on-surface outline-none focus:border-primary dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                </label>

<<<<<<< HEAD
                <input type="hidden" name="organizationLat" value={formState.organizationLat} />
                <input type="hidden" name="organizationLng" value={formState.organizationLng} />
=======
                <label>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant dark:text-zinc-300">
                    Latitud
                  </span>
                  <input
                    type="number"
                    step="0.000001"
                    value={formState.organizationLat}
                    onChange={(event) => {
                      setFormState((current) => ({
                        ...current,
                        organizationLat: event.target.value
                      }));
                    }}
                    className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-on-surface outline-none focus:border-primary dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    required
                  />
                </label>

                <label>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant dark:text-zinc-300">
                    Longitud
                  </span>
                  <input
                    type="number"
                    step="0.000001"
                    value={formState.organizationLng}
                    onChange={(event) => {
                      setFormState((current) => ({
                        ...current,
                        organizationLng: event.target.value
                      }));
                    }}
                    className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-on-surface outline-none focus:border-primary dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    required
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant dark:text-zinc-300">
                    Ubicacion visual
                  </span>
                  <LocationPickerMap
                    selectedLocation={selectedLocation}
                    onLocationSelect={(location) => {
                      setFormState((current) => ({
                        ...current,
                        organizationLat: location.lat.toFixed(6),
                        organizationLng: location.lng.toFixed(6),
                        organizationAddress:
                          typeof location.addressString === "string" &&
                          location.addressString.trim().length > 0
                            ? location.addressString
                            : current.organizationAddress
                      }));
                    }}
                    className="mt-2"
                  />
                </label>
>>>>>>> d1c1be03c3acffac9652993ee06ffb5cf0a93f7a
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Usuario principal
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant dark:text-zinc-300">
                    Nombre
                  </span>
                  <input
                    value={formState.userName}
                    onChange={(event) => {
                      setFormState((current) => ({
                        ...current,
                        userName: event.target.value
                      }));
                    }}
                    placeholder="Ej: Laura Prieto"
                    className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-on-surface outline-none focus:border-primary dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    required
                  />
                </label>

                <label>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant dark:text-zinc-300">
                    Correo
                  </span>
                  <input
                    type="email"
                    value={formState.userEmail}
                    onChange={(event) => {
                      setFormState((current) => ({
                        ...current,
                        userEmail: event.target.value
                      }));
                    }}
                    placeholder="nombre@organizacion.org"
                    className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-on-surface outline-none focus:border-primary dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    required
                  />
                </label>

                <label>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                    Contraseña
                  </span>
                  <div className="mt-2 flex items-center overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-primary">
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={formState.userPassword}
                      onChange={(event) => {
                        setFormState((current) => ({
                          ...current,
                          userPassword: event.target.value
                        }));
                      }}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full px-4 py-3 text-sm text-on-surface outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowPassword((current) => !current);
                      }}
                      className="mr-2 rounded-lg px-2 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </label>

                <label className="sm:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                    Confirmar contraseña
                  </span>
                  <div className="mt-2 flex items-center overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-primary">
                    <input
                      type={showPasswordConfirmation ? "text" : "password"}
                      autoComplete="new-password"
                      value={formState.userPasswordConfirmation}
                      onChange={(event) => {
                        setFormState((current) => ({
                          ...current,
                          userPasswordConfirmation: event.target.value
                        }));
                      }}
                      placeholder="Repite tu contraseña"
                      className="w-full px-4 py-3 text-sm text-on-surface outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordConfirmation((current) => !current);
                      }}
                      className="mr-2 rounded-lg px-2 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label={
                        showPasswordConfirmation
                          ? "Ocultar confirmación de contraseña"
                          : "Mostrar confirmación de contraseña"
                      }
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPasswordConfirmation ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </label>

                <label className="sm:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant dark:text-zinc-300">
                    Rol operativo inicial
                  </span>
                  <select
                    value={formState.userRole}
                    onChange={(event) => {
                      setFormState((current) => ({
                        ...current,
                        userRole: event.target.value as RegisterFormState["userRole"]
                      }));
                    }}
                    className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-on-surface outline-none focus:border-primary dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  >
                    <option value="foundation">Fundacion</option>
                    <option value="volunteer">Voluntario</option>
                    <option value="donor">Donante</option>
                  </select>
                </label>
              </div>
            </div>

            {submitError ? (
              <p className="rounded-xl border border-error/25 bg-error-container px-4 py-3 text-sm text-on-error-container">
                {submitError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-on-primary shadow-[0_18px_32px_rgba(0,109,55,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creando tenant..." : "Crear cuenta y entrar"}
            </button>

            <p className="text-center text-sm text-on-surface-variant">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="font-semibold text-primary">
                Iniciar sesión
              </Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
};

export default RegisterPage;
