// 简单的本地开发服务器
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8787;
const STATIC_DIR = path.join(__dirname, 'src', 'static');

const getContentType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon'
  };
  return types[ext] || 'text/plain';
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // 解析 URL
  let filePath = req.url === '/' ? '/index.html' : req.url;

  // 移除查询参数
  filePath = filePath.split('?')[0];

  const fullPath = path.join(STATIC_DIR, filePath);

  // 检查文件是否存在
  fs.access(fullPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File not found:', fullPath);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    // 读取并返回文件
    fs.readFile(fullPath, (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }

      const contentType = getContentType(fullPath);
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 服务器已启动！`);
  console.log(`\n📝 访问小说创作工作室：`);
  console.log(`   http://localhost:${PORT}/novel-writer.html`);
  console.log(`\n🎮 访问 Gemini 演示：`);
  console.log(`   http://localhost:${PORT}/index.html`);
  console.log(`\n按 Ctrl+C 停止服务器\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`错误：端口 ${PORT} 已被占用`);
    console.log('请关闭占用端口的程序，或修改 server.js 中的端口号');
  } else {
    console.error('服务器错误:', err);
  }
  process.exit(1);
});
