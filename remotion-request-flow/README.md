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
- `BoundaryProbe` — 1920×1080 / 20 秒 / 30fps（Figma は箱と辺のみ。ラベル・発光・パケット・キャプションは Remotion）
- `BranchMerge` — 1920×1080 / 25 秒 / 30fps（App A / App B へ分岐して DB で合流）
- `CacheHitMiss` — 1920×1080 / 約 26.5 秒 / 30fps（ミスは DB へ、ヒットは Cache から引き返す）

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

境界プローブ（SVG=箱/辺、Remotion=ラベル/発光/パケット）:

```bash
cd remotion-request-flow
npm run render:probe
```

分岐と合流:

```bash
cd remotion-request-flow
npm run render:branch
```

キャッシュのヒットとミス:

```bash
cd remotion-request-flow
npm run render:cache
```

同等の直接コマンド:

```bash
npx remotion render RequestFlow out/request-flow.mp4
npx remotion render RequestFlowZoom out/request-flow-zoom.mp4
npx remotion render BoundaryProbe out/boundary-probe.mp4
npx remotion render BranchMerge out/branch-merge.mp4
npx remotion render CacheHitMiss out/cache-hit-miss.mp4
```

Chrome のパスを明示する場合（Linux 例）:

```bash
npx remotion render RequestFlow out/request-flow.mp4 --browser-executable=/usr/bin/google-chrome-stable
npx remotion render RequestFlowZoom out/request-flow-zoom.mp4 --browser-executable=/usr/bin/google-chrome-stable
npx remotion render BoundaryProbe out/boundary-probe.mp4 --browser-executable=/usr/bin/google-chrome-stable
npx remotion render BranchMerge out/branch-merge.mp4 --browser-executable=/usr/bin/google-chrome-stable
npx remotion render CacheHitMiss out/cache-hit-miss.mp4 --browser-executable=/usr/bin/google-chrome-stable
```

出力先は `out/` です（gitignore 対象）。このクラウド環境では上記コマンドでレンダーに成功しています。

成果物のコピー:

- `artifacts/request-flow.mp4`（1920×1080、25 秒、H.264）
- `artifacts/request-flow-zoom.mp4`（1920×1080、約 20 秒、H.264）
- `artifacts/boundary-probe.mp4`（1920×1080、20 秒、H.264）
- `artifacts/branch-merge.mp4`（1920×1080、25 秒、H.264）
- `artifacts/cache-hit-miss.mp4`（1920×1080、約 26.5 秒、H.264）

## Composition

| ID | 尺 | 解像度 | 内容 |
| --- | --- | --- | --- |
| `RequestFlow` | 25s（750 frames @ 30fps） | 1920×1080 | Client / LB / App / DB が順にフェードインし、矢印が描画されたあと、ハイライトが Client→LB→App→DB へ一度流れる |
| `RequestFlowZoom` | 約 20s（601 frames @ 30fps） | 1920×1080 | `public/overview-request-flow.svg` を表示し、LB が直線で画面中央へ向かうカメラズームのあと `public/lb-detail.svg`（「LB の中身」）へクロスフェード。最後に全体像へ戻る |
| `BoundaryProbe` | 20s（600 frames @ 30fps） | 1920×1080 | `public/parts-only-flow.svg`（箱と辺のみ）の上に Remotion がラベル・発光・パケット・日本語キャプションを重ねる |
| `BranchMerge` | 25s（750 frames @ 30fps） | 1920×1080 | `public/parts-branch-cache.svg` 上で Packet A（App A）と Packet B（App B）が分岐し、DB で合流する |
| `CacheHitMiss` | 約 26.5s（795 frames @ 30fps） | 1920×1080 | 同じ SVG でミス（Cache→DB）とヒット（Cache から App A へ折り返し、DB に行かない）を対比する |

画面タイトル: **リクエストがサーバに届く流れ**

## SVG アセット

Figma から書き出した図を `public/` に置いています。

- `public/overview-request-flow.svg` — Client → LB → App → DB（1200×400）。ズーム対象は LB ボックス
- `public/lb-detail.svg` — Health Check → Router → Target Pool（960×540）、タイトル「LB の中身」
- `public/parts-only-flow.svg` — Client / LB / App / DB の箱と辺だけ（1200×400、テキストなし）。ラベル等は `BoundaryProbe` が描画
- `public/parts-branch-cache.svg` — Client / LB / App A / App B / Cache / DB と Manhattan 辺（1400×720、テキストなし）。`BranchMerge` と `CacheHitMiss` がラベルとパケットを描画
