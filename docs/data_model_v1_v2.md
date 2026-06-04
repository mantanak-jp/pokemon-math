# V1 / V2 / マスターデータモデル定義

最終更新: 2026-06-04

## 1. 目的

この文書は、ポケモンさんすうアプリにおける Firestore データモデルを定義します。

対象は以下です。

- V1.5 退避版で使用する `users`
- V2 Main で使用する `users_v2`
- V2 のポケモンマスターで使用する `masters/gen_{1..9}`

V2 Main では、この文書を参照し、V1.5 退避版と移行元データを壊さないことを最優先にします。

## 2. 確定済み方針

| 論点 | 方針 |
| --- | --- |
| `users_v2/{userId}` のID形式 | 英数字IDを使用します。 |
| 使用する `userId` | `ryoma`、`sara`、`guest` を使用します。 |
| 表示名 | `displayName` を持ちます。 |
| 進行状態 | `cleared_generations` を正本にします。 |
| 現在世代の取得済みID | `current_gen_owned` には `local_id` を保存します。 |
| クリア済み世代の取得履歴 | 個別履歴は保存しません。クリア済み世代はコンプリート済みとして扱います。 |
| 移行時の保存フィールド | `displayName`、`cleared_generations`、`current_gen_owned` の3フィールドに限定します。 |
| 移行済みフラグ | `migrated_from_v1`、`migratedAt` は移行時には保存しません。 |
| guestユーザー | `users_v2/guest` に保存します。V1.5からの通常移行対象外です。 |
| マスターバージョン | 現時点では `version` などのメタデータは持ちません。 |
| `flavor` | Firestoreに保存済みの値を現状維持で使います。 |
| 保存タイミング | ポケモン取得直後に保存します。 |
| 重複取得 | 未取得ポケモンだけから抽選します。 |

## 3. Firestore 全体構成

```text
Firestore
├─ users
│  ├─ りょうま
│  ├─ さら
│  └─ guest
├─ users_v2
│  ├─ ryoma
│  ├─ sara
│  └─ guest
└─ masters
   ├─ gen_1
   ├─ gen_2
   ├─ gen_3
   ├─ gen_4
   ├─ gen_5
   ├─ gen_6
   ├─ gen_7
   ├─ gen_8
   └─ gen_9
```

注記:

- `users` のドキュメントIDは、V1.5実装に合わせて既存値を維持します。
- `users_v2` のドキュメントIDは英数字IDとし、`ryoma`、`sara`、`guest` を使用します。
- `masters` は第1世代から第9世代までのマスターデータを保持します。
- V2 Main は通常プレイ中に `users` へ書き込みません。
- V2 Main は通常プレイ中に `masters` へ書き込みません。

## 4. V1.5 データモデル: `users/{username}`

### 4.1 位置づけ

`users/{username}` は、V1.5 退避版 `archive/index_v1_5.html` が使用するユーザーデータです。

V2 Main では、移行時の読み取りを除き、このコレクションを変更しません。

### 4.2 ドキュメントパス

```text
users/{username}
```

想定される `username`:

```text
りょうま
さら
guest
```

### 4.3 フィールド

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `owned` | `number[]` | 必須 | 取得済みポケモンの全国図鑑ID。V1.5では初代151匹のIDを保持します。 |
| `updatedAt` | `Timestamp` | 任意 | 最終更新日時。V1.5実装では保存時に更新されます。 |

### 4.4 例

```json
{
  "owned": [1, 4, 7, 25],
  "updatedAt": "Timestamp"
}
```

### 4.5 V2での取り扱い

V2 Main では、`users` に対して以下を禁止します。

- 新規ドキュメント作成
- 既存ドキュメント更新
- `owned` の上書き
- `updatedAt` の更新
- V2進行状態の保存

許可するのは、V1.5 から V2 への移行処理における読み取りのみです。

## 5. V2 データモデル: `users_v2/{userId}`

### 5.1 位置づけ

`users_v2/{userId}` は、V2 Main 専用のユーザーデータです。

V1.5 の `users` と分離し、V2 の進行状態、現在世代の取得状況を管理します。

### 5.2 ドキュメントパス

```text
users_v2/{userId}
```

使用する `userId`:

```text
ryoma
sara
guest
```

V1.5とV2のユーザー対応は以下です。

| V1.5 `users/{username}` | V2 `users_v2/{userId}` | 表示名 | 備考 |
| --- | --- | --- | --- |
| `りょうま` | `ryoma` | `りょうま` | 移行済み。第1世代クリア済みとして扱います。 |
| `さら` | `sara` | `さら` | 移行済み。第1世代途中経過を引き継ぎます。 |
| `guest` | `guest` | `ゲスト` | V1.5からの通常移行対象外です。 |

### 5.3 正本フィールド

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `displayName` | `string` | 必須 | 画面表示名。例: `りょうま`、`さら`、`ゲスト`。 |
| `cleared_generations` | `number` | 必須 | クリア済み世代数。0〜9を想定します。 |
| `current_gen_owned` | `number[]` | 必須 | 現在挑戦中の世代で取得済みの `local_id` 一覧。 |

### 5.4 移行時に保存しないフィールド

V1.5→V2移行時には、以下は保存しません。

| フィールド | 扱い |
| --- | --- |
| `migrated_from_v1` | 保存しません。 |
| `migratedAt` | 保存しません。 |
| `createdAt` | 移行保存では保存しません。 |
| `updatedAt` | 移行保存では保存しません。 |
| `owned_by_generation` | 採用しません。 |
| `migration_logs` | 作成しません。 |

通常プレイ時に `updatedAt` 等を将来追加する可能性はありますが、移行仕様では採用しませんでした。

### 5.5 例

```json
{
  "displayName": "りょうま",
  "cleared_generations": 1,
  "current_gen_owned": []
}
```

### 5.6 `cleared_generations`

`cleared_generations` は、どの世代までクリア済みかを表します。

| 値 | 意味 |
| --- | --- |
| `0` | 第1世代に挑戦中。まだ第1世代をクリアしていない。 |
| `1` | 第1世代をクリア済み。第2世代に挑戦中。 |
| `2` | 第2世代までクリア済み。第3世代に挑戦中。 |
| `9` | 第9世代までクリア済み。全世代コンプリート。 |

現在挑戦中の世代は、原則として以下で算出します。

```text
current_generation = cleared_generations + 1
```

ただし、`cleared_generations = 9` の場合は全世代クリア済みであり、次の世代はありません。

### 5.7 `current_gen_owned`

`current_gen_owned` は、現在挑戦中の世代における取得済みポケモンを表します。

保存する値は `local_id` です。`api_id` ではありません。

例:

```json
{
  "cleared_generations": 1,
  "current_gen_owned": [1, 2, 5]
}
```

この例は、第1世代をクリア済みで、第2世代に挑戦中であり、第2世代の `local_id` 1、2、5 を取得済みであることを表します。

`api_id` ではなく `local_id` を保存する理由は以下です。

- 世代内コンプリート判定が単純になります。
- `masters/gen_{n}.pokemon_list[].local_id` と直接照合できます。
- 第2世代以降も、世代内IDとして1から扱えます。

### 5.8 クリア済み世代の取得履歴

クリア済み世代の個別取得履歴は保存しません。

理由は、クリア済み世代はコンプリート済みとして扱えるためです。

例:

```text
cleared_generations = 1
```

この場合、第1世代は全件取得済みとして表示できます。第2世代は `current_gen_owned` を見て取得済み判定します。

このため、`owned_by_generation` のような履歴フィールドは持ちません。

## 6. マスターデータモデル: `masters/gen_{1..9}`

### 6.1 位置づけ

`masters/gen_{1..9}` は、V2 Mainで使用するポケモンマスターデータです。

マスターデータは、PokeAPIから取得済みであり、Firestoreに投入済みであることを前提にします。

V2 Main では、このコレクションを読み取り専用として扱います。

### 6.2 ドキュメントパス

```text
masters/gen_1
masters/gen_2
masters/gen_3
masters/gen_4
masters/gen_5
masters/gen_6
masters/gen_7
masters/gen_8
masters/gen_9
```

### 6.3 フィールド

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `pokemon_list` | `PokemonMaster[]` | 必須 | 世代ごとのポケモン一覧。 |

### 6.4 `PokemonMaster`

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `local_id` | `number` | 必須 | 世代内ID。各世代で1から始まります。 |
| `api_id` | `number` | 必須 | PokeAPI / 全国図鑑ID。 |
| `name` | `string` | 必須 | ポケモン名。 |
| `image` | `string` | 必須 | 画像URL。 |
| `height` | `number` | 必須 | 高さ。単位はメートル想定。 |
| `weight` | `number` | 必須 | 重さ。単位はキログラム想定。 |
| `types` | `string[]` | 必須 | 日本語化されたタイプ一覧。 |
| `flavor` | `string` | 必須 | 図鑑説明文。Firestore保存済みの値をそのまま使用します。 |

### 6.5 例

```json
{
  "pokemon_list": [
    {
      "local_id": 1,
      "api_id": 1,
      "name": "フシギダネ",
      "image": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
      "height": 0.7,
      "weight": 6.9,
      "types": ["くさ", "どく"],
      "flavor": "生まれたときから 背中に 不思議な タネが 植えてあって..."
    }
  ]
}
```

### 6.6 `flavor` の扱い

`flavor` は、Firestore `masters/gen_{1..9}` に保存済みの値を正本としてそのまま使用します。

現時点では、以下は行いません。

- PokeAPIから `flavor` を再取得する
- 漢字をひらがなへ変換する
- 子ども向けに文章を再編集する
- Firestoreへ再投入する
- マスターデータを再構築する

ただし、画面表示時の軽微な整形は許容します。

例:

- 折り返し
- 表示幅に合わせたレイアウト調整
- 前後の不要な空白の除去

## 7. 世代範囲

V2では、以下の世代範囲を前提とします。

| 世代 | ドキュメント | `api_id` 範囲 | 件数 |
| --- | --- | --- | --- |
| 第1世代 | `masters/gen_1` | 1〜151 | 151 |
| 第2世代 | `masters/gen_2` | 152〜251 | 100 |
| 第3世代 | `masters/gen_3` | 252〜386 | 135 |
| 第4世代 | `masters/gen_4` | 387〜493 | 107 |
| 第5世代 | `masters/gen_5` | 494〜649 | 156 |
| 第6世代 | `masters/gen_6` | 650〜721 | 72 |
| 第7世代 | `masters/gen_7` | 722〜809 | 88 |
| 第8世代 | `masters/gen_8` | 810〜898 | 89 |
| 第9世代 | `masters/gen_9` | 899〜1025 | 127 |

合計: 1025匹

## 8. 保存タイミングと取得抽選

### 8.1 保存タイミング

V2では、ポケモン取得直後に Firestore へ保存します。

理由:

- 子どもが獲得したポケモンが失われる体験を避けるためです。
- 結果画面や画面遷移前の離脱に強くするためです。

保存時は、保存中・保存完了・保存失敗をUI上で分かりやすく表示します。詳細は `docs/ui_ux_v2.md` で定義します。

### 8.2 重複取得

取得ポケモンは、未取得ポケモンだけから抽選します。

具体的には、現在世代の `pokemon_list` から `current_gen_owned` に含まれない `local_id` のみを候補にします。

未取得ポケモンが残っていない場合は、その世代はコンプリート済みとして扱います。

## 9. V1.5からV2への移行時の基本方針

移行の詳細は `docs/migration_v1_to_v2.md` で定義します。

この文書では、データモデル上の前提だけを定義します。

- V1.5 `users/{username}.owned` を読み取ります。
- V1.5 の `owned` は `api_id` として扱います。
- 第1世代では `api_id` と `local_id` が同じ値です。
- V2 `users_v2/{userId}.current_gen_owned` へ `local_id` として保存します。
- 移行時も V1.5 `users` は更新しません。
- 移行時に保存するフィールドは `displayName`、`cleared_generations`、`current_gen_owned` の3つだけです。
- `migrated_from_v1`、`migratedAt`、`migration_logs` は保存しません。
- `guest` は通常移行対象外です。

## 10. 実装時の禁止事項

V2 Mainでは以下を禁止します。

- `users` コレクションへのV2進行状態の保存
- `users/{username}.owned` の上書き
- `masters/gen_{1..9}` への通常プレイ中の書き込み
- マスターデータ取得済み前提を崩すPokeAPI大量フェッチ処理の追加
- `canary/index_dev_masterdata_2.html` を本実装に流用すること
- `owned_by_generation` など、今回採用しない履歴構造を無断で追加すること

## 11. 関連ドキュメント

| 項目 | ドキュメント |
| --- | --- |
| V1.5→V2移行ボタン、再実行、失敗時処理 | `docs/migration_v1_to_v2.md` |
| 子ども向け文言、保存中表示、世代タブ | `docs/ui_ux_v2.md` |
| V2 Main / Canary / archive の配置 | `docs/release_and_canary.md` |
| 現在の棚卸し | `docs/current_inventory.md` |
