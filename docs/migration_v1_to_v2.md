# V1.5 から V2 へのデータ移行仕様

最終更新: 2026-06-04

## 1. 目的

この文書は、ポケモンさんすうアプリの V1.5 データを、V2 用データへ移行する仕様と実施結果を定義します。

```text
V1.5: users/{username}
V2:   users_v2/{userId}
```

この移行は、通常ユーザーや子どもが実行するものではありません。

## 2. 現在の状態

V2 Main昇格は完了済みです。

```text
root index.html:
V2 Main 本番版

archive/index_v1_5.html:
V1.5 退避版

canary/migration.html:
V1.5→V2 移行ツールとして残置
```

移行対象の `ryoma` / `sara` は移行済みです。

## 3. 基本方針

- 移行UIは `canary/migration.html` として V2本体から分離する。
- 通常ユーザー・子どもには移行操作をさせない。
- V1.5 の `users` コレクションは読み取り専用として扱う。
- V2 の `users_v2` コレクションへ移行後データを書き込む。
- `masters/gen_{1..9}` には書き込まない。
- `migration_logs` は作成しない。
- `owned_by_generation` のような新しい履歴構造は追加しない。

## 4. 移行対象

| V1.5 | V2 | displayName | 移行方針 |
| --- | --- | --- | --- |
| `users/りょうま` | `users_v2/ryoma` | `りょうま` | 第1世代クリア済みとして移行 |
| `users/さら` | `users_v2/sara` | `さら` | 第1世代途中経過を引き継ぎ |

`guest` は移行対象外です。

## 5. 保存データ

`users_v2/{userId}` に保存するフィールドは、以下の3つだけです。

```json
{
  "displayName": "りょうま",
  "cleared_generations": 1,
  "current_gen_owned": []
}
```

保存しないフィールド:

- `createdAt`
- `updatedAt`
- `migratedAt`
- `migrated_from_v1`
- `migration_logs`
- `owned_by_generation`

## 6. ryoma の変換ルール

`ryoma` は、第1世代クリア済みとして扱います。

```json
{
  "displayName": "りょうま",
  "cleared_generations": 1,
  "current_gen_owned": []
}
```

## 7. sara の変換ルール

`sara` は、第1世代の途中経過を引き継ぎます。

```json
{
  "displayName": "さら",
  "cleared_generations": 0,
  "current_gen_owned": [1, 2, 3]
}
```

実際には、V1.5から抽出・正規化した第1世代 `local_id` 配列を保存します。

## 8. 移行後の確認結果

移行後、V2本体の図鑑表示で以下を確認済みです。

```text
りょうま:
第2世代（ジョウト）
0 / 100 ひき ゲットずみ

さら:
第1世代（カントー）
115 / 151 ひき ゲットずみ

ゲスト:
第3世代（ホウエン）
既存 users_v2/guest のダミーデータを維持
```

## 9. Main昇格後の扱い

Main昇格後も、`canary/migration.html` は通常導線に混ぜません。

V2 Mainは `users_v2` を正本として読みます。

```text
V2 Main:
users_v2 を読む

V1.5:
users は移行元・退避版用として参照
```

## 10. 禁止事項

- `index.html` に移行UIを混ぜない。
- 通常ユーザー導線に `migration.html` へのリンクを置かない。
- `guest` を通常移行対象にしない。
- `users` コレクションへ書き込まない。
- `masters` コレクションへ書き込まない。
- `migration_logs` を作らない。
- `owned_by_generation` を追加しない。
