"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTenant } from "@/application/hooks/useTenant";
import { login } from "@/infrastructure/network/authApi";
import { HttpError, setAuthTokenInRuntime } from "@/infrastructure/network/httpClient";
import { Toast } from "@/infrastructure/ui/components/Toast";

interface LoginFormState {
  email: string;
  password: string;
  tenantId: string;
}

const INITIAL_FORM_STATE: LoginFormState = {
  email: "",
  password: "",
  tenantId: ""
};

const INVALID_CREDENTIALS_MESSAGE =
  "Credenciales inválidas, por favor verifica tus datos";

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

const LoginPageContent = (): JSX.Element => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasSession, bootstrapSession } = useTenant();

  const [formState, setFormState] = useState<LoginFormState>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showInvalidCredentialsToast, setShowInvalidCredentialsToast] =
    useState<boolean>(false);

  const nextPath = useMemo(() => {
    return resolveSafeNextPath(searchParams.get("next"));
  }, [searchParams]);

  useEffect(() => {
    if (!hasSession) {
      return;
    }

    router.replace(nextPath);
  }, [hasSession, nextPath, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setSubmitError(null);
    setShowInvalidCredentialsToast(false);

    const normalizedEmail = formState.email.trim().toLowerCase();
    const normalizedPassword = formState.password.trim();
    const normalizedTenantId = formState.tenantId.trim();

    if (normalizedEmail.length === 0 || !normalizedEmail.includes("@")) {
      setSubmitError("Ingresa un correo valido.");
      return;
    }

    if (normalizedPassword.length === 0) {
      setSubmitError("Ingresa tu contraseña para continuar.");
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await login({
        email: normalizedEmail,
        password: normalizedPassword,
        ...(normalizedTenantId.length > 0 ? { tenantId: normalizedTenantId } : {})
      });

      setAuthTokenInRuntime(session.token);
      bootstrapSession({
        organization: session.organization,
        user: session.user
      });
      router.replace(nextPath);
    } catch (error: unknown) {
      const isInvalidCredentialsError =
        error instanceof HttpError && error.status === 401;

      if (isInvalidCredentialsError) {
        setShowInvalidCredentialsToast(true);
        return;
      }

      const message =
        error instanceof Error ? error.message : "No fue posible iniciar sesión.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,#CFF6DE_0%,#F5FAF7_45%,#F2F4F7_100%)] px-6 py-12">
        <p className="rounded-2xl border border-primary/20 bg-white/90 px-5 py-3 text-sm font-semibold text-on-surface shadow-sm">
          Redirigiendo al dashboard operativo...
        </p>
      </main>
    );
  }

  return (
    <>
      <Toast
        isVisible={showInvalidCredentialsToast}
        message={INVALID_CREDENTIALS_MESSAGE}
        onClose={() => {
          setShowInvalidCredentialsToast(false);
        }}
      />

      <main className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,#D8FBE6_0%,#F4F7FB_45%,#E9EFF5_100%)] px-6 py-10">
        <div className="mx-auto w-full max-w-lg">
          <section className="rounded-[2rem] border border-slate-900/10 bg-white/95 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.1)] sm:p-9">
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
              Iniciar sesión
            </h1>

            <form className="mt-6 space-y-5" onSubmit={(event) => void handleSubmit(event)}>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                  Correo
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  value={formState.email}
                  onChange={(event) => {
                    setFormState((current) => ({
                      ...current,
                      email: event.target.value
                    }));
                  }}
                  placeholder="nombre@organizacion.org"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-on-surface outline-none focus:border-primary"
                  required
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                  Contraseña
                </span>
                <div className="mt-2 flex items-center overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-primary">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={formState.password}
                    onChange={(event) => {
                      setFormState((current) => ({
                        ...current,
                        password: event.target.value
                      }));
                    }}
                    placeholder="••••••••"
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

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                  Tenant ID (opcional)
                </span>
                <input
                  value={formState.tenantId}
                  onChange={(event) => {
                    setFormState((current) => ({
                      ...current,
                      tenantId: event.target.value
                    }));
                  }}
                  placeholder="Ej: 662f..."
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-on-surface outline-none focus:border-primary"
                />
              </label>

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
                {isSubmitting ? "Validando..." : "Entrar"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-on-surface-variant">
              ¿Primera vez en RURA?{" "}
              <Link href="/register" className="font-semibold text-primary">
                Crear cuenta
              </Link>
            </p>
          </section>
        </div>
      </main>
    </>
  );
};

const LoginPage = (): JSX.Element => {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,#CFF6DE_0%,#F5FAF7_45%,#F2F4F7_100%)] px-6 py-12">
          <p className="rounded-2xl border border-primary/20 bg-white/90 px-5 py-3 text-sm font-semibold text-on-surface shadow-sm">
            Cargando acceso...
          </p>
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
};

export default LoginPage;
