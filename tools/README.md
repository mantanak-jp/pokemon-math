# tools

`tools/` は、管理・投入補助ツールを置く場所です。

## import_country_masters.html

`import_country_masters.html` は、V4 国旗クイズで使う `country_masters` の投入前確認ツールです。

Step 7 時点では、`data/country_masters.generated.json` を読み込み、件数・サンプル・`enabled=false` 一覧・スキーマ検証結果を表示します。

Firestore には書き込みません。Firestore SDK、Firebase config、実投入処理は含めません。

Step 8 で投入機能または投入手順を追加・実行する場合は、誤操作防止のため、チェックボックスや確認文入力などの安全策を設け、明示承認後のみ実データ操作を行います。
