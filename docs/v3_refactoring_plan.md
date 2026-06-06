# V3 リファクタリング計画

最終更新: 2026-06-07

## 1. 目的

この文書は、`pokemon-math` の V3 プロジェクトにおける、シングルHTMLファイル分割の進め方を定義します。

V3 は、現在の V2 Main の機能・Firestoreデータ仕様・UI/UXを維持したまま、コード構造を段階的に分割し、今後の機能拡張とメンテナンス性を高めるための検証プロジェクトです。

```text
V3の目的:
- root index.html を直接壊さずに分割検証する
- GitHub Pages上で iPhone 実機確認できるようにする
- CSS / JavaScript を相対パスで外部ファイル化する
- B案の責務分割へ進む
- Phase 2でES Modules化へ進める状態を作る
- 将来のクイズ拡張・報酬拡張に備える
```

## 2. V3の位置づけ

現在の本番アプリは root `index.html` の V2 Main です。

V3では、root `index.html` を直接変更せず、まず `v3/` ディレクトリを新設して検証版を作ります。

```text
root index.html
→ V2 Main 本番版。通常ユーザー向けの正本。

v3/index.html
→ V3 開発・検証版。シングルHTML分割プロジェクトの検証対象。

canary/
→ V2 Canaryの開発・検証履歴、および既存検証ファイル群。

archive/
→ V1.5退避版。
```

V3は、V2 Mainを置き換えるものではありません。V3で十分に検証した後、別PRで root `index.html` への昇格を判断します。

## 3. GitHub Pagesでの確認方針

GitHub Pagesでは、同一リポジトリ内のサブディレクトリを静的ページとして確認できます。

想定URLは以下です。

```text
V2 Main:
https://mantanak-jp.github.io/pokemon-math/

V3検証版:
https://mantanak-jp.github.io/pokemon-math/v3/
```

GitHub Pagesの公開元ブランチを切り替えて複数ブランチを同時公開する運用は採用しません。

その代わり、main ブランチ上に `v3/` ディレクトリを配置し、V2 MainとV3検証版を同時に確認できる状態にします。

## 4. 相対パス方針

V3では、CSS / JavaScript の読み込みは `v3/index.html` からの相対パスで行います。

Phase 1Aの読み込み例:

```html
<link rel="stylesheet" href="./css/app.css">
<script src="./js/app.js" defer></script>
```

Phase 1B以降の読み込み例:

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

Firebase SDKは、既存のV2 Mainと同様にCDN読み込みを維持します。

## 5. V3で変更しないもの

V3検証中は、以下を変更しません。

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

V3は、あくまで検証用ディレクトリです。V3の存在によって V2 Main の通常ユーザー導線を変更しません。

## 6. V3 Phase 0: ドキュメント整備

V3に入る前に、以下をドキュメントで整理しました。

```text
- V3は v3/ ディレクトリで開発・検証する
- root index.html は V2 Main 本番版として維持する
- v3/ は GitHub Pages上で /pokemon-math/v3/ として確認する
- CSS / JavaScript は相対パスで読み込む
- canary/ はV2 Canary履歴として維持し、V3には流用しない
```

完了済みです。

## 7. V3 Phase 1A: CSS / JS 外出し

### 7.1 目的

V2 Mainの `index.html` をベースに `v3/index.html` を作成し、V3側でCSSとJavaScriptを外部ファイル化します。

目標構成:

```text
v3/
├─ index.html
├─ css/
│  └─ app.css
└─ js/
   └─ app.js
```

### 7.2 実施内容

```text
- root index.html をベースに v3/index.html を作成する
- v3/index.html 内の <style> を v3/css/app.css へ移す
- v3/index.html 内のメイン <script> を v3/js/app.js へ移す
- Firebase SDK読み込みは v3/index.html 側に残す
- v3/index.html から ./css/app.css を読み込む
- v3/index.html から ./js/app.js を読み込む
```

### 7.3 Phase 1Aでやらないこと

```text
- JS責務分割
- ES Modules化
- import / export 化
- クイズ仕様変更
- 報酬仕様変更
- Firestoreデータ構造変更
- UI文言変更
- root index.html の変更
- canary/ の変更
- archive/ の変更
```

### 7.4 完了状況

Phase 1Aは完了済みです。

```text
PR #24: Add V3 Phase 1A verification app
状態: merged

- v3/index.html 追加済み
- v3/css/app.css 追加済み
- v3/js/app.js 追加済み
- /pokemon-math/v3/ で実機確認済み
```

## 8. V3 Phase 1B: B案の責務分割

### 8.1 目的

V3 Phase 1Aで作成した `v3/js/app.js` を、B案の責務単位に分割します。

Phase 1Bでは、通常script方式を維持し、`window.AppXXX` 名前空間方式を採用します。

詳細設計は以下を正本とします。

```text
docs/v3_phase_1b_design.md
```

### 8.2 目標構成

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

### 8.3 分割方針

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
- Firebase初期化、users_v2読込、masters読込、users_v2保存transaction
- window.AppFirestore

quiz.js:
- 問題生成、選択肢生成、クイズ進行、回答処理
- window.AppQuiz

reward.js:
- 報酬数計算、未取得ポケモン抽選、世代クリア判定、全世代コンプリート判定、報酬保存フロー
- window.AppReward

zukan.js:
- 図鑑表示、図鑑グリッド、ポケモン詳細モーダル
- window.AppZukan

app.js:
- イベントハンドラ登録、アプリ起動
```

### 8.4 Phase 1Bでやらないこと

```text
- ES Modules化
- import / export 化
- type="module" 導入
- TypeScript化
- npm / build 導入
- クイズレベル追加
- 割り算追加
- 算数以外のクイズ追加
- 報酬仕様変更
- 図鑑仕様変更
- UI文言変更
- Firestoreデータモデル変更
- root index.html の変更
- canary/ の変更
- archive/ の変更
```

### 8.5 完了状況

Phase 1Bは完了済みです。

```text
PR #26: Split V3 JavaScript into namespaces
状態: merged

- v3/index.html のscript読み込みを10本構成に変更
- v3/js/app.js をイベント登録・起動処理に縮小
- config / constants / state / dom / ui / firestore / quiz / reward / zukan に分割
- window.AppXXX 名前空間方式で動作
- /pokemon-math/v3/ で実機確認済み
```

## 9. V3 Phase 1C: 分割後の安定化・軽微整理

### 9.1 目的

Phase 1Bで分割したJavaScriptを、動作確認済み状態を崩さない範囲で軽微整理します。

### 9.2 実施内容

```text
- 未使用 window.AppConfig 参照を削除
- dom.js / ui.js / quiz.js の明らかなインデントを整形
- reward.js / zukan.js は未使用 config 削除のみ
```

### 9.3 Phase 1Cでやらないこと

```text
- ロジック変更
- UI文言変更
- Firestore仕様変更
- 報酬仕様変更
- ES Modules化
- import / export 化
- root index.html の変更
- v3/index.html の変更
- v3/css/app.css の変更
```

### 9.4 完了状況

Phase 1Cは完了済みです。

```text
PR #27: Clean up V3 Phase 1C JavaScript namespaces
状態: merged

- v3/js/dom.js
- v3/js/quiz.js
- v3/js/reward.js
- v3/js/ui.js
- v3/js/zukan.js

/pokemon-math/v3/ で実機確認済み
```

## 10. V3 Phase 1D: 不正解時に正解選択肢を表示

### 10.1 目的

不正解時に正解の選択肢を見せることで、子どもが間違えた直後に正しい答えを確認できるようにします。

### 10.2 実施内容

```text
- 不正解時に、選択した誤答ボタンへ wrong を付与
- 不正解時に、正解ボタンへ correct を付与
- 不正解時メッセージに正解値を表示
- 次の問題へ進むまで wrong / correct 表示を維持
- 次の問題では resetAnswerButtons() で表示をリセット
```

変更箇所:

```text
v3/js/quiz.js
answerQuestion(button)
```

### 10.3 Phase 1Dでやらないこと

```text
- 問題数変更
- 正解数カウント仕様変更
- 報酬付与仕様変更
- QUIZ_NEXT_DELAY_MS 変更
- Firestore仕様変更
- 図鑑仕様変更
- CSS変更
- ES Modules化
- import / export 化
```

### 10.4 完了状況

Phase 1Dは完了済みです。

```text
PR #28: Show correct answer after wrong V3 quiz choice
状態: merged

- v3/js/quiz.js のみ変更
- /pokemon-math/v3/ で実機確認済み
```

## 11. V3 Phase 2: ES Modules化

### 11.1 目的

Phase 2では、Phase 1Bで作った責務境界を前提に、`import` / `export` を導入します。

Phase 1Bでは `window.AppXXX` 名前空間方式で分割し、Phase 2でES Modulesへ移行します。

### 11.2 Phase 2の想定

```text
- type="module" を導入する
- main.js を起点にする
- import / export で依存関係を明示する
- window.AppXXX 依存を段階的に削減する
- build tool はまだ導入しない
```

想定読み込み:

```html
<script type="module" src="./js/main.js"></script>
```

### 11.3 Phase 2でやらないこと

```text
- npm / build 導入
- Vite / React / Next.js 導入
- TypeScript化
- クイズ仕様変更
- 報酬仕様変更
- Firestoreデータモデル変更
```

### 11.4 Phase 2着手前に決めること

```text
- ES Modules化を1PRで行うか、2A/2Bに分けるか
- main.js 起点にするか、app.js 起点にするか
- state.js を mutable singleton として export するか
- dom.js のDOM取得タイミングをどう扱うか
- firestore.js / reward.js / zukan.js などの循環依存をどう避けるか
- window.AppXXX を一気に外すか、段階的に外すか
```

候補ドキュメント:

```text
docs/v3_phase_2_design.md
```

## 12. V3実機確認方針

V3の確認は、GitHub Pages上の `/pokemon-math/v3/` で行います。

原則として `guest` を使います。

最低限の確認項目:

```text
- /pokemon-math/v3/ でタイトル画面が表示される
- はじめるボタンが動作する
- guest を選択できる
- メニュー画面が表示される
- 現在世代の進捗が表示される
- レベル選択ができる
- クイズが5問進行する
- 正解時に正解ボタンが correct 表示になる
- 不正解時に誤答ボタンが wrong 表示になる
- 不正解時に正解ボタンが correct 表示になる
- 不正解時に「せいかいは X」が表示される
- 次の問題で correct / wrong 表示がリセットされる
- 結果画面が表示される
- 4問以上正解でポケモン取得処理が動く
- Firestore users_v2/guest に保存される
- 図鑑を表示できる
- 詳細モーダルが表示される
- 背景クリックでモーダルが閉じる
- 右上×でモーダルが閉じる
- migration.html への通常導線が追加されていない
```

`ryoma` / `sara` は実データのため、原則として表示確認のみとします。

## 13. V3完了条件

V3の短期完了条件:

```text
- docs/v3_refactoring_plan.md が追加・更新されている
- docs/v3_phase_1b_design.md が追加されている
- docs/v3_handoff.md が追加されている
- v3/ ディレクトリ方式が合意されている
- 相対パス方針が明記されている
```

V3 Phase 1A完了条件:

```text
- v3/index.html が存在する
- v3/css/app.css が存在する
- v3/js/app.js が存在する
- /pokemon-math/v3/ でV3が表示できる
- V2 Main root index.html が変更されていない
```

V3 Phase 1B完了条件:

```text
- v3/js/ がB案の責務単位に分割されている
- dom.js にDOM参照が集約されている
- state.js に状態管理が集約されている
- firestore.js にFirestore操作が集約されている
- window.AppXXX 名前空間方式でファイル間参照できている
- v3/ でguestによる基本回帰確認ができている
- V2 Main root index.html が変更されていない
```

V3 Phase 1C完了条件:

```text
- 未使用参照が整理されている
- 明らかなインデント崩れが整理されている
- ロジック変更なしで /pokemon-math/v3/ の基本動作確認ができている
```

V3 Phase 1D完了条件:

```text
- 不正解時に誤答ボタンが wrong 表示になる
- 不正解時に正解ボタンが correct 表示になる
- 不正解時に正解値が表示される
- 次の問題で表示がリセットされる
- 正解数カウント、報酬仕様、Firestore仕様に影響がない
```

V3 Phase 2完了条件:

```text
- type="module" が導入されている
- main.js が起点になっている
- import / export で依存関係が明示されている
- window.AppXXX 依存を削減できている
- v3/ でguestによる基本回帰確認ができている
```

V3プロジェクト完了条件:

```text
- V3 Phase 1A / 1B / 1C / 1D / 2 が完了している
- /pokemon-math/v3/ で基本動作確認が完了している
- root index.html へ昇格するかどうかを判断できる状態になっている
```

## 14. V3 Main昇格判断

V3で十分に検証できた後、別PRで root `index.html` への昇格を検討します。

昇格PRでは、以下を明確にします。

```text
- root index.html をV3構成へ置き換えるか
- root css/ と root js/ を新設するか
- v3/ を残すか、archive化するか
- GitHub Pages上の本番URLに影響があるか
- Firestoreデータ構造に影響がないか
- guestでの回帰確認結果
- ryoma / sara への影響がないこと
```

V3検証PRとV3 Main昇格PRは分離します。
