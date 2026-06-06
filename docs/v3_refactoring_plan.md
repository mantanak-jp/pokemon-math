# V3 リファクタリング計画

最終更新: 2026-06-06

## 1. 目的

この文書は、`pokemon-math` の V3 プロジェクトにおける、シングルHTMLファイル分割の進め方を定義します。

V3 は、現在の V2 Main の機能・Firestoreデータ仕様・UI/UXを維持したまま、コード構造を段階的に分割し、今後の機能拡張とメンテナンス性を高めるための検証プロジェクトです。

```text
V3の目的:
- root index.html を直接壊さずに分割検証する
- GitHub Pages上で iPhone 実機確認できるようにする
- CSS / JavaScript を相対パスで外部ファイル化する
- 最終的にB案の責務分割へ進む
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

Phase 1Bの読み込み例:

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

V3に入る前に、以下をドキュメントで整理します。

```text
- V3は v3/ ディレクトリで開発・検証する
- root index.html は V2 Main 本番版として維持する
- v3/ は GitHub Pages上で /pokemon-math/v3/ として確認する
- CSS / JavaScript は相対パスで読み込む
- canary/ はV2 Canary履歴として維持し、V3には流用しない
```

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

## 8. V3 Phase 1B: B案の責務分割

### 8.1 目的

V3 Phase 1Aで作成した `v3/js/app.js` を、B案の責務単位に分割します。

目標構成:

```text
v3/
├─ index.html
├─ css/
│  └─ app.css
└─ js/
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

### 8.2 分割方針

```text
constants.js:
- 固定値、ユーザー定義、世代名、クイズ定数

config.js:
- Firebase設定

state.js:
- アプリ状態、保存中フラグ、選択ユーザー、クイズ進行、図鑑状態、マスターキャッシュ

firestore.js:
- Firebase初期化、users_v2読込、masters読込、users_v2保存transaction

quiz.js:
- 問題生成、選択肢生成、クイズ進行補助

reward.js:
- 報酬数計算、未取得ポケモン抽選、世代クリア判定、全世代コンプリート判定

zukan.js:
- 図鑑表示、図鑑グリッド、ポケモン詳細モーダル

ui.js:
- 画面切り替え、メニュー、結果、世代開始、世代クリア、全世代コンプリート表示

app.js:
- DOM初期化、イベントハンドラ登録、アプリ起動
```

### 8.3 Phase 1Bでやらないこと

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
- root index.html の変更
- canary/ の変更
- archive/ の変更
```

## 9. V3実機確認方針

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

## 10. V3完了条件

V3の短期完了条件:

```text
- docs/v3_refactoring_plan.md が追加されている
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
- state.js に状態管理が集約されている
- firestore.js にFirestore操作が集約されている
- v3/ でguestによる基本回帰確認ができている
- V2 Main root index.html が変更されていない
```

V3プロジェクト完了条件:

```text
- V3 Phase 1A / 1B が完了している
- /pokemon-math/v3/ で基本動作確認が完了している
- root index.html へ昇格するかどうかを判断できる状態になっている
```

## 11. V3 Main昇格判断

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
