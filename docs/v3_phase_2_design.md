# V3 Phase 2 設計: ES Modules化

最終更新: 2026-06-07

## 1. 目的

この文書は、`pokemon-math` の V3 Phase 2 における ES Modules 化の設計方針を定義します。

V3 Phase 2 では、Phase 1B / 1C / 1D で分割済みの JavaScript ファイルを前提に、`import` / `export` を導入し、ファイル間依存を明示します。

```text
Phase 2 の目的:
- type="module" を導入する
- main.js を起点にする
- import / export で依存関係を明示する
- window.AppXXX 名前空間依存を段階的に削減する
- 今後のクイズ拡張・報酬拡張に耐えられる構造にする
- V2 Main / Firestore / 実データを壊さずに検証する
```

## 2. 現在地

現在の状態は以下です。

```text
V3 Phase 1A: 完了
V3 Phase 1B: 完了
V3 Phase 1C: 完了
V3 Phase 1D: 完了
/pokemon-math/v3/ 実機確認OK
```

現在の V3 構成は以下です。

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

現在は通常の `script defer` 読み込みです。

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

各ファイルは `window.AppXXX` 名前空間で連携しています。

## 3. Phase 2 の対象

Phase 2 の対象は、原則として `v3/` 配下のみです。

```text
対象:
- v3/index.html
- v3/js/*.js
- 必要に応じて docs/v3_refactoring_plan.md
- 必要に応じて docs/v3_handoff.md
- 必要に応じて docs/review_checklist.md
```

## 4. Phase 2 で変更しないもの

Phase 2 では、以下を変更しません。

```text
- root index.html
- canary/
- archive/
- canary/migration.html
- Firestoreデータ
- users_v2 データ構造
- users データ
- masters/gen_{1..9}
- GitHub Pages設定
- V2 Mainの通常導線
- migration.html への通常導線禁止ルール
- クイズ仕様
- 報酬仕様
- 図鑑仕様
- UI文言
```

V3 Phase 1D で追加済みの以下仕様は維持します。

```text
- 不正解時に誤答ボタンを wrong 表示する
- 不正解時に正解ボタンを correct 表示する
- 不正解時に「せいかいは X」を表示する
```

Phase 2 では、この仕様を追加・変更するのではなく、ES Modules 化後も壊さず維持することを目的とします。

## 5. Phase 2 を分割する理由

Phase 2 は、単なるファイル分割ではありません。

同時に以下が変わります。

```text
- script 読み込み方式
- 初期化起点
- import / export による依存解決
- window.AppXXX 名前空間の扱い
- DOM取得タイミング
- ui / firestore / quiz / reward / zukan 間の依存関係
```

これらを1PRで一気に変更すると、問題発生時の切り分けが難しくなります。

そのため、Phase 2 は以下に分割します。

```text
Phase 2A:
ES Modules 起動基盤

Phase 2B:
機能モジュールの import / export 化

Phase 2C:
window.AppXXX 残存整理
```

## 6. Phase 2A: ES Modules 起動基盤

### 6.1 目的

Phase 2A では、ES Modules として起動できる最小構成を作ります。

```text
目的:
- v3/index.html に type="module" を導入する
- v3/js/main.js を新設する
- main.js を起点にする
- 低依存ファイルを export 化する
- 既存機能・UI・Firestore仕様を変えない
```

### 6.2 対象ファイル

```text
- v3/index.html
- v3/js/main.js
- v3/js/config.js
- v3/js/constants.js
- v3/js/state.js
- v3/js/dom.js
- v3/js/app.js
```

必要に応じて、互換維持のために以下も最小限触る可能性があります。

```text
- v3/js/ui.js
- v3/js/firestore.js
- v3/js/quiz.js
- v3/js/reward.js
- v3/js/zukan.js
```

ただし Phase 2A では、機能モジュールの本格的な依存整理は行いません。

### 6.3 想定変更

`v3/index.html` の末尾を、最終的に以下へ寄せます。

```html
<script type="module" src="./js/main.js"></script>
```

ただし、Phase 2A の途中段階で互換用に一部通常scriptを残す案は採用しません。

理由:

```text
- 通常scriptとmodule scriptの混在は初期化順序が分かりにくくなる
- import / export 化の成立範囲が曖昧になる
- レビュー時に依存関係を確認しにくい
```

Phase 2A では、低依存ファイルから module 化します。

```text
config.js:
- firebaseConfig を export する

constants.js:
- USER_OPTIONS
- GENERATION_NAMES
- GENERATION_REGION_NAMES
- QUIZ_QUESTION_COUNT
- QUIZ_NEXT_DELAY_MS
を export する

state.js:
- state を mutable singleton として export する

dom.js:
- dom を export する

app.js:
- setupEvents などを export し、main.js から呼び出す

main.js:
- setupEvents()
- initFirebase()
を呼び出す起点にする
```

### 6.4 Phase 2A でやらないこと

```text
- クイズ仕様変更
- 報酬仕様変更
- 図鑑仕様変更
- UI文言変更
- Firestoreデータ構造変更
- users_v2 以外への保存追加
- masters/gen_{1..9} への書き込み追加
- window.AppXXX 完全撤去
- npm / build 導入
- TypeScript化
```

## 7. Phase 2B: 機能モジュールの import / export 化

### 7.1 目的

Phase 2B では、主要機能モジュールを `import` / `export` 化し、`window.AppXXX` 参照を削減します。

```text
目的:
- ui.js / firestore.js / quiz.js / reward.js / zukan.js を module 化する
- 依存関係を import 文で明示する
- 循環依存を避ける
- window.AppXXX 直接参照を削減する
```

### 7.2 対象ファイル

```text
- v3/js/ui.js
- v3/js/firestore.js
- v3/js/quiz.js
- v3/js/reward.js
- v3/js/zukan.js
- v3/js/main.js
- v3/js/app.js
```

必要に応じて、以下を新設します。

```text
- v3/js/utils.js
```

### 7.3 utils.js 新設方針

現在、`reward.js` は `quiz.js` の `shuffleArray()` を利用しています。

ES Modules 化すると、これは `reward.js -> quiz.js` 依存になります。

この依存は、将来的な循環依存の原因になりやすいため、Phase 2B で `utils.js` を新設し、共通関数を移します。

```text
utils.js:
- randomInt(min, max)
- shuffleArray(values)
```

そのうえで、依存を以下に整理します。

```text
quiz.js -> utils.js
reward.js -> utils.js
```

### 7.4 機能モジュールの依存方針

理想的には、機能モジュール同士の直接依存を減らします。

ただし、Phase 2B では完全なアーキテクチャ再設計までは行いません。

```text
許容する依存:
- ui.js -> constants / state / dom
- firestore.js -> config / constants / state / dom / ui
- quiz.js -> constants / state / dom / ui / firestore / reward / utils
- reward.js -> constants / state / dom / ui / firestore / utils
- zukan.js -> constants / state / dom / ui / firestore
- app.js -> state / dom / ui / firestore / quiz / reward / zukan
- main.js -> app / firestore
```

ただし、以下の依存は避けます。

```text
避ける依存:
- reward.js -> quiz.js
- firestore.js -> quiz.js
- firestore.js -> reward.js
- zukan.js -> quiz.js
- zukan.js -> reward.js
```

### 7.5 Phase 2B でやらないこと

```text
- 画面遷移仕様変更
- クイズレベル追加
- 割り算追加
- 国旗・都道府県・時間クイズ追加
- 報酬仕様変更
- 図鑑仕様変更
- Firestoreデータモデル変更
- root index.html への昇格
```

## 8. Phase 2C: window.AppXXX 残存整理

### 8.1 目的

Phase 2C では、Phase 2A / 2B 後に残った `window.AppXXX` 参照を整理します。

```text
目的:
- window.AppXXX 依存をさらに削減する
- 互換用に残したグローバル公開を削除する
- main.js 起点の module 構成に寄せる
```

### 8.2 実施判断

Phase 2C は必須ではありません。

Phase 2B 完了時点で以下を満たせていれば、Phase 2C は小規模整理として扱います。

```text
- type="module" で起動している
- main.js が起点になっている
- 主要依存が import / export で明示されている
- window.AppXXX 依存が十分に削減されている
- /pokemon-math/v3/ で実機確認OK
```

## 9. main.js 起点方針

Phase 2 では、`main.js` を起点にします。

理由:

```text
- docs/v3_refactoring_plan.md で main.js 起点が想定されている
- app.js はイベント登録・アプリ起動補助として残せる
- 将来、初期化順序を main.js に集約しやすい
- index.html の script 読み込みを1本化できる
```

想定構造:

```text
main.js:
- setupEvents() を呼ぶ
- initFirebase() を呼ぶ

app.js:
- setupEvents() を export する
```

## 10. state.js 方針

Phase 2 では、`state.js` を mutable singleton として export します。

```js
export const state = {
  db: null,
  firebaseReady: false,
  selectedUserId: null,
  selectedUserLabel: "",
  currentUserData: null,
  ...
};
```

理由:

```text
- 現在の window.AppState と同じ意味を維持できる
- 既存実装の状態更新方式を大きく変えずに済む
- getter / setter 化や reducer 化は Phase 2 ではやりすぎ
```

将来的には、以下の分割を検討できます。

```text
- appState
- quizState
- rewardState
- zukanState
- cacheState
```

ただし、これは Phase 2 の対象外です。

## 11. dom.js 方針

Phase 2A では、`dom.js` の DOM 取得タイミングは現行方式を維持します。

```text
現行:
- ファイル読み込み時に document.getElementById() を実行
- 取得したDOM参照を window.AppDom として公開

Phase 2A:
- ファイル読み込み時に document.getElementById() を実行
- 取得したDOM参照を dom として export
```

理由:

```text
- v3/index.html の末尾で main.js を読み込むため、DOM構築後に評価される
- getDom() 化は全ファイルの参照変更が増える
- Phase 2Aでは初期化方式変更を最小化したい
```

将来的には、以下のような遅延取得方式も検討できます。

```js
let dom = null;

export function getDom() {
  if (dom) return dom;
  dom = {
    appShell: document.getElementById("app-shell"),
    // ...
  };
  return dom;
}
```

ただし、これは Phase 2 では必須にしません。

## 12. 現行V3依存関係

現在の V3 は、概ね以下の依存関係です。

```text
config.js
  -> 依存なし

constants.js
  -> 依存なし

state.js
  -> 依存なし

dom.js
  -> document / DOM

ui.js
  -> constants / state / dom / quiz

firestore.js
  -> config / constants / state / dom / ui

quiz.js
  -> constants / state / dom / ui / firestore / reward

reward.js
  -> constants / state / dom / ui / firestore / quiz

zukan.js
  -> constants / state / dom / ui / firestore

app.js
  -> state / dom / ui / firestore / quiz / reward / zukan
```

特に注意する依存は以下です。

```text
- reward.js が quiz.js の shuffleArray() に依存している
- ui.js が quiz.js の startQuiz() に依存している
- firestore.js が ui.js を直接呼んでいる
- quiz.js が reward.js を直接呼んでいる
- zukan.js が firestore.js と ui.js を直接呼んでいる
```

## 13. 循環依存回避方針

Phase 2B では、循環依存を避けるために以下を守ります。

```text
- 共通関数は utils.js に移す
- reward.js -> quiz.js 依存を解消する
- firestore.js から quiz.js / reward.js へ依存させない
- zukan.js から quiz.js / reward.js へ依存させない
- main.js / app.js を起点としてイベント連携する
```

Phase 2B で完全に疎結合化できない場合でも、少なくとも以下は達成します。

```text
- import 文で依存が見える状態にする
- 新たな循環依存を作らない
- Firestore読み書き先を変えない
- UI文言を変えない
```

## 14. window.AppXXX 移行方針

Phase 2 では、`window.AppXXX` を一気に外しません。

理由:

```text
- 既存ファイル間参照が広範囲に存在する
- 一括撤去は差分が大きくなりすぎる
- 実機確認で問題が出た場合の切り分けが難しい
```

移行方針は以下です。

```text
Phase 2A:
- 低依存ファイルを export 化
- main.js 起点を作る
- 必要に応じて一時的な window.AppXXX 互換を残す

Phase 2B:
- 機能モジュールの window.AppXXX 参照を import に置き換える
- window.AppXXX 依存を大きく削減する

Phase 2C:
- 残った window.AppXXX を削除または最小化する
```

## 15. 実機確認方針

実機確認は、GitHub Pages の以下URLで行います。

```text
https://mantanak-jp.github.io/pokemon-math/v3/
```

原則として `guest` を使います。

最低限の確認項目:

```text
- /pokemon-math/v3/ でタイトル画面が表示される
- はじめるボタンが有効になる
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

## 16. PR分割方針

Phase 2 は以下のPRに分割します。

```text
PR 1:
Add V3 Phase 2 design document
- docs/v3_phase_2_design.md の追加

PR 2:
Introduce V3 Phase 2A module entrypoint
- main.js 新設
- type="module" 導入
- 低依存ファイルの export 化

PR 3:
Convert V3 feature files to ES modules
- ui / firestore / quiz / reward / zukan の import / export 化
- utils.js 新設
- window.AppXXX 依存削減

PR 4: 必要な場合のみ
Clean up remaining V3 window namespaces
- 残存 window.AppXXX の整理
```

## 17. ロールバック方針

Phase 2A / 2B で問題が出た場合は、以下の順で戻します。

```text
1. 問題のあるPRをマージしない
2. PR上で差分を確認し、変更範囲を狭める
3. 必要ならPRを閉じる
4. main 上の /pokemon-math/v3/ は直前の安定版を維持する
5. すでにマージ済みの場合は revert PR または修正PRを作成する
```

Phase 2 は `v3/` 検証領域で行うため、root `index.html` の V2 Main には影響させません。

## 18. 完了条件

Phase 2A 完了条件:

```text
- v3/index.html が main.js を type="module" で読み込んでいる
- main.js が起点になっている
- config / constants / state / dom が export 化されている
- /pokemon-math/v3/ で基本動作確認できる
- root index.html が変更されていない
- Firestore読み書き先が変わっていない
```

Phase 2B 完了条件:

```text
- ui / firestore / quiz / reward / zukan が import / export 化されている
- reward.js -> quiz.js の shuffleArray 依存が解消されている
- window.AppXXX 直接参照が削減されている
- /pokemon-math/v3/ で guest による基本回帰確認ができる
- 不正解時の正解表示仕様が維持されている
```

Phase 2C 完了条件:

```text
- 残存 window.AppXXX の扱いが整理されている
- 不要な互換層が削除されている
- main.js 起点の module 構成として説明できる
```

Phase 2 全体完了条件:

```text
- type="module" が導入されている
- main.js が起点になっている
- import / export で依存関係が明示されている
- window.AppXXX 依存を削減できている
- v3/ で guest による基本回帰確認ができている
- root index.html へ昇格するかどうかを判断できる状態になっている
```
