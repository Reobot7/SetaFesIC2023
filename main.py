import socket
import time
import json
import sys

# NFCが利用可能かどうかをチェック
try:
    import nfc
    NFC_ENABLED = True
    print("テストモード: NFCリーダが接続されています。")
except:
    NFC_ENABLED = False
    print("テストモード: NFCリーダが接続されていません。ダミーデータを使用します。")

HOST, PORT = 'localhost', 65432

def connect_socket():
    """Socket接続を確立し、接続済みのsocketを返します"""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    while True:
        try:
            s.connect((HOST, PORT))
            print("Socket connection established.")
            return s
        except socket.error:
            print("Failed to establish socket connection. Retrying in 2 seconds...")
            time.sleep(2)

def send_data_via_socket(sock, data):
    try:
        sock.sendall(json.dumps(data).encode())
    except socket.error:
        print("Socket connection lost. Reconnecting...")
        sock = connect_socket()
        send_data_via_socket(sock, data)

def read_from_nfc(sock):
    with nfc.ContactlessFrontend('usb') as clf:
        while True:
            target = clf.sense(nfc.clf.RemoteTarget('106A'))
            if target:
                tag = nfc.tag.activate(clf, target)
                tag_id = str(tag).split('=')[1]
                send_data_via_socket(sock, {"data": tag_id})
                time.sleep(1)

def dummy_data_generator(sock):
    dummy_ids = ["DUMMY_001", "DUMMY_002", "DUMMY_003"]
    index = 0
    while True:
        send_data_via_socket(sock, {"data": dummy_ids[index]})
        index = (index + 1) % len(dummy_ids)
        time.sleep(5)

def main():
    sock = connect_socket()
    try:
        if NFC_ENABLED:
            read_from_nfc(sock)
        else:
            dummy_data_generator(sock)
    finally:
        sock.close()

if __name__ == "__main__":
    main()