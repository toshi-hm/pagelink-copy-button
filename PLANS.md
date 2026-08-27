# 実装計画

## 完了

- [x] Bun + TypeScript + WXT の初期設定
- [x] Oxlint、Oxfmt、Markdown lint、GitHub Actions の品質ゲート
- [x] Codex 用 `AGENTS.md`、`.agents/skills/`、`.codex/config.toml`
- [x] 基本設計と検証方針

## 進行中

- [x] アイコン作成と manifest への組み込み
- [x] ページ上のコピー・ドラッグ・右クリックメニュー
- [x] popup の表示切替と位置リセット
- [x] 純粋ロジックの Bun テスト

## 完了条件

- [ ] ページタイトルと URL が HTML ハイパーリンクとして貼り付けられる
- [ ] 水色 → 緑 + チェック → 水色の状態遷移が確認できる
- [ ] 位置をドラッグでき、viewport 外へ出ない
- [ ] 右クリックから非表示にでき、popup から再表示できる
- [ ] Chrome MV3 build が成功する
- [ ] `bun run check` と GitHub Actions が成功する
