// app/(bbs)/forum/category/[cid]/page.tsx — 父版块分区内页

import { CategoryClient } from "./CategoryClient"

export default function CategoryPage() {
  return (
    <div className="forum-home">
      <CategoryClient />
    </div>
  )
}
