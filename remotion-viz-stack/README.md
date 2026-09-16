# remotion-viz-stack

可視化スタックの役割（部品アイコン / 本編 Remotion / 周辺 Canva）を、チーム向けメタ図として 1 本の短い動画で説明する Remotion 第一稿です。

`remotion-request-flow/`・`remotion-tcp-handshake/`・`remotion-js-array-methods/` は触っていません。このディレクトリは別パッケージです。

## ライセンス（personal trial）

Remotion は個人・非営利・従業員 3 名以下の営利組織、および**商用利用前の評価**では無償で使えます。それ以外の営利組織では Company License が必要です。

本プロジェクトは **personal trial / 評価目的** です。利用条件の本文は [Remotion LICENSE](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) と [Terms](https://www.remotion.dev/docs/terms) を確認してください。

## 必要環境

- Node.js 18+
- npm

## インストール

```bash
cd remotion-viz-stack
npm install
```

## Studio（プレビュー）

```bash
cd remotion-viz-stack
npm run studio
```

`npm run dev` でも同じ Studio が起動します。Composition `VizStackRoles`（1920×1080 / 30fps）を開いてください。

## レンダー（MP4）

```bash
cd remotion-viz-stack
npm run render
```

成果物をリポジトリの `artifacts/` に直接出す場合:

```bash
npm run render:artifact
```

同等の直接コマンド:

```bash
npx remotion render VizStackRoles out/viz-stack-roles.mp4
```

Chrome のパスを明示する場合（Linux 例）:

```bash
npx remotion render VizStackRoles out/viz-stack-roles.mp4 --browser-executable=/usr/bin/google-chrome-stable
```

`out/` は gitignore 対象です。コミットする成果物は `artifacts/viz-stack-roles.mp4` です。

## Composition

| ID | 尺 | 解像度 | 内容 |
| --- | --- | --- | --- |
| `VizStackRoles` | ~25s（754 frames @ 30fps） | 1920×1080 | 3 層を順にリニアフォーカスし、流れと担当の境界を示す |

画面タイトル: **可視化スタックの役割**

補間はすべて線形です。各層へ短いリニアフォーカス → ホールド → 次の層、最後に全景へ戻します。

## 役割（画面上の 3 層）

1. **部品アイコン** — テキストなし SVG（Lucide など）。ラベルは SVG に焼き込まない。本編のノードへ置く
2. **本編 Remotion** — ラベル、キャプション、パス配線、発光、データフロー、カメラ（リニアフォーカス）、タイミング
3. **周辺 Canva** — SNS 静止画、軽いフェード、一括 / 静的。本編のあとの任意エクスポート

流れ: **部品 → 本編 Remotion → 周辺 Canva（任意）**。判断が必要なら **参謀** へ（脇注）。

## コード整理（本編とは別の注）

**コード整理は Remotion担当（Bot）** — 重複排除・共有モジュール。デザのビジュアルディレクションとは別です。

## 図解モーション分担

- 配線は Remotion のパス。Figma の分岐 / 合流バーは使わない
- アイコン SVG に文字を入れない。ラベル・キャプションは Remotion 側
- 第一稿は装飾より役割の切れ目が読めることを優先

## アイコン

テキストなし SVG（Lucide）。ラベルは Remotion 側で描画します。

| ファイル | 用途 |
| --- | --- |
| `public/icons/box.svg` | 部品アイコン層 |
| `public/icons/clapperboard.svg` | 本編 Remotion 層 |
| `public/icons/image.svg` | 周辺 Canva 層 |
| `public/icons/monitor.svg` / `server.svg` / `database.svg` | 部品の例（ノードへ配置） |
| `public/icons/share.svg` | SNS / 一括の例 |
| `public/icons/compass.svg` | 参謀（脇注） |
| `public/icons/bot.svg` | Remotion担当（Bot） |
| `public/icons/palette.svg` | デザ |

## ステータス

第一稿です。見やすさ優先、ポリッシュは後回し。成功グリーンは流れが揃ったあとの矢印にだけ使っています。
