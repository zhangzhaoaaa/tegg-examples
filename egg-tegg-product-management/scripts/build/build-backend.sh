#!/bin/bash

# 后端构建脚本
# 用于构建 Egg.js + Tegg 后端应用

set -e  # 遇到错误立即退出

echo "🚀 开始构建后端应用..."

# 检查 Node.js 版本
echo "📋 检查 Node.js 版本..."
node --version
npm --version

# 进入项目根目录
cd "$(dirname "$0")/.."

echo "📦 安装后端依赖..."
# 清理 node_modules 和 lock 文件（可选）
if [ "$1" = "--clean" ]; then
    echo "🧹 清理旧的依赖..."
    rm -rf node_modules package-lock.json pnpm-lock.yaml
fi

# 安装依赖
if command -v pnpm &> /dev/null; then
    echo "使用 pnpm 安装依赖..."
    pnpm install
else
    echo "使用 npm 安装依赖..."
    npm install
fi

echo "🔧 编译 TypeScript..."
# 清理旧的构建产物
rm -rf dist

# 编译 TypeScript
if command -v pnpm &> /dev/null; then
    pnpm exec tsc
else
    npx tsc
fi

echo "📋 复制必要文件..."
# 复制配置文件
cp -r config dist/
cp package.json dist/

# 复制其他必要文件
if [ -d "app/public" ]; then
    cp -r app/public dist/app/
fi

# 复制数据库初始化脚本
if [ -d "scripts" ]; then
    mkdir -p dist/scripts
    cp scripts/init-db.js dist/scripts/ 2>/dev/null || true
fi

echo "📦 安装生产依赖..."
cd dist
if command -v pnpm &> /dev/null; then
    pnpm install --prod
else
    npm install --production
fi

cd ..

echo "✅ 后端构建完成！"
echo "📁 构建产物位置: $(pwd)/dist"

# 检查构建产物
if [ -d "dist" ]; then
    echo "📊 构建产物大小:"
    du -sh dist
    echo "📋 构建产物内容:"
    ls -la dist/
else
    echo "❌ 构建失败：未找到 dist 目录"
    exit 1
fi

echo "🎉 后端构建成功完成！"