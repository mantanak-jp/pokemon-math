# Release and Canary 方針

最終更新: 2026-06-06

## 1. 目的

この文書は、ポケモンさんすうアプリ V2 Main 昇格後の Release / Canary / V3検証運用方針を定義します。

## 2. 現在の基本方針

- ルート `index.html` は V2 Main 本番版です。
- V1.5本番版は `archive/index_v1_5.html` に退避済みです。
- `canary/index.html` は V2 Canary 開発・検証の履歴、および今後の検証用ファイルとして残します。
- `canary/migration.html` は V1.5→V2移行に使用した運用者向けツールとして残します。
- V3シングルHTML分割プロジェクトでは、`v3/` ディレクトリを新設し、root `index.html` を直接壊さずに検証します。
- Main の通常ユーザー画面に移行UIを表示しません。
- 今後の本番反映は、原則として作業ブランチまたは検証ディレクトリで確認したうえで PR で Main に反映します。

## 3. ファイル配置

| パス | 位置づけ |
| --- | --- |
| `/index.html` | V2 Main 本番版 |
| `/v3/` | V3シングルHTML分割プロジェクト用に新設予定の検証領域 |
| `/archive/index_v1_5.html` | V1.5退避版 |
| `/canary/index.html` | V2 Canary履歴・検証用 |
| `/canary/migration.html` | 運用者向け移行ツール |
| `/canary/index_ui.html` | UIプロトタイプ |
| `/canary/index_dev_masterdata_2.html` | マスターデータ取得履歴 |

## 4. Main昇格の完了状態

V2 Main昇格は PR #19 で完了済みです。

```text
PR #19:
Promote V2 app to main

変更:
index.html

結果:
merged
```

## 5. 今後のリリース運用

```text
1. 仕様・影響範囲を docs または Issue で確認する
2. 作業ブランチを作る
3. 必要に応じて canary/index.html、v3/、または別検証ファイルで確認する
4. 差分を小さく保ってPRを作る
5. Files changed で対象ファイルを確認する
6. 実機確認する
7. 問題なければ main へマージする
```

## 6. V3検証運用

V3シングルHTML分割プロジェクトでは、`v3/` ディレクトリを検証領域として使います。

想定URL:

```text
https://mantanak-jp.github.io/pokemon-math/v3/
```

V3では、以下を基本方針とします。

```text
- root index.html は V2 Main 本番版として維持する
- v3/index.html を検証対象にする
- CSS / JavaScript は v3/index.html からの相対パスで読み込む
- canary/ は V2 Canary履歴として維持し、V3には流用しない
- V3検証後、root index.html への昇格は別PRで判断する
```

Phase 1A想定:

```text
v3/
├─ index.html
├─ css/
│  └─ app.css
└─ js/
   └─ app.js
```

Phase 1B想定:

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

## 7. 移行UIの扱い

- V2 Main `index.html` には移行ボタンを入れません。
- V3 `v3/index.html` にも移行ボタンを入れません。
- 移行は `canary/migration.html` で運用者が直接実行します。
- Mainに `migration.html` 相当のUIを入れません。

## 8. 実装時の禁止事項

- V2本体に移行ボタンを混ぜないでください。
- V3検証版に移行ボタンを混ぜないでください。
- Mainに `canary/migration.html` 相当の移行UIを入れないでください。
- V2 / V3から `users` コレクションへ通常プレイ中に書き込まないでください。
- `masters/gen_{1..9}` へ通常プレイ中に書き込まないでください。
- `body.modal-open` を安易に戻さないでください。
