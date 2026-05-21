#!/bin/bash

cd "$(dirname "$0")"

PORT=8765
URL="http://127.0.0.1:$PORT"
ARCH=$(uname -m)

# 优先使用零依赖的 Mac 原生启动器（自动识别架构）
if [ "$ARCH" = "arm64" ] && [ -x "offline-package/runtime/展厅服务-mac-arm64" ]; then
    echo "=========================================="
    echo "  正在启动神枢数字展厅（Apple Silicon）..."
    echo "=========================================="
    "offline-package/runtime/展厅服务-mac-arm64" &
    SERVER_PID=$!
elif [ "$ARCH" = "x86_64" ] && [ -x "offline-package/runtime/展厅服务-mac-x64" ]; then
    echo "=========================================="
    echo "  正在启动神枢数字展厅（Intel Mac）..."
    echo "=========================================="
    "offline-package/runtime/展厅服务-mac-x64" &
    SERVER_PID=$!
else
    # 未找到原生启动器，fallback 到 Node.js
    NODE_CMD=""
    if command -v node &> /dev/null; then
        NODE_CMD="node"
    elif [ -x "/usr/local/bin/node" ]; then
        NODE_CMD="/usr/local/bin/node"
    elif [ -x "/opt/homebrew/bin/node" ]; then
        NODE_CMD="/opt/homebrew/bin/node"
    elif [ -x "$HOME/.nvm/versions/node/*/bin/node" ] 2>/dev/null; then
        NODE_CMD=$(ls $HOME/.nvm/versions/node/*/bin/node 2>/dev/null | tail -1)
    fi

    if [ -n "$NODE_CMD" ]; then
        echo "=========================================="
        echo "  正在使用 Node.js 启动神枢数字展厅..."
        echo "=========================================="
        "$NODE_CMD" offline-package/runtime/server.cjs &
        SERVER_PID=$!
    else
        # Fallback：尝试 Python
        PYTHON_CMD=""
        if command -v python3 &> /dev/null; then
            PYTHON_CMD="python3"
        elif command -v python &> /dev/null; then
            PYTHON_CMD="python"
        fi

        if [ -n "$PYTHON_CMD" ]; then
            echo "=========================================="
            echo "  正在使用 Python 启动神枢数字展厅..."
            echo "=========================================="
            cd offline-package/dist && "$PYTHON_CMD" -m http.server $PORT &
            SERVER_PID=$!
            cd - > /dev/null
        else
            # 没有原生启动器、没有 Node 也没有 Python，弹窗提示
            DIALOG_RESULT=$(osascript -e 'display dialog "您的 Mac 尚未安装 Node.js 或 Python，无法启动展厅服务。\n\n建议安装 Node.js（推荐）：\nhttps://nodejs.org/zh-cn/\n\n安装完成后重新双击运行即可。" buttons {"前往下载", "取消"} default button "前往下载" with icon stop')
            if echo "$DIALOG_RESULT" | grep -q "前往下载"; then
                open "https://nodejs.org/zh-cn/"
            fi
            exit 1
        fi
    fi
fi

sleep 2

# 打开浏览器
if command -v open &> /dev/null; then
    open "$URL"
fi

echo ""
echo "=========================================="
echo "  神枢数字展厅已启动"
echo "  访问地址: $URL"
echo "  按 Ctrl+C 关闭服务"
echo "=========================================="
echo ""

# 捕获 Ctrl+C，优雅退出
trap 'echo ""; echo "正在关闭展厅服务..."; kill $SERVER_PID 2>/dev/null; exit 0' INT

wait $SERVER_PID
