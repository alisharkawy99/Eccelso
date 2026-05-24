import {
  Button,
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from "@headlessui/react";

export default function MyModal({
  isOpen,
  onClose,
  content,
}: {
  isOpen: boolean;
  content?: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* The backdrop with fade transition */}
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition duration-300 ease-out data-[closed]:opacity-0"
      />

      {/* The container for the modal */}
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-lg bg-luxury-dark border border-luxury-border p-6 rounded-lg 
                     transition duration-300 ease-out 
                     data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          <DialogTitle className="text-gold text-xl font-playfair">
            Edit Car
          </DialogTitle>

          <div className="mt-4 text-cream">{content}</div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
