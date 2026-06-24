#!/bin/bash
# Yu-mcbbs 一键部署脚本
# 用法: curl -fsSL https://raw.githubusercontent.com/yubbo/Yu-mcbbs/main/deploy.sh | bash

set -e

echo "🚀 开始部署 Yu-mcbbs..."

# 1. 创建目录并进入
mkdir -p /opt/yu-mcbbs
cd /opt/yu-mcbbs

# 2. 下载 docker-compose.yml
if [ ! -f "docker-compose.yml" ]; then
    echo "📥 下载 docker-compose.yml..."
    curl -fsSL -o docker-compose.yml https://raw.githubusercontent.com/yubbo/Yu-mcbbs/main/docker-compose.yml
fi

# 3. 启动
echo "🐳 启动容器..."
docker compose up -d

# 4. 等待并显示地址
echo "⏳ 等待服务启动..."
sleep 10

echo ""
echo "✅ 部署完成！"
echo ""
echo "🌐 访问地址:"
echo "   http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "📋 管理命令:"
echo "   cd /opt/yu-mcbbs && docker compose logs -f"
echo "   cd /opt/yu-mcbbs && docker compose down"
echo ""
