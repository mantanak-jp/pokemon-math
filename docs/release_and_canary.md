# Release and Canary 方針

最終更新: 2026-06-11

## 1. 目的

この文書は、ポケモンさんすうアプリの Release / Canary / V3検証運用方針を定義します。

## 2. 現在の基本方針

- ルート `index.html` は通常ユーザー向けの Main 本番版です。
- V3.1 main昇格後、root `index.html` は V3.1 アプリシェルになります。
- V3.1 main昇格では、root `index.html` が `v3/css/app.css` と `v3/js/main.js` を参照します。
- `v3/` は V3.1 Main の実行資産として当面維持します。
- V4 開発では、既存の `v3/` を直接壊さないよう、`v4/` を開発確認用ディレクトリとして使用します。
- V2 Main 本番版は `archive/index_v2_main_before_v3_1.html` に退避済みです。
- V1.5本番版は `archive/index_v1_5.html` に退避済みです。
- `canary/index.html` は V2 Canary 開発・検証の履歴、および今後の検証用ファイルとして残します。
- `canary/migration.html` は V1.5→V2移行に使用した運用者向けツールとして残します。
- Main の通常ユーザー画面に移行UIを表示しません。
- 今後の本番反映は、原則として作業ブランチまたは検証ディレクトリで確認したうえで PR で Main に反映します。

## 3. ファイル配置

| パス | 位置づけ |
| --- | --- |
| `/index.html` | Main 本番版。V3.1 main昇格後は V3.1 アプリシェルです。 |
| `/v3/` | V3.1 Main の CSS / JavaScript 実行資産、および比較確認用です。 |
| `/v4/` | V4 開発確認用ディレクトリです。V3.1 Main 実行資産をベースにした独立構成として扱います。 |
| `/archive/index_v2_main_before_v3_1.html` | V3.1 main昇格前の V2 Main 退避版です。 |
| `/archive/index_v1_5.html` | V1.5退避版です。 |
| `/canary/index.html` | V2 Canary履歴・検証用です。 |
| `/canary/migration.html` | 運用者向け移行ツールです。 |
| `/canary/index_ui.html` | UIプロトタイプです。 |
| `/canary/index_dev_masterdata_2.html` | マスターデータ取得履歴です。 |

## 4. Main昇格履歴

### 4.1 V2 Main昇格

V2 Main昇格は PR #19 で完了済みです。

```text
PR #19:
Promote V2 app to main

変更:
index.html

結果:
merged
```

### 4.2 V3.1 Main昇格

V3.1 Main昇格では、root `index.html` を V3.1 アプリシェルに置き換えます。

```text
昇格方式:
- root index.html を V3.1 の画面構造に置き換える
- CSS は ./v3/css/app.css を参照する
- JavaScript は ./v3/js/main.js を参照する
- root css/ と root js/ は追加しない
- V2 Main は archive/index_v2_main_before_v3_1.html に退避済み
```

## 5. 今後のリリース運用

```text
1. 仕様・影響範囲を docs または Issue で確認する
2. 作業ブランチを作る
3. 必要に応じて canary/、v3/、または別検証ディレクトリで確認する
4. 差分を小さく保ってPRを作る
5. Files changed で対象ファイルを確認する
6. 実機確認する
7. 問題なければ main へマージする
```

## 6. V3.1 Main運用

V3.1 main昇格後、通常URLは V3.1 を表示します。

```text
https://mantanak-jp.github.io/pokemon-math/
```

root `index.html` は以下を参照します。

```html
<link rel="stylesheet" href="./v3/css/app.css">
<script type="module" src="./v3/js/main.js"></script>
```

このため、`v3/` は当面 Main の実行資産です。

```text
注意:
- V4 開発で v3/ を直接変更すると Main に影響する可能性があります。
- 国旗クイズなど次期開発は、`v4/` で検証してから PR 単位で進めます。
- GitHub Pages の `/v4/` iPhone確認は、通常は対象 PR の merge 後に行います。
```

## 7. rollback 方針

V3.1 main昇格後に問題が出た場合は、以下の順で rollback を検討します。

```text
第1候補:
V3.1 main昇格PRを revert する

第2候補:
archive/index_v2_main_before_v3_1.html を root index.html に復元するPRを作成する
```

Git履歴による rollback を優先し、archive退避版は手動復旧時の補助手段とします。

## 8. 移行UIの扱い

- Main `index.html` には移行ボタンを入れません。
- V3.1 Main にも移行ボタンを入れません。
- 移行は `canary/migration.html` で運用者が直接実行します。
- Mainに `migration.html` 相当のUIを入れません。

## 9. 実装時の禁止事項

- Mainに移行ボタンを混ぜないでください。
- V3.1 Mainに移行ボタンを混ぜないでください。
- Mainに `canary/migration.html` 相当の移行UIを入れないでください。
- V2 / V3 / Mainから `users` コレクションへ通常プレイ中に書き込まないでください。
- `masters/gen_{1..9}` へ通常プレイ中に書き込まないでください。
- `body.modal-open` を安易に戻さないでください。
