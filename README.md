# Simple Task App

ブラウザーの `localStorage` にデータを保存する、依存関係の小さいタスク管理アプリです。

## 開発

```bash
npm install
npm run dev
```

## コマンド

- `npm run build` — TypeScript の検査と本番ビルド
- `npm test` — ユニットテスト
- `npm run dev` — 開発サーバー

## 構成

- `src/domain` — タスクの型とドメインエラー
- `src/application` — UI から利用するタスク操作 API
- `src/infrastructure` — `localStorage` 永続化実装
- `src/ui` — DOM の描画とイベント処理

永続化は `TaskRepository` インターフェース越しに利用するため、UI やユースケースを変更せずに別の保存先へ差し替えられます。
