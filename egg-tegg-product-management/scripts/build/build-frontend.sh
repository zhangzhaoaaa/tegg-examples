#!/bin/bash

# 前端构建脚本
# 用于构建 React + Umi 前端应用

set -e  # 遇到错误立即退出

echo "🚀 开始构建前端应用..."

# 检查 Node.js 版本
echo "📋 检查 Node.js 版本..."
node --version
npm --version

# 进入前端目录
cd "$(dirname "$0")/../web"

echo "📦 安装前端依赖..."
# 清理 node_modules 和 lock 文件（可选）
if [ "$1" = "--clean" ]; then
    echo "🧹 清理旧的依赖..."
    rm -rf node_modules package-lock.json
fi

# 安装依赖
if command -v pnpm &> /dev/null; then
    echo "使用 pnpm 安装依赖..."
    pnpm install
else
    echo "使用 npm 安装依赖..."
    npm install
fi

echo "🔧 构建前端应用..."
# 设置环境变量
export NODE_ENV=production
export UMI_ENV=production

# 构建应用
if command -v pnpm &> /dev/null; then
    pnpm run build
else
    npm run build
fi

echo "✅ 前端构建完成！"
echo "📁 构建产物位置: $(pwd)/dist"

# 检查构建产物
if [ -d "dist" ]; then
    echo "📊 构建产物大小:"
    du -sh dist/*
else
    echo "❌ 构建失败：未找到 dist 目录"
    exit 1
fi

echo "🎉 前端构建成功完成！"