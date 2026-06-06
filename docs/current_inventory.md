# 現在のリポジトリ棚卸し

最終更新: 2026-06-06

## 1. 目的

この文書は、ポケモンさんすうアプリの現時点のファイル構成、主要HTMLの位置づけ、V2 Main / V3 / Canary / V1.5 archive、Firestoreデータ構造、関連ドキュメントの関係を整理するための棚卸し文書です。

## 2. 現在のリポジトリ概要

現在の本番アプリは V2 Main です。算数クイズの成果に応じて、第1〜第9世代のポケモンを順次ゲットし、世代クリア・全世代コンプリートを目指します。

V1.5 は初代151匹のみを対象とする旧本番版であり、現在は `archive/index_v1_5.html` に退避済みです。

V3 は、V2 Main の機能・データ仕様を維持したまま、シングルHTMLファイル構成を分割するための検証プロジェクトです。V3本体は今後 `v3/` ディレクトリに新設予定であり、GitHub Pagesでは `/pokemon-math/v3/` で確認する想定です。

## 3. 現在の主要ファイル

| パス | 現在の位置づけ | 今後の扱い |
| --- | --- | --- |
| `index.html` | V2 Main 本番版。 | V3検証中も本番正本として維持します。V3昇格判断時のみ、別PRで慎重に変更します。 |
| `v3/` | V3シングルHTML分割プロジェクト用に新設予定の検証領域。 | 今後のV3 Phase 1A / 1Bで作成します。GitHub Pagesでは `/pokemon-math/v3/` で確認する想定です。 |
| `archive/index_v1_5.html` | V1.5本番版の退避ファイル。 | V1.5参照・復旧・比較用として維持します。 |
| `canary/index.html` | V2 Canary開発・検証履歴、および今後の検証用ファイル。 | 本番正本ではありません。V2 Canary履歴として維持します。V3には流用しません。 |
| `canary/migration.html` | 運用者向けV1.5→V2移行ツール。 | 通常導線に出さず、必要時のみ直接開いて使用します。V3にも移行導線は追加しません。 |
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

## 5. V3検証領域

V3は、V2 Mainを直接変更せずに、シングルHTMLファイル分割を検証するためのプロジェクトです。

現時点では `v3/` は新設予定であり、V3 Phase 1A以降で作成します。

想定構成は以下です。

Phase 1A:

```text
v3/
├─ index.html
├─ css/
│  └─ app.css
└─ js/
   └─ app.js
```

Phase 1B:

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

V3では、CSS / JavaScript を `v3/index.html` からの相対パスで読み込みます。

```html
<link rel="stylesheet" href="./css/app.css">
<script src="./js/app.js" defer></script>
```

## 6. V1.5退避版

`archive/index_v1_5.html` は、V2 Main昇格前の V1.5 本番版を退避したファイルです。

V1.5 の仕様確認には `docs/system_definition_v1.5.md` を参照します。

## 7. Firestoreデータ構造の現状

### V2 Main / V3検証版

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

V3検証版も、V2 Main と同じ Firestore データ仕様を維持します。V3のために `users_v3` は作成しません。

### マスターデータ

```text
masters/gen_{1..9}
```

各ドキュメントは `pokemon_list` 配列を持ちます。

### V1.5

```text
users/{username}
```

V2 Main / V3検証版では、通常プレイ中に `users` へ書き込みません。

## 8. 移行後のユーザー状態

```text
りょうま:
第2世代（ジョウト）
0 / 100 ひき ゲットずみ

さら:
第1世代（カントー）
115 / 151 ひき ゲットずみ

ゲスト:
移行対象外。
V2 / V3検証用データとして使用し、現在も users_v2/guest を使用。
```

## 9. Main昇格の状態

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

## 10. 現在の主要ギャップ・注意点

| 項目 | 現状 | 今後の方針 |
| --- | --- | --- |
| 本番アプリ | `index.html` が V2 Main | V3検証中は変更しない。V3昇格判断時のみ別PRで変更する |
| V3 | `v3/` は新設予定 | Phase 1A / 1Bで検証領域として作成する |
| V1.5 | `archive/index_v1_5.html` に退避済み | アーカイブ・比較用として維持 |
| V2/V3データ | `users_v2/{userId}` | V2 Main / V3検証版の正本として維持 |
| V1データ | `users/{username}.owned` | 移行元・V1.5退避版用。V2/V3から通常書き込みしない |
| マスター | `masters/gen_{1..9}` | 読み取り専用で利用 |
| migration | `canary/migration.html` | 通常導線に出さない。V3にも移行導線を追加しない |
| canary | `canary/index.html` | V2 Canary履歴として維持。V3には流用しない |

## 11. 今後の改善候補

- V3 Phase 1A: `v3/` 新設と CSS / JS の外出し
- V3 Phase 1B: B案の責務分割
- V3検証後の root `index.html` への昇格判断
- Firestoreルールの整理
- ゲストデータの運用方針整理
- マスターデータ `flavor` の子ども向け再整備
- V2 Mainの軽微なUX改善

## 12. 削除対象

現時点で Markdown の削除対象はありません。
