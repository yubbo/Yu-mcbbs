// lib/utils.ts — 通用工具函数
// 对应 Go 后端文件: 无（前端独有）
//
// cn() — 合并 Tailwind 类名（shadcn/ui 必需）

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
