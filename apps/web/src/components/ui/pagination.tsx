import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Pagination({ className, ...props }: HTMLAttributes<HTMLElement>) { return <nav aria-label="Pagination" className={cn("flex items-center justify-center", className)} {...props} />; }
