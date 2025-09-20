#!/bin/bash

# 部署脚本
# 支持本地部署、Docker部署和生产环境部署

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

print_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# 显示帮助信息
show_help() {
    echo "部署脚本使用说明:"
    echo ""
    echo "用法: $0 [选项] [部署类型]"
    echo ""
    echo "部署类型:"
    echo "  local     - 本地开发部署"
    echo "  docker    - Docker 容器部署"
    echo "  prod      - 生产环境部署"
    echo ""
    echo "选项:"
    echo "  --clean   - 清理旧的构建产物和依赖"
    echo "  --build   - 重新构建应用"
    echo "  --help    - 显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 local --clean --build"
    echo "  $0 docker"
    echo "  $0 prod --build"
}

# 检查依赖
check_dependencies() {
    print_message "检查系统依赖..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    
    # 检查 Docker（如果需要）
    if [ "$DEPLOY_TYPE" = "docker" ] && ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    # 检查 Docker Compose（如果需要）
    if [ "$DEPLOY_TYPE" = "docker" ] && ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    print_message "依赖检查完成"
}

# 本地部署
deploy_local() {
    print_message "开始本地部署..."
    
    # 构建后端
    if [ "$BUILD_FLAG" = "true" ]; then
        print_message "构建后端应用..."
        ./scripts/build-backend.sh $CLEAN_FLAG
    fi
    
    # 构建前端
    if [ "$BUILD_FLAG" = "true" ]; then
        print_message "构建前端应用..."
        ./scripts/build-frontend.sh $CLEAN_FLAG
    fi
    
    # 启动数据库（如果需要）
    print_message "检查数据库连接..."
    # 这里可以添加数据库初始化逻辑
    
    # 启动后端服务
    print_message "启动后端服务..."
    npm run start &
    BACKEND_PID=$!
    
    # 等待后端启动
    sleep 5
    
    # 启动前端服务（开发模式）
    print_message "启动前端服务..."
    cd web
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    print_message "本地部署完成！"
    print_message "后端服务: http://localhost:7001"
    print_message "前端服务: http://localhost:8000"
    print_message "按 Ctrl+C 停止服务"
    
    # 等待用户中断
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
    wait
}

# Docker 部署
deploy_docker() {
    print_message "开始 Docker 部署..."
    
    # 停止现有容器
    print_message "停止现有容器..."
    docker-compose down || true
    
    # 清理旧镜像（如果需要）
    if [ "$CLEAN_FLAG" = "--clean" ]; then
        print_message "清理旧镜像..."
        docker-compose down --rmi all --volumes --remove-orphans || true
    fi
    
    # 构建并启动服务
    if [ "$BUILD_FLAG" = "true" ]; then
        print_message "构建并启动服务..."
        docker-compose up --build -d
    else
        print_message "启动服务..."
        docker-compose up -d
    fi
    
    # 等待服务启动
    print_message "等待服务启动..."
    sleep 10
    
    # 检查服务状态
    print_message "检查服务状态..."
    docker-compose ps
    
    print_message "Docker 部署完成！"
    print_message "应用访问地址: http://localhost"
    print_message "后端 API: http://localhost:7001"
    print_message "数据库: localhost:5432"
    
    # 显示日志
    print_message "显示服务日志（按 Ctrl+C 退出）:"
    docker-compose logs -f
}

# 生产环境部署
deploy_prod() {
    print_message "开始生产环境部署..."
    
    # 设置生产环境变量
    export NODE_ENV=production
    export EGG_SERVER_ENV=prod
    
    # 构建应用
    if [ "$BUILD_FLAG" = "true" ]; then
        print_message "构建生产版本..."
        ./scripts/build-backend.sh $CLEAN_FLAG
        ./scripts/build-frontend.sh $CLEAN_FLAG
    fi
    
    # 数据库迁移（如果需要）
    print_message "执行数据库迁移..."
    # npm run migrate || true
    
    # 启动生产服务
    print_message "启动生产服务..."
    
    # 使用 PM2 管理进程（如果安装了）
    if command -v pm2 &> /dev/null; then
        print_message "使用 PM2 启动服务..."
        pm2 start ecosystem.config.js --env production
        pm2 save
    else
        print_warning "PM2 未安装，使用普通方式启动"
        npm run start
    fi
    
    print_message "生产环境部署完成！"
}

# 主函数
main() {
    # 进入项目根目录
    cd "$(dirname "$0")/.."
    
    # 解析参数
    DEPLOY_TYPE=""
    CLEAN_FLAG=""
    BUILD_FLAG="false"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --clean)
                CLEAN_FLAG="--clean"
                shift
                ;;
            --build)
                BUILD_FLAG="true"
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            local|docker|prod)
                DEPLOY_TYPE="$1"
                shift
                ;;
            *)
                print_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 如果没有指定部署类型，默认为 local
    if [ -z "$DEPLOY_TYPE" ]; then
        DEPLOY_TYPE="local"
    fi
    
    print_message "部署类型: $DEPLOY_TYPE"
    print_message "清理标志: ${CLEAN_FLAG:-无}"
    print_message "构建标志: $BUILD_FLAG"
    
    # 检查依赖
    check_dependencies
    
    # 根据部署类型执行相应的部署函数
    case $DEPLOY_TYPE in
        local)
            deploy_local
            ;;
        docker)
            deploy_docker
            ;;
        prod)
            deploy_prod
            ;;
        *)
            print_error "不支持的部署类型: $DEPLOY_TYPE"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"