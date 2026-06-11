# data

`data/` は、Firestore 投入前にレビューする生成データ候補を置く場所です。

## country_masters.generated.json

`country_masters.generated.json` は、V4 国旗クイズで使う Firestore `country_masters` の投入元候補です。

このファイルは Step 6 で作成したレビュー対象データであり、ファイル作成だけでは Firestore 実データは変更されません。

Firestore への投入は Step 8 で行います。投入前に、JSON構造、件数、国名表記、`flag_url`、`enabled` の扱いを確認します。
