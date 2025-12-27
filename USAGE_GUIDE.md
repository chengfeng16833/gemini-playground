# 小说创作工作室 - 使用指南

## 当前服务器状态
✅ 服务器正在运行在端口 8787

## 访问方法

### 方式 1：通过浏览器访问（推荐）

1. **打开你的浏览器**（Chrome、Firefox、Safari、Edge 等）

2. **在地址栏输入以下网址**：
   ```
   http://localhost:8787/novel-writer.html
   ```

3. 按回车键访问

### 方式 2：如果你在远程环境

如果你是通过 SSH 或网页版 Claude Code 连接到远程服务器，你需要：

#### 使用 SSH 端口转发
```bash
ssh -L 8787:localhost:8787 your-server
```

然后在本地浏览器访问 `http://localhost:8787/novel-writer.html`

#### 或者使用 VS Code 的端口转发功能
1. 在 VS Code 中打开"端口"面板
2. 转发端口 8787
3. 点击转发的链接访问

### 方式 3：文件直接访问

由于应用使用了 ES6 模块，需要通过 HTTP 服务器访问，不能直接双击 HTML 文件。

## 常见问题

### Q: 显示 "无法访问此网站"
A: 确保服务器正在运行：
```bash
node server.js
```

### Q: 页面空白或报错
A: 按 F12 打开浏览器开发者工具，查看控制台错误信息

### Q: 在云环境/远程服务器
A: 需要配置防火墙允许 8787 端口，或使用反向代理

## 服务器命令

启动服务器：
```bash
cd /home/user/gemini-playground
node server.js
```

停止服务器：
按 `Ctrl+C` 或者：
```bash
pkill -f "node server.js"
```

重启服务器：
```bash
pkill -f "node server.js" && node server.js &
```

## 需要帮助？

如果仍然无法访问，请告诉我：
1. 你的操作系统（Windows/Mac/Linux）
2. 你是在本地还是远程环境使用
3. 浏览器控制台显示的错误信息（如果有）
