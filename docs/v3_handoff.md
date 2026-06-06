# PokeMath V3 引き継ぎメモ

最終更新: 2026-06-07

## 1. 現在地

PokeMath V3 は、V2 Main を直接壊さずに `v3/` ディレクトリで検証するシングルHTML分割プロジェクトです。

現時点では、V3 Phase 1A / 1B / 1C / 1D まで完了しています。

```text
現在地:
V3 Phase 1D 完了直後
/pokemon-math/v3/ 実機確認OK

次に進む候補:
V3 Phase 2 設計
```

V2 Main の正本は引き続き root `index.html` です。

```text
root index.html
→ V2 Main 本番版。通常ユーザー向けの正本。

v3/index.html
→ V3 開発・検証版。GitHub Pages上で /pokemon-math/v3/ として確認する。

v3/css/app.css
→ V3用CSS。

v3/js/
→ V3用JavaScript分割ファイル群。
```

## 2. 完了済みPR

### PR #24: Add V3 Phase 1A verification app

状態: merged

内容:

```text
- v3/index.html を追加
- v3/css/app.css を追加
- v3/js/app.js を追加
- V2 Main相当の構成を v3/ に複製
- CSS / JS を外部ファイル化
- root index.html は変更なし
```

実機確認:

```text
/pokemon-math/v3/ で確認OK
```

### PR #26: Split V3 JavaScript into namespaces

状態: merged

内容:

```text
- v3/js/app.js を責務単位に分割
- 通常script方式を維持
- ES Modules化はしない
- window.AppXXX 名前空間方式を採用
```

追加・更新ファイル:

```text
更新:
- v3/index.html
- v3/js/app.js

追加:
- v3/js/config.js
- v3/js/constants.js
- v3/js/state.js
- v3/js/dom.js
- v3/js/ui.js
- v3/js/firestore.js
- v3/js/quiz.js
- v3/js/reward.js
- v3/js/zukan.js
```

実機確認:

```text
/pokemon-math/v3/ で確認OK
```

### PR #27: Clean up V3 Phase 1C JavaScript namespaces

状態: merged

内容:

```text
- 未使用 window.AppConfig 参照を削除
- dom.js / ui.js / quiz.js の明らかなインデントを整形
- reward.js / zukan.js は未使用 config 削除のみ
- ロジック変更なし
- UI文言変更なし
- Firestore仕様変更なし
```

変更ファイル:

```text
- v3/js/dom.js
- v3/js/quiz.js
- v3/js/reward.js
- v3/js/ui.js
- v3/js/zukan.js
```

実機確認:

```text
/pokemon-math/v3/ で確認OK
```

### PR #28: Show correct answer after wrong V3 quiz choice

状態: merged

内容:

```text
- 不正解時に、選択した誤答ボタンへ wrong を付与
- 不正解時に、正解ボタンへ correct を付与
- 不正解時メッセージに正解値を表示
- QUIZ_NEXT_DELAY_MS は変更なし
- 正解数カウント仕様は変更なし
- 報酬仕様は変更なし
- Firestore仕様は変更なし
```

変更ファイル:

```text
- v3/js/quiz.js
```

実機確認:

```text
/pokemon-math/v3/ で確認OK
```

## 3. 現在のV3構成

```text
v3/
├─ index.html
├─ css/
│  └─ app.css
└─ js/
   ├─ config.js
   ├─ constants.js
   ├─ state.js
   ├─ dom.js
   ├─ ui.js
   ├─ firestore.js
   ├─ quiz.js
   ├─ reward.js
   ├─ zukan.js
   └─ app.js
```

### ファイル責務

```text
config.js:
- Firebase設定
- window.AppConfig

constants.js:
- 固定値、ユーザー定義、世代名、クイズ定数
- window.AppConstants

state.js:
- アプリ状態、保存中フラグ、選択ユーザー、クイズ進行、図鑑状態、マスターキャッシュ
- window.AppState

dom.js:
- DOM参照の集約
- window.AppDom

ui.js:
- 画面切り替え、メニュー、結果、世代開始、世代クリア、全世代コンプリート表示
- window.AppUI

firestore.js:
- Firebase初期化
- users_v2読込
- masters読込
- users_v2保存transaction
- window.AppFirestore

quiz.js:
- 問題生成
- 選択肢生成
- クイズ進行
- 回答処理
- 不正解時の正解表示
- window.AppQuiz

reward.js:
- 報酬数計算
- 未取得ポケモン抽選
- 世代クリア判定
- 全世代コンプリート判定
- 報酬保存フロー
- window.AppReward

zukan.js:
- 図鑑表示
- 図鑑グリッド
- ポケモン詳細モーダル
- window.AppZukan

app.js:
- イベントハンドラ登録
- アプリ起動
```

## 4. 現在維持している重要仕様

```text
- root index.html は V2 Main のまま
- v3/ はV3検証版
- GitHub Pagesでは /pokemon-math/v3/ で確認
- Firebase SDKはCDN読み込みを維持
- V3は通常script方式を維持
- type="module" は未導入
- import / export は未導入
- window.AppXXX 名前空間方式で分割
- Firestore users_v2 を正本として利用
- Firestore masters/gen_{1..9} は読み取り専用
- users_v3 は作らない
- owned_by_generation は追加しない
- migration_logs は作らない
- root index.html への昇格はまだしない
```

## 5. Phase 1D 不正解時の正解表示仕様

現行V3では、不正解時に正解の選択肢も表示されます。

```text
正解時:
- 選択した正解ボタンに correct を付与
- メッセージは「⭕ せいかい！」
- correctCount を加算
- 次問題へ進む

不正解時:
- 選択した誤答ボタンに wrong を付与
- 正解ボタンに correct を付与
- メッセージに「せいかいは X」を表示
- correctCount は加算しない
- 次問題へ進むまで wrong / correct 表示を維持
- 次問題では resetAnswerButtons() で表示をリセット
```

変更箇所:

```text
v3/js/quiz.js
answerQuestion(button)
```

## 6. 変更してはいけないこと

V3作業中は、明示的な合意がない限り以下を変更しません。

```text
- root index.html
- canary/index.html
- canary/migration.html
- archive/index_v1_5.html
- Firestoreデータ
- users_v2 データ構造
- users データ
- masters/gen_{1..9}
- GitHub Pages設定
- V2 Mainの通常導線
- migration.html への通常導線禁止ルール
```

## 7. 実機確認方針

V3の確認URL:

```text
https://mantanak-jp.github.io/pokemon-math/v3/
```

原則として `guest` を使います。

`ryoma` / `sara` は実データのため、原則として表示確認のみとし、検証で不用意に変更しません。

最低限の確認項目:

```text
- /pokemon-math/v3/ が開く
- はじめるボタンが有効になる
- guest を選択できる
- メニュー画面が表示される
- レベル選択ができる
- クイズを開始できる
- 正解時に正解ボタンが correct 表示になる
- 不正解時に誤答ボタンが wrong 表示になる
- 不正解時に正解ボタンが correct 表示になる
- 不正解時に「せいかいは X」が表示される
- 次の問題で correct / wrong 表示がリセットされる
- 図鑑を開ける
- 詳細モーダルが表示される
```

## 8. 次にやること

次は、V3 Phase 2 に進む前に設計整理を行うのが推奨です。

```text
次の推奨:
V3 Phase 2 設計

目的:
- ES Modules化の進め方を決める
- import / export 化の対象範囲を決める
- main.js 起点にするか、app.js 起点にするか決める
- state.js を mutable singleton として扱うか決める
- dom.js のDOM取得タイミングを確認する
- firestore.js / reward.js / zukan.js などの循環依存リスクを整理する
- Phase 2を1PRでやるか、2A/2Bに分けるか決める
```

候補ファイル:

```text
docs/v3_phase_2_design.md
```

## 9. 次チャット開始時の推奨アクション

```text
1. この docs/v3_handoff.md を確認する
2. docs/v3_refactoring_plan.md の現在地を確認する
3. /pokemon-math/v3/ が引き続き動作している前提にする
4. Phase 2の設計から開始する
5. 実装に入る前に、Phase 2を1PRで行うか分割するか決める
```

## 10. GitHub操作ルール

読み取り以外のGitHub操作は、事前説明と明示承認後に実行します。

状態変更操作に該当するもの:

```text
- ブランチ作成
- ファイル作成
- ファイル更新
- ファイル削除
- PR作成
- PR更新
- PRマージ
- ブランチ削除
```

状態変更前には、以下を説明します。

```text
- 実行対象
- 実行内容
- 影響範囲
- 後戻り可否
- 変更されないもの
```

そのうえで、ユーザーの明示的なOKを得てから実行します。
