# PageLink Copy Button 設計

## 目的

閲覧中のページタイトルと URL を、HTML のハイパーリンクとしてクリップボードへコピーする。ページを離れずに操作できるフローティングボタンを提供し、位置と表示状態を利用者が調整できるようにする。

## 対象範囲

### 対応する挙動

1. Content script がページ内にフローティングボタンを一つだけ表示する。
2. 初期位置は画面右下（右 24px、下 24px）とする。
3. 左クリックで `document.title` と `location.href` を取得し、次の二種類を同時にコピーする。
   - `text/html`: URL を `href`、タイトルを表示文字列にした `<a>` 要素
   - `text/plain`: `タイトル (URL)`
4. コピー成功時は水色のボタンを緑色へ変え、チェックマークを表示する。1.5 秒後に通常状態へ戻す。
5. ポインター操作でボタンをドラッグできる。位置は viewport 内に収め、`chrome.storage.local` に保存する。
6. ページ上の任意位置で通常の Chrome 右クリックメニューを開くと、「ページリンクをコピー」「PageLink ボタンを表示」「PageLink ボタンを非表示」を選択できる。
7. 非表示状態は拡張機能の popup から再表示できる。popup には表示切替と位置リセットを置く。

### 対応しない挙動

- ページ本文の編集や URL の書き換え
- 履歴、ブックマーク、外部サーバーへの送信
- `chrome://`、`edge://`、拡張機能ページなど content script を実行できないページへの無理な注入

## 構成

```text
entrypoints/
├── background.ts       # MV3 service worker の入口
├── content.ts          # ページ上の UI とイベント
└── popup/              # 表示設定と位置リセット
src/
├── copy-link.ts        # クリップボード用データ生成
├── position.ts         # 座標の clamp と保存モデル
└── storage.ts          # chrome.storage.local の型付きラッパー
public/
└── icon-*.png          # 拡張機能アイコン
tests/
└── *.test.ts           # Bun で実行する純粋ロジックのテスト
```

Content script の UI は Shadow DOM に入れて、対象ページの CSS と拡張機能の CSS が互いに影響しないようにする。Chrome の通常コンテキストメニューは background service worker の `contextMenus` API で登録し、選択結果を content script へメッセージで伝える。保存値は次の単一キーにまとめ、将来の拡張で後方互換性を保つ。

```ts
type Settings = {
  visible: boolean;
  position: { x: number; y: number } | null;
};
```

## イベントと状態

```text
idle (水色)
  ├─ click ──> copying ──成功──> copied (緑 + check) ──1.5s──> idle
  │                       └─失敗──> error (赤) ──1.5s──> idle
  ├─ pointerdown/move ──> dragging ──pointerup──> idle
  └─ contextmenu ──> Chrome 標準メニュー ──hide──> hidden
```

ドラッグ開始後は移動量が一定以上になるまでクリックを予約し、ドラッグ終了時の `click` でコピーが発火しないようにする。キーボード利用時は `button` 要素として Enter と Space でコピーし、右クリック相当の設定操作は popup でも到達できるようにする。

## セキュリティとアクセシビリティ

- `href` と表示文字列は HTML エスケープしてから HTML クリップボードへ渡す。
- ページの URL とタイトル以外を読み取らず、権限は `clipboardWrite` と storage に限定する。
- ボタンには日本語の accessible name、`aria-live` の成功通知、十分なコントラストを設定する。
- `prefers-reduced-motion` が有効な場合は色変化やメニューのアニメーションを短縮する。

## 検証方針

- 純粋ロジック: HTML エスケープ、クリップボード payload、viewport clamp、設定の既定値を Bun test で検証する。
- ビルド: `bun run check` で整形、lint、Markdown lint、型検査、Chrome MV3 build を実行する。
- 手動確認: 通常ページ、長いタイトル、特殊文字を含むページ、狭い viewport、ドラッグ、右クリック非表示、popup 再表示を確認する。

## 判断記録

- 「ハイパーテキスト」は rich text として貼り付けられる `text/html` を正とし、アプリが HTML を扱えない場合にも情報を失わないよう `text/plain` を併記する。
- ボタンの位置と表示状態はサイト単位ではなく拡張機能全体の設定として保存する。ページごとに状態を変える必要がある場合は、後続で hostname 単位の設定へ移行できる形にする。
