#!/bin/bash

# 使用 egg-scripts 启动服务脚本
# 适用于生产环境和开发环境

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
    echo "egg-scripts 启动脚本使用说明:"
    echo ""
    echo "用法: $0 [选项] [环境]"
    echo ""
    echo "环境:"
    echo "  dev       - 开发环境 (默认)"
    echo "  test      - 测试环境"
    echo "  prod      - 生产环境"
    echo ""
    echo "选项:"
    echo "  --port    - 指定端口号 (默认: 7001)"
    echo "  --workers - 指定工作进程数 (默认: auto)"
    echo "  --daemon  - 后台运行"
    echo "  --stop    - 停止服务"
    echo "  --restart - 重启服务"
    echo "  --status  - 查看服务状态"
    echo "  --logs    - 查看日志"
    echo "  --help    - 显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 dev --port 7001"
    echo "  $0 prod --workers 4 --daemon"
    echo "  $0 --stop"
    echo "  $0 --restart"
    echo "  $0 --logs"
}

# 检查 egg-scripts 是否安装
check_egg_scripts() {
    if ! command -v egg-scripts &> /dev/null; then
        print_warning "egg-scripts 未全局安装，尝试使用本地版本..."
        if [ ! -f "node_modules/.bin/egg-scripts" ]; then
            print_error "egg-scripts 未安装，请先安装: npm install egg-scripts"
            exit 1
        fi
        EGG_SCRIPTS="npx egg-scripts"
    else
        EGG_SCRIPTS="egg-scripts"
    fi
    print_message "使用 egg-scripts: $EGG_SCRIPTS"
}

# 获取进程 PID
get_pid() {
    if [ -f "run/egg.pid" ]; then
        cat run/egg.pid
    else
        echo ""
    fi
}

# 检查服务状态
check_status() {
    local pid=$(get_pid)
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
        print_message "服务正在运行 (PID: $pid)"
        return 0
    else
        print_message "服务未运行"
        return 1
    fi
}

# 停止服务
stop_service() {
    print_message "停止服务..."
    local pid=$(get_pid)
    
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
        print_message "正在停止进程 $pid..."
        $EGG_SCRIPTS stop
        
        # 等待进程停止
        local count=0
        while kill -0 "$pid" 2>/dev/null && [ $count -lt 30 ]; do
            sleep 1
            count=$((count + 1))
        done
        
        if kill -0 "$pid" 2>/dev/null; then
            print_warning "进程未正常停止，强制终止..."
            kill -9 "$pid"
        fi
        
        print_message "服务已停止"
    else
        print_message "服务未运行"
    fi
}

# 启动服务
start_service() {
    local env="$1"
    local port="$2"
    local workers="$3"
    local daemon="$4"
    
    print_message "启动服务..."
    print_message "环境: $env"
    print_message "端口: $port"
    print_message "工作进程数: $workers"
    print_message "后台运行: $daemon"
    
    # 检查端口是否被占用
    if lsof -i :$port >/dev/null 2>&1; then
        print_error "端口 $port 已被占用，请选择其他端口或停止占用进程"
        exit 1
    fi
    
    # 设置环境变量
    export EGG_SERVER_ENV="$env"
    export PORT="$port"
    
    # 构建启动命令
    local cmd="$EGG_SCRIPTS start"
    
    if [ "$workers" != "auto" ]; then
        cmd="$cmd --workers=$workers"
    fi
    
    if [ "$daemon" = "true" ]; then
        cmd="$cmd --daemon"
    fi
    
    cmd="$cmd --port=$port --env=$env"
    
    print_message "执行命令: $cmd"
    
    # 创建必要的目录
    mkdir -p run logs
    
    # 启动服务
    eval $cmd
    
    if [ "$daemon" = "true" ]; then
        # 等待服务启动
        sleep 3
        if check_status; then
            print_message "服务启动成功！"
            print_message "访问地址: http://localhost:$port"
            print_message "PID 文件: $(pwd)/run/egg.pid"
            print_message "日志目录: $(pwd)/logs"
        else
            print_error "服务启动失败，请检查日志"
            exit 1
        fi
    else
        print_message "服务启动成功！"
        print_message "访问地址: http://localhost:$port"
        print_message "按 Ctrl+C 停止服务"
    fi
}

# 重启服务
restart_service() {
    print_message "重启服务..."
    stop_service
    sleep 2
    start_service "$ENV" "$PORT" "$WORKERS" "$DAEMON"
}

# 查看日志
show_logs() {
    print_message "查看服务日志..."
    
    if [ -d "logs" ]; then
        echo "可用的日志文件:"
        ls -la logs/
        echo ""
        
        # 显示最新的错误日志
        if [ -f "logs/common-error.log" ]; then
            print_message "最新错误日志 (最后 50 行):"
            tail -n 50 logs/common-error.log
        fi
        
        echo ""
        
        # 显示最新的应用日志
        if [ -f "logs/egg-web.log" ]; then
            print_message "最新应用日志 (最后 50 行):"
            tail -n 50 logs/egg-web.log
        fi
        
        echo ""
        print_message "实时查看日志请使用: tail -f logs/egg-web.log"
    else
        print_warning "日志目录不存在"
    fi
}

# 主函数
main() {
    # 进入项目根目录
    cd "$(dirname "$0")/.."
    
    # 默认参数
    ENV="dev"
    PORT="7001"
    WORKERS="auto"
    DAEMON="false"
    ACTION="start"
    
    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            --port)
                PORT="$2"
                shift 2
                ;;
            --workers)
                WORKERS="$2"
                shift 2
                ;;
            --daemon)
                DAEMON="true"
                shift
                ;;
            --stop)
                ACTION="stop"
                shift
                ;;
            --restart)
                ACTION="restart"
                shift
                ;;
            --status)
                ACTION="status"
                shift
                ;;
            --logs)
                ACTION="logs"
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            dev|test|prod)
                ENV="$1"
                shift
                ;;
            *)
                print_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    print_message "egg-scripts 服务管理脚本"
    print_message "项目目录: $(pwd)"
    
    # 检查 egg-scripts
    check_egg_scripts
    
    # 根据操作执行相应的函数
    case $ACTION in
        start)
            # 检查服务是否已运行
            if check_status; then
                print_warning "服务已在运行，如需重启请使用 --restart 参数"
                exit 1
            fi
            start_service "$ENV" "$PORT" "$WORKERS" "$DAEMON"
            ;;
        stop)
            stop_service
            ;;
        restart)
            restart_service
            ;;
        status)
            check_status
            ;;
        logs)
            show_logs
            ;;
        *)
            print_error "不支持的操作: $ACTION"
            show_help
            exit 1
            ;;
    esac
}

# 信号处理
trap 'print_message "收到中断信号，正在停止服务..."; stop_service; exit 0' INT TERM

# 执行主函数
main "$@"