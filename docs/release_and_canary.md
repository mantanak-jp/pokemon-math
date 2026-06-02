# Release and Canary 方針

最終更新: 2026-06-02

## 1. 目的

この文書は、ポケモンさんすうアプリ V2 本実装における Canary 開発・移行・Main 昇格の運用方針を定義します。

特に以下を明確にします。

- V2本体をどのファイルに作るか
- Canary環境で何を確認するか
- 移行UIをどこに置くか
- 既存canaryファイルをどう扱うか
- Main昇格時に何を `index.html` へ反映するか
- 最初のV2実装PRの範囲

## 2. 前提ドキュメント

この文書は、以下のドキュメントを前提とします。

- `AGENTS.md`
- `README.md`
- `docs/README.md`
- `docs/current_inventory.md`
- `docs/data_model_v1_v2.md`
- `docs/migration_v1_to_v2.md`
- `docs/ui_ux_v2.md`
- `docs/system_definition_v1.5.md`
- `docs/system_definition_v2.md`

## 3. 基本方針

- ルート `index.html` は V1.5 本番版として保護します。
- V2本体は `canary/index.html` として新規作成します。
- 旧 `canary/index.html` は削除済みであり、今後の参照対象にはしません。
- `canary/index_ui.html` は UIプロトタイプとして参考扱いにします。
- `canary/index_dev_masterdata_2.html` はマスターデータ取得履歴として参考扱いにします。
- V1→V2移行UIは `canary/migration.html` としてV2本体から分離します。
- Main昇格時は、検証済み `canary/index.html` の内容をルート `index.html` に反映します。
- Main昇格は専用PRで行います。

## 4. ファイル配置

### 4.1 本番ファイル

```text
/index.html
```

位置づけ:

- V1.5本番版です。
- V2検証が完了するまで変更しません。
- V2 Main昇格時にのみ、専用PRで更新します。

### 4.2 V2 Canary本体

```text
/canary/index.html
```

位置づけ:

- V2本実装のCanary正本です。
- これから新規作成します。
- 既存プロトタイプの流用ではなく、仕様書に基づいて新規実装します。
- Canary検証後、Main昇格候補となります。

### 4.3 V1→V2移行UI

```text
/canary/migration.html
```

位置づけ:

- 運用者向けの一括移行画面です。
- 通常ユーザー・子どもには見せません。
- Main昇格対象ではありません。
- V2本体とは分離します。

### 4.4 既存参考ファイル

```text
/canary/index_ui.html
/canary/index_dev_masterdata_2.html
```

位置づけ:

- `canary/index_ui.html` は、V2 UI評価用プロトタイプです。参考扱いです。
- `canary/index_dev_masterdata_2.html` は、マスターデータ取得・Firestore投入用の開発ダッシュボードです。マスターデータ投入済みの履歴として残します。

## 5. Canary確認URL

Canaryでの確認対象URLは以下です。

```text
/canary/index.html
/canary/migration.html
```

用途:

| URL | 用途 |
| --- | --- |
| `/canary/index.html` | V2本体の動作確認 |
| `/canary/migration.html` | V1→V2一括移行の実行・結果確認 |

既存の以下は、Canary確認対象から外します。

```text
/canary/index_ui.html
/canary/index_dev_masterdata_2.html
```

ただし、参考資料・履歴として残します。

## 6. 実装順序

推奨する実装順序は以下です。

```text
Step 6-1: canary/index.html の骨組み作成
Step 6-2: Firebase接続・ユーザー選択・users_v2読み込み
Step 6-3: masters/gen_{1..9} 読み込みとメニュー表示
Step 6-4: クイズ・結果・保存処理
Step 6-5: 図鑑・詳細モーダル
Step 6-6: 世代開始・世代クリア・全世代コンプリート
Step 6-7: canary/migration.html 作成
Step 6-8: Canaryで移行実行・V2動作確認
Step 6-9: 検証済み canary/index.html を root index.html へ昇格
```

## 7. 最初のV2実装PR範囲

最初の実装PRは小さくします。

対象:

```text
追加:
- canary/index.html
```

実装範囲:

- タイトル画面
- ユーザー選択画面
- Firebase初期化
- `users_v2/{userId}` 読み込み
- 読み込み中表示
- 読み込み失敗表示
- 最小限のメニュー画面

含めないもの:

- V1→V2移行処理
- `canary/migration.html`
- クイズ本実装
- 図鑑本実装
- 世代クリア処理
- Main `index.html` の更新

## 8. Main昇格方針

V2をMainへ反映する場合は、専用PRで実施します。

```text
canary/index.html
↓
index.html
```

Main昇格PRでは、以下を必ず確認します。

- `canary/index.html` がV2本体として検証済みであること
- `users_v2` の読み書きが想定どおりであること
- V2から `users` へ書き込んでいないこと
- `masters/gen_{1..9}` は読み取り専用であること
- `canary/migration.html` はMainに昇格しないこと
- Mainの通常ユーザー画面に移行UIが表示されないこと

## 9. 移行UIの扱い

移行UIは `canary/migration.html` に分離します。

- V2本体 `canary/index.html` には移行ボタンを入れません。
- 移行は `canary/migration.html` で運用者が一括実行します。
- 移行結果を確認した後に、`canary/index.html` でV2本体を確認します。
- Main昇格時に `migration.html` は反映しません。

これは、V2本体に移行用の危険な操作を混ぜないためです。

## 10. 既存canaryファイルの扱い

### 10.1 旧 `canary/index.html`

- 削除済みです。
- 以前はV2図鑑遷移プロトタイプでした。
- 今後は参照対象ではありません。
- 新しく作成する `canary/index.html` とは別物として扱います。

### 10.2 `canary/index_ui.html`

- UI評価用プロトタイプです。
- 参考扱いです。
- 本実装の正本にはしません。
- 必要な考え方のみ、仕様書に基づき再実装します。

### 10.3 `canary/index_dev_masterdata_2.html`

- マスターデータ取得・Firestore投入用です。
- マスターデータ投入済みの履歴として残します。
- 本実装の正本にはしません。
- 通常プレイ導線には使いません。

## 11. PR分割方針

PRは小さく分けます。

推奨分割:

```text
PR 1: canary/index.html 骨組み + users_v2読み込み
PR 2: masters読み込み + メニュー表示
PR 3: クイズ + 結果画面
PR 4: ポケモン取得 + 保存処理
PR 5: 図鑑 + 詳細モーダル
PR 6: 世代開始・世代クリア・全世代コンプリート
PR 7: canary/migration.html + 一括移行処理
PR 8: Canary検証後、index.htmlへMain昇格
```

実際の粒度は、実装時の差分量に応じて調整します。

## 12. 実装時の禁止事項

- V2検証前にルート `index.html` を変更しないでください。
- `canary/index_ui.html` をV2本体として流用しないでください。
- `canary/index_dev_masterdata_2.html` を通常プレイ導線に入れないでください。
- V2本体 `canary/index.html` に移行ボタンを混ぜないでください。
- Mainに `canary/migration.html` 相当の移行UIを入れないでください。
- V2から `users` コレクションへ書き込まないでください。
- `masters/gen_{1..9}` へ通常プレイ中に書き込まないでください。

## 13. この文書では扱わないこと

| 項目 | 扱う場所 |
| --- | --- |
| V2データモデル | `docs/data_model_v1_v2.md` |
| V1→V2移行仕様 | `docs/migration_v1_to_v2.md` |
| V2 UI/UX | `docs/ui_ux_v2.md` |
| PRレビュー観点 | `docs/review_checklist.md` |
| 実装コード | 後続PR |

## 14. 次のステップ

次に進める作業は以下です。

1. `docs/review_checklist.md` を作成します。
2. `canary/index.html` の最小実装PRに進みます。

ただし、`docs/review_checklist.md` は実装と並行でも構いません。

実装前に最低限必要なのは、この `release_and_canary` 方針の確定です。
