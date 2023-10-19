#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
import signal
import nfc
import json
from websocket_server import WebsocketServer
import re
import threading
import time

from enum import Enum, auto

class NFCState(Enum):
    STOPPED = auto()
    STARTED = auto()
    
nfc_state = NFCState.STOPPED  # NFCの初期状態をSTOPPEDとして設定

def on_startup(targets):
    return targets

def on_connect(tag):
    print("Tag: {}".format(tag))
    print("Tag type: {}".format(tag.type))

def on_release(tag):
    if tag.ndef:
        print(tag.ndef.message.pretty())

def send_dummy_data(server):
    dummy_data = {"command": "detect", "message": "DUMMY_ID", "data_flag": "True"}
    d = json.dumps(dummy_data, ensure_ascii=False, indent=2)
    for client in server.clients:
        server.send_message(client, d)
        print(f"Sent dummy data to client {client['id']}: {d}")

def readNFC(server):
    global nfc_state
    try:
        with nfc.ContactlessFrontend('usb') as clf:  
            while True:
                if nfc_state == NFCState.STARTED:
                    tag = clf.connect(rdwr={
                        'on-startup': on_startup,
                        'on-connect': on_connect,
                        'on-release': on_release,
                        'targets': ['106A', '106B', '212F', '424F'],
                        'iterations': 1,  # 試行回数を1回に設定
                        'interval': 0.1,  # インターバルを0.1秒に設定
                    })

                    if tag:
                        ID_tmp = str(tag).find("ID=")
                        ID_tmp1 = str(tag)[ID_tmp+len("ID="):]
                        ID_arr = re.split("[= ]", str(ID_tmp1))
                        message = str(ID_arr[0])

                        print(f"Detected NFC ID: {message}")

                        data = {"type": "nfc_data", "data": message}
                        d = json.dumps(data, ensure_ascii=False, indent=2)

                        for client in server.clients:
                            server.send_message(client, d)
                            print(f"Sent message to client {client['id']}: {d}")

                        nfc_state = NFCState.STOPPED  # ここで状態をSTOPPEDに変更

                    time.sleep(0.1)
                else:
                    time.sleep(1)  # 状態がSTOPPEDの場合は、1秒待機する
    except nfc.UnsupportedTargetError:
        print("Pasori is not connected. Sending dummy data...")
        send_dummy_data(server)

def handle_message(client, server, message):
    global nfc_state
    data = json.loads(message)
    print(f"Received message: {message}")  # 追加: 受信したメッセージを表示
    if "command" in data:
        if data["command"] == "start_nfc":
            nfc_state = NFCState.STARTED
            print("NFC state set to STARTED")  # 追加: 状態変更を表示
        elif data["command"] == "stop_nfc":
            nfc_state = NFCState.STOPPED
            print("NFC state set to STOPPED")  # 追加: 状態変更を表示

def new_client(client, server):
    print(f"New client connected: {client['id']}")
    
def close_resources(server, clf):
    """クリーンアップ用の関数"""
    print("Closing resources...")
    if server:
        # WebSocketサーバを停止
        server.server_close()
        print("WebSocket server closed.")
    if clf:
        # NFCデバイスとの接続を閉じる
        clf.close()
        print("NFC device connection closed.")

def main():
    server = WebsocketServer(port=8765, host="127.0.0.1")
    server.set_fn_new_client(new_client)
    server.set_fn_message_received(handle_message)  # 追加

    # Start the NFC reading in a separate thread
    threading.Thread(target=readNFC, args=(server,)).start()

    server.run_forever()


def handler(signal, frame):
    print("Process Interrupt!")
    sys.exit(0)

if __name__ == '__main__':
    signal.signal(signal.SIGINT, handler)
    signal.signal(signal.SIGTERM, handler)
    main()
