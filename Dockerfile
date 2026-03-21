# 使用 Node.js 20 作为基础镜像
FROM node:20-slim AS build

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件
COPY . .

# 编译项目
RUN npm run build

# 使用 nginx 作为生产环境镜像
FROM nginx:alpine

# 复制编译后的文件到 nginx 目录
COPY --from=build /app/dist /usr/share/nginx/html

# 复制自定义 nginx 配置 (如果需要处理 SPA 路由)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
