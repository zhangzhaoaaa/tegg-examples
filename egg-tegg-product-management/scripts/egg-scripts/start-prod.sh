#!/bin/bash

# 生产环境启动脚本
# 使用 egg-scripts 启动生产服务

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_message() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] $1${NC}"
}

print_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] $1${NC}"
}

# 进入项目根目录
cd "$(dirname "$0")/.."

print_message "启动生产环境..."

# 检查构建产物
if [ ! -d "dist" ]; then
    print_error "未找到构建产物，请先运行构建脚本"
    print_message "运行: ./scripts/build-backend.sh"
    exit 1
fi

# 参数解析
PORT=${1:-7001}
WORKERS=${2:-auto}
DAEMON=${3:-true}

# 检查端口
if lsof -i :$PORT >/dev/null 2>&1; then
    print_error "端口 $PORT 已被占用，请停止占用进程或选择其他端口"
    exit 1
fi

# 设置环境变量
export NODE_ENV=production
export EGG_SERVER_ENV=prod
export PORT=$PORT

print_message "环境: production"
print_message "端口: $PORT"
print_message "工作进程: $WORKERS"
print_message "后台运行: $DAEMON"

# 创建必要目录
mkdir -p run logs

# 启动服务
if command -v egg-scripts &> /dev/null; then
    EGG_SCRIPTS="egg-scripts"
else
    EGG_SCRIPTS="npx egg-scripts"
fi

if [ "$DAEMON" = "true" ]; then
    $EGG_SCRIPTS start --port=$PORT --env=prod --workers=$WORKERS --daemon
    
    # 等待启动
    sleep 3
    
    # 检查状态
    if [ -f "run/egg.pid" ] && kill -0 $(cat run/egg.pid) 2>/dev/null; then
        print_message "服务启动成功！"
        print_message "访问地址: http://localhost:$PORT"
        print_message "PID: $(cat run/egg.pid)"
        print_message "日志: $(pwd)/logs/"
    else
        print_error "服务启动失败，请检查日志"
        exit 1
    fi
else
    print_message "前台启动服务..."
    $EGG_SCRIPTS start --port=$PORT --env=prod --workers=$WORKERS
fi