import { AuthResponse, LoginRequest, SignupRequest, AuthUser } from '@creator/types';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL;
const cleanApiUrl = rawApiUrl ? rawApiUrl.replace(/^['"]|['"]$/g, '') : undefined;

export const API_BASE = cleanApiUrl ? `${cleanApiUrl}/api` : '/api';


// Local storage logic removed in favor of HttpOnly cookies

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Credentials 'include' handles HttpOnly cookie transmission automatically

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Handle 401 — auto-logout
  if (res.status === 401) {
    // Automatically triggered logout on unauthorized status
    // Dynamically import the store to avoid circular dependencies
    const { useStore } = await import('../store/useStore');
    useStore.getState().logout();
    throw new Error('Session expired. Please log in again.');
  }

  if (res.status === 402) {
    const data = await res.json();
    const { useStore } = await import('../store/useStore');
    useStore.getState().setShowPricingModal(true);
    throw new Error(data.message || 'Insufficient AI credits.');
  }
  if (res.status === 403) {
    const data = await res.json();
    if (data.error === 'SUBSCRIPTION_REQUIRED') {
      const { useStore } = await import('../store/useStore');
      useStore.getState().setShowPricingModal(true);
      throw new Error(`Subscription required: ${data.requiredPlan}`);
    }
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('text/html')) {
    const text = await res.text();
    console.error(`Received HTML instead of JSON for ${path}. HTML preview:`, text.substring(0, 100));
    throw new Error(`API returned HTML instead of JSON. The route ${path} might not exist or the proxy is misconfigured.`);
  }

  const data = await res.json();

  if (!res.ok) {
    const errorMsg = typeof data.error === 'object' && data.error !== null 
      ? data.error.message || JSON.stringify(data.error)
      : data.error;
    throw new Error(errorMsg || `Request failed with status ${res.status}`);
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
  const data = await request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return data;
}

async function signup(body: SignupRequest): Promise<AuthResponse> {
  const data = await request<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return data;
}

async function googleLogin(credential: string): Promise<AuthResponse> {
  const data = await request<AuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
  return data;
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

async function put<T>(path: string, body: any): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

async function patch<T>(path: string, body: any): Promise<T> {
  return request<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

async function del<T>(path: string): Promise<T> {
  return request<T>(path, {
    method: 'DELETE',
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
  put,
  patch,
  delete: del,
};
