# 現在のリポジトリ棚卸し

最終更新: 2026-06-04

## 1. 目的

この文書は、ポケモンさんすうアプリの現時点のファイル構成、主要HTMLの位置づけ、V2 Main / Canary / V1.5 archive、Firestoreデータ構造、関連ドキュメントの関係を整理するための棚卸し文書です。

## 2. 現在のリポジトリ概要

現在の本番アプリは V2 Main です。算数クイズの成果に応じて、第1〜第9世代のポケモンを順次ゲットし、世代クリア・全世代コンプリートを目指します。

V1.5 は初代151匹のみを対象とする旧本番版であり、現在は `archive/index_v1_5.html` に退避済みです。

## 3. 現在の主要ファイル

| パス | 現在の位置づけ | 今後の扱い |
| --- | --- | --- |
| `index.html` | V2 Main 本番版。 | 明示的なIssueと承認に基づいて慎重に変更します。 |
| `archive/index_v1_5.html` | V1.5本番版の退避ファイル。 | V1.5参照・復旧・比較用として維持します。 |
| `canary/index.html` | V2 Canary開発・検証履歴、および今後の検証用ファイル。 | 本番正本ではありません。検証時に使用します。 |
| `canary/migration.html` | 運用者向けV1.5→V2移行ツール。 | 通常導線に出さず、必要時のみ直接開いて使用します。 |
| `canary/index_ui.html` | V2 UI評価用プロトタイプ。 | 参考用です。 |
| `canary/index_dev_masterdata_2.html` | マスターデータ取得・Firestore投入用ダッシュボード。 | 履歴・参考用です。通常プレイには使いません。 |

## 4. 現在の本番: V2 Main `index.html`

`index.html` は現在の V2 Main 本番版です。

主な特徴は以下です。

- ユーザーは `りょうま`、`さら`、`ゲスト` の3名です。
- ユーザーデータは Firestore `users_v2/{userId}` を使用します。
- ポケモンマスターは Firestore `masters/gen_{1..9}` を読み取ります。
- V2 Main は通常プレイ中に Firestore `users` コレクションへ書き込みません。
- 1回のクイズは5問です。
- 4問正解で1匹、5問正解で2匹のポケモンを取得します。
- 取得済みポケモンは `current_gen_owned` に `local_id` として保存します。
- 世代クリア時は `cleared_generations` を transaction 内で進め、`current_gen_owned` を空にします。

## 5. V1.5退避版

`archive/index_v1_5.html` は、V2 Main昇格前の V1.5 本番版を退避したファイルです。

V1.5 の仕様確認には `docs/system_definition_v1.5.md` を参照します。

## 6. Firestoreデータ構造の現状

### V2 Main

```text
users_v2/{userId}
```

主なフィールド:

```json
{
  "displayName": "りょうま",
  "cleared_generations": 1,
  "current_gen_owned": []
}
```

### マスターデータ

```text
masters/gen_{1..9}
```

各ドキュメントは `pokemon_list` 配列を持ちます。

### V1.5

```text
users/{username}
```

V2 Mainでは、通常プレイ中に `users` へ書き込みません。

## 7. 移行後のユーザー状態

```text
りょうま:
第2世代（ジョウト）
0 / 100 ひき ゲットずみ

さら:
第1世代（カントー）
115 / 151 ひき ゲットずみ

ゲスト:
移行対象外。
V2検証用データとして使用し、現在も users_v2/guest を使用。
```

## 8. Main昇格の状態

V2 Main昇格は PR #19 で完了済みです。

```text
PR #19:
Promote V2 app to main

変更:
index.html

結果:
merged
```

PR #18 は古い Step 6-7 実装PRであり、未マージのままクローズ済みです。

## 9. 現在の主要ギャップ・注意点

| 項目 | 現状 | 今後の方針 |
| --- | --- | --- |
| 本番アプリ | `index.html` が V2 Main | 本番影響を確認して変更する |
| V1.5 | `archive/index_v1_5.html` に退避済み | アーカイブ・比較用として維持 |
| V2データ | `users_v2/{userId}` | V2 Mainの正本として維持 |
| V1データ | `users/{username}.owned` | 移行元・V1.5退避版用。V2から通常書き込みしない |
| マスター | `masters/gen_{1..9}` | 読み取り専用で利用 |
| migration | `canary/migration.html` | 通常導線に出さない |
| canary | `canary/index.html` | 今後の検証・履歴として維持 |

## 10. 今後の改善候補

- `index.html` のコード分割
- CSS / JS の分離
- Firestoreルールの整理
- ゲストデータの運用方針整理
- マスターデータ `flavor` の子ども向け再整備
- V2 Mainの軽微なUX改善
- PRレビュー用チェックリスト `docs/review_checklist.md` の追加

## 11. 削除対象

現時点で Markdown の削除対象はありません。
