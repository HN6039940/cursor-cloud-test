# remotion-pixel-rooftop-garden

昼の屋上庭園を横に流すピクセルアートの短編。キャラクターはいません。Composition は `PixelRooftopGarden` の 1 本だけです。

## ライセンス（personal trial）

Remotion は個人・非営利・従業員 3 名以下の営利組織、および**商用利用前の評価**では無償で使えます。それ以外の営利組織では Company License が必要です。

本プロジェクトは **personal trial / 評価目的** です。利用条件の本文は [Remotion LICENSE](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) と [Terms](https://www.remotion.dev/docs/terms) を確認してください。

## 固定仕様

パレットとキャンバスは `SPEC.md` のままです。奥行きが読めるよう、再生時のパララックスだけ広げています（空はほぼ停止、屋根が庭を追い越す）。

| 項目 | 値 |
| --- | --- |
| キャンバス | **960×540** |
| FPS | 24 |
| 尺 | 15 秒（360 frames） |
| カメラ | 線形の横パンのみ。0–2 秒静止、2–13 秒で屋根が **400px**、13–15 秒静止 |
| パララックス | sky **0.02** / city **0.12** / garden-base **0.5** / plants-far **0.45** / plants-mid **0.55** / plants-near **0.7** / roof **1** / petals **1.25** |
| 風 | 植物だけ三角波で回転。far **±0.6°**（192f） / mid **±1.2°**（144f, 位相 48） / near **±2.2°**（120f, 位相 30）。足元が軸。床・屋根・空・都市は 0° |
| 花びら | 横は 1.25× に風 ±16px。縦は `round(frame / 4)` |
| 補間 | 全レイヤー `image-rendering: pixelated`。位置は整数 px。ぼかしなし |
| 都市の初期位置 | `city-far.png`（1280 幅）を中央合わせ。左オフセット 160（静止プレビューと同じ） |

パレット: `#B8E4FF` `#7EC8F0` `#FFE08A` `#F5FBFF` `#5FBF6A` `#3E8F4A` `#FF7EB6` `#FFC857` `#D9D2C5` `#B5AFA3` `#8A93A0` `#A8B8C8` `#8B6B4A`

中間（frame 180、7.5 秒）の移動量: sky **4** / city **24** / garden-base **100** / plants-far **90** / plants-mid **110** / plants-near **140** / roof **200**。終端の屋根は **400px**、都市は **48px**。

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

重ね順: `sky` → `city-far` → `garden-base` → `plants-far` → `plants-mid` → `plants-near` → `roof-near` → `fx-petals`。

## アセット

`public/pixel/` にデザイン PNG をそのまま置いています。色の描き足しはありません。

| ファイル | 用途 |
| --- | --- |
| `sky.png` | 空 960×540（0.02×）。右端は同じ空を 1 枚足して隙間を埋める |
| `city-far.png` | 遠景 1280×540（0.12×）。余白の中だけパンする |
| `garden-base.png` | デッキとプランターのみ 960×540（0.5×）。植物なし。揺れ 0° |
| `plants-far.png` | 遠景の木（0.45×、±0.6°） |
| `plants-mid.png` | 中景の木（0.55×、±1.2°） |
| `plants-near.png` | 手前の木（0.7×、±2.2°） |
| `garden-mid.png` | `garden-base.png` と同じ内容の別名。合成には使わない |
| `roof-near.png` | 前景 960×540（1×）。右へ手すり 1 ベイ（source x=96、幅 48）を繰り返す |
| `fx-petals.png` | 花びら（1.25× + 風 ±16px + 縦ドリフト）。2×2 でタイル |
| `preview-static.png` | 合成スチル（frame 0 の位置合わせ） |

## 終わり方

最後の 2 秒は速度 0 です。パンの途中で切れません。開始 2 秒も静止なので、出入は静止寄りです。
