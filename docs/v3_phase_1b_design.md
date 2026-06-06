# V3 Phase 1B 詳細設計

最終更新: 2026-06-06

## 1. 目的

この文書は、`pokemon-math` の V3 Phase 1B における JavaScript 責務分割の詳細設計を定義します。

V3 Phase 1B の目的は、V3 Phase 1A で外部化した `v3/js/app.js` を、将来の拡張に耐えられる責務単位へ分割することです。

```text
Phase 1Bの目的:
- 現行V2 Main相当の機能を維持する
- root index.html を変更しない
- v3/ 配下だけで検証する
- 通常script方式を維持する
- window.AppXXX 名前空間方式で依存関係を整理する
- Phase 2 の ES Modules化に備える
```

## 2. Phase 1Bで採用する方式

Phase 1Bでは、ES Modules化は行いません。

代わりに、通常の `<script src="..." defer>` を複数並べる方式を維持します。

ただし、通常scriptではトップレベルの `const` / `let` は別ファイルから直接参照できないため、以下の名前空間方式を採用します。

```javascript
window.AppConfig = {};
window.AppConstants = {};
window.AppState = {};
window.AppDom = {};
window.AppUI = {};
window.AppFirestore = {};
window.AppQuiz = {};
window.AppReward = {};
window.AppZukan = {};
```

この方式により、グローバル汚染を最小限にしながら、ファイル間の依存関係を明示します。

## 3. Phase 1BでES Modules化しない理由

現時点の `v3/js/app.js` は、以下が強く結合しています。

```text
- 状態変数
- DOM参照
- Firestore処理
- クイズ処理
- 報酬保存
- 図鑑描画
- 画面遷移
- イベント登録
```

この状態でいきなり `import` / `export` を導入すると、単なるファイル分割ではなく、依存関係の再設計になります。

特に、以下のリスクがあります。

```text
- 循環依存が発生しやすい
- 状態更新の責任が曖昧になる
- DOM参照の所有者が曖昧になる
- Firestore処理と報酬処理が相互依存しやすい
- iPhone中心の開発では不具合切り分けが難しくなる
```

そのため、Phase 1Bでは名前空間方式で責務境界を作り、Phase 2でES Modules化します。

## 4. 目標ファイル構成

Phase 1B完了後の目標構成は以下です。

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

## 5. 読み込み順

`v3/index.html` では、以下の順序で読み込みます。

```html
<script src="./js/config.js" defer></script>
<script src="./js/constants.js" defer></script>
<script src="./js/state.js" defer></script>
<script src="./js/dom.js" defer></script>
<script src="./js/ui.js" defer></script>
<script src="./js/firestore.js" defer></script>
<script src="./js/quiz.js" defer></script>
<script src="./js/reward.js" defer></script>
<script src="./js/zukan.js" defer></script>
<script src="./js/app.js" defer></script>
```

Firebase SDKのCDN読み込みは、これまでどおり `v3/index.html` の `<head>` に残します。

## 6. 各ファイルの責務

### 6.1 config.js

```text
責務:
- Firebase設定のみ

公開名前空間:
- window.AppConfig
```

主な内容:

```text
- firebaseConfig
```

### 6.2 constants.js

```text
責務:
- 固定値
- ユーザー定義
- 世代名
- クイズ定数

公開名前空間:
- window.AppConstants
```

主な内容:

```text
- USER_OPTIONS
- GENERATION_NAMES
- GENERATION_REGION_NAMES
- QUIZ_QUESTION_COUNT
- QUIZ_NEXT_DELAY_MS
```

### 6.3 state.js

```text
責務:
- アプリ状態
- Firestore接続状態
- 選択ユーザー状態
- クイズ進行状態
- 報酬保存状態
- 図鑑選択状態
- マスターキャッシュ

公開名前空間:
- window.AppState
```

主な内容:

```text
- db
- firebaseReady
- selectedUserId
- selectedUserLabel
- currentUserData
- currentGeneration
- currentGenerationPokemonList
- currentGenerationMasterPromise
- currentGenerationMasterError
- isLoadingUser
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

### 6.4 dom.js

```text
責務:
- DOM参照の集約

公開名前空間:
- window.AppDom
```

主な内容:

```text
- appShell
- screens
- title / user / loading / menu / quiz / result / generation / zukan / error 系DOM
- modal系DOM
- retryButton
```

### 6.5 ui.js

```text
責務:
- 共通UI
- 画面切り替え
- ローディング表示
- メニュー表示
- 世代開始・世代クリア・全世代コンプリート表示
- 結果画面の一部制御

公開名前空間:
- window.AppUI
```

主な内容:

```text
- showScreen
- showError
- showPlaceholderMessage
- hidePlaceholderMessage
- setLoadingMessage
- getRegionName
- getGenerationLabel
- normalizeGenerationNumber
- getGenerationText
- renderFastMenu
- showGenerationStart
- showGenerationClear
- showAllComplete
- continueAfterGenerationClear
- setResultActionDisabled
- resetResultProgressActions
- showResultClearOnlyAction
```

### 6.6 firestore.js

```text
責務:
- Firebase初期化
- Firestore読込
- Firestore保存
- users_v2 / masters のデータ検証

公開名前空間:
- window.AppFirestore
```

主な内容:

```text
- initFirebase
- validateUserData
- validatePokemonList
- resetCachedMaster
- loadCurrentGenerationMaster
- prefetchCurrentGenerationMaster
- getCurrentGenerationMaster
- getGenerationMaster
- loadUserData
- retryLoadUserData
- savePendingRewardOnce
- savePendingRewardWithRetry
```

Firestore仕様は変更しません。

```text
通常プレイのユーザーデータ:
- users_v2/{userId}

ポケモンマスター:
- masters/gen_{1..9}

通常プレイ中に書き込まない:
- users/{username}
- masters/gen_{1..9}
```

### 6.7 quiz.js

```text
責務:
- クイズ問題生成
- 選択肢生成
- クイズ進行
- 回答処理

公開名前空間:
- window.AppQuiz
```

主な内容:

```text
- randomInt
- shuffleArray
- makeQuestionForLevel
- makeChoices
- resetAnswerButtons
- shouldShowGenerationStartForLevel
- startLevelFlow
- startQuiz
- makeNextQuestion
- answerQuestion
```

### 6.8 reward.js

```text
責務:
- 報酬数計算
- 未取得ポケモン抽選
- 結果画面の報酬描画
- 世代クリア判定
- 全世代コンプリート判定
- 報酬保存フロー

公開名前空間:
- window.AppReward
```

主な内容:

```text
- getRewardPlaceholderMessage
- getRewardCount
- getLevelPoolLimit
- selectRewardPokemon
- prepareRewardState
- formatPokemonNames
- renderRewardImages
- renderRewardSaving
- renderRewardSuccess
- renderAllCompleteQuizResult
- renderRewardFailure
- renderNoRewardResult
- renderNoAvailableReward
- calculateGenerationComplete
- handleRewardSave
- showResult
```

### 6.9 zukan.js

```text
責務:
- 図鑑タブ
- 図鑑グリッド
- 図鑑所有判定
- 未取得メッセージ
- ポケモン詳細モーダル

公開名前空間:
- window.AppZukan
```

主な内容:

```text
- getVisibleGenerations
- isGenerationCleared
- getOwnedSetForCurrentGeneration
- isPokemonOwnedInGeneration
- calculateZukanOwnedCount
- renderZukanTabs
- renderZukanLoading
- renderZukanError
- renderZukanGrid
- renderZukanGeneration
- openZukan
- openZukanForUnlockedGeneration
- openZukanForAllComplete
- showUncaughtMessage
- normalizeTypeValue
- formatPokemonTypes
- formatPokemonHeight
- formatPokemonWeight
- openPokemonModal
- closePokemonModal
```

### 6.10 app.js

```text
責務:
- イベントハンドラ登録
- アプリ起動

公開名前空間:
- 原則なし
```

主な内容:

```text
- setupEvents
- setupEvents();
- AppFirestore.initFirebase();
```

## 7. Phase 1Bで変更しないもの

```text
- root index.html
- canary/
- archive/
- Firestoreデータ構造
- users_v2 データ構造
- users コレクション
- masters/gen_{1..9}
- GitHub Pages設定
- UI文言
- クイズ仕様
- 報酬仕様
- 図鑑仕様
- migration.html への通常導線禁止ルール
```

## 8. Phase 1Bでやらないこと

```text
- ES Modules化
- import / export 化
- type="module" 導入
- TypeScript化
- npm / build 導入
- Vite / React / Next.js 導入
- クイズレベル追加
- 割り算追加
- 算数以外のクイズ追加
- 報酬仕様変更
- Firestoreデータモデル変更
- root index.html のV3昇格
```

## 9. Phase 2: ES Modules化の位置づけ

ES Modules化は Phase 2 で実施します。

Phase 1Bで作成した名前空間単位を、Phase 2では `import` / `export` へ段階的に置き換えます。

```text
Phase 1B:
- window.AppConstants
- window.AppState
- window.AppDom
- window.AppFirestore
- window.AppQuiz
- window.AppReward
- window.AppZukan

Phase 2:
- export / import に置き換える
- main.js を起点にする
- window依存を段階的に削減する
```

Phase 2の想定構成:

```text
v3/js/
├─ config.js
├─ constants.js
├─ state.js
├─ dom.js
├─ ui.js
├─ firestore.js
├─ quiz.js
├─ reward.js
├─ zukan.js
└─ main.js
```

`v3/index.html` 側は、Phase 2で以下のように簡略化する想定です。

```html
<script type="module" src="./js/main.js"></script>
```

## 10. Codex実装時の注意事項

CodexにPhase 1B実装を依頼する場合は、以下を明示します。

```text
- GitHub操作はしない
- ブランチ作成はしない
- commitしない
- PR作成しない
- ファイル全文をコピー可能なコードブロックで出力する
- root index.html を変更しない
- v3/index.html と v3/js/ 配下のみを対象にする
- Firestoreデータ構造を変更しない
- UI文言を変更しない
- ロジック改善やバグ修正を混ぜない
- ES Modules化しない
- import / export を使わない
- window.AppXXX 名前空間方式を使う
```

## 11. 実機確認項目

Phase 1B実装後は、GitHub Pagesの `/pokemon-math/v3/` で確認します。

原則として `guest` を使います。

```text
- タイトル画面が表示される
- はじめるボタンが有効化される
- ユーザー選択画面に遷移する
- guest を選択できる
- Firestore users_v2/guest を読み込める
- メニュー画面が表示される
- 現在世代の進捗が表示される
- レベル選択ができる
- クイズが5問進行する
- 結果画面が表示される
- 4問正解で1匹、5問正解で2匹の報酬処理が維持される
- 保存失敗時の手動再試行導線が維持される
- 図鑑を表示できる
- 世代タブが表示される
- ポケモン詳細モーダルが表示される
- 背景クリックでモーダルが閉じる
- 右上×でモーダルが閉じる
- migration.html への通常導線が追加されていない
```

`ryoma` / `sara` は実データのため、原則として表示確認のみとします。

## 12. 完了条件

```text
- v3/js/app.js が責務単位に分割されている
- dom.js にDOM参照が集約されている
- state.js に状態管理が集約されている
- firestore.js にFirestore操作が集約されている
- 通常script方式の読み込み順が維持されている
- window.AppXXX 名前空間方式でファイル間参照できている
- ES Modules化をしていない
- /pokemon-math/v3/ でguest基本回帰確認ができている
- root index.html が変更されていない
```
