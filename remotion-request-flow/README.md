# remotion-request-flow

リクエストがサーバに届く流れ（Client → LB → App → DB）を、ByteByteGo 風のシンプルなボックスと矢印で説明する Remotion プロトタイプです。

このディレクトリは個人利用の試作（personal trial）です。リポジトリ直下の既存アプリには依存しません。

## ライセンス（personal trial）

Remotion は個人・非営利・従業員 3 名以下の営利組織、および**商用利用前の評価**では無償で使えます。それ以外の営利組織では Company License が必要です。

本プロジェクトは **personal trial / 評価目的** です。利用条件の本文は [Remotion LICENSE](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) と [Terms](https://www.remotion.dev/docs/terms) を確認してください。

## 必要環境

- Node.js 18+
- npm

## インストール

```bash
cd remotion-request-flow
npm install
```

## Studio（プレビュー）

```bash
cd remotion-request-flow
npm run studio
```

`npm run dev` でも同じ Studio が起動します。ブラウザで Composition を選んでください。

- `RequestFlow` — 1920×1080 / 25 秒 / 30fps
- `RequestFlowZoom` — 1920×1080 / 約 20 秒 / 30fps（overview SVG → LB へ直線ズーム → 詳細 SVG）

## レンダー（MP4）

全体像（箱の順次表示）:

```bash
cd remotion-request-flow
npm run render
```

LB ズーム（Figma SVG）:

```bash
cd remotion-request-flow
npm run render:zoom
```

同等の直接コマンド:

```bash
npx remotion render RequestFlow out/request-flow.mp4
npx remotion render RequestFlowZoom out/request-flow-zoom.mp4
```

Chrome のパスを明示する場合（Linux 例）:

```bash
npx remotion render RequestFlow out/request-flow.mp4 --browser-executable=/usr/bin/google-chrome-stable
npx remotion render RequestFlowZoom out/request-flow-zoom.mp4 --browser-executable=/usr/bin/google-chrome-stable
```

出力先は `out/` です（gitignore 対象）。このクラウド環境では上記コマンドでレンダーに成功しています。

成果物のコピー:

- `artifacts/request-flow.mp4`（1920×1080、25 秒、H.264）
- `artifacts/request-flow-zoom.mp4`（1920×1080、約 20 秒、H.264）

## Composition

| ID | 尺 | 解像度 | 内容 |
| --- | --- | --- | --- |
| `RequestFlow` | 25s（750 frames @ 30fps） | 1920×1080 | Client / LB / App / DB が順にフェードインし、矢印が描画されたあと、ハイライトが Client→LB→App→DB へ一度流れる |
| `RequestFlowZoom` | 約 20s（601 frames @ 30fps） | 1920×1080 | `public/overview-request-flow.svg` を表示し、LB が直線で画面中央へ向かうカメラズームのあと `public/lb-detail.svg`（「LB の中身」）へクロスフェード。最後に全体像へ戻る |

画面タイトル: **リクエストがサーバに届く流れ**

## SVG アセット

Figma から書き出した図を `public/` に置いています。

- `public/overview-request-flow.svg` — Client → LB → App → DB（1200×400）。ズーム対象は LB ボックス
- `public/lb-detail.svg` — Health Check → Router → Target Pool（960×540）、タイトル「LB の中身」
