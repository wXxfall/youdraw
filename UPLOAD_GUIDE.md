# 手动上传到GitHub指南

由于网络连接问题无法直接推送，请按照以下步骤手动上传：

## 方法一：通过GitHub网页上传（推荐）

### 第一步：访问你的GitHub仓库
打开浏览器访问：https://github.com/wXxfall/youdraw-game

### 第二步：上传文件
1. 点击仓库页面上的 "uploading an existing file" 链接
2. 或者直接点击 "Add file" → "Upload files"

### 第三步：上传以下文件

需要上传的文件列表：

```
youdraw/
├── package.json
├── server.js
├── README.md
├── DEPLOY.md
├── .gitignore
└── public/
    ├── index.html
    ├── css/
    │   └── style.css
    └── js/
        └── app.js
```

**上传步骤**：
1. 点击 "Upload files"
2. 将 `package.json` 文件拖拽到上传区域
3. 继续拖拽其他文件
4. 对于 `public/` 目录，需要先创建文件夹：
   - 点击 "Create a new file"
   - 文件名输入：`public/.gitkeep`（创建public目录）
   - 然后在public目录下创建 `css/` 和 `js/` 子目录
   - 分别上传对应文件

### 第四步：提交更改
1. 所有文件上传完成后
2. 在 "Commit changes" 区域输入提交信息：`Initial commit`
3. 点击 "Commit changes" 按钮

## 方法二：使用GitHub Desktop（推荐）

### 第一步：下载GitHub Desktop
1. 访问：https://desktop.github.com/
2. 下载并安装GitHub Desktop

### 第二步：克隆仓库
1. 打开GitHub Desktop
2. 点击 "File" → "Clone Repository"
3. 输入仓库地址：`https://github.com/wXxfall/youdraw-game`
4. 选择本地路径，点击 "Clone"

### 第三步：复制文件
1. 将 `f:\vs_project\youdraw` 目录下的所有文件复制到克隆的仓库文件夹
2. 在GitHub Desktop中查看更改

### 第四步：提交并推送
1. 在GitHub Desktop左侧看到所有更改
2. 在 "Summary" 输入：`Initial commit`
3. 点击 "Commit to main"
4. 点击 "Push origin"

## 方法三：使用VS Code（如果你使用VS Code）

### 第一步：安装GitHub Pull Requests扩展
1. 打开VS Code
2. 点击左侧扩展图标
3. 搜索 "GitHub Pull Requests"
4. 安装Microsoft的GitHub扩展

### 第二步：克隆仓库
1. 按 `Ctrl+Shift+P`
2. 输入 "Git: Clone"
3. 输入仓库地址：`https://github.com/wXxfall/youdraw-game`
4. 选择本地路径

### 第三步：复制文件
1. 将 `f:\vs_project\youdraw` 的所有文件复制到克隆的仓库
2. 在VS Code中查看更改

### 第四步：提交并推送
1. 点击左侧源代码管理图标
2. 输入提交信息：`Initial commit`
3. 点击 "Commit" 按钮
4. 点击 "Sync Changes"

## 上传完成后的下一步

### 验证上传成功
访问：https://github.com/wXxfall/youdraw-game
确认所有文件都已上传

### 开始部署到云平台

#### 推荐使用Render.com

1. **访问Render**：
   - 打开 https://render.com
   - 点击 "Sign Up"
   - 使用GitHub账号登录

2. **创建Web Service**：
   - 登录后点击 "New +"
   - 选择 "Web Service"
   - 点击 "Connect GitHub"

3. **连接仓库**：
   - 找到 `youdraw-game` 仓库
   - 点击 "Connect"

4. **配置部署**：
   - **Name**: `youdraw-game`
   - **Region**: Singapore (Asia Pacific)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

5. **创建服务**：
   - 点击 "Create Web Service"
   - 等待2-3分钟部署完成

6. **获取访问地址**：
   - 部署完成后，Render会提供一个URL
   - 例如：`https://youdraw-game.onrender.com`

## 常见问题

### Q: 上传文件时提示文件太大怎么办？
A: 单个文件不能超过25MB。如果文件太大，可以使用Git LFS。

### Q: 如何确认上传成功？
A: 访问GitHub仓库页面，查看文件列表是否完整。

### Q: 部署失败怎么办？
A: 检查Render的部署日志，通常是因为缺少依赖或配置错误。

### Q: 可以使用其他云平台吗？
A: 可以！除了Render，还可以使用Railway.app或Glitch。

## 快速检查清单

- [ ] 所有文件已上传到GitHub
- [ ] package.json包含所有依赖
- [ ] server.js配置正确
- [ ] public目录结构完整
- [ ] 已在Render创建Web Service
- [ ] 部署成功，获得公网URL

## 需要帮助？

如果遇到问题，可以：
1. 查看GitHub仓库的Issues页面
2. 查看Render的部署日志
3. 参考DEPLOY.md文档

祝你部署成功！🎉
