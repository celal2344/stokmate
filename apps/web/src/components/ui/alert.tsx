import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Alert({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative w-full rounded-md border border-border bg-card p-4 text-sm leading-6",
        className,
      )}
      {...props}
    />
  );
}
