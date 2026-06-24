// app/(adminpanel)/users/roles/page.tsx — 用户权限管理

import { UserRoles } from "@/modules/adminpanel/users/roles/UserRoles";

export default function UserRolesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">用户权限</h1>
      </div>
      <UserRoles />
    </div>
  );
}
