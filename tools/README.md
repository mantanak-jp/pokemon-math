# tools

`tools/` は、管理・投入補助ツールを置く場所です。

## import_country_masters.html

`import_country_masters.html` は、V4 国旗クイズで使う `country_masters` の投入前確認ツールです。

Step 7 時点では、`data/country_masters.generated.json` を読み込み、件数・サンプル・`enabled=false` 一覧・スキーマ検証結果を表示します。

Step 8-A では、Firestore `country_masters` へ投入するための機能を追加します。ただし、実投入は行いません。

投入ボタンは、JSON検証成功、件数一致、`enabled=false` が `eu` / `un` であること、確認チェック、確認テキスト `IMPORT country_masters` の完全一致を満たした場合だけ有効になります。クリック時には最終確認ダイアログを表示します。

Firestore 実データ操作は Step 8-B の明示承認後のみ行います。
