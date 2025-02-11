import http.server
import socketserver
import socket

def find_free_port(start_port=8001):
    """找到一个可用的端口"""
    port = start_port
    max_port = start_port + 100  # 最多尝试100个端口
    
    while port < max_port:
        try:
            # 尝试创建一个测试socket
            test_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            test_socket.bind(('', port))
            test_socket.close()
            return port
        except OSError:
            port += 1
    raise RuntimeError("无法找到可用的端口")

# 设置处理程序
Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map.update({
    '.js': 'application/javascript',
})

try:
    # 找到可用端口
    PORT = find_free_port()
    print(f"启动服务器在: http://localhost:{PORT}")
    print("按 Ctrl+C 可以停止服务器")
    
    # 创建服务器并启动
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\n服务器已停止")
except Exception as e:
    print(f"启动服务器时出错: {e}")
