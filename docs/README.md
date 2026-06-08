# docs

最終更新: 2026-06-08

このディレクトリは、ポケモンさんすうアプリの仕様・設計・運用ルール・引き継ぎ情報を管理する場所です。

## 1. 現在の正本

| 項目 | 正本 |
| --- | --- |
| V2 Main アプリ | `index.html` |
| V3検証版 | `v3/` |
| V3.1 / Phase 3 要求仕様 | `docs/v3_phase_3_requirements.md` |
| V3.2 / Phase 4 国旗クイズ先行設計 | `docs/v3_country_master_design.md` |
| V2 ユーザーデータ | Firestore `users_v2/{userId}` |
| V2 ポケモンマスター | Firestore `masters/gen_{1..9}` |
| V1.5 退避版 | `archive/index_v1_5.html` |
| V1.5 データ参照 | Firestore `users/{username}` |
| V1.5→V2 移行仕様 | `docs/migration_v1_to_v2.md` |
| UI/UX仕様 | `docs/ui_ux_v2.md` |
| リリース運用 | `docs/release_and_canary.md` |
| V3計画 | `docs/v3_refactoring_plan.md` |
| V3 Phase 2完了報告 | `docs/v3_phase_2_completion_report.md` |

## 2. 主要ドキュメント一覧

| ファイル | 役割 | 対象 | 最終更新 |
| --- | --- | --- | --- |
| `system_definition_v2.md` | V2 Main の仕様定義書。root `index.html` の仕様参照元です。 | V2 Main | 2026-06-04 |
| `ui_ux_v2.md` | V2 Main の UI/UX、画面遷移、文言、図鑑・モーダル仕様を定義します。 | V2 Main | 2026-06-04 |
| `data_model_v1_v2.md` | V1.5 / V2 / マスターデータの Firestore データモデルを定義します。 | V1.5 / V2 | 2026-06-04 |
| `migration_v1_to_v2.md` | V1.5 から V2 への移行仕様、および `ryoma` / `sara` の移行実施記録を整理します。 | 移行 | 2026-06-04 |
| `release_and_canary.md` | V2 Main 昇格後の Main / Canary / archive / V3検証運用方針を定義します。 | 運用 | 2026-06-06 |
| `current_inventory.md` | リポジトリ構成、主要HTML、Firestore、ドキュメントの位置づけを棚卸しします。 | 全体棚卸し | 2026-06-06 |
| `development_workflow.md` | iPhone / ChatGPT / Codex Web / GitHub を使った開発ワークフローを定義します。 | 開発運用 | 2026-06-06 |
| `review_checklist.md` | PR作成前・レビュー時・マージ前後のチェックリストです。 | レビュー | 2026-06-06 |
| `refactoring_plan.md` | root `index.html` 分割・リファクタリングの基本方針を定義します。 | リファクタリング | 2026-06-06 |
| `v2_canary_handoff.md` | V2 Canary 開発から Main 昇格完了までの引き継ぎ・完了メモです。 | V2 Canary | 2026-06-04 |
| `system_definition_v1.5.md` | V1.5 退避版の仕様定義書です。`archive/index_v1_5.html` の参照用として維持します。 | V1.5 archive | 記載なし |

## 3. V3関連ドキュメント一覧

| ファイル | 役割 | 対象 | 最終更新 |
| --- | --- | --- | --- |
| `v3_refactoring_plan.md` | V3シングルHTML分割プロジェクトの専用計画です。`v3/` ディレクトリ方式、相対パス、検証・昇格方針を定義します。 | V3全体 | 2026-06-07 |
| `v3_handoff.md` | V3 Phase 1完了時点の引き継ぎメモです。Phase 2開始前の現在地を整理します。 | V3 Phase 1 | 2026-06-07 |
| `v3_phase_2_design.md` | V3 Phase 2 の ES Modules化設計方針を定義します。 | V3 Phase 2設計 | 2026-06-07 |
| `v3_phase_2c_compatibility_notes.md` | V3 Phase 2C 時点で残る `window.AppXXX` 互換層の扱いを整理します。 | V3 Phase 2C | 2026-06-07 |
| `v3_phase_2_completion_report.md` | V3 Phase 2 の完了内容、実施PR、最終構成、残課題を整理します。 | V3 Phase 2完了 | 2026-06-07 |
| `v3_phase_3_requirements.md` | V3.1 / Phase 3 の算数拡張要求仕様です。レベル5・6追加と main昇格判断条件を整理します。 | V3.1 / Phase 3 | 2026-06-08 |
| `v3_country_master_design.md` | V3.2 / Phase 4 の国旗クイズに向けた `country_masters` 先行設計です。 | V3.2 / Phase 4先行設計 | 2026-06-08 |

## 4. 現在の主要ファイルの位置づけ

| パス | 位置づけ |
| --- | --- |
| `index.html` | V2 Main 本番版です。通常ユーザー向けの正本です。 |
| `v3/` | V3 開発・検証版です。GitHub Pagesでは `/pokemon-math/v3/` で確認します。 |
| `archive/index_v1_5.html` | V1.5 本番版の退避ファイルです。 |
| `canary/index.html` | V2 Canary 開発・検証の履歴、および今後の検証用ファイルです。 |
| `canary/migration.html` | V1.5→V2 移行に使用した運用者向けツールです。通常導線には出しません。 |
| `canary/index_ui.html` | V2 UI 評価用プロトタイプです。参考用です。 |
| `canary/index_dev_masterdata_2.html` | マスターデータ取得・Firestore 投入用の開発ダッシュボードです。参考・履歴扱いです。 |

## 5. 開発フェーズ履歴

| 日付 | 内容 | 関連ドキュメント |
| --- | --- | --- |
| 2026-06-04 | V2 Main 昇格後の仕様・データモデル・UI/UX・移行・引き継ぎを整理しました。 | `system_definition_v2.md`, `data_model_v1_v2.md`, `ui_ux_v2.md`, `migration_v1_to_v2.md`, `v2_canary_handoff.md` |
| 2026-06-06 | リポジトリ棚卸し、開発ワークフロー、レビュー観点、Release / Canary / V3検証運用を整理しました。 | `current_inventory.md`, `development_workflow.md`, `review_checklist.md`, `release_and_canary.md`, `refactoring_plan.md` |
| 2026-06-07 | V3 Phase 1完了状態を整理し、V3 Phase 2 の ES Modules化設計・実施・完了報告を追加しました。 | `v3_handoff.md`, `v3_refactoring_plan.md`, `v3_phase_2_design.md`, `v3_phase_2c_compatibility_notes.md`, `v3_phase_2_completion_report.md` |
| 2026-06-07 | V3 Phase 3 の要求仕様を整理しました。当初は割り算・国旗クイズを同一フェーズで検討しました。 | `v3_phase_3_requirements.md` |
| 2026-06-07 | 国旗クイズ用の `country_masters` 詳細設計を作成しました。 | `v3_country_master_design.md` |
| 2026-06-08 | V3.1 / Phase 3 を算数レベル5・6追加 + main昇格判断に縮小し、国旗クイズを V3.2 / Phase 4 に分離しました。 | `v3_phase_3_requirements.md`, `v3_country_master_design.md` |

## 6. 次に読むべきドキュメント

### V2 Main の現行仕様を確認する場合

```text
1. docs/system_definition_v2.md
2. docs/ui_ux_v2.md
3. docs/data_model_v1_v2.md
4. docs/release_and_canary.md
```

### Firestore データ構造・移行経緯を確認する場合

```text
1. docs/data_model_v1_v2.md
2. docs/migration_v1_to_v2.md
3. docs/v2_canary_handoff.md
```

### V3 の現在地を確認する場合

```text
1. docs/v3_phase_2_completion_report.md
2. docs/v3_phase_3_requirements.md
3. docs/v3_phase_2c_compatibility_notes.md
4. docs/v3_phase_2_design.md
5. docs/v3_refactoring_plan.md
6. docs/v3_handoff.md
```

### V3.1 / Phase 3 の設計・実装に進む場合

```text
1. docs/v3_phase_3_requirements.md
2. docs/v3_phase_2_completion_report.md
3. docs/v3_phase_2c_compatibility_notes.md
4. docs/review_checklist.md
5. docs/development_workflow.md
```

### V3.2 / Phase 4 の国旗クイズ設計に進む場合

```text
1. docs/v3_country_master_design.md
2. docs/v3_phase_3_requirements.md
3. docs/data_model_v1_v2.md
4. docs/review_checklist.md
5. docs/development_workflow.md
```

### PR作成・レビュー・マージ判断を確認する場合

```text
1. docs/development_workflow.md
2. docs/review_checklist.md
3. docs/release_and_canary.md
```

## 7. ドキュメント更新タイミング

以下の場合は、コード変更と同時に関連ドキュメントを更新してください。

```text
- Firestore の読み書き先を変更する場合
- V1.5 / V2 のデータ構造を変更する場合
- 画面遷移、主要UI、子ども向け文言を変更する場合
- `index.html`、`v3/`、`canary/`、`archive/` 配下のファイルの役割を変更する場合
- Main / Canary / V3 のリリース運用を変更する場合
- V3 のフェーズが完了した場合
- root `index.html` への昇格判断を行う場合
```

## 8. 注意事項

```text
- root `index.html` は V2 Main の正本です。
- `v3/` は検証領域です。root昇格は別PRで判断します。
- V3.1 / Phase 3 では、算数レベル5・6追加までを対象とします。
- 国旗クイズと `country_masters` は V3.2 / Phase 4 の対象です。
- V3.1 / Phase 3 では Firestore `users_v2` と `masters/gen_{1..9}` を変更しません。
- V3.2 / Phase 4 で `country_masters` を追加する場合も、既存のユーザー・ポケモン系Firestore構造は変更しません。
- `ryoma` / `sara` は実データのため、検証で不用意に変更しません。
- migration.html は通常ユーザー導線に出しません。
```
