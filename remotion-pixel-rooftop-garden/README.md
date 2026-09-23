# remotion-pixel-rooftop-garden

昼の屋上庭園を横に流すピクセルアートの短編。キャラクターはいません。Composition は `PixelRooftopGarden` の 1 本だけです。

## ライセンス（personal trial）

Remotion は個人・非営利・従業員 3 名以下の営利組織、および**商用利用前の評価**では無償で使えます。それ以外の営利組織では Company License が必要です。

本プロジェクトは **personal trial / 評価目的** です。利用条件の本文は [Remotion LICENSE](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) と [Terms](https://www.remotion.dev/docs/terms) を確認してください。

## 固定仕様

数値は `SPEC.md` のままです。パレット・キャンバス・パララックス比は変えていません。

| 項目 | 値 |
| --- | --- |
| キャンバス | **960×540** |
| FPS | 24 |
| 尺 | 15 秒（360 frames） |
| カメラ | 線形の横パンのみ。0–2 秒静止、2–13 秒で屋根が **240px**、13–15 秒静止 |
| パララックス | sky **0.05**（1/20） / city **0.2**（1/5） / garden **0.5**（1/2） / roof **1** / petals **1.2**（6/5） |
| 花びら | 横は 1.2×。縦はカメラと別の落下 `round(frame / 4)` |
| 補間 | 全レイヤー `image-rendering: pixelated`。位置は整数 px。ぼかしなし |
| 都市の初期位置 | `city-far.png`（1280 幅）を中央合わせ。左オフセット 160（静止プレビューと同じ） |

パレット: `#B8E4FF` `#7EC8F0` `#FFE08A` `#F5FBFF` `#5FBF6A` `#3E8F4A` `#FF7EB6` `#FFC857` `#D9D2C5` `#B5AFA3` `#8A93A0` `#A8B8C8` `#8B6B4A`

中間（frame 180、7.5 秒）の移動量: sky **6** / city **24** / garden **60** / roof **120** / petals X **144**（Y **45**）。終端（frame 359）: sky **12** / city **48** / garden **120** / roof **240** / petals X **288**。

## 必要環境

- Node.js 18+
- npm
- レンダー用 Chrome

## インストール

```bash
cd remotion-pixel-rooftop-garden
npm install
```

## Studio（プレビュー）

```bash
cd remotion-pixel-rooftop-garden
npm run studio
```

`npm run dev` でも同じ Studio が起動します。Composition `PixelRooftopGarden`（960×540 / 24fps）を開いてください。

## レンダー（MP4）

```bash
cd remotion-pixel-rooftop-garden
npm run render
```

成果物をリポジトリの `artifacts/` に直接出す場合:

```bash
npm run render:artifact
```

同等の直接コマンド:

```bash
npx remotion render PixelRooftopGarden out/pixel-rooftop-garden.mp4 --crf=8 --pixel-format=yuv444p
```

Chrome のパスを明示する場合（Linux 例）:

```bash
npx remotion render PixelRooftopGarden out/pixel-rooftop-garden.mp4 --crf=8 --pixel-format=yuv444p --browser-executable=/usr/bin/google-chrome-stable
```

`out/` は gitignore 対象です。コミットする成果物は `artifacts/pixel-rooftop-garden.mp4` です。

中間フレームは PNG、本編は H.264（CRF 8 / yuv444p）です。

静止画確認（パンの途中、frame 180）:

```bash
npm run still
```

## Composition

| ID | 尺 | 解像度 | 内容 |
| --- | --- | --- | --- |
| `PixelRooftopGarden` | 15s（360 frames @ 24fps） | 960×540 | 昼の屋上庭園。キャラなし。線形横パン |

重ね順: `sky` → `city-far` → `garden-mid` → `roof-near` → `fx-petals`。

## アセット

`public/pixel/` にデザイン PNG をそのまま置いています。色の描き足しはありません。

| ファイル | 用途 |
| --- | --- |
| `sky.png` | 空 960×540（0.05×）。右端は同じ空を 1 枚足して隙間を埋める |
| `city-far.png` | 遠景 1280×540（0.2×）。余白の中だけパンする |
| `garden-mid.png` | 中景 960×540（0.5×）。右へ同じ絵を接続（床グリッドは 48px 周期） |
| `roof-near.png` | 前景 960×540（1×）。右へ手すり 1 ベイ（source x=96、幅 48）を繰り返す |
| `fx-petals.png` | 花びら（1.2× + 縦ドリフト）。2×2 でタイル |
| `preview-static.png` | 合成スチル（frame 0 の位置合わせ） |

## 終わり方

最後の 2 秒は速度 0 です。パンの途中で切れません。開始 2 秒も静止なので、出入は静止寄りです。
