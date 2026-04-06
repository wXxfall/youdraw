# 腾讯云服务器部署指南

## 前提条件

- 已拥有腾讯云账号
- 已购买或拥有腾讯云 CVM 服务器
- 服务器操作系统：推荐 Ubuntu 20.04 或 22.04（Linux）
- 本地已安装 SSH 客户端

## 为什么选择 Linux？

对于 Node.js 应用，Linux 是最佳选择：

✅ **性能更好**：资源占用少，运行速度快
✅ **成本更低**：无需 Windows 授权费
✅ **原生支持**：Node.js 在 Linux 上性能最佳
✅ **稳定可靠**：Linux 服务器更稳定
✅ **社区支持**：丰富的文档和社区资源

## 第一步：连接到服务器

### Windows 用户

1. 打开 PowerShell 或 CMD
2. 使用以下命令连接：
   ```bash
   ssh root@你的服务器公网IP
   ```
3. 输入密码（输入时不会显示）

### 使用 SSH 密钥连接（推荐）

如果使用 SSH 密钥：
```bash
ssh -i 你的密钥文件.pem root@你的服务器公网IP
```

**注意**：如果使用 .pem 密钥文件，需要设置权限：
```bash
chmod 400 你的密钥文件.pem
```

## 第二步：安装 Node.js

### 方法一：使用 NVM 安装（推荐）

1. 安装 NVM（Node Version Manager）：
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   ```

2. 重新加载配置：
   ```bash
   source ~/.bashrc
   ```

3. 安装 Node.js LTS 版本：
   ```bash
   nvm install 18
   nvm use 18
   nvm alias default 18
   ```

4. 验证安装：
   ```bash
   node -v
   npm -v
   ```

### 方法二：使用包管理器安装

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v
npm -v
```

## 第三步：安装 PM2（进程管理器）

PM2 可以让您的应用在后台持续运行，并在服务器重启后自动启动。

```bash
npm install -g pm2
```

## 第四步：配置防火墙

### 腾讯云安全组配置

1. 登录腾讯云控制台：https://console.cloud.tencent.com
2. 进入 **云服务器** → **安全组**
3. 找到您的实例绑定的安全组
4. 点击 **修改规则** → **添加规则**
5. 添加以下入站规则：

| 协议 | 端口 | 来源 | 说明 |
|------|------|------|------|
| TCP | 22 | 0.0.0.0/0 | SSH（建议限制为您的 IP） |
| TCP | 80 | 0.0.0.0/0 | HTTP |
| TCP | 443 | 0.0.0.0/0 | HTTPS |
| TCP | 3000 | 0.0.0.0/0 | 应用端口 |

### 服务器防火墙配置（Ubuntu UFW）

```bash
# 启用防火墙
sudo ufw enable

# 允许 SSH
sudo ufw allow 22

# 允许 HTTP
sudo ufw allow 80

# 允许 HTTPS
sudo ufw allow 443

# 允许您的应用端口（如 3000）
sudo ufw allow 3000

# 查看防火墙状态
sudo ufw status
```

## 第五步：上传项目文件

### 方法一：使用 SCP 上传（推荐）

在本地 PowerShell 中执行：

```bash
# 上传整个项目文件夹
scp -r f:\vs_project\youdraw root@你的服务器公网IP:/root/

# 如果使用 SSH 密钥
scp -i 你的密钥文件.pem -r f:\vs_project\youdraw root@你的服务器公网IP:/root/
```

### 方法二：使用 Git 克隆

如果您已将代码推送到 GitHub：

```bash
# 安装 Git
sudo apt-get update
sudo apt-get install -y git

# 克隆项目
cd /root
git clone https://github.com/你的用户名/你的仓库名.git youdraw
cd youdraw
```

### 方法三：使用 SFTP 工具

使用 WinSCP、FileZilla 等 SFTP 工具上传文件。

## 第六步：安装项目依赖

```bash
# 进入项目目录
cd /root/youdraw

# 安装依赖
npm install --production
```

## 第七步：配置环境变量

创建 `.env` 文件：

```bash
nano .env
```

添加以下内容：

```env
PORT=3000
NODE_ENV=production
```

保存并退出（Ctrl+X，然后 Y，然后 Enter）。

## 第八步：修改服务器配置

确保 [server.js](file:///f:/vs_project/youdraw/server.js) 中的配置正确：

```javascript
const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
```

如果需要修改，可以使用：
```bash
nano server.js
```

## 第九步：使用 PM2 启动应用

```bash
# 启动应用
pm2 start server.js --name youdraw-game

# 查看应用状态
pm2 status

# 查看日志
pm2 logs youdraw-game

# 查看详细信息
pm2 show youdraw-game
```

## 第十步：设置 PM2 开机自启

```bash
# 保存当前 PM2 进程列表
pm2 save

# 生成开机启动脚本
pm2 startup
```

复制输出的命令并执行，例如：
```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

## 第十一步：测试应用

1. 在浏览器中访问：
   ```
   http://你的服务器公网IP:3000
   ```

2. 如果看到游戏界面，说明部署成功！

3. 在两个不同的浏览器窗口中测试游戏功能。

## 第十二步：配置域名（可选）

### 购买域名

1. 在腾讯云或其他域名注册商购买域名
2. 在腾讯云 DNS 解析中添加 A 记录：
   - 主机记录：@ 或 www
   - 记录值：你的服务器公网IP

### 配置 Nginx 反向代理（推荐）

安装 Nginx：
```bash
sudo apt-get update
sudo apt-get install -y nginx
```

创建 Nginx 配置文件：
```bash
sudo nano /etc/nginx/sites-available/youdraw
```

添加以下内容：

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

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
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/youdraw /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 配置 SSL 证书（HTTPS）

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 获取并安装证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 测试自动续期
sudo certbot renew --dry-run
```

## 腾讯云控制台操作

### 购买服务器

1. 登录腾讯云控制台：https://console.cloud.tencent.com
2. 进入 **云服务器 CVM**
3. 点击 **新建** → **自定义配置**
4. 选择配置：
   - **计费模式**：按量付费（测试）或包年包月（长期）
   - **地域**：选择离您最近的地区
   - **实例**：选择 **1核2G**（足够运行双人游戏）
   - **镜像**：选择 **Ubuntu Server 20.04 LTS** 或 **22.04 LTS**
   - **系统盘**：40GB 足够
   - **带宽**：1Mbps 或按流量计费
5. 设置登录方式：
   - **密码**：设置 root 密码
   - **SSH 密钥**：更安全（推荐）
6. 配置安全组：
   - 选择默认安全组或新建
   - 确保开放 22、80、443、3000 端口
7. 确认购买

### 重启服务器

1. 进入 **云服务器 CVM**
2. 找到您的实例
3. 点击 **更多** → **实例状态** → **重启**

### 查看监控

1. 进入 **云服务器 CVM**
2. 点击实例 ID
3. 查看 **监控** 标签页

## 常用 PM2 命令

```bash
# 启动应用
pm2 start server.js --name youdraw-game

# 停止应用
pm2 stop youdraw-game

# 重启应用
pm2 restart youdraw-game

# 删除应用
pm2 delete youdraw-game

# 查看日志
pm2 logs youdraw-game

# 清空日志
pm2 flush

# 监控应用
pm2 monit

# 查看所有应用
pm2 list

# 重载应用（零停机）
pm2 reload youdraw-game
```

## 更新应用

当您需要更新代码时：

```bash
# 方法一：使用 Git
cd /root/youdraw
git pull
pm2 restart youdraw-game

# 方法二：重新上传文件后
cd /root/youdraw
npm install --production
pm2 restart youdraw-game
```

## 性能优化

### 1. 启用 gzip 压缩

修改 [server.js](file:///f:/vs_project/youdraw/server.js)：

```javascript
const compression = require('compression');
app.use(compression());
```

安装 compression：
```bash
npm install compression
```

### 2. 设置静态文件缓存

```javascript
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d'
}));
```

### 3. 使用 PM2 集群模式

```bash
# 根据 CPU 核心数启动多个实例
pm2 start server.js --name youdraw-game -i max
```

## 监控和日志

### 查看实时日志
```bash
pm2 logs youdraw-game
```

### 查看应用监控
```bash
pm2 monit
```

### 查看应用信息
```bash
pm2 show youdraw-game
```

## 安全建议

1. **使用 SSH 密钥**：禁用密码登录，只使用密钥
2. **定期更新系统**：
   ```bash
   sudo apt-get update && sudo apt-get upgrade
   ```
3. **配置防火墙**：只开放必要的端口
4. **使用非 root 用户**：创建普通用户运行应用
5. **定期备份数据**：备份重要文件和配置
6. **限制 SSH 访问**：在安全组中只允许您的 IP 访问 22 端口

## 故障排除

### 应用无法启动

1. 检查端口是否被占用：
   ```bash
   sudo netstat -tlnp | grep 3000
   ```

2. 查看详细日志：
   ```bash
   pm2 logs youdraw-game --lines 100
   ```

3. 手动运行测试：
   ```bash
   node server.js
   ```

### WebSocket 连接失败

1. 检查腾讯云安全组设置
2. 确认 Nginx 配置正确（如果使用）
3. 查看浏览器控制台错误信息

### 端口被占用

```bash
# 查找占用端口的进程
sudo lsof -i :3000

# 杀死进程
sudo kill -9 进程ID
```

### 内存不足

```bash
# 查看内存使用情况
free -h

# 查看进程内存使用
ps aux --sort=-%mem | head
```

## 成本估算

腾讯云 CVM 服务器价格（仅供参考）：

| 配置 | 计费模式 | 价格 |
|------|---------|------|
| 1核2G | 按量付费 | 约 0.08 元/小时 |
| 1核2G | 包年包月 | 约 50-80 元/月 |
| 2核4G | 按量付费 | 约 0.15 元/小时 |
| 2核4G | 包年包月 | 约 100-150 元/月 |

对于您的双人游戏，**1核2G** 配置已经足够。

## 备份建议

1. **代码备份**：使用 Git 管理代码
2. **配置备份**：定期备份 Nginx、PM2 等配置文件
3. **数据库备份**：如果使用数据库，定期备份

## 腾讯云特有功能

### 云监控

腾讯云提供详细的监控服务，可以实时查看：
- CPU 使用率
- 内存使用率
- 磁盘使用率
- 网络流量

### 自动快照

可以设置自动快照，定期备份服务器状态。

### 弹性公网 IP

可以绑定弹性公网 IP，方便更换服务器时保留 IP。

## 相关文件

- [server.js](file:///f:/vs_project/youdraw/server.js) - 服务器主文件
- [package.json](file:///f:/vs_project/youdraw/package.json) - 项目配置文件
- [public/index.html](file:///f:/vs_project/youdraw/public/index.html) - 前端页面
- [public/css/style.css](file:///f:/vs_project/youdraw/public/css/style.css) - 样式文件
- [public/js/app.js](file:///f:/vs_project/youdraw/public/js/app.js) - 前端逻辑

## 需要帮助？

如果遇到问题：
1. 查看 PM2 日志：`pm2 logs youdraw-game`
2. 查看 Nginx 日志：`sudo tail -f /var/log/nginx/error.log`
3. 查看系统日志：`sudo journalctl -xe`
4. 联系腾讯云技术支持
5. 查看腾讯云文档：https://cloud.tencent.com/document/product/213