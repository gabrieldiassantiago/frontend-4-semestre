export const API_BASE_URL = "https://projeto-para-processos-seletivos-mais.onrender.com"

/** Endpoint STOMP do Spring (`registry.addEndpoint("/ws")`). */
export const WS_URL = API_BASE_URL.replace(/^http/, "ws") + "/ws"
