#!/bin/bash

# 开发环境快速启动脚本
# 使用 egg-scripts 启动开发服务

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_message() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] $1${NC}"
}

# 进入项目根目录
cd "$(dirname "$0")/.."

print_message "启动开发环境..."

# 检查端口
PORT=${1:-7001}
if lsof -i :$PORT >/dev/null 2>&1; then
    print_warning "端口 $PORT 已被占用，尝试使用端口 7002"
    PORT=7002
fi

# 设置环境变量
export NODE_ENV=development
export EGG_SERVER_ENV=local
export PORT=$PORT

print_message "环境: development"
print_message "端口: $PORT"
print_message "访问地址: http://localhost:$PORT"

# 启动服务
if command -v egg-scripts &> /dev/null; then
    egg-scripts start --port=$PORT --env=local
else
    npx egg-scripts start --port=$PORT --env=local
fi