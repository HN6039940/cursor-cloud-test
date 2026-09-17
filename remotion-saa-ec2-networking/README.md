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
| `Ec2PlacementGroups` | ~107.6s（3228 frames @ 30fps） | 1920×1080 | Cluster / Partition / Spread をリニアフォーカスし、3 類型比較と試験制約へ |
| `EniOverview` | ~92.0s（2760 frames @ 30fps） | 1920×1080 | ENI の入れ物 → Primary/Secondary → 同一 AZ 移動 → SG 所属 → 試験点 |

画面タイトル:

- **EC2 Placement Groups**
- **Elastic Network Interface**

カメラ補間はすべて線形です。各トピックへ短いリニアフォーカス → ホールド → 次の領域、最後に全景へ戻します。曲線カメラは使いません。

## 図解モーション分担

- 配線は Remotion のパス。Figma の分岐 / 合流バーは使わない
- アイコン SVG に文字を入れない。ラベル・キャプション・発光・タイミングは Remotion 側
- 第一稿は装飾より、試験で切れる切れ目が読めることを優先

## Film 1 — Placement Groups

1. Cluster — 同一 AZ 近傍。低レイテンシ HPC。HA には使わない
2. Partition — ラック単位の論理パーティション。Hadoop / Kafka。7 partitions / AZ
3. Spread — 別ハードウェア。少数の重要ノード。7 running / AZ
4. 3-way 比較
5. 試験点（AZ 認識 / 台数の直観 / ユースケース対応）

## Film 2 — ENI

1. ENI = 仮想 NIC。IP / MAC / SG の入れ物
2. Primary（eth0、外せない） vs Secondary（着脱可）
3. 同一 AZ で Detach → Move → Attach。IP・MAC・SG が一緒に動く
4. SG はインスタンスではなく ENI に付く
5. 試験点（複数 ENI / ENI 移動 / SG の所属）

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
