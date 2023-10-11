#!/usr/bin/env python
# -*- coding: utf-8 -*-
import time
import json
from websocket import WebSocketApp, WebSocketConnectionClosedException

# NFCが利用可能かどうかをチェック
try:
    import nfc
    with nfc.ContactlessFrontend('usb') as clf:
        NFC_ENABLED = True
    print("テストモード: NFCリーダが接続されています。")
except:
    NFC_ENABLED = False
    print("テストモード: NFCリーダが接続されていません。ダミーデータを使用します。")

# グローバル変数で状態を管理
current_state = "waiting"

def on_message(ws, message):
    global current_state
    data = json.loads(message)
    if "state" in data:
        current_state = data["state"]

def read_from_nfc():
    with nfc.ContactlessFrontend('usb') as clf:
        while True:
            if current_state == "waiting":
                target = clf.sense(nfc.clf.RemoteTarget('106A'))
                if target:
                    tag = nfc.tag.activate(clf, target)
                    tag_id = str(tag).split('=')[1]
                    yield tag_id
                else:
                    time.sleep(1)

def dummy_data_generator():
    dummy_ids = ["DUMMY_001", "DUMMY_002", "DUMMY_003"]
    index = 0
    while True:
        if current_state == "waiting":
            yield dummy_ids[index]
            index = (index + 1) % len(dummy_ids)
            time.sleep(5)
        else:
            time.sleep(1)

def send_data_via_websocket(ws, tag):
    message = {
        "command": "detect",
        "data": tag
    }
    ws.send(json.dumps(message))

def main():
    while True:
        ws = WebSocketApp("ws://127.0.0.1:3000/",
                          on_message=on_message)

        if NFC_ENABLED:
            data_source = read_from_nfc()
        else:
            data_source = dummy_data_generator()

        for tag in data_source:
            try:
                send_data_via_websocket(ws, tag)
                time.sleep(1)
            except WebSocketConnectionClosedException:
                print("Connection closed unexpectedly. Reconnecting in 2 seconds...")
                time.sleep(2)
                break

        ws.close()

if __name__ == "__main__":
    main()