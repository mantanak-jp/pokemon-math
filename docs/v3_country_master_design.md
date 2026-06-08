# V3.2 / Phase 4 Country Master Design

作成日: 2026-06-07  
更新日: 2026-06-08  
対象: V3.2 / Phase 4 / Firestore `country_masters`  
位置づけ: 国旗クイズ用マスター先行設計

## 1. 全体像と現在地

```text
V3 Phase 1: 完了
V3 Phase 2: ES Modules化完了
V3 Phase 3 / V3.1: 算数レベル5・6追加 + main昇格判断
V3 Phase 4 / V3.2: 国旗クイズ追加予定 ← 本ドキュメントの対象
```

当初は、V3 Phase 3で割り算と国旗クイズを同時に実装する案としていた。

その後、リリースリスクを分離するため、V3.1 / Phase 3では算数レベル5・6追加までを実装し、国旗クイズは V3.2 / Phase 4 に分離する方針へ変更した。

本ドキュメントは、V3.2 / Phase 4 で追加予定の国旗クイズに向けた `country_masters` の先行設計として維持する。

## 2. 目的

国旗クイズでは、国旗画像を表示し、正しい国名を4択で選ぶ。

そのために、国・地域ごとの国名、国コード、国旗画像URL、地域情報、出題制御情報を Firestore に保持する。

```text
目的:
- 国旗クイズの出題元データを Firestore に持つ
- アプリ実行時に REST Countries 等の外部APIを直接呼ばない
- 国旗クイズに必要なデータを安定して取得できるようにする
- 既存の users_v2 / masters/gen_{1..9} に影響させない
- 将来の国・首都クイズや地域別出題にも拡張できる余地を残す
```

## 3. V3.1 / Phase 3 との関係

V3.1 / Phase 3では、`country_masters` は実装・投入しない。

```text
V3.1 / Phase 3でやらない:
- country_masters の追加
- data/country_masters.generated.json の追加
- ブラウザ用 country_masters 投入ページ
- 国旗クイズ
- クイズ種別選択
- 国旗画像表示
```

V3.1 / Phase 3は、算数レベル5・6追加と main昇格判断を対象とする。

本ドキュメントの内容は、V3.2 / Phase 4 で国旗クイズに進む際の設計前提として扱う。

## 4. 外部データソース

初期データソースは REST Countries とする。

REST Countries は current version として v3.1 を提供している。`/v3.1/all` では全件取得ができるが、`all` endpoint では取得したい fields の指定が必要である。また、REST Countries は 250+ countries と説明している。

参照:
- https://restcountries.com/

## 5. Firestore 配置

採用する Firestore コレクションは以下。

```text
country_masters/{countryId}
```

例:

```text
country_masters/jp
country_masters/us
country_masters/fr
country_masters/br
```

### 5.1 採用理由

```text
1. 既存のポケモン世代マスター masters/gen_{1..9} と明確に分離できる
2. 国マスターはポケモンマスターとライフサイクルが異なる
3. 国旗クイズの変更が既存ポケモン機能へ波及しにくい
4. 将来の prefecture_masters / prefecture_shape_masters と並べやすい
```

将来拡張時は、以下のようにマスターを分離する余地を残す。

```text
country_masters/{countryId}
prefecture_masters/{prefCode}
prefecture_shape_masters/{prefCode}
```

## 6. countryId 方針

`countryId` は、原則として REST Countries の `cca2` を小文字化した値とする。

```text
JP → jp
US → us
FR → fr
BR → br
```

### 6.1 採用理由

```text
1. 短く扱いやすい
2. REST Countries の国コードと対応しやすい
3. Firestore ドキュメントIDとして読みやすい
4. 国旗クイズの answer value として使いやすい
```

### 6.2 例外

REST Countries 全件相当には国・地域が含まれるため、投入時には `cca2` の欠損チェックを行う。

初期方針としては、`cca2` が存在しないデータは投入対象外とする。

## 7. 登録対象

Firestore には REST Countries 全件相当を登録する。

```text
登録対象:
REST Countries 全件相当
```

ただし、国旗クイズの出題対象は `enabled` フラグで制御する。

```text
DB登録:
REST Countries 全件相当

出題対象:
enabled === true のもの
```

## 8. 初期 enabled 方針

初期の `enabled` は以下とする。

```text
enabled: true
- independent === true の国・地域
- 国旗クイズとして出したい一部有名地域

enabled: false
- 上記以外の地域・海外領土等
```

採用方針は、`independent=true` を基本としつつ、子ども向け国旗クイズとして出題したい一部有名地域を追加で `enabled=true` にできるようにする。

一部有名地域は、必要に応じて別途 `enabled_overrides` 的な考え方で制御する。

## 9. difficulty 方針

`difficulty` は将来用フィールドとして持つが、V3.2 / Phase 4初期では利用しない。

```js
difficulty: null
```

理由:

```text
1. 国旗の難易度判断は主観的になりやすい
2. V3.2 / Phase 4初期では国旗クイズに難易度設定を設けない
3. 将来拡張の余地だけ残す
```

## 10. 日本語国名方針

日本語国名は、REST Countries の `translations.jpn.common` を基本に使用する。

国名補正テーブルは必須要件とはしない。初期実装では、最悪やらなくてもよい。

```text
基本:
REST Countries translations.jpn.common を使用する

補正:
任意。必要になったら補正テーブルを追加する
```

### 10.1 補正が必要になった場合

国名補正が必要になった場合は、Firestore を直接正本として手修正するのではなく、補正テーブルを用意し、生成済みJSONを再生成する。

```text
補正テーブル修正
↓
country_masters.generated.json 再生成
↓
Firestore 再投入
```

ただし、初期実装では、国名補正はオプション扱いとする。

## 11. 公式名方針

国名は common name と official name の両方を持つ。

```text
countryNameJa
countryNameEn
officialNameJa
officialNameEn
```

国旗クイズの選択肢では `countryNameJa` を使う。  
`officialNameJa` は将来の表示・説明・国名クイズ拡張用として保持する。

## 12. 首都情報方針

首都情報は、国旗クイズでは不要だが、将来の国・首都クイズ用に有用である。

ただし、V3.2 / Phase 4初期の `country_masters` では、首都情報は必須フィールドとしない。

```text
初期:
capitalJa / capitalEn は必須にしない

将来:
国・首都クイズを実装する段階で追加検討する
```

理由:

```text
1. 国旗クイズでは首都情報を使わない
2. capitalJa の日本語整備コストがある
3. 初期マスターを軽量に保ちたい
```

## 13. 国旗画像URL方針

国旗画像は SVG を優先し、PNG をフォールバックとして持つ。

```text
優先:
flagSvgUrl

フォールバック:
flagPngUrl
```

アプリ上で使う代表URLとして `flagUrl` も保持する。

```js
flagUrl: flagSvgUrl || flagPngUrl
```

国旗クイズの問題生成時には、以下のように `imageUrl` を決める。

```js
imageUrl = flagSvgUrl || flagPngUrl || flagUrl
```

## 14. 地域情報方針

地域別出題や誤答候補生成のため、`region` と `subregion` を持つ。

```text
region
subregion
```

国旗クイズでは、誤答候補を同じ `region` から優先して選ぶため、`region` を利用する。

## 15. 国・地域属性方針

出題対象制御や将来拡張に備え、以下を保持する。

```text
independent
unMember
status
```

これにより、将来的に以下のような出題制御が可能になる。

```text
- independent=true のみ
- unMember=true のみ
- status 条件での絞り込み
- enabled による手動制御
```

## 16. source 情報方針

データ由来と更新履歴を追跡できるように、以下を保持する。

```text
source
sourceVersion
updatedAt
```

例:

```js
source: "REST Countries",
sourceVersion: "v3.1",
updatedAt: "2026-06-07"
```

## 17. 推奨スキーマ

V3.2 / Phase 4 初期の推奨スキーマは以下。

```js
{
  countryId: "jp",

  countryNameJa: "日本",
  countryNameEn: "Japan",
  officialNameJa: "日本",
  officialNameEn: "Japan",

  cca2: "JP",
  cca3: "JPN",

  flagUrl: "https://flagcdn.com/jp.svg",
  flagSvgUrl: "https://flagcdn.com/jp.svg",
  flagPngUrl: "https://flagcdn.com/w320/jp.png",

  region: "Asia",
  subregion: "Eastern Asia",

  independent: true,
  unMember: true,
  status: "officially-assigned",

  difficulty: null,
  enabled: true,

  source: "REST Countries",
  sourceVersion: "v3.1",
  updatedAt: "2026-06-07"
}
```

### 17.1 初期では必須にしない項目

以下は、初期では必須にしない。

```text
capitalJa
capitalEn
flagAlt
ccn3
```

理由:

```text
- 国旗クイズに不要
- 日本語整備コストがある
- 初期マスターを軽量に保つため
```

## 18. 国旗クイズ開始時の取得範囲

アプリは、国旗クイズ開始時に Firestore から `enabled == true` の `country_masters` のみ取得する。

```text
取得対象:
country_masters where enabled == true
```

`country_masters` 全件を毎回取得しない。

## 19. キャッシュ方針

取得した `enabled == true` の国・地域データは、国旗クイズに必要な軽量データへ整形して `state` に保持する。

```text
保持期間:
アプリ起動中のみ

永続キャッシュ:
V3.2 / Phase 4初期では使用しない
```

`localStorage` / `IndexedDB` 等の永続キャッシュは、V3.2 / Phase 4初期では使わない。

state に保持するデータは、国旗クイズに必要な項目に絞る。

```js
state.countryQuizMasterList = [
  {
    countryId: "jp",
    countryNameJa: "日本",
    flagUrl: "https://flagcdn.com/jp.svg",
    region: "Asia"
  }
];
```

## 20. 5問内の重複方針

国旗クイズでは、1回の5問内で同じ国・地域を出題しない。

```text
第1問: 日本
第3問: 日本
```

のような重複は避ける。

実装上は、クイズ中に `usedCountryIds` のようなセットを保持する。

## 21. 誤答候補方針

誤答候補は、正解国・地域と同じ `region` から優先して選ぶ。

```text
1. 正解国を1件選ぶ
2. 正解国と同じ region の国・地域から誤答候補を探す
3. 同じ region で3件そろえば、その3件を使う
4. 足りない場合は全 enabled 対象から補充する
5. 正解1件 + 誤答3件をシャッフルする
```

これにより、国旗クイズとして自然な難易度を保ちやすくする。

## 22. JSON生成とFirestore投入の役割分担

`country_masters` は、Firestoreへ直接手入力しない。

基本フローは以下。

```text
REST Countries 取得
↓
country_masters 用に整形
↓
data/country_masters.generated.json を生成
↓
GitHubリポジトリに保存
↓
ブラウザ用の開発者向け投入ページで Firestore に投入
```

### 22.1 役割分担

```text
ChatGPT:
- REST Countries 由来データを整形する
- country_masters.generated.json を生成する
- 欠損・件数・enabled件数を確認する
- GitHubへ保存する
- PRを作成する

ユーザー:
- PRを確認・マージする
- ブラウザ用投入ページを開く
- 件数・欠損チェックを確認する
- Firestore投入を実行する
```

### 22.2 Firestore投入方式

Firestore投入は、Node.jsスクリプトによる直接投入ではなく、既存運用に近いブラウザ用の開発者向け投入ページで行う。

```text
採用:
B + D のハイブリッド

- 整形済みJSONを作る
- JSONをGitHubに保存する
- Firestore投入はブラウザ用投入ページで行う
```

## 23. 元データ保存方針

整形済みJSONはリポジトリに保存する。

```text
保存候補:
data/country_masters.generated.json
```

国名補正テーブルはオプションとし、初期実装では必須にしない。

```text
補正テーブル:
必要になったら追加する
```

## 24. Firestore既存データへの影響

V3.2 / Phase 4 で `country_masters` を追加する場合も、以下は変更しない。

```text
変更しない:
- users_v2
- users
- masters/gen_{1..9}
- ryoma / sara の実データ
- ポケモン報酬保存構造
- 図鑑保存構造
```

新規追加するのは以下のみ。

```text
新規追加:
- country_masters/{countryId}
```

## 25. 未決定事項

本ドキュメント時点で、以下は V3.2 / Phase 4 実装前にさらに詳細化する。

```text
1. data/country_masters.generated.json の生成タイミング
2. ブラウザ用投入ページのファイル名・配置
3. 投入ページの誤操作防止UI
4. enabled=true にする一部有名地域の初期リスト
5. generated JSON のレビュー観点
```

## 26. 完了条件

country_masters 設計としては、以下を満たせば V3.2 / Phase 4 の投入準備に進める。

```text
1. country_masters のスキーマが確定している
2. REST Countries 由来データの整形方針が明確である
3. enabled 方針が明確である
4. Firestore投入方式が明確である
5. generated JSON の保存方針が明確である
6. 既存 Firestore データへの非影響範囲が明記されている
```
