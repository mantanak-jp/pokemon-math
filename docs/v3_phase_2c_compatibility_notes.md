# V3 Phase 2C 互換層整理メモ

最終更新: 2026-06-07

## 1. 目的

この文書は、V3 Phase 2C 時点で残っている `window.AppXXX` 互換層の扱いを整理するためのメモです。

Phase 2A / 2B / 2C-1 / 2C-2 により、V3 の主要な依存関係は ES Modules の `import` / `export` に移行済みです。

一方で、各 module 末尾には、既存互換のために `window.AppXXX` 公開を残しています。

```text
対象:
- window.AppConfig
- window.AppConstants
- window.AppState
- window.AppDom
- window.AppUI
- window.AppFirestore
- window.AppQuiz
- window.AppReward
- window.AppZukan
- window.AppVersion
- window.AppUtils
```

## 2. 現在地

```text
V3 Phase 2-0: 設計
✅ 完了

V3 Phase 2A: ES Modules 起動基盤
✅ 完了

V3 Phase 2B-1: quiz.js / reward.js module化
✅ 完了

V3 Phase 2B-2: ui.js module化
✅ 完了

V3 Phase 2B-3: firestore.js module化
✅ 完了

V3 Phase 2B-4: zukan.js module化
✅ 完了

V3 Phase 2C-1: app.js の window.AppXXX 参照整理
✅ 完了

V3 Phase 2C-2: quiz.js / reward.js の安全な window.AppXXX 参照整理
✅ 完了

V3 Phase 2C-3: window.AppXXX 互換公開の扱い整理
▶ この文書で棚卸し
```

## 3. 残存 `window.AppXXX` の分類

### 3.1 互換公開として残っているもの

各 module 末尾の `window.AppXXX = ...` は、現在は互換公開として残しています。

```text
config.js      -> window.AppConfig
constants.js   -> window.AppConstants
state.js       -> window.AppState
dom.js         -> window.AppDom
ui.js          -> window.AppUI
firestore.js   -> window.AppFirestore
quiz.js        -> window.AppQuiz
reward.js      -> window.AppReward
zukan.js       -> window.AppZukan
version.js     -> window.AppVersion
utils.js       -> window.AppUtils
```

これらは、V3 の通常動作では徐々に不要になっています。

ただし、以下の理由により、Phase 2C-3 では削除しません。

```text
- ブラウザ実機での切り分けに使える
- コンソール確認時に状態や関数を参照しやすい
- まだ残存参照が完全にゼロとは断言しない方が安全
- 一括削除は差分が大きく、問題発生時の原因切り分けが難しい
```

### 3.2 意図的に残す参照

`ui.js` 内の `window.AppQuiz.startQuiz(...)` は、現時点では意図的に残します。

理由は、`quiz.js` が `ui.js` を import しているためです。

ここで `ui.js` から `quiz.js` を import すると、以下の循環依存が発生します。

```text
quiz.js -> ui.js
ui.js   -> quiz.js
```

この依存は、現状の小規模整理で無理に解消しません。

将来対応する場合は、以下のいずれかを検討します。

```text
案A:
- generation clear 後の continue 処理を app.js に寄せる
- ui.js から quiz.js を直接呼ばない構造にする

案B:
- flow.js のような画面遷移・進行制御専用 module を作る
- ui.js は表示専用に近づける

案C:
- Phase 3 以降の機能追加前に、画面遷移責務を再設計する
```

## 4. 削除方針

Phase 2C-3 時点では、`window.AppXXX` 互換公開は削除しません。

削除する場合は、別PRで以下を満たしてから実施します。

```text
削除前条件:
- v3/js 配下で通常呼び出しとしての window.AppXXX 参照がほぼ解消されている
- 意図的に残す参照が明文化されている
- 削除対象が互換公開のみであることを確認できる
- /pokemon-math/v3/ の実機確認項目をすべて通せる
```

## 5. Phase 2C-3 の結論

Phase 2C-3 では、以下を結論とします。

```text
- `window.AppXXX` 互換公開は、現時点では残す
- `ui.js` 内の `window.AppQuiz.startQuiz(...)` は循環依存回避のため残す
- 互換公開の削除は Phase 2 の必須完了条件にはしない
- Phase 2 の目的は「import/export 化と依存明示」であり、この目的は概ね達成済み
```

## 6. 次の判断

次に進む場合の候補は以下です。

```text
候補A:
Phase 2 完了ドキュメントを作成し、V3 Phase 2 を完了扱いにする

候補B:
互換公開の削除をさらに進める

候補C:
Phase 3 のクイズ拡張設計に進む
```

現時点の推奨は候補Aです。

理由は、V3 Phase 2 の主目的である ES Modules 化は既に達成されており、互換公開の削除に踏み込むよりも、いったん安定点として記録する方が安全だからです。
