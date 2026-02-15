# 部署指南 - 将游戏部署到云端

## 重要说明

**GitHub本身不能运行Node.js服务器**，它只是代码托管平台。你需要将代码推送到GitHub，然后使用云平台来部署和运行游戏。

## 推荐的免费云平台

### 1. Render.com (推荐) ⭐
- ✅ 完全免费
- ✅ 支持Node.js + Socket.io
- ✅ 自动部署
- ✅ 提供HTTPS
- ✅ 无需信用卡

### 2. Railway.app
- ✅ 免费额度（每月$5）
- ✅ 支持Node.js + Socket.io
- ✅ 自动部署
- ✅ 界面友好

### 3. Glitch
- ✅ 完全免费
- ✅ 支持Node.js + Socket.io
- ✅ 在线编辑器
- ❌ 免费版会休眠

## 方案一：Render.com 部署（推荐）

### 第一步：推送到GitHub

1. 在GitHub上创建新仓库：
   - 访问 https://github.com/new
   - 仓库名称：`youdraw-game`
   - 选择"Public"或"Private"
   - 点击"Create repository"

2. 推送代码到GitHub：
```bash
git remote add origin https://github.com/你的用户名/youdraw-game.git
git branch -M main
git push -u origin main
```

### 第二步：在Render部署

1. 注册Render账号：
   - 访问 https://render.com
   - 使用GitHub账号登录

2. 创建新的Web Service：
   - 点击"New +" → "Web Service"
   - 连接你的GitHub仓库
   - 选择`youdraw-game`仓库

3. 配置部署设置：
   - **Name**: `youdraw-game`
   - **Region**: Singapore (Asia Pacific) 或离你最近的区域
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

4. 点击"Create Web Service"

5. 等待部署完成（约2-3分钟）

6. 部署完成后，Render会提供一个公网URL，例如：
   `https://youdraw-game.onrender.com`

### 第三步：配置环境变量（如果需要）

Render会自动检测端口，无需额外配置。

### 第四步：测试访问

1. 访问Render提供的URL
2. 在两个不同的浏览器窗口中打开
3. 使用相同的房间号加入游戏

## 方案二：Railway.app 部署

### 第一步：推送到GitHub

同方案一

### 第二步：在Railway部署

1. 注册Railway账号：
   - 访问 https://railway.app
   - 使用GitHub账号登录

2. 创建新项目：
   - 点击"New Project"
   - 选择"Deploy from GitHub repo"
   - 选择`youdraw-game`仓库

3. 配置设置：
   - Railway会自动检测Node.js项目
   - 确认配置后点击"Deploy"

4. 等待部署完成

5. 获得公网URL，例如：
   `https://youdraw-game.up.railway.app`

## 方案三：Glitch 部署

### 第一步：创建Glitch项目

1. 访问 https://glitch.com
2. 点击"New Project"
3. 选择"glitch-hello-node"模板

### 第二步：上传代码

1. 将以下文件复制到Glitch：
   - `package.json`
   - `server.js`
   - `public/` 目录下的所有文件

2. 修改`package.json`中的`start`脚本：
```json
"scripts": {
  "start": "node server.js"
}
```

### 第三步：启动项目

1. Glitch会自动启动项目
2. 获得公网URL，例如：
   `https://your-project-name.glitch.me`

## 重要注意事项

### Socket.io 配置

由于云平台通常使用代理，需要修改`server.js`中的Socket.io配置：

```javascript
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
```

### 端口配置

云平台会自动分配端口，使用环境变量：

```javascript
const PORT = process.env.PORT || 3001;
```

### 睡眠问题

- **Render**: 免费版15分钟无访问会休眠，首次访问需要约30秒唤醒
- **Railway**: 免费额度内不会休眠
- **Glitch**: 免费版会休眠

## 推荐方案总结

| 平台 | 费用 | 稳定性 | Socket.io支持 | 推荐度 |
|------|------|--------|---------------|--------|
| Render | 免费 | 高 | ✅ | ⭐⭐⭐⭐⭐ |
| Railway | $5/月免费额度 | 高 | ✅ | ⭐⭐⭐⭐ |
| Glitch | 免费 | 中 | ✅ | ⭐⭐⭐ |

## 常见问题

### Q: 为什么不能直接用GitHub Pages？
A: GitHub Pages只支持静态网站，不支持Node.js服务器和WebSocket。

### Q: 免费版够用吗？
A: 对于双人游戏，免费版完全够用。Render免费版提供512MB RAM，足够运行。

### Q: 如何保证24小时在线？
A: 免费版会有休眠机制。如需24小时在线，建议使用Railway付费版（$5/月）。

### Q: 可以自定义域名吗？
A: 可以，但需要购买域名并配置DNS。免费版使用平台提供的域名。

## 下一步

1. 选择一个平台（推荐Render）
2. 按照步骤部署
3. 测试游戏功能
4. 分享URL给朋友

祝你部署成功！🎉
