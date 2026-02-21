import Modal from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "danger" | "default";
}

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm", variant = "default" }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-muted-foreground mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
          Cancel
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            variant === "danger"
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
