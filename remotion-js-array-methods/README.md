# remotion-js-array-methods

JavaScript の配列メソッド 8 個を、参照チートシートの絵文字列のまま、**1メソッドずつ**直線カメラで寄って説明する Remotion ドラフトです。説明文は Remotion のテキスト（日本語キャプション）で重ねています。

`remotion-request-flow/` と `remotion-tcp-handshake/` は触っていません。このディレクトリは別パッケージです。

参照した並び（入力 → メソッド → 結果）:

1. `map` — 🐕🐕🐕🐕 `.map(🐕 => 🐶)` => 🐶🐶🐶🐶
2. `filter` — 🐕🐶🐕🐕 `.filter(🐶)` => 🐶
3. `every` — 🐕🐕🐶🐕 `.every(🐕)` => false
4. `some` — 🐕🐶🐶🐕 `.some(🐶)` => true
5. `fill` — 🐕🐕🐕🐕 `.fill(🐶, 1)` => 🐕🐶🐶🐶
6. `findIndex` — 🐕🐕🐶🐕 `.findIndex(el => el === 🐶)` => 2
7. `find` — 🐕🐶🐕🐕 `.find(🐶)` => 🐶
8. `reduce` — 🥒🍅🥞🧀 `.reduce((acc, cur) => acc + cur)` => 🍔

## ライセンス（personal trial）

Remotion は個人・非営利・従業員 3 名以下の営利組織、および**商用利用前の評価**では無償で使えます。それ以外の営利組織では Company License が必要です。

本プロジェクトは **personal trial / 評価目的** です。利用条件の本文は [Remotion LICENSE](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) と [Terms](https://www.remotion.dev/docs/terms) を確認してください。

絵文字グラフィックは [Twemoji](https://github.com/twitter/twemoji)（CC-BY 4.0）です。

## 必要環境

- Node.js 18+
- npm

## インストール

```bash
cd remotion-js-array-methods
npm install
```

## Studio（プレビュー）

```bash
cd remotion-js-array-methods
npm run studio
```

`npm run dev` でも同じ Studio が起動します。Composition `JsArrayMethods`（1920×1080 / 30fps）を開いてください。

## レンダー（MP4）

```bash
cd remotion-js-array-methods
npm run render
```

成果物をリポジトリの `artifacts/` に直接出す場合:

```bash
npm run render:artifact
```

同等の直接コマンド:

```bash
npx remotion render JsArrayMethods out/js-array-methods.mp4
```

Chrome のパスを明示する場合（Linux 例）:

```bash
npx remotion render JsArrayMethods out/js-array-methods.mp4 --browser-executable=/usr/bin/google-chrome-stable
```

`out/` は gitignore 対象です。コミットする成果物は `artifacts/js-array-methods.mp4` です。

## Composition

| ID | 尺 | 解像度 | 内容 |
| --- | --- | --- | --- |
| `JsArrayMethods` | 135s（4050 frames @ 30fps） | 1920×1080 | 冒頭の全体俯瞰 → 8 メソッドを各 16 秒で直線ズーム/パン → 全体に戻す。カメラ補間は線形 |

各メソッドは同じビートです。

1. 直線カメラでその行にフォーカス
2. 入力配列を大きく見せる
3. 操作の動き（変換・残す・検査・埋め・検索・畳み込み）
4. 日本語キャプション（Remotion テキスト）
5. `=>` のあとに結果を短くホールドして次へ

## ステータス

1メソッドずつの解説に切り替えた改稿です。8行シートの同時表示は冒頭/末尾の俯瞰のみです。失敗パスやインタラクティブな Studio 操作は未実装です。
