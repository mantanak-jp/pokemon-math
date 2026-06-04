# V2 Canary 開発引き継ぎメモ

最終更新: 2026-06-04

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
→ V2 Canary 本体。現在の開発・検証対象。

canary/migration.html
→ V1.5→V2移行ツール。通常プレイ導線には混ぜない。

canary/index_ui.html
→ V2 UI プロトタイプ。参考扱い。

canary/index_dev_masterdata_2.html
→ マスターデータ取得・Firestore投入用の開発ダッシュボード。参考・履歴扱い。
```

V2 本体では以下を守ります。

```text
- users コレクションは V1.5 用。V2本体からは原則読まない・書かない。
- users_v2 が V2 ユーザーデータの正本。
- masters/gen_{1..9} は読み取り専用。
- root index.html は Main 昇格まで変更しない。
- V1.5→V2移行ツールは canary/migration.html に分離する。
- 通常ユーザー・子ども向け導線に migration.html へのリンクを置かない。
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
  ✅ 完了

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
    ❌ ただし実機確認で改悪あり

  Step 6-6c: 図鑑スクロール領域・モーダル仕様のV1.5回帰修正
    ✅ 完了
    ✅ GitHubへコミット済み
    ✅ 画面確認済み

  Step 6-7: 世代開始・世代クリア・全世代コンプリート
    ✅ 完了
    ✅ GitHubへコミット済み
    ✅ 実機確認済み

  Step 6-8: canary/migration.html + V1.5→V2移行
    ✅ 完了
    ✅ ryoma / sara 移行完了
    ✅ guest は移行対象外として既存ダミーデータを維持

Step 7: Canary検証・Main昇格準備
  ← いまここ

  Step 7-1A: 通常プレイ・保存・図鑑反映確認
    ✅ 完了

  Step 7-1B: 世代クリア処理確認
    ✅ 完了

  Step 7-1B-UX: 世代クリア時と結果画面の導線改善
    ✅ 完了
    ✅ GitHubへコミット済み
    ✅ 実機確認済み
    ✅ 受け入れOK

  Step 7-1C: Canary最終回帰確認
    ✅ 完了
    ✅ 受け入れOK

  Step 7-2: docs / handoff 更新
    ← 次に実施中

Step 8: Main昇格準備・Main昇格
  未着手
```

現在地は以下です。

```text
Step 7-1C まで完了。
次は Step 7-2 として docs / handoff を現在の実装に合わせて更新する。
その後、Step 8: Main昇格準備に進む。
```

---

## 4. 現在の canary/index.html の状態

現在の `canary/index.html` は V2 Canary 本体です。

Canary バッジ:

```text
V2 Canary 20260604-step7-1b-ux
```

この状態で、以下の実機確認が完了しています。

```text
- ryoma の初期表示
- sara の初期表示
- guest の初期表示
- guest で通常プレイ
- guest でポケモン取得
- guest で users_v2 保存
- guest の図鑑反映
- 図鑑表示
- 図鑑詳細モーダル
- モーダル背景クリックで閉じる
- 右上 × で閉じる
- 下部の「とじる」ボタンが復活していないこと
- 世代クリア処理
- 世代クリア後の統合画面
- 結果画面の「ずかんをみる」導線
- migration.html が通常導線に混ざっていないこと
```

---

## 5. Step 6-5 の重要ロジック

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

このロジックは、保存開始前に `isSavingReward` を戻してから `handleRewardSave()` を呼ぶために必要です。

今後の修正で以下のように戻してはいけません。

```js
await handleRewardSave();
```

理由:

```text
handleRewardSave() 冒頭で isSavingReward を見ているため、
isSavingReward が true のままだと保存処理が実行されない。
```

---

## 6. Step 6-6c の最終仕様

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

---

## 7. Step 6-7 の最終仕様

Step 6-7 では、世代開始・世代クリア・全世代コンプリートを実装しました。

### 7.1 世代開始画面

以下の条件で世代開始画面を表示します。

```text
- current_gen_owned が0匹
- 同一セッションで、そのユーザー・その世代の開始画面をまだ表示していない
- ユーザーがメニューでレベルを選択した
```

表示例:

```text
ジョウトちほうへ！

第2世代の ポケモンを
ゲットしにいこう！
```

表示済み管理は Firestore ではなく `sessionStorage` です。

キー例:

```text
v2_start_screen_shown_ryoma_gen_2
```

### 7.2 世代クリア処理

ポケモン保存 transaction の中で、世代コンプリート判定と `cleared_generations` 更新を行います。

世代クリア時の更新:

```json
{
  "cleared_generations": 3,
  "current_gen_owned": []
}
```

第9世代クリア時:

```json
{
  "cleared_generations": 9,
  "current_gen_owned": []
}
```

重要:

```text
- transaction 外で cleared_generations += 1 しない。
- current_gen_owned 保存後に別処理で cleared_generations を更新しない。
- 二重実行・再試行・別タブ操作で cleared_generations が過剰に進まないようにする。
```

### 7.3 全世代コンプリート

`cleared_generations === 9` を全世代コンプリートの正本とします。

全世代コンプリート後:

```text
- 図鑑は全世代を全開放する。
- クイズは継続可能。
- 新規ポケモン取得は発生しない。
- Firestore 書き込みも発生しない。
```

---

## 8. Step 7-1B-UX の最終仕様

世代クリア処理は機能的には正しく動いたものの、当初の画面遷移は以下で冗長でした。

```text
結果画面
  ↓
第◯世代クリア画面
  ↓
次世代スタート画面
```

実機確認後、以下のUXに改善しました。

### 8.1 通常結果画面

通常のポケモン取得後の結果画面は、以下の3ボタン構成です。

```text
[同じレベルでつづける]
[ずかんをみる]
[メニューへもどる]
```

従来の `もういちど` は、通常結果画面では使用しません。

ただし、保存失敗時の手動再試行ボタンとして、以下は維持します。

```text
[もういちどゲットする]
```

### 8.2 世代クリア発生時の結果画面

世代クリアが発生した場合、結果画面では以下のみを主導線にします。

```text
[第◯世代クリア！]
```

この画面では以下は表示しません。

```text
- 同じレベルでつづける
- ずかんをみる
- メニューへもどる
```

理由:

```text
世代クリア時は、まずクリア後の統合画面へ進ませる方が自然なため。
```

### 8.3 世代クリア後の統合画面

従来分かれていた以下2画面を統合しました。

```text
第◯世代クリア画面
次世代スタート画面
```

現在は1画面で以下を表示します。

```text
第3世代 クリア！

ホウエンちほうの ポケモンを
ぜんぶ ゲットしたよ！

第4世代（シンオウ）が
あたらしく 解放されたよ！
```

ボタンは以下です。

```text
[同じレベルでつづける]
[ずかんをみる]
[メニューへもどる]
```

`同じレベルでつづける` を押すと、次世代で直前と同じレベルのクイズを開始します。

`ずかんをみる` を押すと、図鑑へ遷移します。可能であれば解放された次世代タブを表示します。

### 8.4 第9世代クリア時

第9世代クリア時は次世代がないため、全世代コンプリート画面を表示します。

表示:

```text
全世代コンプリート！

すべての ポケモンを
ゲットしたよ！
```

ボタン:

```text
[同じレベルでつづける]
[ずかんをみる]
[メニューへもどる]
```

---

## 9. Step 6-8: V1.5→V2移行の最終仕様

V1.5→V2移行は `canary/migration.html` に分離しました。

### 9.1 対象

移行対象は以下の2ユーザーです。

```text
ryoma
sara
```

`guest` は移行対象外です。

理由:

```text
guest は V2 検証用のダミーデータとして users_v2/guest を維持するため。
```

### 9.2 移行元・移行先

```text
V1.5:
users/りょうま
users/さら

V2:
users_v2/ryoma
users_v2/sara
```

念のため、移行ツールでは以下の順で読み取ります。

```text
ryoma:
1. users/りょうま
2. users/ryoma

sara:
1. users/さら
2. users/sara
```

### 9.3 保存フィールド

保存するフィールドは以下の3つだけです。

```json
{
  "displayName": "りょうま",
  "cleared_generations": 1,
  "current_gen_owned": []
}
```

保存しないフィールド:

```text
- createdAt
- updatedAt
- migratedAt
- migrated_from_v1
- migration_logs
- owned_by_generation
```

### 9.4 ryoma の変換

`ryoma` は第1世代クリア済みとして扱います。

移行後:

```json
{
  "displayName": "りょうま",
  "cleared_generations": 1,
  "current_gen_owned": []
}
```

意味:

```text
第1世代クリア済み。
第2世代を0匹から開始。
```

### 9.5 sara の変換

`sara` は第1世代途中として扱います。

移行後:

```json
{
  "displayName": "さら",
  "cleared_generations": 0,
  "current_gen_owned": [V1.5で取得済みの第1世代local_id配列]
}
```

意味:

```text
第1世代に挑戦中。
V1.5で取得済みだった第1世代ポケモンを引き継ぐ。
```

実機確認時点では、`sara` は第1世代 115 / 151 として表示されました。

### 9.6 上書きルール

`users_v2/{userId}` が既に存在する場合は、画面上で既存データを表示します。

無条件上書きはしません。

ただし、運用者が明示的に `上書きして移行する` を押した場合のみ上書き可能です。

### 9.7 V1.5元データが存在しない場合

V1.5元データが存在しない場合、プレビューは表示しますが保存ボタンは無効化します。

理由:

```text
特に sara は途中経過を引き継ぐ前提のため、
V1.5元データなしで保存すると進捗を空にしてしまうリスクがある。
```

---

## 10. 移行後の実データ確認結果

移行後、`canary/index.html` の図鑑表示で以下を確認済みです。

```text
りょうま:
第2世代（ジョウト）
0 / 100 ひき ゲットずみ

さら:
第1世代（カントー）
115 / 151 ひき ゲットずみ

ゲスト:
第3世代（ホウエン）
既存ダミーデータを維持
```

この状態で、移行は成功と判断しています。

---

## 11. Canary総合検証結果

### 11.1 Step 7-1A: 通常プレイ・保存・図鑑反映

`guest` で通常プレイを行い、以下を確認済みです。

```text
- クイズ開始
- 5問回答
- 4問以上正解時のポケモン取得
- users_v2/guest への保存
- 図鑑の取得数増加
- 結果画面から図鑑への遷移
```

実ユーザーである `ryoma` / `sara` は、データを動かさない方針としました。

### 11.2 Step 7-1B: 世代クリア処理

`guest` を第3世代クリア直前データに変更して、以下を確認済みです。

```json
{
  "displayName": "ゲスト",
  "cleared_generations": 2,
  "current_gen_owned": [1, 2, 3, ..., 134]
}
```

この状態で `guest` は以下になります。

```text
第3世代（ホウエン）
134 / 135 ひき ゲットずみ
```

その後、4問以上正解して残り1匹を取得し、以下を確認しました。

```text
- 第3世代クリア処理が走る
- cleared_generations が 3 になる
- current_gen_owned が [] になる
- 第4世代（シンオウ）が解放される
```

### 11.3 Step 7-1B-UX: UX改善

以下のUX改善を反映し、実機確認済みです。

```text
- 通常結果画面に「ずかんをみる」を追加
- 「もういちど」を「同じレベルでつづける」に変更
- 通常結果画面を3ボタン構成に変更
- 世代クリア発生時の結果画面を「第◯世代クリア！」の1ボタンに変更
- 世代クリア画面と次世代スタート画面を統合
- 統合画面に「同じレベルでつづける」「ずかんをみる」「メニューへもどる」を表示
```

### 11.4 Step 7-1C: Canary最終回帰確認

以下は確認済みです。

```text
- ryoma 初期表示
- sara 初期表示
- guest 初期表示
- guest 通常プレイ
- guest 保存・図鑑反映
- 結果画面の3ボタン
- 結果画面から図鑑へ遷移
- 図鑑タブ
- 図鑑グリッド
- 図鑑詳細モーダル
- モーダル背景クリックで閉じる
- 右上 × で閉じる
- 下部の「とじる」ボタンが復活していない
- 世代クリア結果画面
- 世代クリア統合画面
- migration.html が通常導線に混ざっていない
- root index.html が未変更
```

Step 7-1C は受け入れOKです。

---

## 12. 既知の注意点

### 12.1 root index.html はまだ V1.5

`root index.html` は本番版 V1.5 のままです。

Main昇格までは変更しません。

### 12.2 canary/index.html は単一HTMLとして大きい

`canary/index.html` は単一HTMLであり、ファイルサイズが大きくなっています。

Codex Web版で全文出力する際は、今後も分割出力になる可能性が高いです。

対応方針:

```text
- Codexには Part 1 / N のような分割出力を指示する。
- ChatGPT側で結合・構文確認・禁止事項確認を行う。
- GitHubにはユーザーがコミットする。
```

### 12.3 分割HTMLの結合時に改行が詰まる可能性

過去の結合で、以下のように改行が詰まる箇所がありました。

```html
<h1 class="title">ポケモンさんすう</h1>      <p class="subtitle">
```

構文上は問題ありませんが、可読性には影響します。

Main昇格前に、必要なら軽い整形を検討します。

### 12.4 normalizeGenerationNumber

Step 7-1B-UX の結合時に、`normalizeGenerationNumber()` が未定義だと世代クリア時に実行時エラーになることが分かりました。

現在の `canary/index.html` には追加済みです。

今後、世代クリア周りを触る際は、この関数を削除しないこと。

---

## 13. 今後の作業

次に進むべき作業は以下です。

```text
Step 7-2:
docs / handoff 更新

対象:
- docs/v2_canary_handoff.md
- docs/migration_v1_to_v2.md
- docs/ui_ux_v2.md

Step 8:
Main昇格準備

候補作業:
- docs/release_and_canary.md の最終確認
- docs/current_inventory.md の必要最小更新
- canary/index.html の軽微整形確認
- canary/index.html を root index.html に反映する方針の最終確認
- Main昇格用コミットまたはPR
```

---

## 14. Main昇格前の最終判断事項

Main昇格前に、以下を確認します。

```text
1. canary/index.html を root index.html にそのまま反映するか
2. canary/migration.html は残すか
3. migration.html への通常導線がないことを再確認するか
4. V1.5 root index.html を退避ファイルとして残すか
5. Main昇格後、users_v2 を本番正本として使うことで問題ないか
6. V1.5 users コレクションを読み続けないことで問題ないか
```

現時点の推奨:

```text
- Main昇格時は canary/index.html を root index.html に反映する。
- canary/index.html は引き続き Canary 検証用として残してよい。
- canary/migration.html は運用者向け移行ツールとして残してよいが、通常導線には出さない。
- V1.5 root index.html は必要なら docs または archive に退避する。
```

---

## 15. 次回チャットへの引き継ぎ要約

```text
pokemon-math V2 Canary は Step 7-1C まで完了済み。

現在の canary/index.html:
V2 Canary 20260604-step7-1b-ux

完了済み:
- V2データモデル users_v2
- masters/gen_{1..9} 読み取り
- メニュー進捗表示
- クイズ
- ポケモン取得
- Firestore transaction 保存
- 図鑑
- 詳細モーダル
- 世代開始
- 世代クリア
- 全世代コンプリート
- V1.5→V2移行ツール canary/migration.html
- ryoma / sara 移行
- guest ダミーデータ維持
- 通常プレイ保存確認
- 世代クリア確認
- 結果画面UX改善
- Canary最終回帰確認

移行後の状態:
- ryoma: 第2世代（ジョウト）0 / 100
- sara: 第1世代（カントー）115 / 151
- guest: 検証用ダミーデータ。第3世代クリア検証にも使用。

重要注意:
- root index.html はまだ V1.5。本番版として未変更。
- V2本体は canary/index.html。
- migration.html は通常導線に混ぜない。
- users は V1.5用。V2本体からは読まない・書かない。
- users_v2 が V2正本。
- body.modal-open は戻さない。
- 図鑑モーダルは body直下相当の外側レイヤー。
- 下部の「とじる」ボタンは復活させない。
- 保存失敗時の「もういちどゲットする」は維持。
- 通常結果画面は「同じレベルでつづける」「ずかんをみる」「メニューへもどる」。
- 世代クリア発生時の結果画面は「第◯世代クリア！」のみ。
- 世代クリア後は、世代クリア + 次世代解放の統合画面。
- Step 7-2 docs更新後、Step 8 Main昇格準備へ進む。
```
