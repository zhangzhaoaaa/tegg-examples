#!/bin/bash

# PM2 启动脚本
# 用于使用 PM2 进程管理器启动 Egg.js 应用

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取脚本所在目录的父目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo -e "${BLUE}PM2 启动脚本${NC}"
echo "项目根目录: $PROJECT_ROOT"

# 进入项目根目录
cd "$PROJECT_ROOT"

# 检查 PM2 是否已安装
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}错误: PM2 未安装${NC}"
    echo "请运行: npm install -g pm2"
    exit 1
fi

# 检查 ecosystem.config.js 是否存在
if [ ! -f "scripts/pm2/ecosystem.config.js" ]; then
    echo -e "${RED}错误: ecosystem.config.js 文件不存在${NC}"
    exit 1
fi

# 解析命令行参数
ACTION=${1:-start}
ENV=${2:-production}

case $ACTION in
    start)
        echo -e "${GREEN}启动应用 (环境: $ENV)${NC}"
        pm2 start scripts/pm2/ecosystem.config.js --env $ENV
        ;;
    stop)
        echo -e "${YELLOW}停止应用${NC}"
        pm2 stop scripts/pm2/ecosystem.config.js
        ;;
    restart)
        echo -e "${YELLOW}重启应用 (环境: $ENV)${NC}"
        pm2 restart scripts/pm2/ecosystem.config.js --env $ENV
        ;;
    reload)
        echo -e "${YELLOW}重载应用 (零停机时间)${NC}"
        pm2 reload scripts/pm2/ecosystem.config.js
        ;;
    delete)
        echo -e "${RED}删除应用${NC}"
        pm2 delete scripts/pm2/ecosystem.config.js
        ;;
    status)
        echo -e "${BLUE}应用状态${NC}"
        pm2 status
        ;;
    logs)
        echo -e "${BLUE}查看日志${NC}"
        pm2 logs
        ;;
    monit)
        echo -e "${BLUE}监控面板${NC}"
        pm2 monit
        ;;
    *)
        echo -e "${RED}未知操作: $ACTION${NC}"
        echo "用法: $0 {start|stop|restart|reload|delete|status|logs|monit} [environment]"
        echo "环境选项: development, production (默认: production)"
        exit 1
        ;;
esac

echo -e "${GREEN}操作完成${NC}"