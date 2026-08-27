import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Alert({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("relative w-full rounded-lg border border-border bg-card p-4 text-sm", className)} {...props} />; }
