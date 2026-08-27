import type { HTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";

export function Pagination({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  const { t } = useTranslation();
  return (
    <nav
      aria-label={t("pagination")}
      className={cn("flex items-center justify-center", className)}
      {...props}
    />
  );
}
