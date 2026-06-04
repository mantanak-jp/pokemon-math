# V2 Canary〜Main昇格 引き継ぎ・完了メモ

最終更新: 2026-06-04

## 1. この文書の目的

この文書は、`pokemon-math` リポジトリにおける V2 Canary 開発から V2 Main 昇格完了までの経緯、最終状態、既知の注意点、今後の保守作業を整理するための引き継ぎメモです。

## 2. 現在の基本方針

```text
root index.html
→ V2 Main 本番版。

archive/index_v1_5.html
→ V1.5 退避版。

canary/index.html
→ V2 Canary 開発・検証の履歴、および今後の検証用。

canary/migration.html
→ V1.5→V2移行ツール。通常プレイ導線には混ぜない。
```

## 3. Step 全体像と現在地

```text
Step 1: 現状棚卸し・開発ルール整備
  ✅ 完了

Step 2: データモデル定義
  ✅ 完了

Step 3: V1→V2移行仕様定義
  ✅ 完了

Step 4: V2 UI/UX仕様定義
  ✅ 完了

Step 5: V2本実装ファイル名・配置方針の確定
  ✅ 完了

Step 6: V2 Canary機能実装
  ✅ 完了

Step 7: Canary検証・Main昇格準備
  ✅ 完了

Step 8: Main昇格準備・Main昇格
  ✅ 完了
  ✅ PR #19 merged
  ✅ V2 Main公開済み
  ✅ 動作確認済み
```

現在地:

```text
V2 Main昇格完了。
root index.html は V2 Main。
次フェーズは保守・ドキュメント整合・軽微改善。
```

## 4. PR整理

### PR #19

```text
PR #19:
Promote V2 app to main

状態:
closed / merged

変更:
index.html

結果:
V2 Main昇格完了
```

### PR #18

```text
PR #18:
Add generation start/clear/all-complete UI and transactional reward-save handling

状態:
closed / unmerged

理由:
後続コミットでStep 7-1B-UX / Step 7-2まで反映済みとなり、古いPRになったため。
```

## 5. 重要ロジック・注意点

### 保存処理

```text
- 4問正解で1匹
- 5問正解で2匹
- 未取得ポケモンだけから抽選
- current_gen_owned に local_id を追加
- Firestore transaction で保存
- 重複防止
```

### 図鑑・モーダル

```text
- 図鑑グリッド部分だけをスクロール領域にする。
- モーダルは .app の外、body直下相当の外側レイヤーに置く。
- 背景クリックで閉じる。
- 右上の × ボタンで閉じる。
- 下部の「とじる」ボタンは廃止。
- body.modal-open は使わない。
```

### 結果画面

```text
通常:
[同じレベルでつづける]
[ずかんをみる]
[メニューへもどる]

保存失敗:
[もういちどゲットする]

世代クリア:
[第◯世代クリア！]
```

## 6. 移行後の実データ確認結果

```text
りょうま:
第2世代（ジョウト）
0 / 100 ひき ゲットずみ

さら:
第1世代（カントー）
115 / 151 ひき ゲットずみ

ゲスト:
第3世代（ホウエン）
既存ダミーデータを維持
```

## 7. 今後の作業

```text
保守フェーズ:
- V2 Main運用観察
- 軽微なUX改善
- ドキュメント整合
- Firestoreデータ管理ルール整理
- コード分割検討
```

候補作業:

```text
- docs/review_checklist.md 作成
- index.html のコード分割検討
- CSS / JS 分離検討
- guest データ運用整理
- flavor の子ども向け再整備
```
