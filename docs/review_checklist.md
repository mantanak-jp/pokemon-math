# レビュー・チェックリスト

最終更新: 2026-06-11

## 1. 目的

この文書は、`pokemon-math` リポジトリにおける Pull Request 作成前・レビュー時・マージ前の確認項目を定義します。

本プロジェクトでは、root `index.html` が V3.1 Main アプリシェルであり、`v3/` が V3.1 Main の CSS / JavaScript 実行資産です。また、Firestore 上の `users_v2` に実ユーザーデータが存在します。

そのため、変更作業では以下を重視します。

```text
- 本番アプリを壊さないこと
- 実ユーザーデータを壊さないこと
- 変更対象と影響範囲を明確にすること
- 仕様変更とリファクタリングを混ぜないこと
- PR差分を確認しやすい単位に保つこと
```

## 2. レビュー対象の基本分類

PRは、まず以下のどれに該当するかを分類します。

```text
A. ドキュメントのみ
B. UI / UX変更
C. クイズ仕様変更
D. 報酬仕様変更
E. Firestore読み書き変更
F. index.html / v3 / CSS / JS リファクタリング
G. canary / migration / archive 関連変更
H. その他
```

複数に該当する場合は、影響範囲が大きくなるため、PR本文に複数分類であることを明記します。

## 3. PR作成前チェック

PR作成前に、以下を確認します。

```text
- 変更目的が明確か
- 変更対象ファイルが明確か
- 変更しないファイルが明確か
- 本番影響の有無が説明されているか
- Firestore影響の有無が説明されているか
- 実機確認が必要かどうか判断されているか
- 関連ドキュメント更新が必要か判断されているか
```

## 4. 共通チェック

すべてのPRで、以下を確認します。

```text
- 想定外のファイルが変更されていない
- 不要なファイル削除がない
- main へ直接変更していない
- PR本文に Summary / Scope / Checks がある
- 変更内容とPR本文が一致している
- 仕様変更がある場合、関連ドキュメントに反映されている
- リファクタリングの場合、ロジックの意味が変わっていない
- GitHub main を唯一の正本として扱っている
- 作業が branch + Pull Request で進められている
```

## 5. Codex app 作業後チェック

Codex app で作業した後は、PR作成前またはレビュー時に以下を確認します。

```text
- 変更対象がユーザーに許可された範囲内である
- 保護領域を明示承認なしに変更していない
- root index.html を変更していない、または変更理由と承認が明確である
- v3/ を変更していない、または変更理由と承認が明確である
- canary/、archive/、README.md、AGENTS.md を明示承認なしに変更していない
- git status が確認されている
- git diff --stat が確認されている
- commit / push / PR作成が明示許可なしに行われていない
- main への直接 push が行われていない
- HTML / CSS / JavaScript に意図しない変更がない
- Firebase / Firestore 関連設定に意図しない変更がない
- GitHub Pages 設定に意図しない変更がない
- Codex app の実行環境がローカルPC上のリポジトリであることが前提と合っている
- ユーザーがローカルPCを直接操作する前提の手順になっていない
```

Codex app の詳細な初期運用ガードレールは `docs/codex_app_guardrails.md` を参照します。

## 6. ドキュメントのみPRのチェック

ドキュメントのみPRでは、以下を確認します。

```text
- Markdownファイルのみが変更されている
- index.html が変更されていない
- v3/ が変更されていない
- HTML / JavaScript / CSS が変更されていない
- Firestoreデータに影響がない
- GitHub Pages設定に影響がない
- ドキュメント内容が現行仕様と矛盾していない
- 古い仕様を正本のように書いていない
- Codex app / GitHub / iPhone実機確認の運用前提と矛盾していない
```

PR本文には、以下を明記します。

```text
- Markdown documentation only
- No HTML / JavaScript / CSS changes
- No Firestore data changes
- No GitHub Pages setting changes
```

## 7. index.html / v3 変更PRのチェック

root `index.html` は V3.1 Main アプリシェルです。root `index.html` は `./v3/css/app.css` と `./v3/js/main.js` を参照しているため、`v3/` も V3.1 Main の実行資産です。

`index.html` または `v3/` を変更するPRでは、以下を必ず確認します。

```text
- V3.1 Mainへの影響が説明されている
- 変更した画面・機能が説明されている
- Firebase SDK読み込み順が壊れていない
- Firestore読み書き先が変わっていない
- users へ通常プレイ中に書き込まない
- users_v2 を現行ユーザーデータの正本として維持している
- masters/gen_{1..9} へ通常プレイ中に書き込まない
- canary/migration.html への通常導線を追加していない
- UI文言が意図せず変わっていない
- 図鑑モーダル仕様が戻っていない
- body.modal-open を復活させていない
```

V4 / Phase 4 開発では、原則として `v4/` を新設し、V3.1 Main 実行資産である `v3/` を直接変更しません。

## 8. Firestore関連チェック

Firestore読み書きに関わるPRでは、以下を確認します。

```text
- 読み取り対象コレクションが明確か
- 書き込み対象コレクションが明確か
- users_v2 への書き込み仕様が変わるか
- users へ通常プレイ中に書き込まないか
- masters/gen_{1..9} へ通常プレイ中に書き込まないか
- migration_logs を作成していないか
- owned_by_generation を無断追加していないか
- createdAt / updatedAt / migratedAt / migrated_from_v1 の扱いが仕様と矛盾していないか
```

現行アプリの通常プレイで許可されるFirestore利用は以下です。

```text
読み取り:
- users_v2
- masters/gen_{1..9}

書き込み:
- users_v2
```

通常プレイ中に禁止するFirestore利用は以下です。

```text
- users への書き込み
- masters/gen_{1..9} への書き込み
- migration_logs の作成
- owned_by_generation の追加
```

Firestore投入元データを追加・更新するPRでは、以下も確認します。

```text
- JSONとして parse できる
- ルート配列や必須フィールドなど、設計ドキュメントのスキーマと一致している
- IDやコードに重複がない
- boolean / null / string / number の型が仕様どおりである
- Firestore実データへの投入がPRのスコープに含まれるか明記されている
- 投入しないPRでは、Firestore実データが未変更であることを明記している
- V4関連データPRでは、現在のV4確認済みバージョン表示をPR本文に明記している
```

Firestore投入補助ツールを追加・更新するPRでは、以下も確認します。

```text
- プレビュー専用か、実投入機能を含むかが明確である
- Step 7 の投入前確認ツールでは Firestore実データに書き込まない
- Firestore SDK、Firebase config、書き込み処理を含める場合は明示承認と安全策がある
- data/country_masters.generated.json を意図せず変更していない
- root index.html / v3/ / v4/ を変更していない
- 実投入は Step 8 として分離されている
```

Firestore投入機能を追加するPRでは、以下も確認します。

```text
- ページロードだけでFirestoreに書き込まない
- 投入ボタンが初期状態で disabled である
- JSON検証と件数条件を満たさないと投入ボタンが有効にならない
- 確認チェックボックスと確認テキストの完全一致が必要である
- クリック時に window.confirm が出る
- data/country_masters.generated.json を変更していない
- root index.html / v3/ / v4/ を変更していない
- 実投入は明示承認された Step 8-B に分離されている
```

## 9. users_v2 データ保護チェック

実ユーザーデータ保護のため、以下を確認します。

```text
- ryoma / sara の進行データを不用意に変更しない
- 実機確認は原則 guest を使う
- ryoma / sara は表示確認を基本とする
- 世代クリア検証は原則 guest で行う
- テスト用データ操作を行う場合、対象ユーザーを明示する
```

## 10. クイズ仕様チェック

クイズ仕様に関わるPRでは、以下を確認します。

```text
- 1回のクイズが5問であることを維持しているか
- 4問正解で1匹取得の仕様を維持しているか
- 5問正解で2匹取得の仕様を維持しているか
- 3問以下ではポケモン取得しない仕様を維持しているか
- レベル1〜6の既存仕様を壊していないか
- 新レベル・新クイズ種別追加時に既存レベルへ影響していないか
- 選択肢生成で重複や不正な値が出ないか
```

クイズ仕様を変更する場合は、以下の更新要否を確認します。

```text
- docs/system_definition_v2.md
- docs/ui_ux_v2.md
- docs/refactoring_plan.md
- V3 / V4 関連の要求仕様・設計ドキュメント
```

## 11. 報酬仕様チェック

報酬仕様に関わるPRでは、以下を確認します。

```text
- 正解数に応じた報酬数が仕様どおりか
- 未取得ポケモンだけから抽選しているか
- current_gen_owned には local_id を保存しているか
- api_id を誤って保存していないか
- 世代クリア時に cleared_generations が正しく更新されるか
- 世代クリア時に current_gen_owned が [] にリセットされるか
- 全世代コンプリート後に新規取得・Firestore書き込みが発生しないか
```

報酬仕様を変更する場合は、以下の更新要否を確認します。

```text
- docs/data_model_v1_v2.md
- docs/system_definition_v2.md
- docs/ui_ux_v2.md
- docs/refactoring_plan.md
- V3 / V4 関連の要求仕様・設計ドキュメント
```

## 12. 図鑑・モーダルチェック

図鑑・モーダルに関わるPRでは、以下を確認します。

```text
- 図鑑グリッド部分だけをスクロール領域にしているか
- 図鑑画面全体を長いスクロール画面に戻していないか
- モーダルは .app の外、body直下相当の外側レイヤーにあるか
- モーダル背景は position: fixed を維持しているか
- 背景クリックで閉じるか
- 右上 × で閉じるか
- 下部の「とじる」ボタンを復活させていないか
- body.modal-open を復活させていないか
- 未取得ポケモンは ? / ??? 表示を維持しているか
```

## 13. UI / UXチェック

UI / UXに関わるPRでは、以下を確認します。

```text
- 世代表記は「第◯世代」を維持しているか
- 「第◯せだい」に戻していないか
- 通常結果画面のボタン構成を維持しているか
- 保存失敗時の「もういちどゲットする」を維持しているか
- 世代クリア時の結果画面は「第◯世代クリア！」のみか
- 世代クリア後は、世代クリア + 次世代解放の統合画面になっているか
- 全世代コンプリート後もクイズ継続可能か
```

通常結果画面のボタン構成は以下です。

```text
- 同じレベルでつづける
- ずかんをみる
- メニューへもどる
```

保存失敗時の手動再試行ボタンは以下です。

```text
もういちどゲットする
```

## 14. migration / canary / archive チェック

`canary/`、`migration`、`archive/` に関わるPRでは、以下を確認します。

```text
- canary/migration.html を通常導線に混ぜていないか
- root index.html に移行UIを混ぜていないか
- canary/index.html に移行ボタンを追加していないか
- archive/index_v1_5.html を不用意に変更していないか
- archive/index_v2_main_before_v3_1.html を不用意に変更していないか
- V1.5退避版の位置づけを変えていないか
- V2 Canaryの検証用位置づけを変えていないか
- V2 Main退避版の位置づけを変えていないか
```

## 15. CSS / JS外出し Phase 1A チェック

Phase 1Aでは、以下を確認します。

```text
- index.html 内の <style> が css/app.css に移動されている
- index.html 内のメイン <script> が js/app.js に移動されている
- Firebase SDK読み込みは index.html 側に残っている
- css/app.css の読み込みパスが正しい
- js/app.js の読み込みパスが正しい
- defer指定によって初期化順が壊れていない
- ロジック変更が混入していない
- UI文言変更が混入していない
- Firestore読み書き先が変わっていない
```

Phase 1Aで変更してよいファイルは原則以下です。

```text
- index.html
- css/app.css
- js/app.js
- 必要な関連ドキュメント
```

Phase 1Aで変更しないファイルは以下です。

```text
- canary/
- archive/
- Firestoreデータ
- GitHub Pages設定
```

## 16. JS責務分割 Phase 1B チェック

Phase 1Bでは、以下を確認します。

```text
- B案の責務分割どおりにファイルが分かれている
- state.js に状態管理が集約されている
- firestore.js にFirestore操作が集約されている
- config.js にFirebase設定が分離されている
- constants.js に固定値が集約されている
- quiz.js に問題生成処理が集約されている
- reward.js に報酬処理が集約されている
- zukan.js に図鑑・モーダル処理が集約されている
- ui.js に画面表示処理が集約されている
- app.js が起動・イベント登録中心になっている
- script読み込み順が正しい
- window.PokeMath 名前空間が正しく初期化されている
- ロジックの意味が変わっていない
```

Phase 1Bで変更してよいファイルは原則以下です。

```text
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
- 必要な関連ドキュメント
```

Phase 1Bで変更しないものは以下です。

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

## 17. 実機確認チェック

PRの内容に応じて、iPhone実機で以下を確認します。

V4 開発確認では `/v4/` ディレクトリを使います。GitHub Pages 上の `/v4/` を iPhone で確認する作業は、通常は対象 PR が merge された後に行います。

最低限の通常確認:

```text
- タイトル画面が表示される
- 「はじめる」ボタンが有効になる
- ユーザー選択画面が表示される
- guestを選択できる
- メニュー画面が表示される
- 現在世代の進捗が表示される
- レベル選択ができる
- クイズが5問進行する
- 結果画面が表示される
```

保存・図鑑確認:

```text
- 4問以上正解でポケモン取得処理が動く
- Firestore users_v2/guest に保存される
- 図鑑に反映される
- 図鑑を表示できる
- 詳細モーダルが表示される
- 背景クリックでモーダルが閉じる
- 右上×でモーダルが閉じる
```

世代進行を触るPRでは、必要に応じて以下を確認します。

```text
- 世代クリア処理が走る
- cleared_generations が更新される
- current_gen_owned が [] になる
- 次世代が解放される
- 世代クリア + 次世代解放の統合画面が表示される
```

## 18. マージ前チェック

マージ前に以下を確認します。

```text
- PR本文と実際の差分が一致している
- Files changed で想定外の変更がない
- 変更対象ファイル数が妥当
- Firestore影響が説明されている
- 実機確認が必要なPRでは確認結果がある
- 関連ドキュメントが更新されている
- 未解決のコメントがない
- ユーザーがマージを承認している
```

## 19. マージ後チェック

マージ後に以下を確認します。

```text
- PRが merged になっている
- main に変更が反映されている
- 追加・更新されたファイルが main 上で確認できる
- 必要に応じてGitHub Pages上の反映を確認する
- V4 PR の場合、必要に応じて GitHub Pages の `/v4/` を iPhone で確認する
- 次に削除してよいブランチがあれば整理する
- 次フェーズの作業を確認する
```

## 20. 例外対応

想定外の差分や挙動が見つかった場合は、以下を優先します。

```text
- 無理にマージしない
- 原因を切り分ける
- 変更範囲を狭める
- 必要ならPRを閉じる
- 必要なら別ブランチでやり直す
- 実ユーザーデータに影響がある可能性がある場合は、即座に作業を止める
```

## 21. 関連ドキュメント

関連ドキュメントは以下です。

```text
- README.md
- AGENTS.md
- docs/README.md
- docs/codex_app_guardrails.md
- docs/current_inventory.md
- docs/data_model_v1_v2.md
- docs/development_workflow.md
- docs/migration_v1_to_v2.md
- docs/refactoring_plan.md
- docs/release_and_canary.md
- docs/system_definition_v1.5.md
- docs/system_definition_v2.md
- docs/ui_ux_v2.md
- docs/v2_canary_handoff.md
```
