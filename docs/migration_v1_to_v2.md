# V1 から V2 へのデータ移行仕様

最終更新: 2026-06-02

## 1. 目的

この文書は、ポケモンさんすうアプリの V1.5 本番データを、V2 用データへ移行する仕様を定義します。

対象データは以下です。

```text
V1.5: users/{username}
V2:   users_v2/{userId}
```

この移行は、通常ユーザーや子どもが実行するものではありません。

V2 を Main にデプロイする前に、Canary リリース段階で運用者が一括実行する事前移行処理として扱います。

## 2. 基本方針

- 移行は Canary 環境でのみ実行します。
- Main 本番環境では移行UIを表示しません。
- 通常ユーザーには移行操作をさせません。
- Canary のゲスト画面に、運用者向けの一括移行ボタンを置きます。
- 対象ユーザーは `りょうま`、`さら`、`guest` の3名です。
- 移行後に結果を確認し、問題がなければ Main に V2 をデプロイします。
- V1 の `users` コレクションは読み取り専用として扱い、更新しません。
- V2 の `users_v2` が既に存在する場合は上書きしません。
- 移行処理は一括実行しますが、内部的にはユーザーごとに独立して処理します。

## 3. 前提ドキュメント

この文書は、以下のドキュメントを前提とします。

- `docs/current_inventory.md`
- `docs/data_model_v1_v2.md`
- `docs/system_definition_v1.5.md`
- `docs/system_definition_v2.md`

特に、データモデルの正本は `docs/data_model_v1_v2.md` です。

## 4. 移行対象

移行対象は以下の3ユーザーです。

| V1 | V2 | displayName |
| --- | --- | --- |
| `users/りょうま` | `users_v2/ryoma` | `りょうま` |
| `users/さら` | `users_v2/sara` | `さら` |
| `users/guest` | `users_v2/guest` | `ゲスト` |

この対応は、V2 の `users_v2/{userId}` に英数字IDを使用する方針に従います。

## 5. 移行トリガー

移行は、Canary のゲスト画面にだけ表示される一括移行ボタンから実行します。

### 5.1 表示する場所

```text
Canary 環境
└─ ゲスト画面
   └─ 運用者向け一括移行ボタン
```

### 5.2 表示しない場所

- Main 環境
- 通常ユーザー画面
- `りょうま` / `さら` の通常プレイ導線
- V2 Main リリース後の通常導線

## 6. 一括移行の考え方

移行ボタンは一括実行です。

対象は以下の3ユーザーです。

```text
りょうま
さら
guest
```

ただし、内部処理はユーザーごとに独立させます。

例:

```text
りょうま: migrated
さら: failed
guest: skipped
```

このように、1人の失敗が他ユーザーの結果確認を妨げないようにします。

## 7. 移行処理フロー

移行処理は以下の流れで実行します。

```text
1. Canary のゲスト画面で運用者が一括移行ボタンを押す
2. 実行前に確認ダイアログを表示する
3. 対象3ユーザーの移行処理を順番に実行する
4. 各ユーザーについて V1 users/{username} を読み取る
5. 対応する users_v2/{userId} が既に存在するか確認する
6. 既存 users_v2 がある場合は上書きせず skipped とする
7. V1 owned を読み取る
8. 重複IDを除外する
9. 1〜151以外のIDは無視し warning に記録する
10. 有効ID数に応じて cleared_generations を決める
11. transaction で users_v2/{userId} を作成する
12. 3ユーザー分の結果を画面に表示する
13. 結果確認後、問題がなければ Main に V2 をデプロイする
```

## 8. V1 `owned` の変換ルール

V1 の `owned` は、第1世代の `api_id` として扱います。

第1世代では `api_id` と `local_id` が一致するため、有効な `owned` 値はそのまま V2 の `current_gen_owned` に保存できます。

### 8.1 基本変換

```text
V1 users/{username}.owned
↓
V2 users_v2/{userId}.current_gen_owned
```

### 8.2 変換ルール

| 条件 | 処理 |
| --- | --- |
| `owned` に重複がある | 重複を除外します。 |
| `owned` に1〜151以外がある | 無視し、warning に記録します。 |
| 有効IDが151未満 | 第1世代途中として移行します。 |
| 有効IDが151 | 第1世代クリア済み、第2世代開始状態として移行します。 |
| V1データがない | 空のV2初期データを作成します。 |
| `owned` が存在しない | 空配列として扱い、空のV2初期データを作成します。 |

## 9. 移行後データ

### 9.1 151匹未満の場合

V1 の有効IDが151匹未満の場合、第1世代の途中状態として移行します。

```json
{
  "displayName": "さら",
  "cleared_generations": 0,
  "current_gen_owned": [1, 4, 7, 25],
  "migrated_from_v1": true,
  "migratedAt": "Timestamp",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

意味:

```text
第1世代に挑戦中。
V1で取得済みだった第1世代ポケモンを引き継いでいる。
```

### 9.2 151匹コンプリート済みの場合

V1 の有効IDが151匹の場合、第1世代クリア済みとして扱い、第2世代開始状態を作ります。

```json
{
  "displayName": "りょうま",
  "cleared_generations": 1,
  "current_gen_owned": [],
  "migrated_from_v1": true,
  "migratedAt": "Timestamp",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

意味:

```text
第1世代はクリア済み。
第2世代に挑戦開始。
第2世代の取得済みポケモンはまだ0匹。
```

`cleared_generations: 1` と `current_gen_owned: []` により、第2世代用の初期ユーザーデータを表現します。

### 9.3 V1データが存在しない場合

V1 `users/{username}` が存在しない場合、V2初期データを作成します。

```json
{
  "displayName": "ゲスト",
  "cleared_generations": 0,
  "current_gen_owned": [],
  "migrated_from_v1": false,
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

この場合は `migrated_from_v1: false` とします。

## 10. 既存 `users_v2` がある場合

既存の `users_v2/{userId}` がある場合は、上書き禁止です。

以下は行いません。

- 上書き
- 削除
- マージ
- 差分更新

この場合は、該当ユーザーの結果を `skipped` として表示します。

例:

```text
guest:
- result: skipped
- reason: users_v2/guest already exists
```

## 11. Firestore transaction 方針

各ユーザーごとに Firestore transaction を使用します。

目的は、`users_v2/{userId}` が存在しない場合だけ作成し、既存データの上書きを確実に防ぐことです。

処理方針:

```text
ユーザー単位で transaction 実行
↓
users_v2/{userId} の存在確認
↓
存在すれば skipped
↓
存在しなければ create
```

一括移行ではありますが、transaction はユーザーごとに独立して実行します。

## 12. 移行結果表示

移行結果は運用者向けに詳細表示します。

表示する項目は以下です。

| 項目 | 説明 |
| --- | --- |
| `userId` | V2ユーザーID。 |
| `displayName` | 表示名。 |
| `result` | `migrated` / `skipped` / `failed`。 |
| `validOwnedCount` | 有効な移行対象ID数。 |
| `duplicateRemovedCount` | 重複除外した件数。 |
| `ignoredInvalidIds` | 1〜151以外として無視したID。 |
| `cleared_generations` | 移行後のクリア済み世代数。 |
| `current_gen_owned_count` | 移行後の現在世代取得済み件数。 |
| `nextGeneration` | 次に挑戦する世代。 |
| `reason` | `skipped` の理由。 |
| `error` | `failed` のエラー内容。 |

表示例:

```text
りょうま:
- result: migrated
- validOwnedCount: 151
- duplicateRemovedCount: 0
- ignoredInvalidIds: []
- cleared_generations: 1
- nextGeneration: 2

さら:
- result: migrated
- validOwnedCount: 87
- duplicateRemovedCount: 2
- ignoredInvalidIds: []
- cleared_generations: 0
- nextGeneration: 1

guest:
- result: skipped
- reason: users_v2/guest already exists
```

## 13. エラー・warning の扱い

### 13.1 warning

以下は warning として扱います。

- V1 `owned` に重複がある
- V1 `owned` に1〜151以外の値がある
- V1 `owned` が配列ではないが、補正可能である

warning があっても、有効IDで移行可能な場合は移行します。

### 13.2 failed

以下は failed として扱います。

- V1 `users/{username}` の読み取り失敗
- `users_v2/{userId}` の transaction 失敗
- Firestore権限エラー
- 想定外の例外

failed の場合、該当ユーザーの `users_v2` は作成しません。

## 14. Main デプロイ前の確認項目

移行後、Main に V2 をデプロイする前に以下を確認します。

- 3ユーザーの移行結果が `migrated` または意図した `skipped` になっていること
- `users_v2/ryoma`、`users_v2/sara`、`users_v2/guest` が存在すること
- V1 `users` が変更されていないこと
- 151匹コンプリート済みユーザーは `cleared_generations: 1` になっていること
- 151匹未満ユーザーは `cleared_generations: 0` になっていること
- `current_gen_owned` が `local_id` として保存されていること
- Main に移行ボタンが表示されないこと

## 15. この文書では扱わないこと

以下は後続ドキュメントまたは別Issueで扱います。

| 項目 | 後続 |
| --- | --- |
| 移行ボタンの具体的なUI文言 | `docs/ui_ux_v2.md` |
| Canary / Main のデプロイ手順 | `docs/release_and_canary.md` |
| 実際のV2本実装HTMLファイル名 | `docs/release_and_canary.md` または Issue |
| 管理用リセット・再移行 | 別Issue |
| 移行処理の実装 | 後続PR |

## 16. 実装時の禁止事項

V1→V2移行実装では、以下を禁止します。

- Main に移行ボタンを出すこと
- 通常ユーザーに移行UIを見せること
- V1 `users` を更新すること
- 既存 `users_v2` を上書きすること
- 失敗を隠して成功扱いにすること
- Canary 既存HTMLを正本化すること
- V2本実装前に移行処理を通常導線へ組み込むこと

## 17. 次のステップ

次に作成すべき文書は以下です。

1. `docs/ui_ux_v2.md`
2. `docs/release_and_canary.md`
3. `docs/review_checklist.md`

その後、V2本実装用HTMLファイル名と配置方針を確定し、移行処理とV2最小実装に進みます。
