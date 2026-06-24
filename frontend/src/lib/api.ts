// lib/api.ts — 统一 API 请求封装
// 对应 Go 后端文件: pkg/response/response.go + pkg/response/errors.go
//
// 所有前端 API 调用必须通过此模块，统一处理：
//   1. 自动携带 JWT Token
//   2. 统一错误格式解析
//   3. 响应类型安全
//   4. 后端不可达 / 网络错误 → 友好中文提示

const API_BASE = ""; // Next.js rewrites 自动代理到 Go 后端，前端无需写完整 URL

interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/** 判断错误是否为网络/连接类问题 */
function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError && err.message === "Failed to fetch") return true;
  if (err instanceof Error && err.message.includes("NetworkError")) return true;
  return false;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  // 自动附加 JWT Token
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers,
    });
  } catch (err) {
    // 网络错误：fetch 本身抛出（连接被拒绝、DNS 解析失败等）
    if (isNetworkError(err)) {
      throw new Error("无法连接到后端服务，请确认后端已启动（http://localhost:8080）");
    }
    throw new Error("网络请求失败，请检查网络连接");
  }

  // HTTP 状态码不在 2xx 范围内
  if (!res.ok) {
    // 尝试解析后端统一错误响应
    try {
      const errorBody: ApiResponse = await res.json();
      if (errorBody.message) {
        throw new Error(errorBody.message);
      }
    } catch (parseErr) {
      // JSON 解析失败 → 可能是 Next.js 代理返回的 HTML 错误页
      if (parseErr instanceof SyntaxError) {
        if (res.status >= 500) {
          throw new Error("后端服务异常，请稍后重试");
        }
        throw new Error("服务器返回了无法识别的响应");
      }
      // 已经是业务错误，继续抛出
      throw parseErr;
    }
    throw new Error(`请求失败 (${res.status})`);
  }

  // 解析 JSON 响应体
  let body: ApiResponse<T>;
  try {
    body = await res.json();
  } catch {
    throw new Error("后端返回了无效的数据格式，请稍后重试");
  }

  // 业务错误：非 0 的 code 都是错误
  if (body.code !== 0) {
    throw new Error(body.message || "请求失败");
  }

  return body.data;
}

export function apiGet<T>(url: string): Promise<T> {
  return request<T>(url);
}

export function apiPost<T>(url: string, data?: any): Promise<T> {
  return request<T>(url, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function apiPut<T>(url: string, data?: any): Promise<T> {
  return request<T>(url, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function apiDelete<T>(url: string): Promise<T> {
  return request<T>(url, { method: "DELETE" });
}
