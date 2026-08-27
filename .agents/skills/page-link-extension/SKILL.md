---
name: page-link-extension
description: PageLink Copy Button の設計・実装・検証ルール
---

# PageLink Copy Button Skill

## 実装ルール

- URL とタイトルは現在表示中のタブから取得する。
- コピー形式は HTML の `<a href="...">...</a>` とし、プレーンテキストも同時に扱えるようにする。
- クリップボード権限や `navigator.clipboard` の失敗を UI に反映する。
- ボタン位置、非表示設定、成功表示のタイマーはページ単位で予期せず失われないように設計する。
- ドラッグ中はクリックによるコピーを発火させず、右クリックメニューはブラウザ標準メニューを遮らない形で実装する。

## 検証

1. `bun run check`
2. Chrome の開発者モードで `.output/chrome-mv3` を読み込む。
3. コピー形式、ドラッグ、右クリック、再表示、複数ページでの分離を確認する。
