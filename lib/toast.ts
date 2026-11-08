export interface ToastNotice {
  id: number
  tone: "success" | "error"
  message: string
}

const empty: ToastNotice[] = []
let current: ToastNotice[] = empty
let sequence = 0
const listeners = new Set<() => void>()

export function subscribeToasts(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export const getToasts = () => current
export const getServerToasts = () => empty

export function dismissToast(id: number) {
  current = current.filter((item) => item.id !== id)
  listeners.forEach((listener) => listener())
}

function showToast(message: string, tone: ToastNotice["tone"]) {
  if (typeof window === "undefined") return
  current = [...current.filter((item) => item.message !== message), { id: ++sequence, message, tone }].slice(-3)
  listeners.forEach((listener) => listener())
}

export function toastSuccess(message: string) {
  showToast(message, "success")
}

export function toastError(message: string) {
  showToast(message, "error")
}
