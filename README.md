# Yu-mcbbs — BBS CMS 论坛内容管理系统

## 技术栈

| 层 | 技术 | 说明 |
|---|------|------|
| 后端 | Go (闭源预编译) | REST API，端口 8080 |
| 前端 | Next.js 16 + React 19 + Tailwind v4 | 开源，端口 3000 |
| 数据库 | MySQL 8.0 | — |

## 快速部署（Docker 一键启动）

> **一行命令跑起来。** 无需安装 Go、Node.js，无需编译，无需写配置文件。

### 前提条件

- 服务器已安装 [Docker](https://docs.docker.com/engine/install/) 和 Docker Compose
- 最低配置：512MB 内存，1 核 CPU

### 第一步：克隆仓库

```bash
git clone https://github.com/yubbo/Yu-mcbbs.git
cd Yu-mcbbs
```

### 第二步：启动（一行命令搞定）

```bash
DB_ROOT_PASSWORD=你的数据库密码 JWT_SECRET=你的随机密钥 docker compose up -d
```

把 `你的数据库密码` 和 `你的随机密钥` 换成自己的值即可，其他不用管。

> 上面这行 `docker compose up -d` 会自动拉取前后端镜像、初始化数据库、启动所有服务，整个过程约 30 秒。

**三种传参方式，任选一种：**

```bash
# 方式一：命令行直接传（推荐，最简单）
DB_ROOT_PASSWORD=mypass JWT_SECRET=xxx docker compose up -d

# 方式二：先 export 再启动
export DB_ROOT_PASSWORD=mypass
export JWT_SECRET=xxx
docker compose up -d

# 方式三：传统 .env.docker 文件
cp .env.docker.example .env.docker   # 编辑改密码
docker compose up -d
```

### 第三步：访问安装向导

打开浏览器访问 `http://你的服务器IP:3000`，看到 **安装引导页面**，按提示填写站点信息即可。

### 各服务地址

| 地址 | 说明 |
|------|------|
| `http://你的IP:3000` | 站点首页 |
| `http://你的IP:3000/register` | 注册页面 |
| `http://你的IP:3000/admin` | 管理后台（需管理员登录） |
| `http://你的IP:3000/user` | 个人中心 |

---

## 服务器部署（生产环境）

### 方式一：纯 Docker（推荐小内存 VPS）

本项目的 `docker-compose.yml` 已优化内存占用：
- MySQL：约 120MB 实际占用（限 192MB）
- 后端：约 20MB 实际占用（限 128MB）
- 前端：约 100MB 实际占用（限 256MB）
- **总计约 240-280MB**，512MB VPS 可以跑

### 方式二：配合 Nginx 反代

如果你需要在同一台服务器上跑多个网站，建议用 Nginx 反代：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 后端 API 反代
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 前端
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

然后编辑 `.env.docker`，添加：

```ini
CORS_ALLOW_ORIGINS=https://your-domain.com
```

---

## 1Panel 面板部署

如果你的服务器已经安装了 [1Panel](https://1panel.cn/)，部署更简单：

### 步骤

1. **登录 1Panel** → 左侧菜单「容器」→「编排」→ 「创建编排」

2. **填写基本信息**：
   - 名称：`bbs-cms`
   - 描述：`论坛CMS系统`

3. **粘贴编排内容**：复制项目根目录的 `docker-compose.yml` 全部内容

4. **编辑环境变量**：在编排编辑器中，找到 `environment:` 段落，修改：
   - `MYSQL_ROOT_PASSWORD`
   - `MYSQL_PASSWORD`  
   - `JWT_SECRET`

5. **点击「确定」** → 再点「启动」

6. 1Panel 会自动拉取代码、构建镜像、启动容器

### 设置反向代理

1Panel → 「网站」→ 「创建网站」→ 「反向代理」
- 域名：填写你的域名
- 代理地址：`http://127.0.0.1:3000`

---

## 常用命令

```bash
# 查看运行状态
docker compose ps

# 查看日志
docker compose logs -f backend
docker compose logs -f frontend

# 重启服务
docker compose restart

# 停止服务
docker compose down

# 停止并删除数据（慎用！）
docker compose down -v

# 升级后重新构建
docker compose build --no-cache
docker compose up -d
```

---

## 更新升级

有新版本时，拉取最新镜像即可：

```bash
cd Yu-mcbbs
git pull                     # 拉取最新 docker-compose.yml
docker compose pull          # 拉取最新镜像
docker compose up -d         # 重启服务
```

数据库会自动执行迁移，不影响已有数据。

## 镜像说明

本项目使用 GitHub Actions 自动构建 Docker 镜像，推送到 GitHub Container Registry (ghcr.io)：

| 镜像 | 地址 |
|------|------|
| 后端 | `ghcr.io/yubbo/yu-mcbbs-backend:latest` |
| 前端 | `ghcr.io/yubbo/yu-mcbbs-frontend:latest` |

镜像在每次 push 到 main 分支时自动构建并设为公开，用户可直接拉取。

---

## 内存优化说明

本项目的 Docker 配置针对低配 VPS 做了以下优化：

- MySQL：`innodb-buffer-pool-size=32M`，关闭 binlog 和 performance_schema
- 后端：Go 静态编译，内存占用极低（约 20MB）
- 前端：Next.js standalone 模式，不启动开发服务器

如果你的 VPS 内存更小（256MB），可以启用 swap 作为缓冲：

```bash
# 创建 1GB swap 文件（以 root 执行）
fallocate -l 1G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## 项目结构

```
Yu-mcbbs/
├── docker-compose.yml          # Docker 编排文件
├── .env.docker.example         # 环境变量模板
├── frontend/                   # 前端（开源）
│   ├── Dockerfile
│   ├── src/                    # Next.js 源码
│   ├── themes/                 # 主题包
│   ├── plugins/                # 插件包
│   └── public/                 # 静态资源
└── server/                     # 后端（闭源）
    ├── Dockerfile
    ├── echov5                  # 预编译 Go 二进制
    ├── config/                 # 配置文件
    └── builtin/                # 内置主题/插件
```

---

## 常见问题

**Q: 启动后访问 3000 端口显示空白？**
A: 等待 30 秒，前端需要编译。可以 `docker compose logs -f frontend` 查看进度。

**Q: 安装时提示数据库连接失败？**
A: 检查 `.env.docker` 中数据库配置是否正确，确保密码不含特殊字符。

**Q: 如何彻底清除重新安装？**
```bash
docker compose down -v   # 删除容器和数据卷
rm -rf .env.docker       # 删除配置
# 重新从第二步开始
```

**Q: 忘记管理员密码？**
A: 连接 MySQL 执行：
```sql
UPDATE users SET password = '' WHERE email = '你的邮箱';
```
然后通过「忘记密码」功能重置。
