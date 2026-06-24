/**
 * popup_effect.js — 弹窗系统统一 JS 控制器
 *
 * 配套 6 种 CSS 动画效果（popup_effect_1~6.css），无需为每种效果单独加载 JS。
 * 引入此文件后，任意效果的弹窗均可使用同一套 API。
 *
 * 全局方法：
 *   showModal(id) — 打开弹窗（添加 .show class，触发 CSS 入场动画）
 *   hideModal(id) — 关闭弹窗（移除 .show class，触发 CSS 出场动画）
 *
 * 自动行为：
 *   点击带有 data-modal-overlay 属性的遮罩层 → 自动关闭弹窗
 *
 * 使用步骤：
 *   1. 引入 CSS：<link href="{SITE_URL}/api/component-asset/popup_effect/popup_effect_2.css">
 *   2. 引入 JS ：<script src="{SITE_URL}/api/component-asset/popup_effect/popup_effect.js"></script>
 *   3. HTML 结构参考 docs/弹窗效果系统使用文档.md
 */

;(function () {
  // ==============================
  // 全局 API
  // ==============================

  /** 打开弹窗 → 添加 .show class → CSS transition 自动播放入场动画 */
  window.showModal = function (id) {
    var el = document.getElementById(id)
    if (!el) return
    el.classList.add('show')
  }

  /** 关闭弹窗 → 移除 .show class → CSS transition 自动反向播放出场动画 */
  window.hideModal = function (id) {
    var el = document.getElementById(id)
    if (!el) return
    el.classList.remove('show')
  }

  // ==============================
  // 全局事件委托
  // ==============================

  /**
   * 点击遮罩关闭弹窗
   *
   * 通过 data-modal-overlay 属性识别遮罩元素（与 CSS 类名无关），
   * 兼容所有效果编号（modal-overlay-1 ~ modal-overlay-6）。
   */
  document.addEventListener('click', function (e) {
    var overlay = e.target.closest('[data-modal-overlay]')
    if (overlay && overlay.classList.contains('show')) {
      hideModal(overlay.id)
    }
  })
})()
