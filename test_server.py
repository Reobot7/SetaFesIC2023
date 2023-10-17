import socket

def main():
    host = '127.0.0.1'  # localhost
    port = 65432  # ポート番号

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((host, port))
        s.listen()
        print(f"Listening on {host}:{port}")
        conn, addr = s.accept()
        with conn:
            print('Connected by', addr)
            conn.sendall(b'Hello from server!')

if __name__ == '__main__':
    main()