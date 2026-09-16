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
- `RequestFlowZoom` / `RequestFlowZoomDetail` — 1920×1080 / 約 22 秒 / 30fps（ロック済み IconPathBranch 全体像 → LB へ直線カメラズーム → Health Check / Router / Target Pool。同一コンポーネント）
- `BoundaryProbe` — 1920×1080 / 20 秒 / 30fps（Figma は箱と辺のみ。ラベル・発光・パケット・キャプションは Remotion）
- `BranchMerge` — 1920×1080 / 25 秒 / 30fps（App A / App B へ分岐して DB で合流）
- `CacheHitMiss` / `RequestFlowCacheHitMiss` — 1920×1080 / 約 30.5 秒 / 30fps（ロック済みトポロジ。ミスは Cache→DB、ヒットは Cache から引き返し DB には行かない。同一コンポーネント）
- `IconNodes` — 1920×1080 / 10 秒 / 30fps（Lucide アイコン SVG を暗色カード上に表示。トポロジーなし）
- `IconPathBranch` / `RequestFlowSuccess` — 1920×1080 / 25 秒 / 30fps（成功: アイコンカード＋ Remotion の Manhattan パス。分岐して 1 本のトランクで DB へ。着地 ✓ と成功パスの緑ハイライト。同一コンポーネント）
- `RequestFlowFailLost` — 1920×1080 / 25 秒 / 30fps（ロスト: 同じレイアウト。App B に ❌、パケット消失。App A は DB へ成功）
- `RequestFlowRetry` — 1920×1080 / 約 26 秒 / 30fps（同じ経路で失敗 → 再送 → 成功。App A に ❌ のあと ✓）

## レンダー（MP4）

全体像（箱の順次表示）:

```bash
cd remotion-request-flow
npm run render
```

LB ズーム（ロック済みレイアウト → LB 内部）:

```bash
cd remotion-request-flow
npm run render:zoom-detail
```

互換用（同じコンポーネント → `out/request-flow-zoom.mp4`）:

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

キャッシュのヒットとミス（ロック済みトポロジ。ミス→短いリセット→ヒット）:

```bash
cd remotion-request-flow
npm run render:cache-hit-miss
```

互換用（同じコンポーネント → `out/cache-hit-miss.mp4`）:

```bash
cd remotion-request-flow
npm run render:cache
```

ノードアイコン（SVG → Remotion Img）:

```bash
cd remotion-request-flow
npm run render:icons
```

アイコン＋ Remotion パス（分岐と合流 / 成功。`IconPathBranch` と同じ）:

```bash
cd remotion-request-flow
npm run render:success
```

失敗ロスト（App B でパケット消失）:

```bash
cd remotion-request-flow
npm run render:fail-lost
```

再送（失敗 → 同じ経路で再送 → 成功）:

```bash
cd remotion-request-flow
npm run render:retry
```

互換用（`IconPathBranch` → `out/icon-path-branch.mp4`）:

```bash
cd remotion-request-flow
npm run render:icon-path
```

同等の直接コマンド:

```bash
npx remotion render RequestFlow out/request-flow.mp4
npx remotion render RequestFlowZoom out/request-flow-zoom.mp4
npx remotion render RequestFlowZoomDetail out/request-flow-zoom-detail.mp4
npx remotion render BoundaryProbe out/boundary-probe.mp4
npx remotion render BranchMerge out/branch-merge.mp4
npx remotion render CacheHitMiss out/cache-hit-miss.mp4
npx remotion render RequestFlowCacheHitMiss out/request-flow-cache-hit-miss.mp4
npx remotion render IconNodes out/icon-nodes.mp4
npx remotion render IconPathBranch out/icon-path-branch.mp4
npx remotion render RequestFlowSuccess out/request-flow-success.mp4
npx remotion render RequestFlowFailLost out/request-flow-fail-lost.mp4
npx remotion render RequestFlowRetry out/request-flow-retry.mp4
```

Chrome のパスを明示する場合（Linux 例）:

```bash
npx remotion render RequestFlow out/request-flow.mp4 --browser-executable=/usr/bin/google-chrome-stable
npx remotion render RequestFlowZoom out/request-flow-zoom.mp4 --browser-executable=/usr/bin/google-chrome-stable
npx remotion render RequestFlowZoomDetail out/request-flow-zoom-detail.mp4 --browser-executable=/usr/bin/google-chrome-stable
npx remotion render BoundaryProbe out/boundary-probe.mp4 --browser-executable=/usr/bin/google-chrome-stable
npx remotion render BranchMerge out/branch-merge.mp4 --browser-executable=/usr/bin/google-chrome-stable
npx remotion render CacheHitMiss out/cache-hit-miss.mp4 --browser-executable=/usr/bin/google-chrome-stable
npx remotion render RequestFlowCacheHitMiss out/request-flow-cache-hit-miss.mp4 --browser-executable=/usr/bin/google-chrome-stable
npx remotion render IconNodes out/icon-nodes.mp4 --browser-executable=/usr/bin/google-chrome-stable
npx remotion render IconPathBranch out/icon-path-branch.mp4 --browser-executable=/usr/bin/google-chrome-stable
npx remotion render RequestFlowSuccess out/request-flow-success.mp4 --browser-executable=/usr/bin/google-chrome-stable
npx remotion render RequestFlowFailLost out/request-flow-fail-lost.mp4 --browser-executable=/usr/bin/google-chrome-stable
npx remotion render RequestFlowRetry out/request-flow-retry.mp4 --browser-executable=/usr/bin/google-chrome-stable
```

出力先は `out/` です（gitignore 対象）。このクラウド環境では上記コマンドでレンダーに成功しています。

成果物のコピー:

- `artifacts/request-flow.mp4`（1920×1080、25 秒、H.264）
- `artifacts/request-flow-zoom.mp4`（1920×1080、約 22 秒、H.264。`RequestFlowZoom` = `RequestFlowZoomDetail`）
- `artifacts/request-flow-zoom-detail.mp4`（**ズームの正規成果物**、1920×1080、約 22 秒、H.264）
- `artifacts/boundary-probe.mp4`（1920×1080、20 秒、H.264）
- `artifacts/branch-merge.mp4`（1920×1080、25 秒、H.264）
- `artifacts/cache-hit-miss.mp4`（1920×1080、約 30.5 秒、H.264。`CacheHitMiss` = `RequestFlowCacheHitMiss`）
- `artifacts/request-flow-cache-hit-miss.mp4`（**キャッシュの正規成果物**、1920×1080、約 30.5 秒、H.264）
- `artifacts/icon-nodes.mp4`（1920×1080、10 秒、H.264）
- `artifacts/icon-path-branch.mp4`（1920×1080、25 秒、H.264。成功コンポジションの別名出力）
- `artifacts/request-flow-success.mp4`（**成功の正規成果物**、1920×1080、25 秒、H.264。`RequestFlowSuccess` = `IconPathBranch`）
- `artifacts/request-flow-fail-lost.mp4`（ロスト、1920×1080、25 秒、H.264）
- `artifacts/request-flow-retry.mp4`（再送、1920×1080、約 26 秒、H.264）

## Composition

| ID | 尺 | 解像度 | 内容 |
| --- | --- | --- | --- |
| `RequestFlow` | 25s（750 frames @ 30fps） | 1920×1080 | Client / LB / App / DB が順にフェードインし、矢印が描画されたあと、ハイライトが Client→LB→App→DB へ一度流れる |
| `RequestFlowZoom` / `RequestFlowZoomDetail` | 約 22s（664 frames @ 30fps） | 1920×1080 | ロック済み IconPathBranch 全体像から LB へ直線カメラフォーカス。内部は文字なし SVG + Remotion ラベル（Health Check → Router → Target Pool）。最後に全体像へ戻る。同一コンポーネント |
| `BoundaryProbe` | 20s（600 frames @ 30fps） | 1920×1080 | `public/parts-only-flow.svg`（箱と辺のみ）の上に Remotion がラベル・発光・パケット・日本語キャプションを重ねる |
| `BranchMerge` | 25s（750 frames @ 30fps） | 1920×1080 | `public/parts-branch-cache.svg` 上で Packet A（App A）と Packet B（App B）が分岐し、DB で合流する |
| `CacheHitMiss` / `RequestFlowCacheHitMiss` | 約 30.5s（915 frames @ 30fps） | 1920×1080 | ロック済みアイコンパス。ミスは App→Cache→DB（DB に ✓）。短いリセットのあとヒットは Cache で折り返し、DB には行かない（Cache に ✓、DB は暗いまま） |
| `IconNodes` | 10s（300 frames @ 30fps） | 1920×1080 | Remotion が描いた暗色カード上に `public/icons/*.svg` を `Img` + `staticFile` で載せ、Client / LB / App / Cache / DB のラベルを表示する（アイコン経路の確認用。辺なし） |
| `IconPathBranch` | 25s（750 frames @ 30fps） | 1920×1080 | 成功メイン。同じアイコンカードをトポロジ配置し、コネクタは Remotion の SVG `<path>`（Manhattan、カード辺の中点）。上段は Client→LB→App A→Cache、App B は App A と Cache の水平中間（下段）。DB へは 1 本の合流トランク。パケット着地で ✓、成功パスは緑ハイライト。`parts-branch-cache.svg` は使わない |
| `RequestFlowSuccess` | 25s（750 frames @ 30fps） | 1920×1080 | `IconPathBranch` と同一コンポーネント。正規レンダー ID |
| `RequestFlowFailLost` | 25s（750 frames @ 30fps） | 1920×1080 | 成功と同じノード配置・パス言語。App B に ❌ が着地しパケットが消える。App A は Cache 経由で DB へ成功 |
| `RequestFlowRetry` | 約 26.2s（785 frames @ 30fps） | 1920×1080 | 成功と同じノード配置。1 回目は App A で ❌ とパケット消失。キャプション「再送」のあと、同じ経路を再送して DB に ✓ |

画面タイトル: **リクエストがサーバに届く流れ**

## SVG アセット

Figma から書き出した図を `public/` に置いています。

- `public/overview-request-flow.svg` — Client → LB → App → DB（1200×400）。初期ズーム試作。現行の `RequestFlowZoomDetail` は使わない
- `public/lb-detail.svg` — Health Check → Router → Target Pool（960×540）。タイトル文字入りの旧詳細図。現行ズームは文字なしアイコン + Remotion ラベル
- `public/parts-only-flow.svg` — Client / LB / App / DB の箱と辺だけ（1200×400、テキストなし）。ラベル等は `BoundaryProbe` が描画
- `public/parts-branch-cache.svg` — Client / LB / App A / App B / Cache / DB と Manhattan 辺（1400×720、テキストなし）。`BranchMerge` がラベルとパケットを描画

アイコン専用 SVG（Figma 配線なし、**文字なし**）。Lucide static v0.454.0（ISC）。stroke `#c5d3ee`、64×64、`viewBox="0 0 24 24"`。暗色背景向けの単色アウトライン。ラベル・キャプションは Remotion 側で描画します。`IconNodes` / `IconPathBranch` / `RequestFlowSuccess` / `RequestFlowFailLost` / `RequestFlowRetry` / `RequestFlowCacheHitMiss` / `RequestFlowZoomDetail` が `staticFile('icons/….svg')` 経由で `Img` 表示します。

配置: `remotion-request-flow/public/icons/`

- `public/icons/client.svg` — monitor
- `public/icons/lb.svg` — git-branch
- `public/icons/app.svg` — server
- `public/icons/cache.svg` — zap
- `public/icons/db.svg` — database
- `public/icons/check.svg` — check（成功着地 ✓。カード上のバッジとして使用）
- `public/icons/x.svg` — x（失敗 ❌。カード上のバッジとして使用）
- `public/icons/health.svg` — activity（LB 内部: Health Check）
- `public/icons/router.svg` — git-fork（LB 内部: Router）
- `public/icons/pool.svg` — layers（LB 内部: Target Pool）
