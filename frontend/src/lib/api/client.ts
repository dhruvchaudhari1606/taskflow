import axios from "axios";
import { setupInterceptors } from "./interceptors";

// ─── Axios Client ─────────────────────────────────────────────────────────────
// Central API client used by all feature services.
// Auto-refresh and request-queue interceptors are configured immediately.

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const API_URL = RAW_API_URL.endsWith("/v1")
  ? RAW_API_URL
  : `${RAW_API_URL.replace(/\/+$/, "")}/v1`;

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Required for HTTP-only cookie auth
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000, // 15 second timeout
});

// Attach silent auto-refresh and queuing interceptors
setupInterceptors(apiClient);

export default apiClient;
