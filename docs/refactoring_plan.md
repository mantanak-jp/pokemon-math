# index.html 分割・リファクタリング計画

最終更新: 2026-06-06

## 1. 目的

この文書は、現在 `index.html` の単一ファイルにまとまっている V2 Main 本体を、段階的に分割・整理するための計画を定義します。

目的は以下です。

```text
- コードの見通しをよくする
- 修正時の影響範囲を小さくする
- PR差分を確認しやすくする
- 今後の機能追加に耐えられる構成にする
- iPhone / GitHub / ChatGPT / Codex Web版を前提とした開発運用を維持する
```

今後想定する拡張は以下です。

```text
- 算数レベル追加
  - 割り算
  - 文章題
  - 時計
  - 単位
  - 図形

- 算数以外のクイズ
  - 国語
  - 英語
  - 理科
  - 社会
  - ポケモン知識クイズ

- 図鑑以外の報酬設計
  - バッジ
  - アイテム
  - 称号
  - アバター
  - ステージ解放
```

## 2. 現在の課題

現在の V2 Main は root `index.html` に以下が同居しています。

```text
- HTML画面構造
- CSSスタイル
- Firebase初期化
- Firestore読み書き
- ユーザー状態管理
- クイズ生成ロジック
- 報酬抽選ロジック
- 世代進行ロジック
- 図鑑表示
- ポケモン詳細モーダル
- イベントハンドラ
```

V2 Main昇格直後の安定運用としては問題ありません。

しかし、今後の機能追加を考えると、以下の課題があります。

```text
- ファイルが長く、目的の処理を探しにくい
- CSS変更とJS変更が同じファイル差分に混ざる
- クイズロジックと報酬ロジックが密結合しやすい
- Firestore読み書き先の変更リスクをレビューしにくい
- 図鑑以外の報酬を追加する際に影響範囲が広がりやすい
- Codexで大きなファイルを扱う際に分割出力・結合ミスが起きやすい
```

## 3. 基本方針

リファクタリングは、以下の方針で進めます。

```text
- 本番動作を変えない
- データ構造を変えない
- Firestore読み書き先を変えない
- 機能追加とリファクタリングを同じPRに混ぜない
- iPhone中心でも確認できる構成を維持する
- npm / build / bundler を前提にしない
- 仕様変更を伴う前に、先にドキュメントで設計を固める
```

当面は、GitHub Pagesでそのまま動く静的構成を維持します。

```text
採用する:
- HTML
- CSS
- JavaScript
- GitHub Pages
- Firebase compat SDK

当面採用しない:
- npm必須構成
- build必須構成
- TypeScript
- Vite
- React
- Next.js
- Webpack
```

## 4. 採用する分割方針

比較対象として、以下3案を検討しました。

```text
A案:
CSS / JS 外出しのみ

AB中間案:
CSS外出し + JSを大分類で分割

B案:
CSS外出し + JSを責務単位で本格分割
```

検討の結果、本プロジェクトでは **B案を採用方針** とします。

理由は以下です。

```text
- 将来的に算数レベル追加や算数以外のクイズ追加を想定している
- 図鑑以外の報酬設計も将来検討したい
- 状態管理、Firestore、クイズ、報酬、図鑑、UIの責務を分けた方が、長期的なメンテナンス性が高い
- Firestore読み書き先を firestore.js に閉じ込めることで、データ事故リスクをレビューしやすくなる
- state.js を独立させることで、保存中フラグ、世代進行、図鑑状態を追いやすくなる
```

ただし、B案は構造変更としては大きいため、実装は段階化します。

```text
Phase 1A:
CSS / JS 外出し

Phase 1B:
B案の責務分割

Phase 2:
クイズエンジン化

Phase 3:
報酬エンジン化
```

## 5. A案 / AB中間案 / B案の位置づけ

### 5.1 A案

構成:

```text
index.html
css/
  app.css
js/
  app.js
```

評価:

```text
- 最も安全
- ただし app.js が巨大なまま
- 将来拡張性・メンテナンス性の改善は限定的
```

A案だけで止めると、今回の目的である将来拡張性・メンテナンス性の向上には不十分です。

### 5.2 AB中間案

構成:

```text
index.html
css/
  app.css
js/
  constants.js
  data.js
  quiz.js
  reward.js
  zukan.js
  ui.js
  app.js
```

評価:

```text
- A案より拡張性が高い
- B案より安全
- ただし data.js に Firebase設定、Firestore、状態管理が混ざりやすい
- state.js が独立しないため、将来の状態管理が曖昧になりやすい
```

AB中間案は現実的な選択肢ですが、本プロジェクトでは将来拡張性を重視するため、採用方針はB案とします。

### 5.3 B案

構成:

```text
index.html
css/
  app.css
js/
  constants.js
  config.js
  state.js
  firestore.js
  quiz.js
  reward.js
  zukan.js
  ui.js
  app.js
```

評価:

```text
- 将来拡張性が最も高い
- 状態管理の所在が明確になる
- Firestore操作の所在が明確になる
- クイズ・報酬・図鑑・UIを個別に保守しやすい
- 初回分割の難易度は高い
```

B案は、仕様変更を伴わずに段階的に実施する前提で採用します。

## 6. 大規模改修の定義

このプロジェクトでは、大規模改修を以下のように定義します。

```text
大規模改修とは、ファイル数が多いこと自体ではなく、
仕様変更・構造変更・データ変更・初期化方式変更が同一PRに複数同時に入ることを指す。
```

同一PRで以下のうち2つ以上を行う場合は、大規模改修として扱います。

```text
- ファイル構成変更
- JSモジュール方式変更
- アプリ状態管理方式変更
- Firebase初期化方式変更
- Firestore読み書き仕様変更
- データモデル変更
- UI/UX変更
- クイズ仕様変更
- 報酬仕様変更
- 図鑑仕様変更
- リリース導線変更
```

一方で、以下は「管理されたリファクタリング」として扱います。

```text
- 仕様を変えずに CSS を外部ファイルへ移す
- 仕様を変えずに JS を外部ファイルへ移す
- 仕様を変えずに既存関数を責務別ファイルへ移す
- Firestore読み書き先を変えずに firestore.js へ処理を移す
- UI文言を変えずに ui.js へ表示処理を移す
- クイズ仕様を変えずに quiz.js へ問題生成処理を移す
- 報酬仕様を変えずに reward.js へ報酬処理を移す
```

## 7. B案Phase 1Bの扱い

B案のPhase 1Bは、構造変更としては大きいものの、以下を守る前提では大規模改修ではなく **管理された中規模リファクタリング** として扱います。

```text
- 仕様変更しない
- UI文言を変えない
- Firestoreデータ構造を変えない
- users / users_v2 / masters の扱いを変えない
- 報酬仕様を変えない
- クイズ仕様を変えない
- 図鑑仕様を変えない
- migration.html への通常導線を追加しない
```

ただし、実施時のチェックは大規模改修に近い慎重さで行います。

```text
- 変更対象を明示する
- 変更しないものを明示する
- Firestore影響を明記する
- guestで回帰確認する
- ryoma / sara は原則表示確認のみ
- PR本文に「管理された中規模リファクタリング」であることを明記する
- マージ前にFiles changedを再確認する
```

## 8. Phase 1A: CSS / JS 外出し

### 8.1 目的

Phase 1Aでは、まず `index.html` から CSS と JavaScript を外部ファイルに分離します。

目標構成:

```text
/
├─ index.html
├─ css/
│  └─ app.css
└─ js/
   └─ app.js
```

### 8.2 変更内容

```text
- index.html 内の <style> 内容を css/app.css へ移動する
- index.html 内のメイン <script> 内容を js/app.js へ移動する
- Firebase SDK読み込みは index.html 側に残す
- index.html から css/app.css を読み込む
- index.html から js/app.js を読み込む
```

想定する読み込み例:

```html
<link rel="stylesheet" href="./css/app.css">
<script src="./js/app.js" defer></script>
```

### 8.3 Phase 1Aでやらないこと

```text
- ロジック変更
- UI変更
- Firestoreデータ構造変更
- users / users_v2 / masters の扱い変更
- ES Modules化
- クイズ仕様変更
- 報酬仕様変更
- 図鑑仕様変更
```

### 8.4 Phase 1Aの成功条件

```text
- 画面表示が分割前と同じ
- タイトル画面が表示される
- ユーザー選択ができる
- guestでメニュー表示できる
- guestでクイズができる
- guestでポケモン取得・保存できる
- 図鑑が表示できる
- 詳細モーダルが表示できる
- migration.htmlへの通常導線が追加されていない
```

## 9. Phase 1B: B案の責務分割

### 9.1 目的

Phase 1Bでは、Phase 1Aで外出しした `js/app.js` を、B案の責務単位に分割します。

目標構成:

```text
js/
├─ constants.js
├─ config.js
├─ state.js
├─ firestore.js
├─ quiz.js
├─ reward.js
├─ zukan.js
├─ ui.js
└─ app.js
```

### 9.2 分割単位

#### constants.js

以下を管理します。

```text
- USER_OPTIONS
- GENERATION_NAMES
- GENERATION_REGION_NAMES
- QUIZ_QUESTION_COUNT
- QUIZ_NEXT_DELAY_MS
- レベル定義
- sessionStorageキー接頭辞
```

#### config.js

以下を管理します。

```text
- Firebase設定
```

注意:

```text
Firebase Webアプリの設定値はフロントエンドに含まれる。
そのため、Firestore Security Rules で保護する前提を維持する。
```

#### state.js

以下を管理します。

```text
- db
- firebaseReady
- selectedUserId
- selectedUserLabel
- currentUserData
- currentGeneration
- selectedLevel
- currentQuestionIndex
- correctCount
- currentCorrectAnswer
- isAnswered
- quizTimerId
- pendingRewardPokemon
- pendingRewardPokemonList
- isSavingReward
- lastProgressResult
- generationStartLevel
- generationStartTarget
- selectedZukanGeneration
- generationMasterCache
- generationMasterPromises
```

目的:

```text
アプリ状態の所在を明確にし、状態不整合や保存中フラグの扱いを追いやすくする。
```

#### firestore.js

以下を管理します。

```text
- Firebase初期化
- users_v2/{userId} の読み込み
- masters/gen_{1..9} の読み込み
- users_v2/{userId} への保存transaction
- マスターデータキャッシュ読み込み
```

通常プレイ中に触ってよいFirestore:

```text
- users_v2
- masters
```

通常プレイ中に触ってはいけないFirestore:

```text
- users
- migration_logs
```

#### quiz.js

以下を管理します。

```text
- 問題生成
- 選択肢生成
- クイズ進行補助
```

今後の拡張候補:

```text
- 割り算
- 文章題
- 時計
- 単位
- 算数以外のクイズ
```

#### reward.js

以下を管理します。

```text
- 正解数に応じた報酬数計算
- 未取得ポケモン抽選
- レベル別出現プール
- 世代コンプリート判定
- 全世代コンプリート判定
```

今後の拡張候補:

```text
- ポケモン以外の報酬
- バッジ
- アイテム
- 称号
- アバター
```

#### zukan.js

以下を管理します。

```text
- 図鑑タブ表示
- 図鑑グリッド表示
- 未取得ポケモン表示
- 取得済みポケモン表示
- 詳細モーダル表示
```

維持する仕様:

```text
- 図鑑グリッド部分だけをスクロール領域にする
- モーダルは .app の外、body直下相当の外側レイヤーに置く
- 背景クリックで閉じる
- 右上 × で閉じる
- 下部の「とじる」ボタンは復活させない
- body.modal-open は戻さない
```

#### ui.js

以下を管理します。

```text
- 画面切り替え
- ボタン状態制御
- loading表示
- error表示
- menu表示
- result表示
- 世代開始画面表示
- 世代クリア画面表示
- 全世代コンプリート画面表示
```

#### app.js

以下を担当します。

```text
- DOM初期化
- イベントハンドラ登録
- アプリ起動
```

理想的には、`app.js` は薄く保ちます。

## 10. Phase 1Bでやらないこと

Phase 1Bでは、責務分割のみを行い、以下は実施しません。

```text
- ES Modules化
- import / export 化
- TypeScript化
- npm / build 導入
- クイズレベル追加
- 割り算追加
- 算数以外のクイズ追加
- 報酬仕様変更
- 図鑑仕様変更
- UI文言変更
- Firestoreデータモデル変更
- migration.html への通常導線追加
```

Phase 1Bでは、通常の `<script defer>` による複数JS読み込みを前提とします。

例:

```html
<script src="./js/constants.js" defer></script>
<script src="./js/config.js" defer></script>
<script src="./js/state.js" defer></script>
<script src="./js/firestore.js" defer></script>
<script src="./js/quiz.js" defer></script>
<script src="./js/reward.js" defer></script>
<script src="./js/zukan.js" defer></script>
<script src="./js/ui.js" defer></script>
<script src="./js/app.js" defer></script>
```

各ファイル間の連携は、当面 `window.PokeMath` 名前空間を使います。

## 11. Phase 2: クイズエンジン化

Phase 1B完了後、クイズ機能を拡張しやすくするために、クイズ生成をエンジン化します。

目標:

```text
- 算数レベル追加を容易にする
- 算数以外のクイズを追加できるようにする
- UIと問題生成ロジックを分離する
```

将来的な概念:

```text
Course:
- さんすう
- ポケモンクイズ
- こくご
- えいご

Level:
- 1けたの たし・ひき
- 2けた と 1けた
- かけざん 九九
- わり算

Question:
- 問題文
- 正解
- 選択肢
- 解説
```

Phase 2で初めて、割り算などの新機能追加を検討します。

## 12. Phase 3: 報酬エンジン化

Phase 2以降、報酬設計を拡張する場合に検討します。

現在の報酬:

```text
正解数
↓
ポケモン取得
↓
users_v2.current_gen_owned に local_id を保存
```

将来の報酬候補:

```text
- ポケモン
- バッジ
- アイテム
- 称号
- アバター
- ステージ解放
```

データモデル拡張候補:

```text
users_v2/{userId}
  displayName
  cleared_generations
  current_gen_owned
  badges
  items
  quiz_stats
```

または:

```text
users_v2/{userId}
users_v2/{userId}/rewards/{rewardId}
users_v2/{userId}/stats/{courseId}
```

ただし、Phase 3ではFirestore構造への影響が大きいため、必ず事前に `docs/data_model_v1_v2.md` と `docs/system_definition_v2.md` を更新します。

## 13. 優先順位

推奨順は以下です。

```text
1. docs/development_workflow.md 作成
2. docs/refactoring_plan.md 作成
3. docs/review_checklist.md 作成
4. Phase 1A: CSS / JS 外出し
5. Phase 1B: B案の責務分割
6. Phase 2: クイズエンジン化
7. Phase 3: 報酬エンジン化
```

直近では、まず Phase 1A / Phase 1B の設計合意までを対象にします。

## 14. Phase 1A PRの想定スコープ

Phase 1A PRの対象は以下です。

```text
追加:
- css/app.css
- js/app.js

更新:
- index.html
- docs/current_inventory.md
- docs/system_definition_v2.md
- docs/release_and_canary.md
- 必要に応じて docs/v2_canary_handoff.md
```

Phase 1A PRで変更しないもの:

```text
- Firestoreデータ
- users_v2 データ構造
- users データ
- masters/gen_{1..9}
- canary/migration.html
- canary/index.html
- archive/index_v1_5.html
- GitHub Pages設定
- クイズ仕様
- 報酬仕様
- 図鑑仕様
- UI文言
```

## 15. Phase 1B PRの想定スコープ

Phase 1B PRの対象は以下です。

```text
追加:
- js/constants.js
- js/config.js
- js/state.js
- js/firestore.js
- js/quiz.js
- js/reward.js
- js/zukan.js
- js/ui.js

更新:
- js/app.js
- index.html
- docs/current_inventory.md
- docs/system_definition_v2.md
- docs/release_and_canary.md
- docs/v2_canary_handoff.md
```

Phase 1B PRで変更しないもの:

```text
- Firestoreデータ
- users_v2 データ構造
- users データ
- masters/gen_{1..9}
- canary/migration.html
- canary/index.html
- archive/index_v1_5.html
- GitHub Pages設定
- クイズ仕様
- 報酬仕様
- 図鑑仕様
- UI文言
```

## 16. Phase 1A / 1Bのリスク

主なリスクは以下です。

```text
- CSS読み込みパスの誤り
- JS読み込みパスの誤り
- Firebase SDK読み込み順の誤り
- defer指定による初期化順の変化
- DOM取得タイミングの変化
- GitHub Pages上での相対パス不整合
- 関数移動漏れ
- 状態変数の参照漏れ
- state.js 移行時の更新漏れ
- window.PokeMath 名前空間の初期化漏れ
```

特に注意する状態:

```text
- selectedUserId
- currentUserData
- selectedLevel
- correctCount
- pendingRewardPokemon
- isSavingReward
- lastProgressResult
- selectedZukanGeneration
```

## 17. Phase 1A / 1Bの確認項目

最低限以下を確認します。

```text
- タイトル画面が表示される
- 「はじめる」ボタンが有効になる
- ユーザー選択画面が表示される
- guestを選択できる
- メニュー画面が表示される
- 現在世代の進捗が表示される
- レベル選択ができる
- クイズが5問進行する
- 4問以上正解でポケモン取得処理が動く
- Firestore users_v2/guest に保存される
- 図鑑を表示できる
- 詳細モーダルが表示される
- 背景クリックでモーダルが閉じる
- 右上×でモーダルが閉じる
- 下部の「とじる」ボタンが復活していない
- body.modal-open が復活していない
- migration.html への通常導線が追加されていない
```

## 18. 実データ保護方針

Phase 1A / Phase 1B の確認では、原則として `guest` を使用します。

```text
guest:
- 通常プレイ検証に使用可能
- 保存確認に使用可能
- 必要に応じて世代クリア検証に使用可能

ryoma / sara:
- 原則として表示確認のみ
- 不用意にクイズを実行しない
- 不用意にポケモン取得・保存を発生させない
```

## 19. Codex向け実装指示の方針

Codexに依頼する際は、以下を明示します。

```text
- 対象Phaseを明記する
- Phase 1AではCSS/JSの外出しだけを行う
- Phase 1BではB案の責務分割だけを行う
- ロジックの意味は変更しない
- UI文言変更は行わない
- Firestore読み書き先を変更しない
- migration.htmlへの導線を追加しない
- canary/index.html や archive/index_v1_5.html は変更しない
- 差分説明を出す
```

Codexへの指示では、以下のように作業範囲を限定します。

```text
Phase 1A対象:
- index.html
- css/app.css
- js/app.js

Phase 1B対象:
- index.html
- js/app.js
- js/constants.js
- js/config.js
- js/state.js
- js/firestore.js
- js/quiz.js
- js/reward.js
- js/zukan.js
- js/ui.js

対象外:
- canary/
- archive/
- Firestoreデータ
- GitHub Pages設定
- 仕様変更
```

## 20. PR作成前の判断

Phase 1AのPR作成前に、以下を確認します。

```text
- index.html からCSSが正しく外出しされている
- index.html からJSが正しく外出しされている
- Firebase SDK読み込み順が維持されている
- app.jsの内容が既存scriptと同等である
- app.cssの内容が既存styleと同等である
- 不要なロジック変更が混入していない
- Firestore読み書き先が変わっていない
- 通常導線に migration.html が追加されていない
```

Phase 1BのPR作成前に、以下を確認します。

```text
- B案の責務分割どおりにファイルが分かれている
- state.js に状態管理が集約されている
- firestore.js にFirestore操作が集約されている
- config.js にFirebase設定が分離されている
- quiz.js / reward.js / zukan.js / ui.js の責務が混ざりすぎていない
- script読み込み順が正しい
- window.PokeMath 名前空間が正しく初期化されている
- ロジックの意味が変わっていない
- Firestore読み書き先が変わっていない
- 通常導線に migration.html が追加されていない
```

## 21. 完了条件

短期的な完了条件は以下です。

```text
- docs/development_workflow.md が追加されている
- docs/refactoring_plan.md が追加されている
- B案採用方針が合意されている
- Phase 1A / Phase 1B の進め方が明文化されている
- 大規模改修の定義が明文化されている
```

中期的な完了条件は以下です。

```text
- index.html がHTML構造中心になっている
- CSSが css/app.css に分離されている
- JavaScriptが js/app.js に分離されている
- guestでV2 Mainの基本回帰確認ができている
```

長期的な完了条件は以下です。

```text
- JSがB案の責務単位に分割されている
- state.js に状態管理が集約されている
- firestore.js にFirestore操作が集約されている
- クイズ追加が既存ロジックへの影響少なく実施できる
- 報酬追加が既存図鑑仕様を壊さず検討できる
- PR差分が読みやすくなっている
```
