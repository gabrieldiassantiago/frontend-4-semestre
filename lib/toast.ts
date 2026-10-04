export interface SuccessToast {
  id: number
  message: string
}

const empty: SuccessToast[] = []
let current: SuccessToast[] = empty
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

/** Chame somente depois de a ação ter sido confirmada. */
export function toastSuccess(message: string) {
  if (typeof window === "undefined") return
  current = [...current.filter((item) => item.message !== message), { id: ++sequence, message }].slice(-3)
  listeners.forEach((listener) => listener())
}
