import { AuthResponse, LoginRequest, SignupRequest, AuthUser } from '@creator/types';

const API_BASE = (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'http://localhost:5000/api';

// Local storage logic removed in favor of HttpOnly cookies

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Handle 401 — auto-logout
  if (res.status === 401) {
    // Dynamically import the store to avoid circular dependencies
    const { useStore } = await import('../store/useStore');
    useStore.getState().logout();
    throw new Error('Session expired. Please log in again.');
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

// ==========================================
// AUTH API
// ==========================================

async function checkEmail(email: string): Promise<{ exists: boolean }> {
  return request<{ exists: boolean }>('/auth/check-email', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

async function login(body: LoginRequest): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

async function signup(body: SignupRequest): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

async function googleLogin(credential: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
}

async function logout(): Promise<void> {
  try {
    await request<{ message: string }>('/auth/logout', { method: 'POST' });
  } catch {
    // Ignore errors — logout is best-effort on backend
  }
}

async function getMe(): Promise<{ user: AuthUser }> {
  return request<{ user: AuthUser }>('/auth/me');
}

// ==========================================
// GENERIC API METHODS
// ==========================================

async function get<T>(path: string): Promise<T> {
  return request<T>(path);
}

async function post<T>(path: string, body: any): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export const authClient = {
  checkEmail,
  login,
  signup,
  googleLogin,
  logout,
  getMe,
  get,
  post,
};
