# 中文名生成器

一个帮助外国人根据英文名生成中文名的网站应用。

## 功能特点

- 根据英文名智能生成三个富有文化内涵的中文名
- 提供拼音注释和详细的中英文含义解释
- 支持名字缓存，提高响应速度
- 优雅的加载动画和错误提示
- 响应式设计，支持移动端访问

## 快速开始

### 本地运行

1. 克隆项目到本地：
```bash
git clone [项目地址]
cd 起中文名
```

2. 使用任意 Web 服务器运行，例如：
```bash
# 使用 Python 的简单 HTTP 服务器
python -m http.server 8000

# 或使用 Node.js 的 http-server
npx http-server
```

3. 在浏览器中访问：
```
http://localhost:8000
```

### 部署到生产环境

#### 方案一：GitHub Pages（免费）

1. 创建 GitHub 仓库
2. 将代码推送到仓库
3. 在仓库设置中启用 GitHub Pages
4. 访问 `https://[用户名].github.io/[仓库名]`

#### 方案二：Vercel（推荐，免费）

1. 注册 [Vercel](https://vercel.com) 账号
2. 导入 GitHub 仓库
3. 点击部署，自动完成配置
4. 获取部署域名，例如：`https://your-app.vercel.app`

#### 方案三：自有服务器

1. 准备服务器（阿里云、腾讯云等）
2. 安装 Nginx：
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS
sudo yum install nginx
```

3. 配置 Nginx：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/chinese-name-generator;
    index index.html;
    
    location / {
        try_files $file $uri $uri/ /index.html;
    }
}
```

4. 上传文件：
```bash
scp -r ./* user@your-server:/var/www/chinese-name-generator/
```

5. 启动 Nginx：
```bash
sudo systemctl start nginx
```

## 安全注意事项

1. API 密钥保护
   - 在生产环境中，建议将 API 密钥存储在环境变量中
   - 可以使用后端服务器中转 API 请求，避免密钥暴露

2. HTTPS 配置
   - 使用 Let's Encrypt 免费证书
   - 配置 SSL/TLS 加密

## 维护和更新

1. 定期检查：
   - API 密钥有效性
   - 模型可用性
   - 缓存系统状态

2. 性能监控：
   - 使用 Google Analytics 跟踪访问情况
   - 监控 API 响应时间
   - 观察错误日志

## 常见问题

1. API 超时
   - 检查网络连接
   - 确认 API 密钥有效
   - 可能需要更换更快的模型

2. 生成失败
   - 刷新页面重试
   - 清除浏览器缓存
   - 检查控制台错误信息

## 技术栈

- 前端：HTML5, CSS3, JavaScript (ES6+)
- API：SiliconFlow API
- 模型：google/gemma-2-9b-it
- 缓存：LocalStorage

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目。

## 许可证

MIT License
