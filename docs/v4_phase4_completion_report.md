# V4 Phase 4 Completion Report

作成日: 2026-06-12
対象: V4 / Phase 4 国旗クイズ
位置づけ: Step 11 / V4 Phase 4完了報告

## 1. 文書の目的

この文書は、V4 Phase 4 国旗クイズ開発の完了内容を整理します。

Step 12 の Main昇格判断前の確認資料として、実装内容、データ投入、実機確認、保護領域、残課題を明確にします。

## 2. 完了サマリ

V4 Phase 4 では、V4 開発確認用ディレクトリである `/v4/` に国旗クイズを実装しました。

完了内容は以下です。

```text
- V4国旗クイズを /v4/ に実装した。
- 既存の V3.1 Main 実行資産 root index.html / v3/ は変更していない。
- Firestore country_masters を作成・投入済み。
- 国旗クイズは country_masters の enabled=true を読み取る。
- 国旗画像を見て日本語国名4択で回答する。
- 5問構成。
- 正解/不正解表示あり。
- 不正解時は正解選択肢も分かる。
- 報酬フローは既存ポケモン報酬へ接続済み。
- iPhone実機確認済み。
```

## 3. 確認済みバージョン

V4 Phase 4 完了時点の確認済みバージョン表示は以下です。

```text
V4開発版 v4.0.0.3.202606120003
```

## 4. 実装済み機能

実装済み機能は以下です。

```text
- クイズ種別選択
  - さんすうクイズ
  - こっきクイズ
- さんすうクイズ導線の維持
- 国旗クイズ導線の追加
- Firestore country_masters 読み取り
- enabled=true の国・地域から出題
- 5問出題
- 国旗画像表示
- 日本語国名4択
- 正解/不正解判定
- 不正解時の正解選択肢表示
- 5問後の結果表示
- 国旗クイズ報酬接続
- 図鑑反映
- メニュー戻り
- 連続プレイ
```

## 5. 報酬仕様

算数クイズの報酬仕様は既存仕様を維持します。

```text
さんすうクイズ:
- 0〜3問正解: 0匹
- 4問正解: 1匹
- 5問正解: 2匹
```

こっきクイズの報酬仕様は以下です。

```text
こっきクイズ:
- 0〜2問正解: 0匹
- 3〜4問正解: 1匹
- 5問正解: 2匹
```

クイズ選択画面の表示文言は以下です。

```text
さんすうクイズ: 4もんで1ぴき・5もんで2ひきゲット
こっきクイズ: 3もんで1ぴき・5もんで2ひきゲット
```

## 6. country_masters データ

Firestore `country_masters` の投入結果は以下です。

```text
collection: country_masters
document total: 252
enabled=true: 250
enabled=false: 2
enabled=false document ids: eu, un
document id rule: record.country_id
```

代表 document は以下を確認済みです。

```text
- jp
- us
- gb
- eu
- un
```

全252 documents で、以下の主要フィールドが存在することを確認済みです。

```text
- country_id
- country_code
- country_name_ja
- country_name_en
- flag_url
- region
- capital_ja
- difficulty
- similar_group_id
- enabled
- source
- updated_at
```

## 7. 生成データ・投入ツール

country_masters 関連の生成データ・投入ツールは以下の流れで整備しました。

```text
- data/country_masters.generated.json を作成済み。
- tools/import_country_masters.html を作成済み。
- Step 7ではプレビュー専用。
- Step 8-Aで guarded import 機能を追加。
- Step 8-Bでユーザー明示操作により Firestore 投入を実施。
- 投入後確認で 252件・enabled内訳・代表document・主要フィールド確認済み。
```

## 8. 実機確認結果

ユーザーによる iPhone 実機確認で、以下を確認済みです。

```text
- 初期表示
- ユーザー選択
- さんすうクイズ導線
- こっきクイズ導線
- 国旗画像表示
- 4択表示
- 正解/不正解表示
- 5問完了
- 結果画面
- 報酬画面
- 図鑑反映
- メニュー戻り
- 連続プレイ
- iPhone表示
- Firestore保存まわり
```

## 9. 変更していない保護領域

V4 Phase 4 開発では、以下の保護領域を不用意に変更していません。

```text
- root index.html は Main昇格前のため未変更
- v3/ は V3.1 Main 実行資産として未変更
- canary/ 未変更
- archive/ 未変更
- root README.md 未変更
- AGENTS.md 未変更
- Firebase / Firestore 設定ファイル未変更
- users_v2 構造未変更
- masters/gen_{1..9} 未変更
- GitHub Pages 設定未変更
```

## 10. 既知の注意点・残課題

既知の注意点・残課題は以下です。

```text
- Main昇格は未実施。
- root index.html はまだ V4 に切り替えていない。
- /v4/ は開発確認URLとして利用中。
- 実ブラウザ console error の網羅的確認は限定的。
- country_masters の国名表記・enabled調整は、実運用で違和感が出たら個別調整する。
- eu / un は enabled=false。
- v4/ を Main に昇格する場合は root index.html の更新、必要に応じた archive 退避、docs更新が必要。
- Main昇格後も v3/ をバックアップまたは過去版として残すかを判断する必要がある。
```

## 11. Step 12 Main昇格判断に向けた観点

Step 12 では、以下を判断します。

```text
- V4を Main に昇格するか
- root index.html を V4 相当に更新するか
- v3/ を残すか
- archive に Main昇格前rootを退避するか
- /v4/ を残すか
- users_v2 / country_masters の本番利用に問題がないか
- Main昇格PRは runtime変更を含むため、今回の完了報告PRとは分ける
```

## 12. Step 12-B Main昇格PR方針

Step 12-A の読み取り確認により、V4 Main昇格方式は案Dを採用する方針とします。

Step 12-B では、root `index.html` を V4 相当のMainシェルに更新するPRを作成します。実際のMain昇格は、このPRのmerge後に成立します。

```text
- root index.html は ./v4/css/app.css と ./v4/js/main.js を参照する。
- v4/index.html は変更しない。
- v3/ は過去版資産として残す。
- v4/ はV4実行資産として残す。
- Main昇格前の root index.html は archive/index_v3_1_main_before_v4.html に退避する。
```
