# remotion-saa-ec2-networking

AWS SAA 向けに、EC2 Placement Groups と ENI（Elastic Network Interface）を 2 本の解説動画で説明する Remotion 第一稿です。

`remotion-request-flow/`・`remotion-tcp-handshake/`・`remotion-js-array-methods/`・`remotion-viz-stack/` は触っていません。このディレクトリは別パッケージです。

## ライセンス（personal trial）

Remotion は個人・非営利・従業員 3 名以下の営利組織、および**商用利用前の評価**では無償で使えます。それ以外の営利組織では Company License が必要です。

本プロジェクトは **personal trial / 評価目的** です。利用条件の本文は [Remotion LICENSE](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) と [Terms](https://www.remotion.dev/docs/terms) を確認してください。

## 必要環境

- Node.js 18+
- npm

## インストール

```bash
cd remotion-saa-ec2-networking
npm install
```

## Studio（プレビュー）

```bash
cd remotion-saa-ec2-networking
npm run studio
```

`npm run dev` でも同じ Studio が起動します。Composition を選んでください。

- `Ec2PlacementGroups` — Cluster / Partition / Spread
- `EniOverview` — ENI の入れ物モデルと着脱

## レンダー（MP4）

両方:

```bash
cd remotion-saa-ec2-networking
npm run render
```

成果物をリポジトリの `artifacts/` に直接出す場合:

```bash
npm run render:artifact
```

個別:

```bash
npm run render:placement
npm run render:eni
```

Chrome のパスを明示する場合（Linux 例）:

```bash
npx remotion render Ec2PlacementGroups ../artifacts/saa-ec2-placement-groups.mp4 --browser-executable=/usr/bin/google-chrome-stable
npx remotion render EniOverview ../artifacts/saa-eni-overview.mp4 --browser-executable=/usr/bin/google-chrome-stable
```

`out/` は gitignore 対象です。コミットする成果物は次の 2 本です。

| パス | Composition |
| --- | --- |
| `artifacts/saa-ec2-placement-groups.mp4` | `Ec2PlacementGroups` |
| `artifacts/saa-eni-overview.mp4` | `EniOverview` |

## Composition

| ID | 尺 | 解像度 | 内容 |
| --- | --- | --- | --- |
| `Ec2PlacementGroups` | 81.0s（2430 frames @ 30fps） | 1920×1080 | Cluster / Partition / Spread を緩いリニアフォーカス。通信と障害の広がりをパケットで見せ、最後に 3 類型比較 |
| `EniOverview` | 65.0s（1950 frames @ 30fps） | 1920×1080 | ENI を通る通信 → eth0/eth1 の 2 経路 → 同一 AZ で ENI ごと移動 |

画面タイトル:

- **EC2 Placement Groups**
- **Elastic Network Interface**

カメラは領域間を直線でつなぎ、補間の **t だけ ease-in-out** します。曲線カメラは使いません。ズームは約 2.6 秒かけてゆっくり寄ります。

画面は **1 画面 1 メッセージ**。試験用語は短いキャプションにだけ残します。

## 図解モーション分担

- 配線は Remotion のパス。Figma の分岐 / 合流バーは使わない
- アイコン SVG に文字を入れない。ラベル・キャプション・発光・タイミングは Remotion 側
- 通信と障害の広がりはパケットの流れで見せる

## Film 1 — Placement Groups

1. Cluster — 近くに集める。速い。一緒に落ちる（通信 → ラック障害）
2. Partition — ラックごとに分ける。片方の障害は他に広がらない
3. Spread — 別々の機械へ。1 台落ちても他は生きる
4. 比較 — 一緒に落ちる / 一部だけ / 1 台だけ
5. 覚え方キャプション — Cluster は 1 AZ。Spread は 7 台/AZ

## Film 2 — ENI

1. ENI は仮想 NIC。通信は Instance → ENI → Subnet
2. eth0 は外せない。eth1 は移せる（2 本のパケット経路）
3. 同じ AZ なら ENI ごと移る
4. 覚え方キャプション — SG は ENI に付く

## アイコン

テキストなし SVG（Lucide）。ラベルは Remotion 側で描画します。

| ファイル | 用途 |
| --- | --- |
| `public/icons/server.svg` | インスタンス |
| `public/icons/zap.svg` | Cluster（性能） |
| `public/icons/layers.svg` | Partition |
| `public/icons/spread.svg` | Spread |
| `public/icons/building.svg` | AZ |
| `public/icons/cable.svg` | ENI |
| `public/icons/shield.svg` | Security Group |
| `public/icons/globe.svg` | Subnet |
| `public/icons/lock.svg` / `unplug.svg` / `move.svg` | 固定 / 着脱 / 移動 |

## ステータス

第一稿です。見やすさ優先、ポリッシュは後回し。成功グリーンは移動完了と試験の正向きラベルに使っています。
