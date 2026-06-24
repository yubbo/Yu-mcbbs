"use client"

// modules/userpanel/settings/PointsView.tsx — 积分展示

const RULES = [
  { action: "每日登录", points: "+2" },
  { action: "发布文章", points: "+10" },
  { action: "发布帖子", points: "+5" },
  { action: "发表评论", points: "+2" },
  { action: "文章被推荐", points: "+20" },
  { action: "帖子被加精", points: "+15" },
]

export function PointsView() {
  return (
    <div className="space-y-5">
      {/* 当前积分 */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100">
        <div className="size-12 rounded-full bg-amber-100 flex items-center justify-center">
          <svg className="size-6 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <div>
          <p className="text-xs text-zinc-500">当前积分</p>
          <p className="text-2xl font-bold text-amber-600">0</p>
        </div>
      </div>

      {/* 积分规则 */}
      <div>
        <h4 className="text-sm font-semibold text-zinc-800 mb-3">积分规则</h4>
        <div className="space-y-2">
          {RULES.map((rule) => (
            <div key={rule.action} className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-50">
              <span className="text-sm text-zinc-700">{rule.action}</span>
              <span className="text-xs font-medium text-emerald-600">{rule.points}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-zinc-400">
        积分系统正在开发中，以上规则可能调整
      </p>
    </div>
  )
}
