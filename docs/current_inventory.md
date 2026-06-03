# 現在のリポジトリ棚卸し

最終更新: 2026-06-02

## 1. 目的

この文書は、ポケモンさんすうアプリの現時点のファイル構成、既存HTMLの位置づけ、V1.5本番版とV2開発方針、Firestoreデータ構造の関係を整理するための棚卸し文書です。

今後の実装では、この文書を参照し、どのファイルが本番版で、どのファイルが参考用・検討用かを明確にしたうえで変更します。

## 2. リポジトリ概要

このリポジトリは、子ども向けのポケモン算数学習アプリです。

現行のV1.5では、算数クイズの成果に応じて初代151匹のポケモンを収集し、図鑑に登録します。V2では、1〜9世代を順次進行する世代進行型の学習アプリへ刷新する方針です。

## 3. 現在の主要ファイル

| パス | 現在の位置づけ | 今後の扱い |
| --- | --- | --- |
| `README.md` | リポジトリの最小説明。現状は簡素です。 | 後続で整備対象です。 |
| `AGENTS.md` | 開発エージェント向けルール。 | 本文書と整合させて維持します。 |
| `index.html` | V1.5本番版。 | 明示的なIssueと承認がない限り変更しません。 |
| `docs/system_definition_v1.5.md` | V1.5仕様定義書。 | V1.5仕様の参照元です。 |
| `docs/system_definition_v2.md` | V2構想・要求仕様・データ構造・ロードマップ。 | V2の参照元です。ただし最新方針と差分がある場合は更新します。 |
| `docs/README.md` | docs配下の目次・運用説明。 | ドキュメント追加時に更新します。 |
| `docs/current_inventory.md` | 本文書。現状棚卸し。 | 現状認識が変わった場合に更新します。 |
| `canary/index_ui.html` | V2 UI評価用プロトタイプ。 | 参考用です。V2本実装の正本にはしません。 |
| `canary/index_dev_masterdata_2.html` | マスターデータ取得・Firestore投入用の開発ダッシュボード。 | マスターデータ投入済み前提のため、参考用・履歴扱いです。 |

## 4. V1.5本番版 `index.html` の概要

`index.html` は現行のV1.5本番版です。

主な特徴は以下です。

- 単一HTMLのSPAです。
- 画面は、タイトル、プレイヤー選択、メニュー、クイズ、結果、図鑑、詳細モーダルで構成されています。
- ユーザーは `りょうま`、`さら`、`ゲスト` の3名です。
- 起動時にPokeAPIから初代151匹のデータを直接取得します。
- Firestore `users/{username}` に `owned` 配列として取得済みポケモンIDを保存します。
- クイズは1セッション5問です。
- 4問正解で1匹、5問正解で2匹のポケモンを取得します。
- 図鑑は初代151匹固定です。
- `goToNextGen` は存在しますが、現状は次世代処理の実体を持たない拡張用フックです。

## 5. V1.5仕様書との関係

`docs/system_definition_v1.5.md` は、現行 `index.html` の仕様と概ね整合しています。

特に以下の内容が仕様書と現行実装で一致しています。

- 子ども向け算数学習アプリであること
- 初代151匹を対象とすること
- 画面構成が6画面であること
- 1セッション5問の4択クイズであること
- 4問以上正解でポケモン取得が発生すること
- Firestore `users/{username}` に `owned` を保存すること
- PokeAPIから初代151匹のデータを取得すること
- 図鑑の未取得ポケモンを `?` / `???` で隠すこと

## 6. V2仕様書の概要

`docs/system_definition_v2.md` では、V2を「1〜9世代を順次ゲットし、全世代コンプリートを目指す世代進行型学習アプリ」と定義しています。

主な方針は以下です。

- V1.5本番版とV2を分離します。
- V2ユーザーデータは Firestore `users_v2/{userId}` に保存します。
- V1の `users` コレクションは、移行時の読み取り以外では触りません。
- マスターデータは Firestore `masters/gen_{1..9}` に保持します。
- マスターデータの各ドキュメントは `pokemon_list` 配列を持ちます。
- `pokemon_list` の各要素は `local_id`、`api_id`、`name`、`image`、`height`、`weight`、`types`、`flavor` を持ちます。
- V2ユーザーデータは `cleared_generations` と `current_gen_owned` を中心に管理します。
- V1からV2への移行は自動同期ではなく、明示的な移行操作として設計します。

## 7. canary配下HTMLの扱い

現在存在する参考HTML:
canary/index_ui.html
canary/index_dev_masterdata_2.html

過去に存在したが削除済み:
旧 canary/index.html

旧 canary/index.html は今後の参照対象にしない

新しい V2 Canary正本として、canary/index.html を新規作成する

### 7.1 `canary/index.html`

過去に存在しましたが、現在は削除されています。旧ファイルは参考にする必要はありません。

今後新しい V2 Canary正本として /canary/index.html を新規作成します。

### 7.2 `canary/index_ui.html`

V2 UI評価用プロトタイプです。

- タイトル、メニュー、クイズ、結果、図鑑のラフな導線があります。
- 世代タブと地方名の表示イメージを確認できます。
- 実データ連携やFirestore連携はありません。

### 7.3 `canary/index_dev_masterdata_2.html`

マスターデータ取得・Firestore投入用の開発ダッシュボードです。

- PokeAPIから1〜9世代、計1025匹分のデータを取得するための管理用HTMLです。
- Firestore `masters/gen_{id}` に `pokemon_list` として保存する処理を持ちます。
- マスターデータはすでに取得済み・Firestore投入済みであるため、今後は参考用・履歴扱いとします。
- V2本実装では、このファイルを正本化しません。

## 8. V2本実装の方針

V2本実装では、既存の `canary/*.html` をそのまま正本化しません。

方針は以下です。

- V2本実装・開発用HTMLは新規ファイルとして作成します。
- 新規ファイル名は、docs/release_and_canary.md にて定義しています。
- 既存 `canary/index_ui.html`、`canary/index_dev_masterdata_2.html` は参照・移植元としてのみ扱います。
- ルート `index.html` はV1.5本番版として保護します。
- V2から Firestore `users` へ書き込みません。
- V2では Firestore `users_v2` と `masters/gen_{1..9}` を使用します。
- `masters/gen_{1..9}` は読み取り専用として扱います。
- V2本実装では、PokeAPIへの直接呼び出しを原則追加しません。

## 9. Firestoreデータ構造の現状

### 9.1 V1.5

V1.5では以下を使用します。

```text
users/{username}
```

主なフィールドは以下です。

```json
{
  "owned": [1, 4, 7, 25],
  "updatedAt": "Timestamp"
}
```

V2開発中は、この `users` コレクションへの書き込みを追加・変更しません。

### 9.2 V2

V2では以下を使用します。

```text
users_v2/{userId}
```

想定フィールドは以下です。

```json
{
  "cleared_generations": 0,
  "current_gen_owned": [1, 4, 7, 25]
}
```

### 9.3 マスターデータ

マスターデータは以下を使用します。

```text
masters/gen_{1..9}
```

各ドキュメントは以下のような構造を持ちます。

```json
{
  "pokemon_list": [
    {
      "local_id": 1,
      "api_id": 1,
      "name": "フシギダネ",
      "image": "https://...",
      "height": 0.7,
      "weight": 6.9,
      "types": ["くさ", "どく"],
      "flavor": "..."
    }
  ]
}
```

マスターデータは取得済み・Firestore投入済み前提です。V2本実装では読み取り専用として利用します。

## 10. 現在の主要ギャップ

| 項目 | 現状 | 今後の方針 |
| --- | --- | --- |
| V1本番 | `index.html` が本番版 | 保護する |
| V2実装 | `canary/` に複数の試作HTMLがある | 既存HTMLは参考扱い。新規HTMLで開始する |
| V1データ | `users/{username}.owned` | 移行時の読み取り以外では触らない |
| V2データ | `users_v2/{userId}` の設計あり | 未実装。別途データモデル文書で詳細化する |
| マスター | `masters/gen_{1..9}` 設計済み・投入済み | 読み取り専用で利用する |
| PokeAPI | V1は起動時に直接取得 | V2では原則直接呼び出さない |
| 仕様書 | V1.5/V2仕様書が存在 | 最新方針に合わせて補助docsを追加する |
| 開発ルール | `AGENTS.md` が存在 | 本文書と整合させて維持する |

## 11. 未確定論点

以下は、実装前にIssueまたは仕様書で明確にする必要があります。

- V2本実装用HTMLのファイル名
- V2の初期リリース範囲
- V1からV2への移行操作のUI
- 移行処理の再実行時の挙動
- `users_v2` の正確なフィールド定義
- `current_gen_owned` に保存するIDを `api_id` とするか `local_id` とするか
- 世代クリア時の演出とボタン文言
- 未到達世代タブの扱い
- マスターデータの `flavor` をひらがな優先に再構築するかどうか

## 12. 次に作成すべきドキュメント候補

優先度の高い順に以下を作成します。

1. `docs/data_model_v1_v2.md`
2. `docs/migration_v1_to_v2.md`
3. `docs/ui_ux_v2.md`
4. `docs/release_and_canary.md`
5. `docs/review_checklist.md`

## 13. 次に作成すべきIssue候補

- V2本実装用HTMLファイル名と配置方針を決める
- V1/V2/マスターのデータモデルを確定する
- V1からV2への移行仕様を定義する
- V2 UI/UX要件を定義する
- V2本実装の最小スコープを決める
- `AGENTS.md` と各仕様書の整合性を継続的に確認する
