# V2 Canary 開発引き継ぎメモ

最終更新: 2026-06-03

## 1. この文書の目的

この文書は、`pokemon-math` リポジトリにおける V2 Canary 開発の現在地、直近の実装状況、既知の注意点、次に進むべき作業を整理するための引き継ぎメモです。

正式な仕様定義は以下のドキュメントを参照します。

```text
docs/README.md
docs/current_inventory.md
docs/data_model_v1_v2.md
docs/migration_v1_to_v2.md
docs/ui_ux_v2.md
docs/release_and_canary.md
AGENTS.md
```

この文書は、それらの仕様書を補完する「現在地メモ」です。

---

## 2. 基本方針

```text
root index.html
→ V1.5 本番版。明示承認がない限り変更禁止。

canary/index.html
→ V2 Canary 本体。現在の開発対象。

canary/index_ui.html
→ V2 UI プロトタイプ。参考扱い。

canary/index_dev_masterdata_2.html
→ マスターデータ取得・Firestore投入用の開発ダッシュボード。参考・履歴扱い。

canary/migration.html
→ 将来の V1→V2 一括移行UI。V2本体とは分離する。
```

V2 本体では以下を守ります。

```text
- users コレクションは V1.5 用。V2本体からは原則読まない・書かない。
- users_v2 が V2 ユーザーデータの正本。
- masters/gen_{1..9} は読み取り専用。
- root index.html は Main 昇格専用PRまで変更しない。
- 1 Issue = 1 PR を原則とする。
- 仕様未確定部分は、実装前に論点整理・判断を行う。
```

---

## 3. Step 全体像と現在地

現在の Step 全体像は以下です。

```text
Step 1: 現状棚卸し・開発ルール整備
  ✅ 完了

Step 2: データモデル定義
  ✅ 完了

Step 3: V1→V2移行仕様定義
  ✅ 完了

Step 4: V2 UI/UX仕様定義
  ✅ 完了

Step 5: V2本実装ファイル名・配置方針の確定
  ✅ 完了

Step 6: V2 Canary機能実装
  ← いまここ

  Step 6-1: canary/index.html 最小実装
    ✅ 完了

  Step 6-2: タイトル/ユーザー選択画面改善
    ✅ 完了

  Step 6-3: 現在世代マスター読み込み + メニュー進捗表示
    ✅ 完了

  Step 6-3b: メニューUI改善
    ✅ 完了

  Step 6-3c: メニュー高速化 + master裏読み込み
    ✅ 完了

  Step 6-4: クイズ + 結果画面
    ✅ 完了

  Step 6-5: ポケモン取得 + 保存処理
    ✅ 完了

  Step 6-6: 図鑑 + 詳細モーダル
    ✅ 完了

  Step 6-6b: 図鑑モーダル表示位置 + 読み込み表示改善
    ✅ PR #17 マージ済み
    ❌ ただし実機確認で改悪

  Step 6-6c: 図鑑スクロール領域・モーダル仕様のV1.5回帰修正
    ✅ 修正済み
    ✅ GitHubへコミット済み
    ✅ 画面確認済み

  Step 6-7: 世代開始・世代クリア・全世代コンプリート
    未着手

  Step 6-8: canary/migration.html + V1→V2一括移行
    未着手

Step 7: Canary検証・移行・Main昇格
  未着手
```

現在地は以下です。

```text
Step 6-6c 完了。
次は Step 6-7 の論点整理から開始する。
```

---

## 4. 現在の canary/index.html の状態

現在の `canary/index.html` は V2 Canary 本体です。

直近の修正では、図鑑モーダル周りを V1.5 の操作感に戻しました。

Canary バッジのタイムスタンプ:

```text
V2 Canary 202606031930
```

この状態で、ユーザーが画面確認し、図鑑モーダルの挙動が修正されていることを確認済みです。

---

## 5. Step 6-6c の最終仕様

Step 6-6c では、PR #17 の改悪を修正し、V1.5 と同様の図鑑・モーダル体験に戻しました。

最終仕様は以下です。

```text
- 図鑑画面全体を長いスクロール画面にしない。
- 図鑑グリッド部分だけをスクロール領域にする。
- 「メニューへ もどる」ボタンは図鑑グリッドの外に置く。
- モーダルは .app の外、body直下相当の外側レイヤーに置く。
- モーダル背景は position: fixed。
- 背景クリックで閉じる。
- モーダル本体クリックでは閉じない。
- 右上の × ボタンで閉じる。
- 下部の「とじる」ボタンは廃止。
- body.modal-open は使わない。
```

特に重要な注意点:

```text
PR #17 で入れた body.modal-open は、実機確認でスクロール挙動を悪化させた。
今後、安易に body.modal-open を戻さないこと。
```

`.zukan-grid` の高さ指定は以下。

```css
max-height: min(58vh, 520px);
max-height: min(58dvh, 520px);
```

意味:

```text
- スマホ表示領域の約58%を図鑑グリッドに使う。
- 大画面では520pxを上限にする。
- グリッド内部だけをスクロールさせる。
```

実機確認で狭い場合は、後続の軽微修正で以下を検討する。

```text
- 62dvh
- 65dvh
```

---

## 6. Step 6-5 の重要ロジック

Step 6-5 では、ポケモン取得と `users_v2` への保存処理を実装済みです。

方針:

```text
- 4問正解で1匹
- 5問正解で2匹
- 未取得ポケモンだけから抽選
- current_gen_owned に local_id を追加
- Firestore transaction で保存
- 重複防止
- 保存失敗時は自動再試行
- 自動再試行でも失敗した場合は「もういちどゲットする」
```

重要な修正済みロジック:

```js
isSavingReward = false;
await handleRewardSave();
```

このロジックは絶対に巻き戻さないこと。

また、「もういちどゲットする」ボタンの再試行処理も維持すること。

```js
retryRewardButton.addEventListener("click", function() {
  if (isSavingReward) return;
  if (pendingRewardPokemon.length > 0) {
    handleRewardSave();
  } else {
    showResult();
  }
});
```

---

## 7. Firestore データ前提

V2 ユーザーデータは以下。

```text
collection: users_v2
document: guest
```

確認用データの前提:

```json
{
  "displayName": "ゲスト",
  "cleared_generations": 2,
  "current_gen_owned": [1, 2, 3, 5, 10]
}
```

意味:

```text
cleared_generations: 2
→ 第1世代・第2世代は完了済み
→ 現在世代は第3世代（ホウエン）

current_gen_owned
→ 第3世代内の取得済み local_id
```

途中で実際にクイズをクリアし、ポケモン取得・DB更新が成功したことを確認済みです。

ユーザーは「ゲストのデータはこのままでよい」と明示しています。

Firestore Console では `number` 型ではなく `int64` と表示されます。
`cleared_generations` と `current_gen_owned` の各要素は `int64` で問題ありません。

---

## 8. UI/UX 表記ルール

現在の会話上の最新合意は以下です。

```text
- タイトルは「ポケモンさんすう」。改行しない。
- サブタイトルは「世代を すすめる あたらしい ぼうけん」。
- 「第◯世代」を使う。「第◯せだい」に戻さない。
- 「いまの 世代」を使う場合は「世代」を漢字にする。
- 完了文言は「全世代コンプリート！」。
- トップ画面のポケモン名キャプションは表示しない。
- ユーザー選択画面のポケモン名キャプションも表示しない。
- トップ画面の「ユーザーを えらんで ぼうけんを はじめよう！」は戻さない。
- 「じゅんびできました！」表示は戻さない。
```

注意:

```text
docs/ui_ux_v2.md には一部「第◯せだい」表記が残っている。
会話上の最新合意は「第◯世代」。
必要であれば、後続で docs/ui_ux_v2.md の表記更新を検討する。
```

---

## 9. Codex / ChatGPT / GitHub の役割分担

合意済みの役割分担は以下。

```text
ChatGPT:
- 方針整理
- 論点整理
- 仕様レビュー
- Codex指示文作成
- Codex出力レビュー
- 必要に応じてGitHub PR作成

Codex:
- リポジトリ内容を読んでコード案を作成
- GitHubへ直接 commit / push / PR はしない
- 完成版HTML全文をテキストで返す
- 長い場合は Part 1 / Part 2 / Part 3 に分割して返す

GitHub:
- 正本管理
- PRレビュー
- マージ
```

今回の反省:

```text
- Codex Web版はPR作成できない前提を忘れない。
- ChatGPT がPR作成担当。
- ただし巨大HTMLを GitHub update_file に渡す場合は、content にファイルパスではなくHTML本文そのものを渡す。
- content: "/mnt/data/xxx.html" はNG。
- content: "<!DOCTYPE html> ... </html>" が正しい。
```

---

## 10. 次に進むべき作業

次は **Step 6-7: 世代開始・世代クリア・全世代コンプリート** の論点整理から進める。

いきなり実装しない。

必ず以下の順で提示する。

```text
1. 全体像
2. 現在地
3. 今回ステップの目的
4. 実施範囲
5. 含めない範囲
6. 判断が必要な論点
7. 実装指示 or PR作成
```

---

## 11. Step 6-7 の検討テーマ

Step 6-7 の目的は以下。

```text
世代開始・世代クリア・全世代コンプリートの体験を実装する。
```

検討が必要な論点:

```text
論点1:
現在世代の current_gen_owned が0匹の場合、世代開始画面を出すか。

例:
ホウエン地方のポケモンを ゲットしに いこう！

論点2:
ポケモン取得保存後に、現在世代の全ポケモンを取得済みになった場合、即座に cleared_generations を +1 するか。

論点3:
世代クリア時に current_gen_owned をどうするか。

想定:
- cleared_generations を +1
- 次世代に進む場合 current_gen_owned は [] にリセット
- 第9世代クリア時は cleared_generations = 9
- 全世代コンプリート時は current_gen_owned = [] または現状維持のどちらにするか要検討

論点4:
世代クリア画面を結果画面の後に表示するか、結果画面内に表示するか。

論点5:
全世代コンプリート後もクイズを継続できるようにするか。

過去方針:
- 全世代コンプリート後もクイズは継続挑戦可能
- 図鑑はいつでも閲覧可能
- 新規ポケモン取得は発生しない

論点6:
全世代コンプリート後のメニュー表示。

候補:
全世代コンプリート！
さんすうに ちょうせんできるよ！

論点7:
Firestore transaction の設計。

重要:
- ポケモン保存処理と世代クリア更新をどう一体化するか
- 二重実行・連打で cleared_generations が過剰に進まないようにする
- current_gen_owned のリセットタイミング
```

---

## 12. Step 6-7 で特に注意すること

```text
- users_v2 への書き込みが増えるため、実装前に必ず仕様判断する。
- cleared_generations 更新は危険なので transaction 前提。
- current_gen_owned リセットも危険なので、仕様確定後に実装する。
- Step 6-5 の保存処理を壊さない。
- 図鑑表示のクリア済み世代扱いと矛盾させない。
- root index.html は触らない。
- masters は読み取り専用。
```

---

## 13. 次チャット開始時の確認事項

次チャットでは、まず GitHub 上の現状を確認する。

確認対象:

```text
- /docs 以下
- AGENTS.md
- canary/index.html
- root index.html
- 直近のコミット / PR 状況
```

特に `canary/index.html` について、以下を確認する。

```text
- Canary バッジが V2 Canary 202606031930 になっているか。
- body.modal-open が消えているか。
- modal backdrop が .app 外にあるか。
- 右上 × ボタンがあるか。
- 背景クリックで閉じる実装があるか。
- zukan-grid が内部スクロールになっているか。
- root index.html が変更されていないか。
```

確認後、Step 全体像と現在地を提示し、Step 6-7 の論点整理に入る。

---

## 14. 現在の結論

```text
Step 6-6c まで完了。
図鑑モーダルのV1.5回帰修正はGitHubへコミット済み。
画面でも修正確認済み。
次は Step 6-7 の論点整理から。
```
