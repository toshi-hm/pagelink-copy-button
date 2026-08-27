# Repository Guidelines

## 目的

このリポジトリは、ページタイトルと URL をハイパーリンクとしてコピーする Chrome 拡張機能を Bun、TypeScript、WXT で開発します。

## 構成

- `entrypoints/`: WXT の background、content script、popup などの入口
- `src/`: 共有ロジック、UI、型定義
- `public/`: 拡張機能の静的アセット
- `docs/`: 設計と仕様
- `.github/workflows/`: CI

## 開発コマンド

- `bun install`: 依存関係をインストール
- `bun run dev`: Chrome 向け開発モード
- `bun run build`: Chrome 向け本番ビルド
- `bun run format`: Oxfmt で整形
- `bun run format:check`: Oxfmt の差分検査
- `bun run lint`: Oxlint の検査
- `bun run lint:markdown`: Markdown の検査
- `bun run typecheck`: TypeScript の型検査
- `bun run check`: 上記の品質ゲートとビルド

## 実装規約

2 スペース、シングルクォート、セミコロンありを基本とし、整形は Oxfmt に委ねます。ブラウザ API は WXT の型と `browser` API を利用し、`any` は使用しません。ページ上に表示する UI は content script、拡張機能設定や権限は WXT の設定に分離します。

## 変更手順

作業単位ごとに `codex/` 接頭辞のブランチ、短い日本語のコミットメッセージ、Draft PR を作成します。PR には目的、設計上の判断、検証コマンド、未対応事項を記載します。生成物（`.output/`、`.wxt/`）はコミットしません。

## 完了条件

変更前後の挙動を確認し、`bun run check` が成功していることを確認します。UI 変更時は Chrome の実機または Playwright 等で、ドラッグ、右クリック、コピー成功状態、レスポンシブ表示を確認します。
