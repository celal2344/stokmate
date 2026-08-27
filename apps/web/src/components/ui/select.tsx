import type { SelectHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-[inset_0_1px_0_color-mix(in_oklch,var(--foreground)_3%,transparent)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}
