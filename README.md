# pokemon-math

子ども向けのポケモン算数学習アプリです。

## 現在の位置づけ

- `index.html` は V1.5 本番版です。明示的な Issue と承認がない限り変更しません。
- `canary/` 配下の既存HTMLファイルは、V2検討用の参考・プロトタイプ・作業履歴として扱います。
- V2本実装・開発用HTMLは、既存の `canary/*.html` を正本化せず、新規ファイルとして作成します。

## 開発ルール

開発エージェント向けのルールは [`AGENTS.md`](./AGENTS.md) を参照してください。

特に以下を重視します。

- ルート `index.html` を保護すること
- Firestore `users` へのV2書き込みを避けること
- V2では `users_v2` と `masters/gen_{1..9}` を使用すること
- 仕様変更時は `docs/` 配下のドキュメントも更新すること

## ドキュメント

仕様書・棚卸し・今後の設計文書は [`docs/README.md`](./docs/README.md) を入口に参照してください。

主なドキュメント:

- [`docs/system_definition_v1.5.md`](./docs/system_definition_v1.5.md): V1.5 本番版の仕様定義書
- [`docs/system_definition_v2.md`](./docs/system_definition_v2.md): V2 の構想・要求仕様・データ構造・ロードマップ
- [`docs/current_inventory.md`](./docs/current_inventory.md): 現在のファイル構成、既存HTMLの位置づけ、V1/V2/Firestore の関係整理

## 開発時の基本方針

1 Issue = 1 Pull Request を原則とし、変更範囲を小さく保ちます。

コードやFirestoreの読み書き先を変更する場合は、事前に関連ドキュメントを確認し、必要に応じて同じPRで更新してください。
