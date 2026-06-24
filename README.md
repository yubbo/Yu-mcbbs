# Yu-mcbbs — BBS CMS 论坛内容管理系统

**零配置，粘贴即用。** 后端闭源 · 前端开源。

---

## 部署

### 1Panel 面板（推荐）

1. 1Panel → 「容器」→ 「编排」→ 「创建编排」
2. 名称填 `bbs-cms`，粘贴以下内容：

```yaml
version: "3.8"

services:
  mysql:
    image: mysql:8.0
    container_name: bbs-cms-db
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: yu-mcbbs-2024
      MYSQL_DATABASE: bbs_cms
    command: >
      --innodb-buffer-pool-size=32M
      --innodb-log-buffer-size=4M
      --performance-schema=0
      --skip-log-bin
      --max-connections=30
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_unicode_ci
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 10

  backend:
    image: ghcr.io/yubbo/yu-mcbbs-backend:latest
    container_name: bbs-cms-backend
    restart: unless-stopped
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      THEMES_DIR: /shared/themes
      PLUGINS_DIR: /shared/plugins
    ports:
      - "8080:8080"
    volumes:
      - app_data:/shared

  frontend:
    image: ghcr.io/yubbo/yu-mcbbs-frontend:latest
    container_name: bbs-cms-frontend
    restart: unless-stopped
    depends_on:
      - backend
    environment:
      API_BACKEND_URL: http://backend:8080
    ports:
      - "3000:3000"
    volumes:
      - app_data:/app/themes

volumes:
  mysql_data:
  app_data:
```

3. 点击「确定」→ 「启动」
4. 访问 `http://你的IP:3000` → 进入安装引导 → 按提示填完 → 完成！

> 不需要 clone、不需要改配置、不需要设置环境变量。粘贴即用。

### 命令行 Docker

```bash
git clone https://github.com/yubbo/Yu-mcbbs.git
cd Yu-mcbbs
docker compose up -d
```

---

## 安装引导

首次访问 `http://你的IP:3000` 会进入安装引导页，依次填写：

1. **数据库设置** — 默认已配好（容器内 MySQL），直接下一步
2. **管理员账号** — 设置邮箱和密码
3. **站点信息** — 站点名称、描述

安装完成后即可使用。第一个注册用户自动成为超级管理员。

| 地址 | 说明 |
|------|------|
| `http://你的IP:3000` | 站点首页 |
| `http://你的IP:3000/admin` | 管理后台 |
| `http://你的IP:3000/user` | 个人中心 |

---

## 更新升级

```bash
cd Yu-mcbbs
git pull && docker compose pull && docker compose up -d
```

---

## 镜像说明

GitHub Actions 自动构建并推送镜像到 GitHub Container Registry：

| 镜像 | 地址 |
|------|------|
| 后端 | `ghcr.io/yubbo/yu-mcbbs-backend:latest` |
| 前端 | `ghcr.io/yubbo/yu-mcbbs-frontend:latest` |

---

## 内存占用

512MB VPS 可流畅运行：
- MySQL：约 120MB
- 后端 Go：约 20MB
- 前端 Node.js：约 100MB
- **总计约 240MB**

## 项目结构

```
Yu-mcbbs/
├── docker-compose.yml     # Docker 编排（零配置，粘贴即用）
├── frontend/              # 前端（开源）
│   ├── Dockerfile
│   ├── src/
│   ├── themes/
│   └── public/
└── server/                # 后端（闭源）
    ├── Dockerfile
    ├── echov5             # 预编译 Go 二进制
    └── config/
```

## 常见问题

**Q: 如何彻底清除重新安装？**
```bash
docker compose down -v
# 重新 git clone 从头开始
```

**Q: 安装时提示数据库连接失败？**
A: 等待 MySQL 容器启动完成（约 10 秒），刷新页面重试。

**Q: 忘记管理员密码？**
A: 连接 MySQL 执行：
```sql
UPDATE yu_users SET password_hash = '' WHERE email = '你的邮箱';
```
然后通过「忘记密码」功能重置。
