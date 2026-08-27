import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

export function DropdownMenu({ children }: { children: ReactNode }) {
  return <details className="relative">{children}</details>;
}
export function DropdownMenuTrigger({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <summary
      className={cn(
        "inline-flex h-10 cursor-pointer list-none items-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent",
        className,
      )}
      {...props}
    />
  );
}
export function DropdownMenuContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-popover absolute right-0 z-10 mt-2 grid min-w-44 gap-1 rounded-md border p-1 shadow-md",
        className,
      )}
      {...props}
    />
  );
}
export function DropdownMenuItem({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "rounded-sm px-3 py-2 text-left text-sm hover:bg-accent",
        className,
      )}
      type="button"
      {...props}
    />
  );
}
