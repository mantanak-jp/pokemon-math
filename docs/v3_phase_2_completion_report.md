# V3 Phase 2 完了報告

最終更新: 2026-06-07

## 1. 目的

この文書は、`pokemon-math` V3 Phase 2 の完了内容を整理する完了報告です。

V3 Phase 2 の主目的は、V3 検証版の JavaScript 構成を ES Modules 化し、`main.js` 起点の `import` / `export` ベースの構造へ段階的に移行することでした。

```text
Phase 2 の目的:
- type="module" を導入する
- main.js を起点にする
- import / export によって依存関係を明示する
- window.AppXXX 名前空間依存を段階的に削減する
- V2 Main / Firestore / 実データを壊さずに V3 で検証する
```

## 2. 完了判断

V3 Phase 2 は、2026-06-07 時点で完了扱いとします。

```text
V3 Phase 2-0: 設計
✅ 完了

V3 Phase 2A: ES Modules 起動基盤
✅ 完了・実機確認OK

V3 Phase 2B-1: quiz.js / reward.js module化
✅ 完了・実機確認OK

V3 Phase 2B-2: ui.js module化
✅ 完了・実機確認OK

V3 Phase 2B-3: firestore.js module化
✅ 完了・実機確認OK

V3 Phase 2B-4: zukan.js module化
✅ 完了・実機確認OK

V3 Phase 2C-1: app.js の window.AppXXX 参照整理
✅ 完了・実機確認OK

V3 Phase 2C-2: feature modules側の残存 window.AppXXX 参照整理
✅ 完了・実機確認OK

V3 Phase 2C-3: window.AppXXX 互換公開の扱い整理
✅ 完了・実機確認OK
```

## 3. 実施PR一覧

```text
PR #29: Add V3 Phase 2 design document
- docs/v3_phase_2_design.md を追加
- Phase 2 の設計方針を定義

PR #30: Introduce V3 Phase 2A module entrypoint
- v3/js/main.js を新設
- v3/index.html を type="module" 起点化
- config / constants / state / dom / app / firestore の初期module化

PR #31: Start V3 Phase 2B module conversion
- v3/js/utils.js を追加
- v3/js/version.js を追加
- quiz.js / reward.js を module 化
- reward.js -> quiz.js の shuffleArray 依存を解消
- 開発ビルド情報表示を追加

PR #32: Convert V3 UI to ES module
- ui.js を module 化
- window.AppUI 互換公開を維持

PR #33: Convert V3 Firestore to ES module
- firestore.js を module 化
- Firestore の読み書き先・データ構造は維持
- window.AppFirestore 互換公開を維持

PR #34: Convert V3 Zukan to ES module
- zukan.js を module 化
- 図鑑UI・モーダル挙動は維持
- window.AppZukan 互換公開を維持

PR #35: Replace V3 app window namespace calls with imports
- app.js のイベントハンドラ内の window.AppXXX 呼び出しを import 呼び出しへ置換
- window.AppXXX 互換公開は維持

PR #36: Replace V3 feature module window namespace calls with imports
- quiz.js / reward.js 内の安全に置換できる window.AppXXX 呼び出しを import 化
- ui.js 内の window.AppQuiz.startQuiz は循環依存回避のため維持

PR #37: Document V3 Phase 2C compatibility layer policy
- docs/v3_phase_2c_compatibility_notes.md を追加
- window.AppXXX 互換公開の扱いを整理
- 互換公開は現時点では残す方針を明文化
```

## 4. 最終構成

Phase 2 完了時点の V3 JavaScript 構成は以下です。

```text
v3/js/
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

`v3/index.html` は `main.js` を `type="module"` で読み込みます。

```html
<script type="module" src="./js/main.js"></script>
```

## 5. ES Modules化の達成内容

Phase 2 により、以下を達成しました。

```text
- main.js を起点にした初期化構成へ移行
- config.js の firebaseConfig を export 化
- constants.js の定数群を export 化
- state.js の state を mutable singleton として export 化
- dom.js の DOM 参照を dom として export 化
- ui.js / firestore.js / quiz.js / reward.js / zukan.js を module 化
- utils.js に randomInt / shuffleArray を集約
- version.js に開発ビルド表示を集約
- app.js のイベント登録を import ベースに整理
```

## 6. window.AppXXX 互換層の扱い

Phase 2 完了時点では、各 module 末尾の `window.AppXXX` 互換公開は残しています。

```text
残している互換公開:
- window.AppConfig
- window.AppConstants
- window.AppState
- window.AppDom
- window.AppUtils
- window.AppVersion
- window.AppUI
- window.AppFirestore
- window.AppQuiz
- window.AppReward
- window.AppZukan
```

理由は以下です。

```text
- ブラウザ実機での確認・切り分けに使える
- 一括削除は差分が大きくなり、問題発生時の切り分けが難しい
- ui.js 内の window.AppQuiz.startQuiz は循環依存回避のため意図的に残している
- Phase 2 の主目的は import/export 化と依存明示であり、互換公開の完全削除ではない
```

詳細は以下に整理済みです。

```text
docs/v3_phase_2c_compatibility_notes.md
```

## 7. 維持した仕様

Phase 2 は構造変更が目的であり、ユーザー向け仕様は変更しない方針でした。

以下は維持されています。

```text
- クイズは5問進行
- 正解時に選択ボタンを correct 表示
- 不正解時に誤答ボタンを wrong 表示
- 不正解時に正解ボタンを correct 表示
- 不正解時に「せいかいは X」を表示
- 4問以上正解で報酬処理
- 図鑑表示
- ポケモン詳細モーダル表示
- 背景クリック / ×ボタンでモーダルを閉じる
```

## 8. 変更していないもの

Phase 2 では、以下は変更していません。

```text
- root index.html
- root の V2 Main
- canary/
- archive/
- migration.html への通常導線
- GitHub Pages 設定
- Firestoreデータ構造
- users_v2 データ構造
- users データ
- masters/gen_{1..9}
- ryoma / sara の実データ
- クイズ仕様
- 報酬仕様
- 図鑑仕様
```

## 9. 実機確認結果

各PRマージ後、GitHub Pages の以下URLで実機確認済みです。

```text
https://mantanak-jp.github.io/pokemon-math/v3/
```

確認済みの主な項目は以下です。

```text
- タイトル画面が表示される
- Dev Build 表示が更新される
- はじめるボタンが有効になる
- guest を選択できる
- メニューが表示される
- クイズを開始できる
- 正解表示が動作する
- 不正解時の wrong + correct 表示が動作する
- 不正解時に「せいかいは X」が表示される
- 結果画面が表示される
- 報酬保存が動作する
- 図鑑を表示できる
- 世代タブを切り替えられる
- 所有済みポケモンの詳細モーダルを開ける
- 未取得ポケモンで「まだ つかまえていないよ」が表示される
- モーダルを背景クリック・×ボタンで閉じられる
```

## 10. 残課題

Phase 2 完了時点で、以下は残課題として扱います。

```text
- window.AppXXX 互換公開を将来的に削除するかどうか
- ui.js 内の window.AppQuiz.startQuiz 参照をどう解消するか
- 画面遷移制御を app.js / flow.js 等へ分離するか
- Phase 3 のクイズ拡張設計
- root index.html へ昇格するかどうかの判断
```

## 11. Phase 3 に進む前の判断

Phase 3 に進む前に、以下を確認します。

```text
- V3 Phase 2 完了状態を安定版として扱う
- 互換公開削除を先に進めるか、Phase 3 の機能拡張を優先するか判断する
- Phase 3 で追加するクイズ種別を確定する
- Firestoreデータ構造変更が必要かどうかを確認する
```

現時点の推奨は、互換公開の完全削除よりも、Phase 3 の設計に進むことです。

理由は以下です。

```text
- Phase 2 の主目的は達成済み
- 互換公開は実害が小さく、実機確認時の切り分けにも使える
- 先に Phase 3 の拡張要件を整理した方が、必要な責務分離が見えやすい
```

## 12. 結論

V3 Phase 2 は、以下の理由により完了扱いとします。

```text
- main.js 起点の type="module" 構成に移行済み
- 主要JSファイルが import / export 化済み
- 依存関係が明示化済み
- window.AppXXX 依存は段階的に削減済み
- 互換公開の扱いは docs/v3_phase_2c_compatibility_notes.md に整理済み
- /pokemon-math/v3/ で guest による基本回帰確認済み
- root index.html / Firestore / 実データに影響なし
```

以上により、次工程は以下のいずれかです。

```text
候補A:
V3 Phase 3 のクイズ拡張設計に進む

候補B:
window.AppXXX 互換公開削除を追加で進める

候補C:
V3 を root index.html に昇格するための判断材料を整理する
```

現時点の推奨は候補Aです。
