export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "")

export const WS_URL = API_BASE_URL.replace(/^http/, "ws") + "/ws"
