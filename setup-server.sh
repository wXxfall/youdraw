#!/bin/bash

echo "======================================"
echo "  阿里云服务器自动化部署脚本"
echo "======================================"

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
  echo "请使用 root 用户运行此脚本"
  exit 1
fi

# 更新系统
echo "正在更新系统..."
apt-get update && apt-get upgrade -y

# 安装必要工具
echo "正在安装必要工具..."
apt-get install -y curl git nginx ufw

# 安装 NVM
echo "正在安装 NVM..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 安装 Node.js 18
echo "正在安装 Node.js 18..."
nvm install 18
nvm use 18
nvm alias default 18

# 安装 PM2
echo "正在安装 PM2..."
npm install -g pm2

# 配置防火墙
echo "正在配置防火墙..."
ufw --force enable
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 3000

# 配置 Nginx
echo "正在配置 Nginx..."
cat > /etc/nginx/sites-available/youdraw << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/youdraw /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

echo "======================================"
echo "  基础环境安装完成！"
echo "======================================"
echo ""
echo "下一步："
echo "1. 上传项目文件到 /root/youdraw"
echo "2. 运行: cd /root/youdraw && npm install"
echo "3. 运行: pm2 start server.js --name youdraw-game"
echo "4. 运行: pm2 save && pm2 startup"
echo ""