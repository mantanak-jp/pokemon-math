# pokemon-math

子ども向けのポケモン算数学習アプリです。

## 現在の位置づけ

- `index.html` は **V2 Main 本番版**です。
- V1.5 本番版は `archive/index_v1_5.html` に退避済みです。
- `canary/index.html` は、V2 Canary 開発・検証の履歴、および今後の検証用ファイルとして残します。
- `canary/migration.html` は、V1.5 から V2 への移行に使用した運用者向けツールです。通常ユーザー・子ども向け導線には出しません。

## データの位置づけ

- V2 Main は Firestore `users_v2` をユーザーデータの正本として使用します。
- V2 Main は Firestore `masters/gen_{1..9}` をポケモンマスターデータとして読み取ります。
- V1.5 の `users` コレクションは、V1.5 退避版および移行元データの参照対象です。V2 Main から通常プレイ中に書き込みません。

## 開発ルール

開発エージェント向けのルールは [`AGENTS.md`](./AGENTS.md) を参照してください。

特に以下を重視します。

- `index.html` は V2 Main 本番版として慎重に変更すること
- 仕様変更時は `docs/` 配下の関連ドキュメントも更新すること
- V2 Main では `users_v2` と `masters/gen_{1..9}` を使用すること
- 通常ユーザー導線に `canary/migration.html` へのリンクを置かないこと
- V1.5 参照が必要な場合は `archive/index_v1_5.html` と `docs/system_definition_v1.5.md` を参照すること

## ドキュメント

仕様書・棚卸し・運用ルールは [`docs/README.md`](./docs/README.md) を入口に参照してください。
