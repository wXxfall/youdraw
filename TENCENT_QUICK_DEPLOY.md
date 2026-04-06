# 腾讯云快速部署指南

## 选择操作系统

**强烈推荐选择 Linux（Ubuntu 20.04 或 22.04）**

### 为什么选择 Linux？

✅ **性能更好**：资源占用少，运行速度快
✅ **成本更低**：无需 Windows 授权费
✅ **原生支持**：Node.js 在 Linux 上性能最佳
✅ **稳定可靠**：Linux 服务器更稳定
✅ **社区支持**：丰富的文档和社区资源

### Windows 的问题

❌ 资源占用高，需要更高配置
❌ 需要额外的 Windows 授权费
❌ Node.js 性能不如 Linux
❌ 管理和维护更复杂

## 腾讯云服务器购买建议

### 推荐配置

| 配置 | 适用场景 | 价格（月） |
|------|---------|-----------|
| 1核2G | 足够运行双人游戏 | 50-80元 |
| 2核4G | 更好的性能 | 100-150元 |

**推荐：1核2G** 已经完全够用。

### 购买步骤

1. 登录腾讯云控制台：https://console.cloud.tencent.com
2. 进入 **云服务器 CVM**
3. 点击 **新建** → **自定义配置**
4. 选择配置：
   - **计费模式**：按量付费（测试）或包年包月（长期）
   - **地域**：选择离您最近的地区
   - **实例**：选择 **1核2G**
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

## 快速部署（3 步完成）

### 第一步：配置服务器环境

在本地 PowerShell 中执行：

```powershell
# 替换为您的服务器 IP
$SERVER_IP = "你的服务器IP"

# 连接到服务器
ssh root@${SERVER_IP}
```

在服务器中运行：

```bash
# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# 安装 PM2
npm install -g pm2

# 配置防火墙
ufw --force enable
ufw allow 22 80 443 3000
```

### 第二步：上传并启动项目

在本地 PowerShell 中执行：

```powershell
# 上传项目文件
scp -r f:\vs_project\youdraw root@${SERVER_IP}:/root/

# 连接到服务器
ssh root@${SERVER_IP}
```

在服务器中运行：

```bash
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

### 第三步：配置腾讯云安全组

1. 登录腾讯云控制台：https://console.cloud.tencent.com
2. 进入 **云服务器 CVM** → **安全组**
3. 找到您的实例绑定的安全组
4. 点击 **修改规则** → **添加规则**
5. 添加以下入站规则：

| 协议 | 端口 | 来源 | 说明 |
|------|------|------|------|
| TCP | 22 | 0.0.0.0/0 | SSH（建议限制为您的 IP） |
| TCP | 80 | 0.0.0.0/0 | HTTP |
| TCP | 443 | 0.0.0.0/0 | HTTPS |
| TCP | 3000 | 0.0.0.0/0 | 应用端口 |

## 验证部署

在浏览器中访问：
```
http://你的服务器IP:3000
```

## 常用管理命令

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs youdraw-game

# 重启应用
pm2 restart youdraw-game

# 停止应用
pm2 stop youdraw-game

# 查看应用信息
pm2 show youdraw-game
```

## 一键部署脚本（复制粘贴）

将以下命令复制到 PowerShell 中，替换 `你的服务器IP`：

```powershell
$SERVER_IP = "你的服务器IP"

# 上传项目文件
scp -r f:\vs_project\youdraw root@${SERVER_IP}:/root/

# 连接到服务器并执行部署
ssh root@${SERVER_IP} "cd /root/youdraw && npm install --production && pm2 start server.js --name youdraw-game && pm2 save && pm2 startup"
```

## 注意事项

1. **选择 Linux 系统**：Ubuntu 20.04 或 22.04
2. **配置安全组**：确保开放 22、80、443、3000 端口
3. **使用 SSH 密钥**：比密码更安全
4. **定期更新系统**：`sudo apt-get update && sudo apt-get upgrade`
5. **监控资源使用**：在腾讯云控制台查看监控信息

## 下一步

部署成功后，您可以：
1. 配置域名（可选）
2. 配置 SSL 证书（HTTPS）
3. 优化性能
4. 添加更多功能

## 详细文档

详细步骤和故障排除请查看：
- [TENCENT_DEPLOY.md](file:///f:/vs_project/youdraw/TENCENT_DEPLOY.md) - 完整部署指南

## 需要帮助？

如果遇到问题：
1. 查看 PM2 日志：`pm2 logs youdraw-game`
2. 查看腾讯云文档：https://cloud.tencent.com/document/product/213
3. 联系腾讯云技术支持