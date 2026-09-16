export function setAuthCookie(token: string, expiresIn?: number) {
  if (typeof document === "undefined") return
  const maxAge = expiresIn || 86400
  document.cookie = `token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export function getAuthToken(): string | null {
  if (typeof document === "undefined") return null
  const nameEQ = "token="
  const ca = document.cookie.split(";")
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim()
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length)
  }
  return null
}
