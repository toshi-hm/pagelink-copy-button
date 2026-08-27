# PageLink Copy Button

ページタイトルと URL を、クリックひとつでハイパーリンクとしてコピーできる Chrome 拡張機能です。

## セットアップ

現在は Chrome ウェブストア未公開のため、ビルドした拡張機能を Chrome に読み込んで使用します。

### 1. リポジトリを取得してビルド

Bun をインストールした環境で、次のコマンドを実行します。

```bash
git clone https://github.com/toshi-hm/pagelink-copy-button.git
cd pagelink-copy-button
bun install
bun run build
```

### 2. Chrome に読み込む

1. Chrome で `chrome://extensions` を開きます。
2. 右上の「デベロッパー モード」を有効にします。
3. 「パッケージ化されていない拡張機能を読み込む」をクリックします。
4. リポジトリ内の `.output/chrome-mv3` フォルダーを選択します。

## 使い方

### ページリンクをコピーする

ページを開くと、右下に水色のボタンが表示されます。ボタンを押すと、ページタイトルを表示文字列にしたリンクがクリップボードへコピーされます。

コピーに成功するとボタンが緑色になり、チェックマークが表示されます。しばらくすると水色へ戻ります。

### ボタンを移動する

ボタンをドラッグすると好きな位置へ移動できます。ボタンは画面外へ出ないように配置され、位置は保存されます。

### 右クリックメニューを使う

ページ上の任意の場所で通常の右クリックをすると、次の項目を選べます。

- 「ページリンクをコピー」: 現在のページのタイトルと URL をコピー
- 「PageLink ボタンを表示」: ページ上のボタンを表示
- 「PageLink ボタンを非表示」: ページ上のボタンを非表示

右上の拡張機能アイコンから popup を開くと、ボタンの表示・非表示の切り替えと位置のリセットもできます。

## 注意事項

`chrome://` ページ、Chrome ウェブストア、その他のブラウザ保護ページでは Chrome の制限によりボタンを表示できません。

<details>
<summary>開発者向け情報</summary>

## 開発環境

- Bun
- TypeScript
- WXT
- Oxlint / Oxfmt
- markdownlint-cli2

## 開発コマンド

依存関係をインストールします。

```bash
bun install
```

開発モードを起動します。

```bash
bun run dev
```

品質ゲート（整形、lint、テスト、型検査、Chrome MV3 ビルド）を実行します。

```bash
bun run check
```

Chrome 用の本番ビルドを作成します。

```bash
bun run build
```

生成された `.output/chrome-mv3` を Chrome の「パッケージ化されていない拡張機能を読み込む」から指定してください。ソースを変更した場合は再ビルド後、拡張機能の再読み込みが必要です。

設計は [`docs/design.md`](docs/design.md)、進捗は [`PLANS.md`](PLANS.md)、エージェント向けの規約は [`AGENTS.md`](AGENTS.md) を参照してください。

</details>
