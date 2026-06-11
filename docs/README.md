# docs

最終更新: 2026-06-10

このディレクトリは、ポケモンさんすうアプリの仕様・設計・運用ルール・引き継ぎ情報を管理する場所です。

## 1. 現在の正本

| 項目 | 正本 |
| --- | --- |
| V3.1 Main アプリ | `index.html` |
| V3.1 Main 実行資産 | `v3/` |
| V2 Main 退避版 | `archive/index_v2_main_before_v3_1.html` |
| V3.1 / Phase 3 要求仕様 | `docs/v3_phase_3_requirements.md` |
| V3.1 / Phase 3 完了報告 | `docs/v3_phase_3_completion_report.md` |
| V3.1 main昇格判断 | `docs/v3_main_promotion_decision.md` |
| V3.2 / Phase 4 国旗クイズ先行設計 | `docs/v3_country_master_design.md` |
| V4計画 | `docs/v4_development_plan.md` |
| 開発運用 | `docs/local_dev_environment.md` |
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
| `system_definition_v2.md` | V2 Main の仕様定義書。V2退避版およびV2仕様参照用として維持します。 | V2 archive | 2026-06-04 |
| `ui_ux_v2.md` | V2 Main の UI/UX、画面遷移、文言、図鑑・モーダル仕様を定義します。V2仕様参照用として維持します。 | V2 archive | 2026-06-04 |
| `data_model_v1_v2.md` | V1.5 / V2 / マスターデータの Firestore データモデルを定義します。 | V1.5 / V2 | 2026-06-04 |
| `migration_v1_to_v2.md` | V1.5 から V2 への移行仕様、および `ryoma` / `sara` の移行実施記録を整理します。 | 移行 | 2026-06-04 |
| `release_and_canary.md` | V3.1 Main 昇格後の Main / Canary / archive / V3.1実行資産運用方針を定義します。 | 運用 | 2026-06-08 |
| `current_inventory.md` | リポジトリ構成、主要HTML、Firestore、ドキュメントの位置づけを棚卸しします。 | 全体棚卸し | 2026-06-06 |
| `development_workflow.md` | iPhone / ChatGPT / Codex app / GitHub を使った開発ワークフローを定義します。 | 開発運用 | 2026-06-08 |
| `local_dev_environment.md` | PC + Codex app + GitHub の初期開発環境とローカル表示確認方法を整理します。 | 開発運用 | 2026-06-10 |
| `codex_app_guardrails.md` | Codex app を安全に使うための初期運用ガードレールを定義します。 | Codex app運用 | 2026-06-09 |
| `review_checklist.md` | PR作成前・レビュー時・マージ前後のチェックリストです。 | レビュー | 2026-06-08 |
| `v4_development_plan.md` | V3.1 Main を壊さずに V4 開発領域を新設して進めるための全体計画です。 | V4計画 | 2026-06-10 |
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
| `v3_phase_3_math_levels_design.md` | V3.1 / Phase 3 の算数レベル5・6実装設計です。 | V3.1 / Phase 3設計 | 2026-06-08 |
| `v3_phase_3_completion_report.md` | V3.1 / Phase 3 の完了内容、実施PR、確認観点、残課題を整理します。 | V3.1 / Phase 3完了 | 2026-06-08 |
| `v3_main_promotion_decision.md` | V3.1を root `index.html` に昇格するための判断材料、退避方針、rollback方針を整理します。 | V3.1 main昇格判断 | 2026-06-08 |
| `v3_country_master_design.md` | V3.2 / Phase 4 の国旗クイズに向けた `country_masters` 先行設計です。 | V3.2 / Phase 4先行設計 | 2026-06-08 |
| `v4_development_plan.md` | V3.2 / Phase 4 として整理していた国旗クイズ構想を、V4 開発計画として進めるための全体計画です。 | V4計画 | 2026-06-10 |

## 4. 現在の主要ファイルの位置づけ

| パス | 位置づけ |
| --- | --- |
| `index.html` | V3.1 Main アプリシェルです。通常URLで表示され、`./v3/css/app.css` と `./v3/js/main.js` を参照します。 |
| `v3/` | V3.1 Main の CSS / JavaScript 実行資産です。直接変更すると通常URLに影響します。GitHub Pagesでは `/pokemon-math/v3/` でも比較確認できます。 |
| `archive/index_v2_main_before_v3_1.html` | V3.1 main昇格前の V2 Main 退避版です。 |
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
| 2026-06-08 | V3.1 / Phase 3 で算数レベル5・6を実装し、開発バージョン表示とレベル6の出題範囲を調整しました。 | `v3_phase_3_math_levels_design.md`, `v3_phase_3_completion_report.md` |
| 2026-06-08 | V3.1 main昇格判断として、root昇格方式、V2 Main退避、rollback方針、昇格前後の確認観点を整理しました。 | `v3_main_promotion_decision.md` |
| 2026-06-08 | V3.1を Main に昇格し、通常URLの実行資産を root `index.html` + `v3/` に切り替えました。 | `release_and_canary.md`, `v3_main_promotion_decision.md` |

## 6. 次に読むべきドキュメント

### V3.1 Main の現行仕様を確認する場合

```text
1. docs/release_and_canary.md
2. docs/v3_main_promotion_decision.md
3. docs/v3_phase_3_completion_report.md
4. docs/v3_phase_3_math_levels_design.md
```

### V2 Main 退避版・V2仕様を確認する場合

```text
1. docs/system_definition_v2.md
2. docs/ui_ux_v2.md
3. docs/data_model_v1_v2.md
4. archive/index_v2_main_before_v3_1.html
```

### Firestore データ構造・移行経緯を確認する場合

```text
1. docs/data_model_v1_v2.md
2. docs/migration_v1_to_v2.md
3. docs/v2_canary_handoff.md
```

### V3.1 / Phase 3 の完了内容を確認する場合

```text
1. docs/v3_phase_3_completion_report.md
2. docs/v3_phase_3_math_levels_design.md
3. docs/v3_phase_3_requirements.md
4. docs/review_checklist.md
5. docs/development_workflow.md
```

### V3.2 / Phase 4 の国旗クイズ設計に進む場合

```text
1. docs/v4_development_plan.md
2. docs/v3_country_master_design.md
3. docs/v3_phase_3_completion_report.md
4. docs/data_model_v1_v2.md
5. docs/review_checklist.md
6. docs/development_workflow.md
```

### PR作成・レビュー・マージ判断を確認する場合

```text
1. docs/development_workflow.md
2. docs/codex_app_guardrails.md
3. docs/review_checklist.md
4. docs/release_and_canary.md
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
- root `index.html` は V3.1 Main アプリシェルです。
- root `index.html` は `./v3/css/app.css` と `./v3/js/main.js` を参照します。
- `v3/` は V3.1 Main の実行資産です。直接変更すると通常URLに影響します。
- V4 / Phase 4 開発では、`v4/` を新設して進め、`v3/` を直接変更しません。
- V3.1 / Phase 3 では、算数レベル5・6追加までを対象とします。
- 国旗クイズと `country_masters` は V3.2 / Phase 4 の対象です。
- V3.1 / Phase 3 では Firestore `users_v2` と `masters/gen_{1..9}` を変更しません。
- V3.2 / Phase 4 で `country_masters` を追加する場合も、既存のユーザー・ポケモン系Firestore構造は変更しません。
- `ryoma` / `sara` は実データのため、検証で不用意に変更しません。
- migration.html は通常ユーザー導線に出しません。
```
