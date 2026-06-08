# V3.1 Main 昇格判断メモ

作成日: 2026-06-08  
対象: `index.html` / `v3/`  
位置づけ: V3.1 / Phase 3 完了後の root `index.html` 昇格判断資料

## 1. 全体像と現在地

```text
V3 Phase 1: 完了
V3 Phase 2: ES Modules化完了
V3.1 / Phase 3: 算数レベル5・6追加 ← 完了
V3.1 main昇格判断 ← 本ドキュメント
V3.1 main昇格PR ← 判断後
V3.2 / Phase 4: 国旗クイズ追加予定
```

V3.1 / Phase 3では、V3検証版 `/v3/` に算数レベル5・6を追加した。

本ドキュメントでは、V3.1を root `index.html` に昇格するかどうか、また昇格する場合の方式・影響範囲・rollback方針を整理する。

## 2. 結論

V3.1は、main昇格候補として妥当である。

推奨方針は以下。

```text
推奨:
V3.1を root index.html に昇格する

ただし:
- 昇格は別PRで実施する
- root index.html の更新前に、現行V2 Mainを archive に退避する
- v3/ は当面そのまま残す
- Firestoreデータ構造は変更しない
- rollbackは archive 退避版またはGit履歴から戻せるようにする
```

## 3. 昇格対象

昇格対象は、V3.1 / Phase 3 完了時点の `v3/` 一式である。

```text
v3/
├─ index.html
├─ css/
│  └─ app.css
└─ js/
   ├─ main.js
   ├─ config.js
   ├─ constants.js
   ├─ state.js
   ├─ dom.js
   ├─ utils.js
   ├─ version.js
   ├─ ui.js
   ├─ firestore.js
   ├─ quiz.js
   ├─ reward.js
   ├─ zukan.js
   └─ app.js
```

## 4. 昇格で変わること

root `index.html` を V3.1 構成へ切り替える。

現行V2 Mainは単一HTML構成であり、V3.1は以下の構成である。

```text
root index.html
root css/app.css
root js/*.js
```

V3.1昇格後は、GitHub Pages の通常URLが V3.1 を表示する。

```text
https://mantanak-jp.github.io/pokemon-math/
```

## 5. 昇格で変えないこと

以下は変更しない。

```text
- Firestoreデータ構造
- users_v2
- users
- masters/gen_{1..9}
- ryoma / sara の実データ
- 報酬保存構造
- 図鑑保存構造
- country_masters
- 国旗クイズ
- クイズ種別選択
- canary/
- migration.html の通常導線
```

## 6. 昇格方式

### 6.1 推奨方式

推奨方式は、V3.1の分割構成を root に配置する方式である。

```text
1. 現行 root index.html を archive に退避する
2. v3/index.html を root index.html 相当に配置する
3. v3/css/app.css を root css/app.css として配置する
4. v3/js/*.js を root js/*.js として配置する
5. root index.html 内の相対パスを root 用に確認する
```

V3.1の `v3/index.html` は、CSSとJSを以下のように相対パスで参照している。

```html
<link rel="stylesheet" href="./css/app.css">
<script type="module" src="./js/main.js"></script>
```

そのため、root に `css/` と `js/` を配置すれば、同じ相対パスで動作できる。

### 6.2 v3/ の扱い

昇格後も `v3/` は当面残す。

理由:

```text
- 昇格直後の比較確認に使える
- main昇格後の切り分けに使える
- V3.2 / Phase 4 の国旗クイズ開発を v3/ で継続できる
```

ただし、V3.2開発開始時点では、`v3/` を「次期検証版」として使い続けるか、`v4/` 相当の新ディレクトリを切るかは再判断する。

## 7. 退避方針

現行 root `index.html` は、昇格前に archive に退避する。

推奨ファイル名:

```text
archive/index_v2_main_before_v3_1.html
```

理由:

```text
- V2 Main の直前状態を明示的に残せる
- rollback時に内容確認しやすい
- 既存の archive/index_v1_5.html と役割が明確に分かれる
```

## 8. rollback 方針

rollback は以下の2系統を用意する。

### 8.1 Git履歴によるrollback

main昇格PRのマージコミットを revert する。

```text
対象:
V3.1 main昇格PR

方法:
GitHub上でrevert PRを作成
```

### 8.2 archive退避版による手動復旧

`archive/index_v2_main_before_v3_1.html` を root `index.html` に戻す。

```text
対象:
archive/index_v2_main_before_v3_1.html

方法:
必要時に root index.html として復元するPRを作成
```

通常は、Git履歴によるrollbackを優先する。

## 9. 昇格PRの想定変更ファイル

昇格PRでは、以下が変更・追加される見込み。

```text
追加:
- archive/index_v2_main_before_v3_1.html
- css/app.css
- js/main.js
- js/config.js
- js/constants.js
- js/state.js
- js/dom.js
- js/utils.js
- js/version.js
- js/ui.js
- js/firestore.js
- js/quiz.js
- js/reward.js
- js/zukan.js
- js/app.js

更新:
- index.html
- docs/README.md
- docs/release_and_canary.md
```

場合によっては、root の既存 `css/` / `js/` の有無を確認し、既存ファイルとの衝突がないことを確認する必要がある。

## 10. 昇格前チェック

昇格PR作成前に、以下を確認する。

```text
1. /pokemon-math/v3/ でV3.1が動作している
2. 開発バージョン表示が v3-dev-0.5.0 / Phase 3 / V3.1 math levels になっている
3. レベル1〜6が表示される
4. レベル5が九九のわり算として動作する
5. レベル6が2けた ÷ 1けた、答え10〜24として動作する
6. 5問進行する
7. 正解・不正解表示が動作する
8. 不正解時に正解選択肢が表示される
9. 4問以上正解で報酬処理される
10. 図鑑・世代進行が壊れていない
11. guestで確認済み
12. ryoma / sara を不用意に変更していない
```

## 11. 昇格後チェック

昇格PRをマージした後、通常URLで以下を確認する。

```text
確認URL:
https://mantanak-jp.github.io/pokemon-math/
```

確認項目:

```text
1. タイトル画面が表示される
2. ユーザー選択が表示される
3. guestで開始できる
4. レベル1〜6が表示される
5. レベル5が動作する
6. レベル6が動作する
7. 報酬処理が動作する
8. 図鑑が表示できる
9. JavaScript/CSSが404になっていない
10. コンソールエラーが出ていない
```

## 12. リスク

### 12.1 パス解決リスク

V3.1は `v3/` 配下では `./css/app.css`、`./js/main.js` を参照している。

root昇格時には、rootにも `css/` と `js/` を配置するため、相対パスは維持できる見込み。

ただし、昇格PRでは必ずGitHub Pages上で404がないことを確認する。

### 12.2 既存V2 Mainとの差分が大きい

V2 Mainは単一HTML、V3.1は分割構成である。

そのため、root `index.html` の差分は大きくなる。

対策:

```text
- V2 Mainを archive に退避する
- 昇格PRの対象ファイルを明確にする
- rollback方針をPR本文に明記する
```

### 12.3 実データ変更リスク

通常プレイでは `users_v2/{userId}` に報酬・進捗が保存される。

対策:

```text
- 基本確認は guest で行う
- ryoma / sara は不用意に使わない
- Firestore構造は変更しない
```

## 13. main昇格PRの推奨手順

```text
1. mainから昇格用ブランチを作成する
2. 現行 root index.html を archive/index_v2_main_before_v3_1.html にコピーする
3. v3/index.html を root index.html に反映する
4. v3/css/app.css を root css/app.css に反映する
5. v3/js/*.js を root js/*.js に反映する
6. docs/README.md を更新する
7. docs/release_and_canary.md を更新する
8. mainとの差分を確認する
9. PRを作成する
10. PRマージ後、通常URLで実機確認する
```

## 14. 判断

V3.1は、算数レベル5・6追加までを対象とし、国旗クイズやFirestore新規マスター追加を含まない。

既存Firestore構造を変更せず、V3検証版での実装・完了報告も完了している。

そのため、以下の条件を満たすなら main昇格に進んでよい。

```text
昇格条件:
- /pokemon-math/v3/ での実機確認がOK
- guestで基本動作確認済み
- root昇格方式とrollback方針をPR本文に明記する
- V2 Main退避ファイルを archive に残す
```

## 15. 次の作業

次の作業は、V3.1 main昇格PRの作成である。

ただし、root `index.html` を変更するため、必ず事前に対象・影響範囲・後戻り可否を説明し、明示承認を得てから実行する。
