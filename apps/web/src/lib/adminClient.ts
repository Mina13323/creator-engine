/**
 * adminClient — thin wrapper around authClient for /api/admin/* endpoints.
 * Automatically prefixes all paths with /admin so callers just pass e.g. '/lockdown'.
 */
import { authClient } from './authClient';

export const adminClient = {
  get: <T = any>(path: string) => authClient.get<T>(`/portal${path}`),
  post: <T = any>(path: string, body: any) => authClient.post<T>(`/portal${path}`, body),
  put: <T = any>(path: string, body: any) => authClient.put<T>(`/portal${path}`, body),
  delete: <T = any>(path: string) => authClient.delete<T>(`/portal${path}`),
};
