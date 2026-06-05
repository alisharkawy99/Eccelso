"use client";

import { Dialog, DialogPanel, DialogBackdrop } from "@headlessui/react";
import { X } from "lucide-react";

type ModalVariant = "default" | "auth" | "confirm";
type ModalSize = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

const variantClasses: Record<ModalVariant, string> = {
  default: "p-6",
  auth: "p-0 overflow-hidden",
  confirm: "p-6",
};

export default function Modal({
  isOpen,
  onClose,
  content,
  isEdit,
  title,
  subtitle,
  variant = "default",
  size,
}: {
  isOpen: boolean;
  isEdit?: boolean;
  content?: React.ReactNode;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  variant?: ModalVariant;
  size?: ModalSize;
}) {
  const resolvedTitle = title ?? (isEdit ? "Edit Vehicle" : undefined);
  const resolvedSize = size ?? (variant === "auth" ? "xl" : isEdit || title ? "lg" : "md");

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition duration-300 ease-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          transition
          className={`modal-panel relative w-full ${sizeClasses[resolvedSize]} ${variantClasses[variant]}
            transition duration-300 ease-out
            data-[closed]:scale-95 data-[closed]:opacity-0 overflow-hidden
          `}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            className="absolute end-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-luxury-border/60 bg-luxury-gray/60 text-cream/60 transition-all hover:border-gold/40 hover:bg-gold/10 hover:text-gold"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {resolvedTitle && variant !== "auth" && (
            <div className="mb-5 pe-10">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold/70">
                Fleet Management
              </p>
              <h2 className="mt-1 font-playfair text-xl font-semibold text-cream">
                {resolvedTitle}
              </h2>
              {subtitle && (
                <p className="mt-1 text-sm text-cream/45">{subtitle}</p>
              )}
              <div className="mt-3 h-px w-12 bg-gradient-to-r from-gold/80 to-transparent" />
            </div>
          )}

          <div className={variant === "auth" ? "" : "text-cream"}>
            {content}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
