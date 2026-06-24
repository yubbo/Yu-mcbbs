// lib/auth.ts — 认证模块

import { apiPost } from "./api";

const TOKEN_KEY = "token";

// ── Token 管理（localStorage + cookie 双写）──

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY) || getCookie(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
  if (typeof document !== "undefined") {
    document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)};path=/;max-age=604800;SameSite=Lax`
  }
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
  if (typeof document !== "undefined") {
    document.cookie = `${TOKEN_KEY}=;path=/;max-age=0`
  }
}

// ── 用户信息解析 ──

interface TokenPayload {
  user_id: number;
  username: string;
  role: string;
}

export function parseToken(token: string): TokenPayload | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function getUserRole(token: string): string {
  const payload = parseToken(token);
  return payload?.role || "";
}

// ── 登录 / 注册 ──

interface LoginData {
  token: string;
  user_id: number;
  username: string;
  role: string;
}

export async function login(
  username: string,
  password: string
): Promise<LoginData> {
  const data = await apiPost<LoginData>("/api/v1/auth/login", {
    username,
    password,
  });
  setToken(data.token);
  return data;
}

export async function register(
  username: string,
  email: string,
  password: string,
  nickname: string
) {
  return apiPost("/api/v1/auth/register", {
    username,
    email,
    password,
    nickname,
  });
}

export function logout() {
  removeToken();
  window.location.href = "/login";
}
