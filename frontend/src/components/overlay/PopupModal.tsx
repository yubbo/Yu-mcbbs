"use client"

// components/PopupModal.tsx — 基于 popup_effect CSS 的通用弹窗组件
// 使用 showModal/hideModal API，6 种入场动画可选

import { useEffect, useId, useRef } from "react"

export interface PopupModalProps {
  open: boolean
  onClose: () => void
  /** 弹窗动画效果编号 1~6，默认 2（淡入缩放） */
  effect?: number
  title?: string
  children: React.ReactNode
  /** 底部操作按钮 */
  footer?: React.ReactNode
  /** 最大宽度，默认 400px */
  maxWidth?: string
}

export function PopupModal({
  open,
  onClose,
  effect = 2,
  title,
  children,
  footer,
  maxWidth = "400px",
}: PopupModalProps) {
  const id = useId().replace(/:/g, "")
  const overlayRef = useRef<HTMLDivElement>(null)
  const initRef = useRef(false)

  useEffect(() => {
    initRef.current = true
  }, [])

  useEffect(() => {
    if (!initRef.current) return
    const el = overlayRef.current
    if (!el) return
    if (open) {
      el.classList.add("show")
    } else {
      el.classList.remove("show")
    }
  }, [open])

  if (!initRef.current) return null

  return (
    <div
      ref={overlayRef}
      id={id}
      data-modal-overlay=""
      className={`modal-overlay-${effect} fixed inset-0 z-[9999] items-center justify-center bg-black/40 p-4`}
    >
      <div
        className={`modal-content-${effect} bg-white rounded-2xl shadow-2xl w-full overflow-hidden`}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
            <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
            <button
              onClick={onClose}
              className="flex items-center justify-center size-7 rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors cursor-pointer bg-transparent border-none"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        )}

        {/* 内容 */}
        <div className="px-5 py-4">{children}</div>

        {/* 底部 */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-zinc-100 bg-zinc-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
