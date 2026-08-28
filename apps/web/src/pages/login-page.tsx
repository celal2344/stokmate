import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useAuth } from "../auth";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../components/ui/field";
import { Input } from "../components/ui/input";
import { PreferencesControls } from "../components/preferences-controls";

export function LoginPage({ redirectTo }: { redirectTo?: string }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [error, setError] = useState<string>();
  const loginSchema = z.object({
    email: z.string().trim().email(t("invalidEmail")),
    password: z.string().min(1, t("required")),
  });
  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: loginSchema },
    onSubmit: async ({ value }) => {
      setError(undefined);
      try {
        await login(value.email.trim(), value.password);
        await navigate({ to: redirectTo ?? "/products", replace: true });
      } catch {
        setError(t("loginError"));
      }
    },
  });
  return (
    <main className="relative grid min-h-screen place-items-center px-4 py-8 md:p-8">
      <div className="absolute top-4 right-4 md:top-8 md:right-8">
        <PreferencesControls showConnectionState={false} />
      </div>
      <form
        className="grid w-full max-w-md gap-6 border border-border bg-card p-6 shadow-sm md:p-8"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <div className="border-b border-border pb-5">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("loginTitle")}
          </h1>
        </div>
        <FieldGroup>
          <form.Field name="email">
            {(field) => {
              const invalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={field.name}>{t("email")}</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    autoComplete="email"
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={invalid}
                  />
                  {invalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
          <form.Field name="password">
            {(field) => {
              const invalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={field.name}>{t("password")}</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    autoComplete="current-password"
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={invalid}
                  />
                  {invalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
        {error && (
          <Alert className="border-destructive text-destructive" role="alert">
            {error}
          </Alert>
        )}
        <form.Subscribe
          selector={(state) => [state.isSubmitting, state.canSubmit] as const}
        >
          {([isSubmitting, canSubmit]) => (
            <Button type="submit" disabled={isSubmitting || !canSubmit}>
              {isSubmitting ? t("signingIn") : t("signIn")}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </main>
  );
}
