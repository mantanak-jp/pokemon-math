# V1.5 から V2 へのデータ移行仕様

最終更新: 2026-06-04

## 1. 目的

この文書は、ポケモンさんすうアプリの V1.5 データを、V2 用データへ移行する仕様と実施結果を定義します。

対象データは以下です。

```text
V1.5: users/{username}
V2:   users_v2/{userId}
```

この移行は、通常ユーザーや子どもが実行するものではありません。

V2 Main 昇格は完了済みですが、移行仕様と実施済み記録を残すことで、なぜ `users_v2` が現在の状態になっているかを後から追えるようにします。

---

## 2. 現在の状態

```text
root index.html:
V2 Main 本番版

archive/index_v1_5.html:
V1.5 退避版

canary/migration.html:
V1.5→V2 移行ツールとして残置
```

移行対象の `ryoma` / `sara` は移行済みです。

`guest` はV1.5からの通常移行対象外です。ただし、V2 Canary検証時には `users_v2/guest` を検証用データとして使いました。

---

## 3. 基本方針

```text
- 移行UIは canary/migration.html として V2本体から分離する。
- canary/index.html の通常プレイ導線には移行UIを混ぜない。
- root index.html に移行UIを混ぜない。
- 通常ユーザー・子どもには移行操作をさせない。
- V1.5 の users コレクションは読み取り専用として扱う。
- V2 の users_v2 コレクションへ移行後データを書き込む。
- masters/gen_{1..9} には書き込まない。
- migration_logs は作成しない。
- owned_by_generation のような新しい履歴構造は追加しない。
```

---

## 4. 移行UI

移行UIは以下のファイルです。

```text
canary/migration.html
```

通常プレイ用の V2 Canary 本体は以下です。

```text
canary/index.html
```

移行UIは V2 本体と分離します。

```text
通常プレイ:
canary/index.html

移行ツール:
canary/migration.html
```

`canary/index.html` から `canary/migration.html` へのボタンやリンクは置きません。

V2 Main 昇格後も、`canary/migration.html` は残置します。ただし通常導線には混ぜません。

---

## 5. 移行対象

移行対象は以下の2ユーザーです。

| V1.5 | V2 | displayName | 移行方針 |
| --- | --- | --- | --- |
| `users/りょうま` | `users_v2/ryoma` | `りょうま` | 第1世代クリア済みとして移行 |
| `users/さら` | `users_v2/sara` | `さら` | 第1世代途中経過を引き継ぎ |

`guest` は移行対象外です。

理由:

```text
guest は V2 Canary 検証用のダミーデータとして users_v2/guest を維持するため。
```

したがって、通常の移行ツールから `users_v2/guest` へは書き込みません。

ただし、Canary検証時に限り、世代クリア直前状態を作るために `users_v2/guest` を検証用データへ上書きする補助操作を行いました。これは移行仕様ではなく、Canary検証用の一時操作です。

---

## 6. 移行元・移行先

### 6.1 ryoma

```text
移行元:
users/りょうま

フォールバック確認:
users/ryoma

移行先:
users_v2/ryoma
```

### 6.2 sara

```text
移行元:
users/さら

フォールバック確認:
users/sara

移行先:
users_v2/sara
```

V1.5 本体では、日本語のユーザー名を使って `users/{username}` を読んでいたため、移行ツールでは日本語docIdを優先して読み取ります。

読み取り候補順は以下です。

```text
ryoma:
1. users/りょうま
2. users/ryoma

sara:
1. users/さら
2. users/sara
```

---

## 7. 移行トリガー

移行は `canary/migration.html` で運用者が手動実行します。

操作フロー:

```text
1. canary/migration.html を開く
2. 「りょうまを確認」または「さらを確認」を押す
3. users/{username} を読み取る
4. users_v2/{userId} の既存データを読み取る
5. V1.5データから取得済みIDを抽出する
6. V2データへ変換する
7. 画面で以下を確認する
   - V1.5元データ
   - 抽出した取得済みID
   - 変換後V2データ
   - 既存 users_v2 データ
8. 問題なければ「この内容で移行する」または「上書きして移行する」を押す
9. users_v2/{userId} に保存する
10. 保存後、users_v2/{userId} を再読み取りして表示する
```

---

## 8. V1.5 データ構造

V1.5 の取得済みポケモンは、基本的に `users/{username}.owned` として保存されます。

```text
users/{username}.owned
```

V1.5 は第1世代151匹のみを対象とする仕様です。

そのため、V1.5 の `owned` は第1世代の `api_id` として扱います。

第1世代では `api_id` と `local_id` が一致するため、有効な `owned` 値はそのまま V2 の `current_gen_owned` に保存できます。

```text
V1.5 users/{username}.owned
↓
V2 users_v2/{userId}.current_gen_owned
```

---

## 9. 取得済みIDの正規化

V1.5 の取得済みIDは、以下のルールで正規化します。

```text
- 数値だけを採用する。
- 文字列数値は Number に変換する。
- 1〜151 の範囲だけを採用する。
- 重複を除去する。
- 昇順に並べる。
```

第2世代以降のデータ移行は発生しません。

理由:

```text
V1.5 は第1世代151匹のみの仕様であるため。
```

---

## 10. V2保存データ

`users_v2/{userId}` に保存するフィールドは、以下の3つだけです。

```json
{
  "displayName": "りょうま",
  "cleared_generations": 1,
  "current_gen_owned": []
}
```

保存しないフィールド:

```text
- createdAt
- updatedAt
- migratedAt
- migrated_from_v1
- migration_logs
- owned_by_generation
- その他の履歴構造
```

理由:

```text
- V2本体が必要とする最小データだけで成立する。
- 移行対象が ryoma / sara の2ユーザーに限定される。
- guest は移行対象外。
- V1.5は第1世代のみで、複雑な履歴移行が不要。
- migration_logs を残さない方針のため、migratedAt だけ残す意味も弱い。
```

---

## 11. ryoma の変換ルール

`ryoma` は、第1世代クリア済みとして扱います。

移行後データ:

```json
{
  "displayName": "りょうま",
  "cleared_generations": 1,
  "current_gen_owned": []
}
```

意味:

```text
第1世代はクリア済み。
第2世代（ジョウト）に挑戦開始。
第2世代の取得済みポケモンは0匹。
```

`ryoma` については、V1.5データ上の取得済み数が151匹未満でも、今回の仕様では第1世代クリア済みとして移行します。

その場合は、移行ツール上で警告表示します。

警告例:

```text
注意: V1.5データ上の取得済み数は151匹未満ですが、今回の仕様では ryoma は第1世代クリア済みとして移行します。
```

---

## 12. sara の変換ルール

`sara` は、第1世代の途中経過を引き継ぎます。

移行後データ:

```json
{
  "displayName": "さら",
  "cleared_generations": 0,
  "current_gen_owned": [1, 2, 3]
}
```

意味:

```text
第1世代（カントー）に挑戦中。
V1.5で取得済みだった第1世代ポケモンを current_gen_owned として引き継ぐ。
```

`current_gen_owned` には、V1.5から抽出・正規化した第1世代 `local_id` 配列を保存します。

取得済みIDが0件でも、移行自体は可能です。

---

## 13. V1.5元データが存在しない場合

V1.5元データが存在しない場合、移行ツールではプレビューを表示しますが、保存ボタンは無効化します。

理由:

```text
特に sara は途中経過を引き継ぐ前提のため、
V1.5元データなしで保存すると、進捗を空にしてしまうリスクがある。
```

表示例:

```text
移行元データが存在しないため、保存できません。
Firestore の users/りょうま または users/さら を確認してください。
```

---

## 14. 既存 users_v2 がある場合

`users_v2/{userId}` が既に存在する場合、移行ツールでは既存データを表示します。

無条件上書きはしません。

ただし、運用者が既存データを確認したうえで、明示的に以下のボタンを押した場合のみ上書き可能です。

```text
上書きして移行する
```

表示例:

```text
既存の users_v2 データがあります。
内容を確認し、問題なければ「上書きして移行する」を押してください。
```

上書き時も、保存するフィールドは以下の3つだけです。

```json
{
  "displayName": "さら",
  "cleared_generations": 0,
  "current_gen_owned": [1, 2, 3]
}
```

---

## 15. 保存処理

保存処理は `set()` を使います。

保存内容:

```js
{
  displayName: converted.displayName,
  cleared_generations: converted.cleared_generations,
  current_gen_owned: converted.current_gen_owned
}
```

`merge: true` は使いません。

理由:

```text
移行データを明確に3フィールドへ揃えるため。
```

---

## 16. 書き込み制限

移行ツールでは、保存対象を `ryoma` / `sara` のみに制限します。

保存前チェック:

```js
if (selectedUserId !== "ryoma" && selectedUserId !== "sara") {
  throw new Error("移行対象外のユーザーです。");
}
```

書き込み先:

```text
users_v2/ryoma
users_v2/sara
```

通常の移行ツールでは、以下へは書き込みません。

```text
users_v2/guest
users/{username}
masters/gen_{1..9}
migration_logs
```

---

## 17. 移行後の確認結果

移行後、V2本体の図鑑表示で以下を確認済みです。

```text
りょうま:
第2世代（ジョウト）
0 / 100 ひき ゲットずみ

さら:
第1世代（カントー）
115 / 151 ひき ゲットずみ

ゲスト:
既存 users_v2/guest のダミーデータを維持
```

この表示により、移行は成功と判断しています。

---

## 18. Canary検証用 guest データ

`guest` は移行対象外ですが、Canary検証では `users_v2/guest` をテスト用に使いました。

例: 第3世代クリア直前データ

```json
{
  "displayName": "ゲスト",
  "cleared_generations": 2,
  "current_gen_owned": [1, 2, 3, "...", 134]
}
```

この状態では、V2本体上で以下のように表示されます。

```text
第3世代（ホウエン）
134 / 135 ひき ゲットずみ
```

その後、4問以上正解して残り1匹を取得し、以下を確認しました。

```text
- 第3世代クリア処理が実行される。
- cleared_generations が 3 になる。
- current_gen_owned が [] になる。
- 第4世代（シンオウ）が解放される。
```

これは移行仕様ではなく、Canary検証のための一時的なテストデータ操作です。

---

## 19. Main昇格後の扱い

Main昇格後も、`canary/migration.html` は通常導線に混ぜません。

Main昇格後の V2 Main は `users_v2` を正本として読みます。

```text
V2 Main:
users_v2 を読む

V1.5:
users は移行元・退避版用として参照
```

Main昇格後、通常プレイ中に `users` を読み続ける実装にはしません。

---

## 20. 禁止事項

```text
- index.html に移行UIを混ぜない。
- canary/index.html に移行ボタンを追加しない。
- root index.html に移行UIを混ぜない。
- 通常ユーザー導線に migration.html へのリンクを置かない。
- guest を通常移行対象にしない。
- users コレクションへ書き込まない。
- masters コレクションへ書き込まない。
- migration_logs を作らない。
- owned_by_generation を追加しない。
- createdAt / updatedAt / migratedAt / migrated_from_v1 を移行保存しない。
```

---

## 21. 最終状態

V2 Main昇格後の移行関連状態は以下です。

```text
canary/migration.html:
✅ 作成済み
✅ 残置
✅ 通常導線なし

ryoma:
✅ 移行済み
✅ 第2世代 0 / 100 で表示確認済み

sara:
✅ 移行済み
✅ 第1世代 115 / 151 で表示確認済み

guest:
✅ 移行対象外
✅ V2検証用ダミーデータとして維持

通常導線:
✅ migration.html へのリンクなし

V2 Main:
✅ users_v2 を正本として利用
✅ root index.html に昇格済み
```
