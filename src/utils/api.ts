/**
 * Base URL for the scanner API.
 * - Development: Vite middleware at /api (same origin)
 * - Production: Railway backend URL from env variable
 */
export const API_BASE =
  import.meta.env.VITE_SCANNER_API_URL ?? '';

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
