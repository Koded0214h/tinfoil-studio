import axios from "axios";

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

export const api = axios.create({
  baseURL: API_BASE_URL,
  // The /api/jobs/{id}/post endpoint can take a couple of seconds round-tripping
  // to Upload-Post; everything else is fast. Generous timeout.
  timeout: 20000,
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    const detail =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.message ||
      "Network error";
    error.detail = typeof detail === "string" ? detail : JSON.stringify(detail);
    return Promise.reject(error);
  },
);

export function resolveAssetUrl(maybeRelative) {
  if (!maybeRelative) return null;
  if (/^https?:\/\//i.test(maybeRelative)) return maybeRelative;
  return `${API_BASE_URL}${maybeRelative.startsWith("/") ? "" : "/"}${maybeRelative}`;
}
