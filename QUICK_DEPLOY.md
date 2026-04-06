# 阿里云快速部署脚本

## 使用说明

### 方法一：使用自动化脚本（推荐）

1. 将 `setup-server.sh` 上传到服务器
2. 连接到服务器：
   ```bash
   ssh root@你的服务器IP
   ```
3. 给脚本添加执行权限：
   ```bash
   chmod +x setup-server.sh
   ```
4. 运行脚本：
   ```bash
   ./setup-server.sh
   ```

### 方法二：手动执行（Windows PowerShell）

在本地 PowerShell 中依次执行以下命令：

```powershell
# 1. 连接到服务器
ssh root@你的服务器IP

# 2. 更新系统
apt-get update && apt-get upgrade -y

# 3. 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# 4. 安装 PM2
npm install -g pm2

# 5. 配置防火墙
ufw --force enable
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 3000

# 6. 安装 Nginx
apt-get install -y nginx

# 7. 配置 Nginx
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
    }
}
EOF

ln -sf /etc/nginx/sites-available/youdraw /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# 8. 上传项目文件（在本地 PowerShell 执行）
# 退出服务器
exit

# 上传项目
scp -r f:\vs_project\youdraw root@你的服务器IP:/root/

# 9. 重新连接服务器并部署
ssh root@你的服务器IP

# 进入项目目录
cd /root/youdraw

# 安装依赖
npm install --production

# 启动应用
pm2 start server.js --name youdraw-game

# 设置开机自启
pm2 save
pm2 startup
```

## 快速部署命令（复制粘贴）

将以下命令复制到 PowerShell 中，替换 `你的服务器IP`：

```powershell
$SERVER_IP = "你的服务器IP"

# 上传项目文件
scp -r f:\vs_project\youdraw root@${SERVER_IP}:/root/

# 连接到服务器
ssh root@${SERVER_IP}

# 在服务器中执行以下命令
cd /root/youdraw
npm install --production
pm2 start server.js --name youdraw-game
pm2 save
pm2 startup
```

## 验证部署

1. 在浏览器中访问：
   ```
   http://你的服务器IP
   ```

2. 查看应用状态：
   ```bash
   pm2 status
   ```

3. 查看日志：
   ```bash
   pm2 logs youdraw-game
   ```

## 常用命令

```bash
# 重启应用
pm2 restart youdraw-game

# 停止应用
pm2 stop youdraw-game

# 查看日志
pm2 logs youdraw-game

# 查看应用信息
pm2 show youdraw-game
```

## 注意事项

1. 确保阿里云安全组已开放 80、443、3000 端口
2. 如果使用域名，记得配置 DNS 解析
3. 首次部署建议先测试，确认无误后再配置 SSL 证书