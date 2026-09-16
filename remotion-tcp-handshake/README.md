# remotion-tcp-handshake

TCP の 3 ウェイハンドシェイク（SYN → SYN-ACK → ACK）を、Client / Server の 2 ノードとパケット往復で説明する Remotion ドラフトです。同じパッケージに、教科書的な **シーケンス図**（確立 → データ領域 → 切断）の Composition も含まれます。

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

`npm run dev` でも同じ Studio が起動します。ブラウザで Composition `TcpThreeWaySuccess`（経路フォーカス）または `TcpSequenceDiagram`（シーケンス図）を開いてください。どちらも 1920×1080 / 30fps です。

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

シーケンス図（確立 ①–③ → データのやり取り → 切断 ④–⑦）:

```bash
cd remotion-tcp-handshake
npm run render:sequence
```

同等の直接コマンド:

```bash
npx remotion render TcpSequenceDiagram out/tcp-sequence-diagram.mp4
```

Chrome のパスを明示する場合（Linux 例）:

```bash
npx remotion render TcpSequenceDiagram out/tcp-sequence-diagram.mp4 --browser-executable=/usr/bin/google-chrome-stable
```

最終フレームの PNG キーフレーム:

```bash
npm run still:sequence
```

成果物のコピーは `artifacts/tcp-sequence-diagram.mp4`（任意で `artifacts/tcp-sequence-diagram.png`）です。`TcpThreeWaySuccess` の経路フォーカスフィルムはそのまま残しています。

## Composition

| ID | 尺 | 解像度 | 内容 |
| --- | --- | --- | --- |
| `TcpThreeWaySuccess` | ~30s（906 frames @ 30fps） | 1920×1080 | 各ビートで Client↔Server の経路へリニアズームし、SYN / SYN+ACK / ACK を経路上で送ったあと、引きで統一グリーンと ✓ |
| `TcpSequenceDiagram` | ~19s（582 frames @ 30fps） | 1920×1080 | 左右ライフラインのシーケンス図。① SYN → ② ACK,SYN → ③ ACK（コネクション確立）→ 破線のデータのやり取り → ④ FIN → ⑤ ACK → ⑥ FIN → ⑦ ACK（コネクション切断）。矢印は上から下へリニアに出現 |

画面タイトル: **TCP 3ウェイハンドシェイク**（経路フォーカス） / **TCP シーケンス図**（シーケンス）

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

## シーケンス図（`TcpSequenceDiagram`）

経路フォーカスフィルムとは別に、教科書的な TCP シーケンス図です。カメラ演出は使いません。情報構造は参照スケッチと同じです。

- 左: クライアント（丸角ボックス + 下向きライフライン）
- 右: サーバー（丸角ボックス + 下向きライフライン）
- 左余白: 縦書き「時間の流れ」と ↓
- ① SYN（C→S） / ② ACK,SYN（S→C） / ③ ACK（C→S） — 右括弧 **コネクション確立**
- ライフライン間の破線矩形 — 右括弧 **データのやり取り**（ペイロードの詳細は描かない）
- ④ FIN（C→S） / ⑤ ACK（S→C） / ⑥ FIN（S→C） / ⑦ ACK（C→S） — 右括弧 **コネクション切断**
- 番号・矢印ラベル・括弧ラベルは Remotion テキスト（SVG に文字を焼き込まない）
- 矢印 ①→⑦ は上から下へ直線タイミングで出現
- 確立完了・切断完了で統一グリーンと ✓

`TcpThreeWaySuccess` は変更していません。

## ステータス色

request-flow ポリッシュと同じルールです。

- 成功 / 完了ステップのアクセント → 統一 **グリーン** (`#5EE9A0`) と ✓
- 失敗アクセントは本ドラフトでは未使用
- アイドル時はノードごとのアクセント（Client 青 / Server 金）
