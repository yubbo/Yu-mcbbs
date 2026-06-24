# Yu-mcbbs — BBS CMS 论坛内容管理系统

**后端闭源 · 前端开源。** 两步部署，零配置。

---

## 部署

```bash
# 1. 克隆仓库
git clone https://github.com/yubbo/Yu-mcbbs.git
cd Yu-mcbbs

# 2. 启动（后端自动拉取镜像，前端自动构建）
docker compose up -d
```

等 5-10 分钟（首次构建前端），访问 `http://你的IP:3000` 进入安装引导。

---

## 1Panel 部署

1. SSH 登录服务器，执行 `git clone https://github.com/yubbo/Yu-mcbbs.git`
2. 1Panel → 容器 → 编排 → 创建编排
3. 名称 `bbs-cms`，**路径选择** → 选克隆的 `Yu-mcbbs` 目录
4. 启动

---

## 安装引导

访问 `http://你的IP:3000`，按提示填写：
1. 数据库设置 → 默认已配好，直接下一步
2. 管理员账号 → 设置邮箱和密码
3. 站点信息 → 站点名称

| 地址 | 说明 |
|------|------|
| `http://你的IP:3000` | 首页 |
| `http://你的IP:3000/admin` | 管理后台 |
| `http://你的IP:3000/user` | 个人中心 |

---

## 更新

```bash
cd Yu-mcbbs
git pull && docker compose up -d --build
```

## 内存

512MB VPS 可运行。MySQL ~120MB + 后端 ~20MB + 前端 ~100MB = **~240MB**。
