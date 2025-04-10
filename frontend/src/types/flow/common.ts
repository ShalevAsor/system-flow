// ==============================
// Common types for simulation
// ==============================
export type Protocol = "HTTP" | "HTTPS" | "WebSocket" | "gRPC" | "TCP" | "UDP";
export type AuthenticationMethod =
  | "None"
  | "Basic"
  | "OAuth"
  | "JWT"
  | "API Key"
  | "Client Certificate";
