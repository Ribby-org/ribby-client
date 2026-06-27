export const API_BASE =
  import.meta.env.VITE_SCANNER_API_URL ?? '';

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

// Attach the shared secret on every server request so the backend
// can reject calls that don't come from this client.
export function apiHeaders(): Record<string, string> {
  const secret = import.meta.env.VITE_RIBBY_API_SECRET as string | undefined;
  return secret ? { 'x-ribby-secret': secret } : {};
}
