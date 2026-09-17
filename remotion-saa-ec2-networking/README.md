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
| `Ec2PlacementGroups` | 96.5s（2896 frames @ 30fps） | 1920×1080 | Cluster / Partition / Spread を Region / AZ の地理で見せ、図 → 動き → 用語 → 余韻の順 |
| `EniOverview` | 77.7s（2332 frames @ 30fps） | 1920×1080 | ENI を通る通信 → eth0/eth1 の 2 経路 → 同一 AZ で ENI ごと移動。同じビート |

画面タイトル:

- **EC2 Placement Groups**
- **Elastic Network Interface**

カメラは領域間を直線でつなぎ、補間の **t だけ ease-in-out** します。曲線カメラは使いません。ズームピークは約 1.16 倍まで。

各トピックは **図解 → 動き → 用語 → 余韻（dwell）**。ラベルの直後に切らず、動きをしばらく残します。

## 図解モーション分担

- 配線は Remotion のパス。Figma の分岐 / 合流バーは使わない
- アイコン SVG に文字を入れない。ラベル・キャプション・発光・タイミングは Remotion 側
- 通信と障害の広がりはパケットの流れで見せる

## Film 1 — Placement Groups

Region 枠の中に AZ を置き、3 類型の違いを地理から読めるようにしています。

1. Cluster — Region の 1 AZ に集め、もう一方の AZ は使わない。速い通信 → ラック障害で全部止まる
2. Partition — AZ-a にラック A/B、AZ-b にラック C。同じラック内の通信。B だけ落ちて A と C は続く
3. Spread — 複数 AZ の別機械へ散らす。1 台落ちても他へ届く
4. 比較 — 一緒に落ちる / 一部だけ / 1 台だけ

## Film 2 — ENI

既存の 3 カット（概要 / eth0·eth1 / 同一 AZ の着脱）に SG-on-ENI の戻りを足していません。テンポだけ揃えています。

1. ENI は仮想 NIC。通信は Instance → ENI → Subnet
2. eth0 は外せない。eth1 は移せる（2 本のパケット経路）
3. 同じ AZ なら ENI ごと移る
4. SG は ENI に付く（既存の概要図へ戻る）

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
