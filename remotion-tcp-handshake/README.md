# remotion-tcp-handshake

TCP の 3 ウェイハンドシェイク（SYN → SYN-ACK → ACK）を、Client / Server の 2 ノードとパケット往復で説明する Remotion ドラフトです。

このディレクトリは個人利用の試作（personal trial）です。`remotion-request-flow/` とは別パッケージで、リクエスト経路トポロジには依存しません。見た目（暗い背景、カードノード、パス上のパケット、成功時の統一グリーン）は request-flow のポリッシュに合わせています。

## ライセンス（personal trial）

Remotion は個人・非営利・従業員 3 名以下の営利組織、および**商用利用前の評価**では無償で使えます。それ以外の営利組織では Company License が必要です。

本プロジェクトは **personal trial / 評価目的** です。利用条件の本文は [Remotion LICENSE](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) と [Terms](https://www.remotion.dev/docs/terms) を確認してください。

## 必要環境

- Node.js 18+
- npm

## インストール

```bash
cd remotion-tcp-handshake
npm install
```

## Studio（プレビュー）

```bash
cd remotion-tcp-handshake
npm run studio
```

`npm run dev` でも同じ Studio が起動します。ブラウザで Composition `TcpThreeWaySuccess`（1920×1080 / 約 30 秒 / 30fps）を開いてください。

## レンダー（MP4）

```bash
cd remotion-tcp-handshake
npm run render
```

同等の直接コマンド:

```bash
npx remotion render TcpThreeWaySuccess out/tcp-3way-success.mp4
```

Chrome のパスを明示する場合（Linux 例）:

```bash
npx remotion render TcpThreeWaySuccess out/tcp-3way-success.mp4 --browser-executable=/usr/bin/google-chrome-stable
```

出力先は `out/tcp-3way-success.mp4` です（`out/` は gitignore 対象）。成果物のコピーはリポジトリの `artifacts/tcp-3way-success.mp4` です。

## Composition

| ID | 尺 | 解像度 | 内容 |
| --- | --- | --- | --- |
| `TcpThreeWaySuccess` | ~30s（906 frames @ 30fps） | 1920×1080 | 各ビートで Client↔Server の経路へリニアズームし、SYN / SYN+ACK / ACK を経路上で送ったあと、引きで統一グリーンと ✓ |

画面タイトル: **TCP 3ウェイハンドシェイク**

## アイコン

テキストなし SVG（Lucide）。ラベルは Remotion 側で描画します。

| ファイル | 用途 |
| --- | --- |
| `public/icons/client.svg` | Client ノード（monitor） |
| `public/icons/server.svg` | Server ノード（server） |
| `public/icons/check.svg` | 成功バッジの ✓ |

配線（往路 / 復路）は Figma の細いバーではなく Remotion のパスです。

## カメラ（経路フォーカス）

各ビートは **パケットやカードではなく Client↔Server の経路** を主役にします。ズーム / パンは直線補間のみ（カーブなし）。

1. SYN — 往路（Client → Server）へリニアズーム。フラグ `SYN` と方向を経路のそばに表示
2. SYN-ACK — 復路（Server → Client）へリニアパン。フラグ `SYN + ACK`
3. ACK — 往路へ戻して `ACK`
4. 着陸後に短いホールド → 次の経路
5. 最後の ACK のあとだけ全景に引き、統一グリーンと ✓

パケットは経路上を動く脇役です。

## ステータス色

request-flow ポリッシュと同じルールです。

- 成功 / 完了ステップのアクセント → 統一 **グリーン** (`#5EE9A0`) と ✓
- 失敗アクセントは本ドラフトでは未使用
- アイドル時はノードごとのアクセント（Client 青 / Server 金）
