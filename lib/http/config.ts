// Ponto único de configuração da API. Defina NEXT_PUBLIC_API_URL no .env.local
// (ver .env.example). Esta variável é lida tanto no cliente quanto no servidor.
const DEFAULT_API_URL = "http://localhost:8080"

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/$/, "")

export const WS_URL = API_BASE_URL.replace(/^http/, "ws") + "/ws"
