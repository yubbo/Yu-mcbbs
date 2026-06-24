"use client"

// BBS 论坛首页客户端交互组件
// 负责轮播图切换、分类/标签点击等纯客户端行为

import { useEffect } from "react"

export default function BbsClient() {
  useEffect(() => {
    // ── 轮播图自动切换 ──
    const slides = document.querySelectorAll<HTMLElement>(".carousel-slide")
    const dots = document.querySelectorAll<HTMLElement>(".carousel-dot")
    const prevBtn = document.querySelector(".carousel-arrow.prev")
    const nextBtn = document.querySelector(".carousel-arrow.next")

    if (slides.length < 2) return

    let current = 0
    let timer: ReturnType<typeof setInterval>

    function show(idx: number) {
      slides.forEach((s) => s.classList.remove("active"))
      dots.forEach((d) => d.classList.remove("active"))
      if (slides[idx]) slides[idx].classList.add("active")
      if (dots[idx]) dots[idx].classList.add("active")
      current = idx
    }

    prevBtn?.addEventListener("click", () => {
      show((current - 1 + slides.length) % slides.length)
    })
    nextBtn?.addEventListener("click", () => {
      show((current + 1) % slides.length)
    })
    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => show(i))
    })

    timer = setInterval(() => {
      show((current + 1) % slides.length)
    }, 5000)

    // ── 分类切换 ──
    document.querySelectorAll(".cat-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".cat-btn").forEach((b) => b.classList.remove("active"))
        btn.classList.add("active")
      })
    })

    // ── 标签切换 ──
    document.querySelectorAll(".section-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".section-tab").forEach((t) => t.classList.remove("active"))
        tab.classList.add("active")
      })
    })

    // ── 排行标签切换 ──
    document.querySelectorAll(".rank-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".rank-tab-btn").forEach((b) => b.classList.remove("active"))
        btn.classList.add("active")
      })
    })

    return () => clearInterval(timer)
  }, [])

  return null
}
