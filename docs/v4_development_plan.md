# V4 Development Plan

最終更新: 2026-06-11

## 1. 目的

この文書は、V3.1 Main を壊さずに、V4 開発領域を新設して国旗クイズ等の拡張を進めるための全体計画を整理します。

V4 開発では、既存の算数学習アプリと既存ユーザーデータを保護しながら、新しいクイズ種別を段階的に追加できる構成を目指します。

## 2. 現在の前提

Step 7 時点の前提は以下です。

```text
- root index.html は V3.1 Main アプリシェル
- v3/ は V3.1 Main 実行資産
- v4/ は V4 開発確認用ディレクトリ
- v4/ は V3.1 Main 実行資産をベースに新設済み
- GitHub Pages /v4/ の iPhone実機確認は完了済み
- V4確認済みバージョン表示は `V4開発版 v4.0.0.0.202606111628`
- 国旗クイズ要求仕様は `docs/v4_flag_quiz_requirements.md` で定義する
- country_masters の V4 向け最終設計は `docs/v4_country_master_design.md` で定義する
- country_masters の生成JSON候補は `data/country_masters.generated.json` として作成する
- country_masters の投入前確認ツールは `tools/import_country_masters.html` として作成する
- users_v2 は現行ユーザーデータ正本
- masters/gen_{1..9} はポケモンマスター読み取り用
- GitHub main は唯一の正本
- Codex app の実行環境はローカルPC上の `C:\Users\manta\dev\pokemon-math`
- ユーザーは iPhone の ChatGPT アプリ内 Codex リンクから Codex app に指示する
```

V4 開発は、V3.1 Main の安定状態を維持したまま進めます。

## 3. V4 開発の基本方針

V4 開発の基本方針は以下です。

```text
- 既存 Main を壊さない
- v4/ 新設を基本とする
- index.html / v3/ は原則変更しない
- 小さい PR 単位で進める
- docs ファーストで進める
- branch + Pull Request で進める
- merge は必ずユーザー判断とする
```

仕様が未確定の機能は、先に docs で要求仕様・設計・影響範囲を整理します。

## 4. V4 初期スコープ

V4 初期スコープは以下を想定します。

```text
- v4/ 新設
- V3.1 をベースにコピー ← Step 2 で実施済み
- メニュー分岐追加
  - さんすうクイズ
  - こっきクイズ
- 国旗クイズは 5 問
- 報酬仕様は既存のポケモン報酬と共通にする方針
```

V4 初期実装では、V3.1 Main の実行資産である `v3/` を直接変更せず、V4 側に分離したうえで検証します。

V4 開発確認は `/v4/` ディレクトリを使います。GitHub Pages の `/v4/` を iPhone で確認する作業は、通常は対象 PR が merge された後に行います。

## 5. 国旗クイズの設計前提

国旗クイズのマスターは `country_masters` を想定します。

国コードは ISO 3166-1 alpha-2 を第一候補とします。

想定項目は以下です。

| 項目 | 内容 |
| --- | --- |
| `country_id` | 国の一意識別子。ISO 3166-1 alpha-2 を第一候補とします。 |
| `country_name_ja` | 日本語の国名です。 |
| `country_name_en` | 英語の国名です。 |
| `flag_url` | 国旗画像の参照 URL です。 |
| `region` | 地域分類です。 |
| `capital_ja` | 日本語の首都名です。 |
| `difficulty` | 出題難易度です。 |
| `similar_group_id` | 似た国旗をまとめるためのグループ ID です。 |
| `source` | データ取得元・出典です。 |
| `updated_at` | 最終更新日時です。 |

既存の `users_v2` と `masters/gen_{1..9}` の構造は、国旗クイズ追加のために不用意に変更しません。

V4 向けの確定設計は `docs/v4_country_master_design.md` を正とします。`docs/v3_country_master_design.md` は先行設計の参考資料として維持します。

## 6. V4 開発ステップ

V4 開発は以下のステップで進めます。

```text
Step 0: V4開発前提の整備 ← 完了
Step 1: V4開発計画ドキュメント作成 ← 完了
Step 1.5: Codex連携運用へのdocs更新 ← 完了
Step 2: V4初期ディレクトリ作成 ← 完了
Step 3: V4初期起動確認 ← 完了
Step 4: 国旗クイズ要求仕様の確定 ← 完了
Step 5: country_masters設計のV4向け確定 ← 完了
Step 6: country_masters.generated.json 作成 ← 完了
Step 7: Firestore投入ツール作成 ← 完了
Step 8-A: Firestore投入機能の追加 ← 今回
Step 8-B: Firestore country_masters 投入・確認
Step 9: V4国旗クイズ実装
Step 10: V4実機確認・安定化
Step 11: V4 Phase 4完了報告
Step 12: Main昇格判断
```

## 7. 想定 PR 分割

V4 開発は、以下のような小さい PR に分割して進める想定です。

```text
PR1: docs/local_dev_environment.md + docs/v4_development_plan.md
PR2: v4/ 初期コピー ← Step 2 で実施
PR3: 国旗クイズ要求仕様・詳細設計 ← Step 4 で実施
PR4: country_masters 生成JSON ← Step 6 で実施
PR5: Firestore投入ツール ← Step 7 で実施
PR5.5: Firestore投入機能追加 ← Step 8-A で実施
PR6: 国旗クイズ実装
PR7: 安定化・完了報告
```

各 PR では、変更対象・本番影響・Firestore 影響・確認結果を明記します。

## 8. 変更禁止・注意領域

V4 開発中も、以下は保護領域として扱います。

```text
- index.html
- v3/
- canary/
- archive/
- README.md
- AGENTS.md
- Firebase / Firestore 設定
```

これらを変更する必要が出た場合は、事前に目的・影響範囲・検証方法を整理し、ユーザー承認を得ます。

## 9. 確認観点

V4 関連 PR では、少なくとも以下を確認します。

```text
- index.html 未変更
- v3/ 未変更
- Firestore 既存データ構造への影響なし
- users_v2 の既存仕様を壊していない
- canary/migration.html への通常導線なし
- GitHub Pages 公開影響なし
- V4 確認対象が `/v4/` である
- GitHub Pages `/v4/` の iPhone確認は通常 merge 後である
```

Firestore を扱う PR では、読み取り先・書き込み先・既存データへの影響を PR 本文に明記します。

Step 7 の `tools/import_country_masters.html` は投入前確認専用です。Step 8-A で安全条件付きの投入機能を追加し、Firestore実データへの投入は Step 8-B の明示承認後に行います。

## 10. 未確定事項

Step 2 時点の未確定事項は以下です。

```text
- 国旗マスターの正確な投入方式
- country_masters の Firestore 投入ツール
- country_masters の Firestore 投入確認方法
- 国旗クイズの難易度設計
- 既存報酬との結合 UI
- V4 をいつ Main 昇格候補にするか
```

これらは、V4 の詳細設計 PR 以降で順次確定します。
