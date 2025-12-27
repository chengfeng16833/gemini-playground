# 📥 小说创作工作室 - 下载和使用教程

## 方法一：通过 GitHub 网页下载（最简单）

### 步骤 1：访问项目页面
在浏览器中打开：
```
https://github.com/chengfeng16833/gemini-playground
```

### 步骤 2：切换到正确的分支
1. 在页面左上方找到分支选择器（显示 "main" 或其他分支名）
2. 点击它，在下拉菜单中搜索：`claude/novel-writing-app-Kra5R`
3. 点击这个分支

### 步骤 3：下载代码
1. 点击绿色的 **"Code"** 按钮
2. 选择 **"Download ZIP"**
3. 将 ZIP 文件保存到你的电脑
4. 解压缩 ZIP 文件

### 步骤 4：安装 Node.js（如果还没安装）
1. 访问：https://nodejs.org/
2. 下载并安装 LTS（长期支持）版本
3. 安装完成后，重启电脑

### 步骤 5：运行应用
1. 打开命令行工具：
   - **Windows**：按 `Win + R`，输入 `cmd`，按回车
   - **Mac**：按 `Command + 空格`，输入 `terminal`，按回车
   - **Linux**：按 `Ctrl + Alt + T`

2. 进入解压后的项目文件夹：
   ```bash
   cd 你的下载路径/gemini-playground-claude-novel-writing-app-Kra5R
   ```

3. 启动服务器：
   ```bash
   node server.js
   ```

4. 看到以下提示表示成功：
   ```
   🚀 服务器已启动！
   📝 访问小说创作工作室：
      http://localhost:8787/novel-writer.html
   ```

5. 打开浏览器，输入：
   ```
   http://localhost:8787/novel-writer.html
   ```

---

## 方法二：使用 Git 命令（推荐，更专业）

### 前提条件
先安装 Git：
- **Windows**：https://git-scm.com/download/win
- **Mac**：`brew install git` 或从网站下载
- **Linux**：`sudo apt install git` (Ubuntu/Debian) 或 `sudo yum install git` (CentOS/RHEL)

### 下载步骤

1. **打开命令行/终端**

2. **选择一个存放项目的文件夹**（例如：Documents 文件夹）
   ```bash
   cd ~/Documents
   ```

3. **克隆项目**
   ```bash
   git clone https://github.com/chengfeng16833/gemini-playground.git
   ```

4. **进入项目目录**
   ```bash
   cd gemini-playground
   ```

5. **切换到正确的分支**
   ```bash
   git checkout claude/novel-writing-app-Kra5R
   ```

6. **启动服务器**
   ```bash
   node server.js
   ```

7. **打开浏览器**访问：
   ```
   http://localhost:8787/novel-writer.html
   ```

---

## 方法三：直接在 GitHub 网页上查看代码

如果你只是想先看看代码，不想立即下载：

1. 访问：https://github.com/chengfeng16833/gemini-playground
2. 切换到分支：`claude/novel-writing-app-Kra5R`
3. 浏览以下文件：
   - `src/static/novel-writer.html` - 主页面
   - `src/static/css/novel-writer.css` - 样式
   - `src/static/js/novel/` - JavaScript 代码
   - `NOVEL_WRITER_README.md` - 功能说明

---

## 🎯 快速测试步骤

下载并解压后，最快启动方式：

### Windows 用户
1. 解压 ZIP 文件
2. 双击解压后的文件夹
3. 在地址栏输入 `cmd` 并按回车（快速打开命令行）
4. 输入：`node server.js`
5. 浏览器访问：`http://localhost:8787/novel-writer.html`

### Mac/Linux 用户
1. 解压 ZIP 文件
2. 右键点击文件夹，选择"在终端中打开"
3. 输入：`node server.js`
4. 浏览器访问：`http://localhost:8787/novel-writer.html`

---

## ❓ 常见问题解决

### Q1: 提示 "node 不是内部或外部命令"
**原因**：Node.js 未安装或未添加到系统路径

**解决**：
1. 访问 https://nodejs.org/ 下载安装
2. 安装时勾选 "Add to PATH"
3. 重启命令行窗口

### Q2: 提示 "端口 8787 已被占用"
**解决方法 1**：关闭占用端口的程序
```bash
# Windows
netstat -ano | findstr :8787
taskkill /PID <进程ID> /F

# Mac/Linux
lsof -i :8787
kill -9 <进程ID>
```

**解决方法 2**：修改端口
1. 用文本编辑器打开 `server.js`
2. 找到 `const PORT = 8787;`
3. 改为 `const PORT = 3000;`（或其他端口）
4. 访问时用新端口：`http://localhost:3000/novel-writer.html`

### Q3: 页面打开是空白的
**解决**：
1. 按 F12 打开浏览器开发者工具
2. 查看 Console（控制台）标签页的错误信息
3. 确认服务器正在运行（命令行窗口不能关闭）

### Q4: 找不到 GitHub 仓库
**解决**：
- 确保你有访问权限
- 或者联系仓库所有者（chengfeng16833）
- 或者使用方法一下载 ZIP 文件

---

## 📱 配置 Gemini API（可选）

应用启动后，如果要使用 AI 助手功能：

1. 访问：https://makersuite.google.com/app/apikey
2. 登录 Google 账号
3. 创建 API Key
4. 在应用右上角点击 AI 助手图标
5. 输入 API Key
6. 开始使用 AI 辅助写作！

---

## 🆘 需要帮助？

如果遇到其他问题，请提供：
1. 你的操作系统（Windows/Mac/Linux）
2. 错误提示的截图或文字
3. 命令行显示的完整信息

我会帮你解决！

---

## 🎉 开始使用

成功启动后，你会看到：

- **工作区**：查看创作统计
- **创意管理**：记录灵感
- **拆书分析**：学习优秀作品
- **小说创作**：开始写作

所有数据都保存在你的浏览器中，完全离线可用！
