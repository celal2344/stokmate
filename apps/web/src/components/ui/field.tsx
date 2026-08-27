import type { HTMLAttributes, LabelHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Field({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-2", className)} {...props} />;
}
export function FieldGroup({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-4", className)} {...props} />;
}
export function FieldLabel({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium", className)} {...props} />;
}
export function FieldError({ errors }: { errors: unknown[] }) {
  const messages = errors
    .map((error) => (typeof error === "string" ? error : "Geçersiz değer"))
    .filter(Boolean);
  return messages.length ? (
    <p className="text-sm text-destructive" role="alert">
      {messages.join(", ")}
    </p>
  ) : null;
}
