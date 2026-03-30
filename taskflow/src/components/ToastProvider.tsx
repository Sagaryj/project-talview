import {
  useCallback,
  useMemo,
  useState,
  type ReactNode
} from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, CheckCircle2, X } from "lucide-react"
import { ToastContext, type ToastVariant } from "./toast-context"

interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = crypto.randomUUID()

      setToasts((prev) => [...prev, { id, message, variant }])

      window.setTimeout(() => {
        dismissToast(id)
      }, 3200)
    },
    [dismissToast]
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-5 top-5 z-[100] flex w-full max-w-sm flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onDismiss={() => dismissToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast
  onDismiss: () => void
}) {
  const variantStyles: Record<ToastVariant, string> = {
    success:
      "border-emerald-200 bg-white text-neutral-900 dark:border-emerald-900/60 dark:bg-neutral-900 dark:text-white",
    warning:
      "border-amber-200 bg-white text-neutral-900 dark:border-amber-900/60 dark:bg-neutral-900 dark:text-white"
  }

  const accentStyles: Record<ToastVariant, string> = {
    success: "bg-emerald-500",
    warning: "bg-amber-500"
  }

  const icon =
    toast.variant === "success" ? (
      <CheckCircle2 size={18} className="text-emerald-500" />
    ) : (
      <AlertTriangle size={18} className="text-amber-500" />
    )

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.18 }}
      className={`pointer-events-auto overflow-hidden rounded-2xl border shadow-2xl ${variantStyles[toast.variant]}`}
    >
      <div className={`h-1 w-full ${accentStyles[toast.variant]}`} />
      <div className="flex items-start gap-3 p-4">
        <div className="mt-0.5">{icon}</div>
        <p className="flex-1 text-sm font-medium">{toast.message}</p>
        <button
          onClick={onDismiss}
          className="rounded-lg p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  )
}
