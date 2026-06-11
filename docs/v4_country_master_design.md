# V4 Country Master Design

作成日: 2026-06-11
対象: V4 / Firestore `country_masters`
位置づけ: Step 5 / country_masters 設計のV4向け確定

## 1. 目的

この文書は、V4 国旗クイズで利用する `country_masters` の設計を定義します。

本設計は、以下の後続ステップの前提です。

```text
Step 6: country_masters.generated.json 作成
Step 7: Firestore投入ツール作成
Step 8: Firestore country_masters 投入・確認
Step 9: V4国旗クイズ実装
```

`country_masters` は国旗クイズ専用のマスターとして追加し、既存の `users_v2` や `masters/gen_{1..9}` を壊さないことを前提にします。

## 2. 設計方針

設計方針は以下です。

```text
- マスターは可能な範囲で広く持つ。
- country_masters には、可能な範囲で全ての国・地域を登録する。
- 初期出題は enabled=true の全件対象にする。
- 初期から子ども向け代表国だけには絞らない。
- 出題制御は enabled / difficulty / similar_group_id で行う。
- 必要があれば、実装後・実機確認後に enabled / difficulty / similar_group_id で調整する。
```

子どもは国旗クイズに慣れている前提とし、初期実装では代表国だけに絞りません。

## 3. 登録対象

`country_masters` には、可能な範囲で全ての国・地域を登録します。

初期データ作成では、ISO 3166-1 alpha-2 をベースに、`flag_url` と日本語国名を用意できる国・地域を可能な範囲で含めます。

代表国だけに絞りません。

## 4. 初期出題対象

初期出題範囲は、原則として `enabled=true` の全件対象にします。

初期データでは、問題なく出題できる国・地域は `enabled=true` にします。画像URL、国名表記、教材上の扱いが難しい国・地域だけ `enabled=false` にできる余地を残します。

子ども向け代表国への絞り込みは、初期実装では行いません。

## 5. Collection 設計

Firestore collection 名は以下です。

```text
country_masters
```

document path は以下です。

```text
country_masters/{country_id}
```

階層構造ではなく、フラット構造にします。

例:

```text
country_masters/jp
country_masters/us
country_masters/gb
country_masters/fr
```

## 6. ID 設計

ID 設計は以下です。

```text
- Firestore document id は ISO 3166-1 alpha-2 の小文字。
- country_id も ISO 3166-1 alpha-2 の小文字。
- country_code は ISO 3166-1 alpha-2 の大文字。
```

例:

```js
country_masters/jp

{
  country_id: "jp",
  country_code: "JP",
  country_name_ja: "日本",
  country_name_en: "Japan"
}
```

## 7. スキーマ

`country_masters/{country_id}` のスキーマは以下です。

```js
{
  country_id: string,
  country_code: string,
  country_name_ja: string,
  country_name_en: string,
  flag_url: string,
  region: string | null,
  capital_ja: string | null,
  difficulty: number | null,
  similar_group_id: string | null,
  enabled: boolean,
  source: string,
  updated_at: string
}
```

## 8. フィールド定義

| フィールド | 型 | 必須 | 例 | 初期値方針 |
| --- | --- | --- | --- | --- |
| `country_id` | `string` | 必須 | `jp` | 小文字 ISO 3166-1 alpha-2。document id と一致させます。 |
| `country_code` | `string` | 必須 | `JP` | 大文字 ISO 3166-1 alpha-2。 |
| `country_name_ja` | `string` | 必須 | `日本` | 国旗クイズの選択肢に使う日本語表示名です。 |
| `country_name_en` | `string` | 必須 | `Japan` | 英語表示名です。レビュー・生成元確認用にも使います。 |
| `flag_url` | `string` | 必須 | `https://flagcdn.com/w320/jp.png` | 国旗画像の外部CDN URLです。 |
| `region` | `string \| null` | 任意 | `Asia` | 分かる範囲で設定します。未確定は `null`。 |
| `capital_ja` | `string \| null` | 任意 | `東京` | 分かる範囲で設定します。未確定は `null`。 |
| `difficulty` | `number \| null` | 任意 | `null` | 初期実装では使わないため `null` 可。 |
| `similar_group_id` | `string \| null` | 任意 | `null` | 初期実装では使わないため `null` 可。 |
| `enabled` | `boolean` | 必須 | `true` | 国旗クイズの初期出題対象なら `true`。 |
| `source` | `string` | 必須 | `generated` | 生成データであること、または生成元を示します。 |
| `updated_at` | `string` | 必須 | `2026-06-11` | `YYYY-MM-DD` または ISO 文字列。Step 6 で形式を最終決定してよいものとします。 |

## 9. enabled の扱い

`enabled` の意味は以下です。

```text
true:
- 国旗クイズの出題対象。

false:
- マスターには存在するが出題対象外。
```

初期データでは、問題なく出題できる国・地域は `true` にします。

以下のような国・地域は `false` にできます。

```text
- 画像URLが不安定
- 日本語国名表記が教材として扱いにくい
- 国旗画像と国・地域の扱いが子ども向け教材として難しい
- Step 6 の生成・検証時点で欠損や不整合がある
```

## 10. null の扱い

未確定値は `null` にします。空文字 `""` は使いません。

`null` を許容するフィールドは以下です。

```text
- region
- capital_ja
- difficulty
- similar_group_id
```

## 11. flag_url の扱い

`flag_url` は外部CDN URLを使います。

初期候補は、FlagCDN のような URL 形式を想定します。

```text
https://flagcdn.com/w320/{country_id}.png
```

ただし、最終的な URL 形式は Step 6 の generated JSON 作成時に検証します。

外部CDN依存のため、画像読み込み失敗リスクがあります。画像読み込み失敗時は、Step 4 要求仕様どおり、可能なら別問題へ差し替え、難しければエラー表示とします。

Step 6 では、`data/country_masters.generated.json` を作成し、`flag_url` は以下の形式にしました。

```text
https://flagcdn.com/w320/{country_id}.png
```

生成データでは、`updated_at` は `2026-06-11` に統一します。

Step 6 時点では、FlagCDN の日本語・英語 `codes.json` を生成元として使用し、生成した 252 件すべての `flag_url` について HEAD リクエストで到達性を確認しました。外部CDN依存であることは変わらないため、実装時は画像読み込み失敗時の扱いを Step 4 要求仕様どおりに実装します。

## 12. 拡張フィールド

以下のフィールドは初期から持ちます。

```text
- enabled
- region
- difficulty
- similar_group_id
```

ただし、暫定値・未確定値は `null` にします。空文字 `""` は使いません。

初期実装で使わないフィールドの扱いは以下です。

```text
- difficulty は初期実装では使わない。値は null でよい。
- similar_group_id は初期実装では使わない。値は null でよい。
- region は分かる範囲で入れる。未確定なら null。
- capital_ja は分かる範囲で入れる。未確定なら null。
```

## 13. 実装後調整

実装後・実機確認後に以下の問題が見つかった場合は、`enabled` / `difficulty` / `similar_group_id` で調整します。

```text
- 難しすぎる
- 似た国旗が多すぎる
- 国名が分かりにくい
- 画像読み込みが不安定
- 教材として扱いにくい
```

## 14. Step 4 要求仕様からの更新点

Step 4 では、初期対象国を子ども向け代表国に絞る方針でした。

Step 5 では、ユーザー判断により、マスター登録対象も初期出題対象も可能な範囲で広く扱う方針に変更しました。

ただし、出題対象は `enabled` で制御可能にします。必要があれば、実装後に `enabled` / `difficulty` / `similar_group_id` で調整します。

## 15. Step 6 生成データ

Step 6 で作成する生成データは以下です。

```text
data/country_masters.generated.json
```

このファイルは Firestore `country_masters` の投入元候補です。Firestore 実データへの投入は Step 8 で行います。

Step 6 の生成結果は以下です。

```text
- total records: 252
- enabled=true records: 250
- enabled=false records: 2
- source: generated
- updated_at: 2026-06-11
- flag_url pattern: https://flagcdn.com/w320/{country_id}.png
```

FlagCDN のコード一覧には `eu`（欧州連合）と `un`（国際連合）が含まれます。これらは国・地域ではなく組織扱いのため、マスターには残しつつ初期出題対象から外し、`enabled=false` とします。

`region` と `capital_ja` は、Step 6 では不確実な補完を避けるため全件 `null` とします。必要になった場合は、別PRで出典と確認方法を整理して補完します。

Step 7 では、`tools/import_country_masters.html` を作成し、`data/country_masters.generated.json` の投入前プレビューとブラウザ上のスキーマ検証を行います。Step 7 のツールは確認専用であり、Firestore SDK、Firebase config、Firestore 書き込み処理は含めません。

## 16. 今回やらないこと

Step 5 では以下を行いません。

```text
- country_masters.generated.json 作成
- data/ 配下の作成
- Firestore投入ツール作成
- Firestore投入
- V4実装
- 国旗クイズ実装
- root index.html 変更
- v3/ 変更
- users_v2 変更
- masters/gen_{1..9} 変更
```

Step 6 では以下を行いません。

```text
- Firestore投入
- Firestore投入ツール作成
- tools/ 配下の作成
- V4実装
- 国旗クイズ実装
- root index.html 変更
- v3/ 変更
- users_v2 変更
- masters/gen_{1..9} 変更
```

Step 7 では以下を行いません。

```text
- Firestore投入
- Firestore実データ操作
- Firestore SDK を使った実書き込み
- country_masters collection の作成
- data/country_masters.generated.json の内容変更
- V4実装
- 国旗クイズ実装
```

## 17. 後続ステップ

後続ステップは以下です。

```text
Step 6: country_masters.generated.json 作成
Step 7: Firestore投入ツール作成
Step 8: Firestore country_masters 投入・確認
Step 9: V4国旗クイズ実装
```

## 18. 確認観点

Step 5 の確認観点は以下です。

```text
- docsのみ変更であること
- runtime files を変更していないこと
- Firestore設定・実データを変更していないこと
- v4/ を変更していないこと
- data/ と tools/ を作成していないこと
- 現時点のV4確認済みバージョン表示は V4開発版 v4.0.0.0.202606111628 のままであること
```

Step 6 の確認観点は以下です。

```text
- data/country_masters.generated.json が JSON として parse できること
- 必須フィールドが全件に存在すること
- country_id / country_code が重複しないこと
- country_id は小文字2文字、country_code は大文字2文字で対応していること
- enabled が boolean であること
- 空文字ではなく null を使うべきフィールドが null になっていること
- flag_url が https://flagcdn.com/w320/{country_id}.png 形式であること
- Firestore設定・実データを変更していないこと
- runtime files を変更していないこと
- v4/ を変更していないこと
```

Step 7 の確認観点は以下です。

```text
- tools/import_country_masters.html が data/country_masters.generated.json を fetch できること
- total 252、enabled=true 250、enabled=false 2 を表示できること
- enabled=false の country_id が eu / un であること
- 必須フィールド、重複、ID形式、型、null/空文字をブラウザ上で検証できること
- Firestore SDK、Firebase config、Firestore 書き込み処理を含まないこと
- data/country_masters.generated.json を変更していないこと
- runtime files を変更していないこと
- v4/ を変更していないこと
```
