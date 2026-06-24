// app/(adminpanel)/users/page.tsx — 用户管理列表
// 对应 Go 后端文件: internal/handler/user.go (ListUsers)
// 业务逻辑在: src/modules/adminpanel/UserTable.tsx

import { UserTable } from "@/modules/adminpanel/users/list/UserTable";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">用户管理</h1>
      </div>
      <UserTable />
    </div>
  );
}
