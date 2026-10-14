export const API_BASE_URL = process.env.API_BASE_URL

/** Endpoint STOMP do Spring (`registry.addEndpoint("/ws")`). */
export const WS_URL = API_BASE_URL?.replace(/^http/, "ws") + "/ws"
