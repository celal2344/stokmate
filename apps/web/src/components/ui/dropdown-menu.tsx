import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils";

type DropdownMenuContextValue = {
  close(): void;
  open: boolean;
  toggle(): void;
};

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(
  null,
);

function useDropdownMenu() {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error(
      "DropdownMenu components must be used inside DropdownMenu.",
    );
  }
  return context;
}

export function DropdownMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <DropdownMenuContext.Provider
      value={{ close, open, toggle: () => setOpen((current) => !current) }}
    >
      <div ref={rootRef} className="relative">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}
export function DropdownMenuTrigger({
  className,
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, toggle } = useDropdownMenu();
  return (
    <button
      aria-expanded={open}
      aria-haspopup="menu"
      className={cn(
        "inline-flex h-10 items-center rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
      type="button"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggle();
      }}
      {...props}
    />
  );
}
export function DropdownMenuContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const { open } = useDropdownMenu();
  if (!open) return null;
  return (
    <div
      className={cn(
        "absolute right-0 z-10 mt-2 grid min-w-52 gap-1 rounded-md border border-border bg-card p-1 shadow-md",
        className,
      )}
      role="menu"
      {...props}
    />
  );
}
export function DropdownMenuItem({
  className,
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { close } = useDropdownMenu();
  return (
    <button
      className={cn(
        "rounded-sm px-3 py-2 text-left text-sm transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
        className,
      )}
      role="menuitem"
      type="button"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) close();
      }}
      {...props}
    />
  );
}
