# SetaFesIC2023


## 概要

このプロジェクトは、NFC カードを利用して特定の位置情報を検証し、Firestore に記録するアプリケーションです。WebSocket を用いてリアルタイムのデータ通信を行い、React.js でフロントエンドが構築されています。

### 機能

- NFC カード読取
- ユーザー位置情報の確認
- Firestore へのデータ保存
- リアルタイム通信による状態管理

### 技術スタック

- React.js
- Firebase (Firestore, Authentication)
- WebSocket
- nfcpy

## 開始方法

これらの指示に従って、開発環境でプロジェクトを動かす方法を記述します。

### 必要条件

例：
node.js
npm
WebSocket サーバー
Firebase プロジェクト

### インストール

リポジトリをクローンします。
''' git clone https://yourrepository.com/yourproject.git '''

依存関係をインストールします。
''' npm install '''

ローカル開発サーバーを起動します。(本番，本番模擬テストでは Firebase にデプロイが必要)

''' npm start '''

## 使い方

アプリケーションの主要な機能とそれらをどのように使用するかについての詳細なガイドです。

1. 「設定」ページから位置情報を選択します。
2. NFC カードリーダーを使用してカードの ID を読み取ります。
3. WebSocket を介して読み取ったデータがバックエンドサーバーに送信されます。
4. サーバーは Firebase を使用して読み取りデータを処理し、Firestore に記録します。
5. 「結果確認」ページで、NFC 読み取り結果を確認できます。各建物に対応した OK の数と総合結果が表示されます。

### ページ概要

- **設定画面 (`/settings`)**: ユーザーはここで自分の位置情報（1 号館、72B 教室など）を選択します。
- **待機画面 (`/waiting`)**: NFC カードの読み取りを待機している状態の画面です。WebSocket を通じてサーバーからのデータを待ちます。
- **結果ローディング画面 (`/loading`)**: NFC 読み取り後、結果がロードされる間に表示される画面です。
- **結果確認画面 (`/result`)**: 個々の NFC タグの検証結果を確認する画面です。

## コンポーネント構造

ここでは、主要な React コンポーネントの構造と役割について説明します。

- `App`: ルーティングと全体の状態管理を行います。
- `Header`: 全てのページに共通のヘッダーコンポーネントです。
- `Settings`: 位置情報を設定するためのコンポーネントです。
- `WaitingScreen`: NFC の読み取りを待つ画面を表示するコンポーネントです。
- `ResultScreen`: NFC 読み取りの結果を表示するコンポーネントです。

## データフロー

アプリケーションのデータフローの説明を記述します。WebSocket を介したメッセージングの流れ、Firebase とのインタラクション、状態管理のロジックについて説明します。

## 開発とデプロイメント

開発者がローカルでの開発や本番環境へのデプロイメントを行うためのガイドラインです。

### ローカル開発

ローカル環境での開発手順について説明します。

### デプロイメント

本番環境へのデプロイプロセスについての手順を説明します。

## ライセンス

プロジェクトのライセンス情報を記述します。該当するライセンスがあれば、その全文をファイルに含めるか、ライセンスの要約と共にリンクを提供します。

## 著者

Reo Himiya (1st version)

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# web

https://setafesic2023.web.app/

# 開発用環境

## Python

## Javascript

# 実行環境

## Python

`pip install nfcpy websocket-server`

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
