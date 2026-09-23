# remotion-pixel-cyber-walk

雨のネオン路地を歩くピクセルアートのループ。キャラは画面に固定し、背景だけパララックスで流します。Composition は `PixelCyberWalk` の 1 本だけです。

## ライセンス（personal trial）

Remotion は個人・非営利・従業員 3 名以下の営利組織、および**商用利用前の評価**では無償で使えます。それ以外の営利組織では Company License が必要です。

本プロジェクトは **personal trial / 評価目的** です。利用条件の本文は [Remotion LICENSE](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) と [Terms](https://www.remotion.dev/docs/terms) を確認してください。

## 固定仕様

数値はデザイン SPEC のままです。

| 項目 | 値 |
| --- | --- |
| キャンバス | **960×540**（表示時は nearest-neighbor ×2 で 1920×1080） |
| FPS | 24 |
| 尺 | 15 秒（360 frames） |
| 歩行 | `Math.floor(frame / 3) % 6` → 約 8 fps（6 フレームで 1 周 ≈ 0.75 秒） |
| スプライト | `walk-01`…`walk-06`（32×48）を整数 ×4 → 128×192 |
| キャラ位置 | 画面中央（left 416）、top 208。プレビュー静止画の足元に合わせた固定 |
| 背景色 | `#0B0B12` |
| パララックス | far **0.15×**（3/20、スカイラインを 150px 上げて中景の裏から出す） / mid **0.45×**（9/20） / ground **1×** / キャラ **0** / 雨 **0.8×** + 縦落下 |
| 地面速度 | 8 px/frame。各層は `round(frame * 8 * ratio)` で独立。15 秒で地面はタイル 3 周 |
| 補間 | 全レイヤー `image-rendering: pixelated`。位置は整数 px |

パレット（アセット側）: hair `#A2E4DF` / `#84CCC5`、skin `#FCE6E0`、blush `#F7B9B8`、eyes `#2D2D2D`、neon `#B84CFF` `#FF4DA6` `#3DE7FF`、outfit `#1E2433`。

## 必要環境

- Node.js 18+
- npm
- レンダー用 Chrome

## インストール

```bash
cd remotion-pixel-cyber-walk
npm install
```

## Studio（プレビュー）

```bash
cd remotion-pixel-cyber-walk
npm run studio
```

`npm run dev` でも同じ Studio が起動します。Composition `PixelCyberWalk`（960×540 / 24fps）を開いてください。

## レンダー（MP4）

```bash
cd remotion-pixel-cyber-walk
npm run render
```

成果物をリポジトリの `artifacts/` に直接出す場合:

```bash
npm run render:artifact
```

同等の直接コマンド:

```bash
npx remotion render PixelCyberWalk out/pixel-cyber-walk.mp4 --crf=8 --pixel-format=yuv444p
```

Chrome のパスを明示する場合（Linux 例）:

```bash
npx remotion render PixelCyberWalk out/pixel-cyber-walk.mp4 --crf=8 --pixel-format=yuv444p --browser-executable=/usr/bin/google-chrome-stable
```

`out/` は gitignore 対象です。コミットする成果物は `artifacts/pixel-cyber-walk.mp4` です。

中間フレームは PNG、本編は H.264（CRF 8 / yuv444p）です。ネオンの色にじみを抑えるための指定です。

静止画確認:

```bash
npm run still
```

## Composition

| ID | 尺 | 解像度 | 内容 |
| --- | --- | --- | --- |
| `PixelCyberWalk` | 15s（360 frames @ 24fps） | 960×540 | 雨のネオン路地。キャラ固定、背景スクロール、6 フレーム歩行 |

重ね順: `bg-far` → `bg-mid` → `bg-ground` → キャラ → `fx-rain`。

## アセット

`public/pixel/` にデザイン PNG をそのまま置いています。描き足しはありません。

| ファイル | 用途 |
| --- | --- |
| `walk-01.png` … `walk-06.png` | 歩行フレーム 32×48 |
| `character-walk.png` | 6 フレーム横並びシート 192×48（参照用） |
| `bg-far.png` | 遠景 960×540（0.15×） |
| `bg-mid.png` | 中景路地 1280×540（0.45×） |
| `bg-ground.png` | 濡れた路面 960×540（1×） |
| `fx-rain.png` | 雨オーバーレイ（0.8× + 縦 3 px/frame） |
| `preview-static.png` | 合成スチル（位置合わせの参照） |

## ループ

歩行は 18 frames 周期で、360 frames にちょうど 20 周入ります。地面は 8 px/frame（60 frame で 480 px）で、幅 960 を 15 秒に 3 周します。水たまりはその層と一緒に動きます。中景は 0.45×、遠景は 0.15× で、地面の距離からそれぞれ別々に計算します。キャラの `left` は毎フレーム 416（胴体中心 X は 466 で固定）。雨の縦落下は 3 px/frame のままです。
