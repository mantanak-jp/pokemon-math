# V1 / V2 / マスターデータモデル定義

最終更新: 2026-06-04

## 1. 目的

この文書は、ポケモンさんすうアプリにおける Firestore データモデルを定義します。

対象は以下です。

- V1.5 退避版で使用する `users`
- V2 Main で使用する `users_v2`
- V2 のポケモンマスターで使用する `masters/gen_{1..9}`

## 2. 確定済み方針

| 論点 | 方針 |
| --- | --- |
| V2ユーザーデータ | `users_v2/{userId}` を正本にします。 |
| `userId` | `ryoma`、`sara`、`guest` を使用します。 |
| 進行状態 | `cleared_generations` を正本にします。 |
| 現在世代の取得済みID | `current_gen_owned` には `local_id` を保存します。 |
| クリア済み世代の取得履歴 | 個別履歴は保存しません。クリア済み世代はコンプリート済みとして扱います。 |
| V1.5データ | `users` は移行元・退避版用です。V2 Mainから通常プレイ中に書き込みません。 |
| guestユーザー | `users_v2/guest` に保存します。V1.5からの移行対象外です。 |

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

## 4. V1.5 データモデル: `users/{username}`

`users/{username}` は、V1.5 退避版 `archive/index_v1_5.html` が使用するユーザーデータです。

```json
{
  "owned": [1, 4, 7, 25],
  "updatedAt": "Timestamp"
}
```

V2 Mainでは、`users` に対して以下を禁止します。

- 新規ドキュメント作成
- 既存ドキュメント更新
- `owned` の上書き
- `updatedAt` の更新
- V2進行状態の保存

## 5. V2 データモデル: `users_v2/{userId}`

`users_v2/{userId}` は、V2 Main 専用のユーザーデータです。

正本フィールド:

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `displayName` | `string` | 必須 | 画面表示名。 |
| `cleared_generations` | `number` | 必須 | クリア済み世代数。0〜9を想定します。 |
| `current_gen_owned` | `number[]` | 必須 | 現在挑戦中の世代で取得済みの `local_id` 一覧。 |

例:

```json
{
  "displayName": "りょうま",
  "cleared_generations": 1,
  "current_gen_owned": []
}
```

`current_gen_owned` には `api_id` ではなく `local_id` を保存します。

## 6. マスターデータモデル: `masters/gen_{1..9}`

`masters/gen_{1..9}` は、V2 Mainで使用するポケモンマスターデータです。

通常プレイ中は読み取り専用として扱います。

`PokemonMaster` の主なフィールド:

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `local_id` | `number` | 世代内ID |
| `api_id` | `number` | PokeAPI / 全国図鑑ID |
| `name` | `string` | ポケモン名 |
| `image` | `string` | 画像URL |
| `height` | `number` | 高さ |
| `weight` | `number` | 重さ |
| `types` | `string[]` | 日本語タイプ一覧 |
| `flavor` | `string` | 図鑑説明文 |

## 7. 世代範囲

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

## 8. V1.5からV2への移行時の基本方針

移行の詳細は `docs/migration_v1_to_v2.md` で定義します。

- V1 `users/{username}.owned` を読み取ります。
- V1 の `owned` は `api_id` として扱います。
- 第1世代では `api_id` と `local_id` が同じ値です。
- V2 `users_v2/{userId}.current_gen_owned` へ `local_id` として保存します。
- 移行時も V1 `users` は更新しません。
- `guest` は移行対象外です。
