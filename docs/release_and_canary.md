# Release and Canary 方針

最終更新: 2026-06-04

## 1. 目的

この文書は、ポケモンさんすうアプリ V2 Main 昇格後の Release / Canary 運用方針を定義します。

## 2. 現在の基本方針

- ルート `index.html` は V2 Main 本番版です。
- V1.5本番版は `archive/index_v1_5.html` に退避済みです。
- `canary/index.html` は V2 Canary 開発・検証の履歴、および今後の検証用ファイルとして残します。
- `canary/migration.html` は V1.5→V2移行に使用した運用者向けツールとして残します。
- Main の通常ユーザー画面に移行UIを表示しません。
- 今後の本番反映は、原則として作業ブランチまたはCanary検証を経て PR で Main に反映します。

## 3. ファイル配置

| パス | 位置づけ |
| --- | --- |
| `/index.html` | V2 Main 本番版 |
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
3. 必要に応じて canary/index.html または別検証ファイルで確認する
4. 差分を小さく保ってPRを作る
5. Files changed で対象ファイルを確認する
6. 実機確認する
7. 問題なければ main へマージする
```

## 6. 移行UIの扱い

- V2 Main `index.html` には移行ボタンを入れません。
- 移行は `canary/migration.html` で運用者が直接実行します。
- Mainに `migration.html` 相当のUIを入れません。

## 7. 実装時の禁止事項

- V2本体に移行ボタンを混ぜないでください。
- Mainに `canary/migration.html` 相当の移行UIを入れないでください。
- V2から `users` コレクションへ書き込まないでください。
- `masters/gen_{1..9}` へ通常プレイ中に書き込まないでください。
- `body.modal-open` を安易に戻さないでください。
