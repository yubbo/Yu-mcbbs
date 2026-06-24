// app/(bbs)/forum/[fid]/page.tsx — 版块帖子列表页

import { ThreadListClient } from "./ThreadListClient"

export default function ForumThreadListPage() {
  return (
    <div className="forum-home">
      <ThreadListClient />
    </div>
  )
}
