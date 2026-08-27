# 実装計画

## 実装済み

- [x] Bun + TypeScript + WXT の初期設定
- [x] Oxlint、Oxfmt、Markdown lint、GitHub Actions の品質ゲート
- [x] Codex 用 `AGENTS.md`、`.agents/skills/`、`.codex/config.toml`
- [x] 基本設計と検証方針

## 完了

- [x] アイコン作成と manifest への組み込み
- [x] ページ上のコピー・ドラッグ・右クリックメニュー
- [x] popup の表示切替と位置リセット
- [x] 純粋ロジックの Bun テスト

## 完了条件

- [x] ページタイトルと URL が HTML ハイパーリンクとして貼り付けられる
- [x] 水色 → 緑 + チェック → 水色の状態遷移が確認できる
- [x] 位置をドラッグでき、viewport 外へ出ない
- [x] 右クリックから非表示にでき、popup から再表示できる
- [x] Chrome MV3 build が成功する
- [x] `bun run check` と GitHub Actions が成功する
