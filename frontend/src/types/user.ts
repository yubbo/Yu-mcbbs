// types/user.ts — 用户相关类型定义
// 对应 Go 后端文件: internal/model/user.go
//
// 与 Go 后端 User 结构体、请求/响应 DTO 一一对应。

// ── 用户实体 ──
export interface User {
  id: number;
  username: string;
  email: string;
  nickname: string;
  avatar: string;
  role: "user" | "super_moderator" | "admin" | "super_admin";
  status: number; // 1=正常 0=禁用
  created_at: string;
  updated_at: string;
}

// ── 请求 DTO ──
export interface LoginRequest {
  username: string;
  password: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  nickname?: string;
}

export interface UpdateUserRequest {
  email?: string;
  nickname?: string;
  avatar?: string;
  role?: string;
  status?: number;
}

// ── 响应 DTO ──
export interface LoginResponse {
  token: string;
  user_id: number;
  username: string;
  role: string;
}

export interface UserListQuery {
  page?: number;
  page_size?: number;
  keyword?: string;
  role?: string;
  status?: number;
}

export interface PaginatedList<T> {
  list: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
