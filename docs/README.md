# docs

このディレクトリは、ポケモンさんすうアプリの仕様・設計・運用ルールを管理する場所です。

## 現在のドキュメント

| ファイル | 役割 |
| --- | --- |
| `system_definition_v2.md` | V2 Main の仕様定義書です。現在の root `index.html` の仕様参照元です。 |
| `ui_ux_v2.md` | V2 Main の UI/UX、画面遷移、文言、図鑑・モーダル仕様を定義します。 |
| `data_model_v1_v2.md` | V1.5 / V2 / マスターデータの Firestore データモデルを定義します。 |
| `migration_v1_to_v2.md` | V1.5 から V2 への移行仕様、および ryoma / sara の移行実施記録を整理します。 |
| `release_and_canary.md` | V2 Main 昇格後の Main / Canary / archive 運用方針を定義します。 |
| `current_inventory.md` | 現在のリポジトリ構成、主要HTML、Firestore、ドキュメントの位置づけを棚卸しします。 |
| `v2_canary_handoff.md` | V2 Canary 開発から Main 昇格完了までの引き継ぎ・完了メモです。 |
| `system_definition_v1.5.md` | V1.5 退避版の仕様定義書です。`archive/index_v1_5.html` の参照用として維持します。 |

## 現在の主要ファイルの位置づけ

| パス | 位置づけ |
| --- | --- |
| `index.html` | V2 Main 本番版です。 |
| `archive/index_v1_5.html` | V1.5 本番版の退避ファイルです。 |
| `canary/index.html` | V2 Canary 開発・検証の履歴、および今後の検証用ファイルです。 |
| `canary/migration.html` | V1.5→V2 移行に使用した運用者向けツールです。通常導線には出しません。 |
| `canary/index_ui.html` | V2 UI 評価用プロトタイプです。参考用です。 |
| `canary/index_dev_masterdata_2.html` | マスターデータ取得・Firestore 投入用の開発ダッシュボードです。参考・履歴扱いです。 |

## 現在の正本

| 項目 | 正本 |
| --- | --- |
| V2 Main アプリ | `index.html` |
| V2 ユーザーデータ | Firestore `users_v2/{userId}` |
| V2 ポケモンマスター | Firestore `masters/gen_{1..9}` |
| V1.5 退避版 | `archive/index_v1_5.html` |
| V1.5 データ参照 | Firestore `users/{username}` |
| 移行仕様 | `docs/migration_v1_to_v2.md` |
| UI/UX仕様 | `docs/ui_ux_v2.md` |
| リリース運用 | `docs/release_and_canary.md` |

## ドキュメント更新タイミング

以下の場合は、コード変更と同時に関連ドキュメントを更新してください。

- Firestore の読み書き先を変更する場合
- V1.5 / V2 のデータ構造を変更する場合
- 画面遷移、主要UI、子ども向け文言を変更する場合
- `index.html`、`canary/`、`archive/` 配下のファイルの役割を変更する場合
- V1.5 から V2 への移行仕様を変更する場合
- Main / Canary のリリース運用を変更する場合
