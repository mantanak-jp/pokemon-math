# V3.1 Main 昇格判断メモ

作成日: 2026-06-08  
更新日: 2026-06-08  
対象: `index.html` / `v3/`  
位置づけ: V3.1 / Phase 3 完了後の root `index.html` 昇格判断資料

## 1. 全体像と現在地

```text
V3 Phase 1: 完了
V3 Phase 2: ES Modules化完了
V3.1 / Phase 3: 算数レベル5・6追加 ← 完了
V3.1 main昇格判断 ← 完了
V3.1 main昇格PR ← 現在地
V3.2 / Phase 4: 国旗クイズ追加予定
```

V3.1 / Phase 3では、V3検証版 `/v3/` に算数レベル5・6を追加した。

本ドキュメントでは、V3.1を root `index.html` に昇格する方式・影響範囲・rollback方針を整理する。

## 2. 結論

V3.1は、main昇格候補として妥当である。

採用する昇格方式は、root `index.html` のみを V3.1 アプリシェルへ置き換え、CSS / JavaScript は既存の `v3/` 配下を参照する **最小昇格方式** とする。

```text
採用:
V3.1を root index.html に昇格する

方式:
- root index.html を V3.1 の画面構造に置き換える
- CSS は ./v3/css/app.css を参照する
- JavaScript は ./v3/js/main.js を参照する
- root css/ と root js/ は追加しない

rollback:
- 主手段: V3.1 main昇格PRのrevert
- 補助手段: archive/index_v2_main_before_v3_1.html から root index.html を復元
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

ただし、昇格PRでは `v3/` 一式を root `css/` / `js/` にコピーしない。

root `index.html` が `v3/` 配下のCSS / JavaScriptを参照する。

## 4. 昇格で変わること

root `index.html` を V3.1 アプリシェルへ切り替える。

V3.1昇格後は、GitHub Pages の通常URLが V3.1 を表示する。

```text
https://mantanak-jp.github.io/pokemon-math/
```

root `index.html` は以下を参照する。

```html
<link rel="stylesheet" href="./v3/css/app.css">
<script type="module" src="./v3/js/main.js"></script>
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
- v3/ 配下の実行ファイル
```

## 6. 昇格方式

### 6.1 採用方式

採用方式は、root `index.html` のみを差し替える最小昇格方式である。

```text
1. 現行 root index.html を archive に退避する
2. root index.html を V3.1 の画面構造に置き換える
3. root index.html のCSS参照を ./v3/css/app.css にする
4. root index.html のJS参照を ./v3/js/main.js にする
5. root css/ と root js/ は追加しない
```

### 6.2 採用理由

```text
1. /v3/ で実機確認済みの CSS / JavaScript をそのまま使える
2. root への大量ファイル追加を避けられる
3. 差分が root index.html と docs に限定される
4. rollback がしやすい
```

### 6.3 注意点

この方式では、`v3/` は main の実行資産になる。

そのため、V3.2 / Phase 4 の国旗クイズ開発で `v3/` を直接変更すると、root Main にも影響する可能性がある。

```text
注意:
- V3.1 main昇格後の v3/ は、単なる検証領域ではなく Main 実行資産である
- V3.2 / Phase 4 では、別ディレクトリまたは別ブランチ運用を先に決める
```

## 7. 退避方針

現行 root `index.html` は、昇格前に以下へ退避済みである。

```text
archive/index_v2_main_before_v3_1.html
```

このファイルは、V3.1 main昇格前の V2 Main の退避版として扱う。

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

通常はこちらを優先する。

### 8.2 archive退避版による手動復旧

`archive/index_v2_main_before_v3_1.html` を root `index.html` に戻す。

```text
対象:
archive/index_v2_main_before_v3_1.html

方法:
必要時に root index.html として復元するPRを作成
```

## 9. 昇格PRの想定変更ファイル

昇格PRでは、以下が変更される見込み。

```text
更新:
- index.html
- docs/release_and_canary.md
- docs/v3_main_promotion_decision.md

既に main 反映済み:
- archive/index_v2_main_before_v3_1.html
```

root `css/` / `js/` は追加しない。

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
13. archive/index_v2_main_before_v3_1.html が存在する
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
9. v3/css/app.css が404になっていない
10. v3/js/main.js が404になっていない
11. コンソールエラーが出ていない
```

## 12. リスク

### 12.1 v3/ 変更が Main に影響するリスク

最小昇格方式では、root `index.html` が `v3/` 配下のCSS / JavaScriptを参照する。

そのため、昇格後に `v3/` を変更すると Main に影響する可能性がある。

対策:

```text
- V3.1 main昇格後、v3/ は Main 実行資産として扱う
- V3.2 / Phase 4 開発開始前に、別ディレクトリまたは別方針を決める
- v3/ を変更する場合は Main 影響ありとして扱う
```

### 12.2 root index.html の差分が大きい

V2 Mainは単一HTML、V3.1は分割構成である。

そのため、root `index.html` の差分は大きくなる。

対策:

```text
- V2 Mainは archive/index_v2_main_before_v3_1.html に退避済み
- rollback方針をPR本文に明記する
- 昇格後に通常URLで実機確認する
```

### 12.3 実データ変更リスク

通常プレイでは `users_v2/{userId}` に報酬・進捗が保存される。

対策:

```text
- 基本確認は guest で行う
- ryoma / sara は不用意に使わない
- Firestore構造は変更しない
```

## 13. main昇格PRの実施手順

```text
1. mainから昇格用ブランチを作成する
2. archive/index_v2_main_before_v3_1.html が存在することを確認する
3. root index.html を V3.1 アプリシェルへ置き換える
4. root index.html の CSS 参照を ./v3/css/app.css にする
5. root index.html の JS 参照を ./v3/js/main.js にする
6. docs/release_and_canary.md を更新する
7. docs/v3_main_promotion_decision.md を更新する
8. mainとの差分を確認する
9. PRを作成する
10. PRマージ後、通常URLで実機確認する
```

## 14. 判断

V3.1は、算数レベル5・6追加までを対象とし、国旗クイズやFirestore新規マスター追加を含まない。

既存Firestore構造を変更せず、V3検証版での実装・完了報告も完了している。

また、V2 Main退避版は `archive/index_v2_main_before_v3_1.html` に保存済みである。

そのため、以下の条件を満たすなら main昇格に進んでよい。

```text
昇格条件:
- /pokemon-math/v3/ での実機確認がOK
- guestで基本動作確認済み
- root昇格方式とrollback方針をPR本文に明記する
- V2 Main退避ファイルが archive に残っている
```

## 15. 次の作業

次の作業は、V3.1 main昇格PRの作成である。

root `index.html` を変更するため、対象・影響範囲・後戻り可否を明記したうえで進める。
