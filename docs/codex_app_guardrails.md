# Codex app Guardrails

最終更新: 2026-06-09

## 1. Purpose

この文書は、PokeMath 開発で Codex app を安全に使うための初期運用ガードレールです。

目的は以下です。

```text
- 現行 Main と実ユーザーデータを壊さない
- Codex app のローカル作業範囲を明確にする
- commit / push / PR / merge の判断をユーザー承認のもとで行う
- 将来の worktree 多用に向けて、まず単純で安全な運用から始める
```

## 2. Current Operating Mode

現在の基本運用は `ChatGPT + Codex app + GitHub` です。

```text
ChatGPT:
- 計画
- 要件整理
- Step 管理
- レビュー
- Codex app 向け指示作成

Codex app:
- ローカルリポジトリ調査
- 実装
- ドキュメント更新
- 差分確認
- 検証補助

GitHub:
- リポジトリ正本
- branch 管理
- Pull Request 管理
- main 管理
- GitHub Pages 公開

User:
- 最終判断
- merge 判断
- 実機確認
- 実データに関わる判断
```

Codex Web版は、必要に応じて補助的に使う可能性があります。ただし、現在の初期運用では Codex app を主な実装・確認環境とします。

## 3. Initial Operating Rules

初期運用では、以下を基本とします。

```text
- 初期運用では、1タスクにつき1つの作業 branch で作業する
- 初期運用では、1タスクにつき1つの Codex thread で作業する
- Codex app の承認設定は「承認を求める」を使う
- worktree 多用は将来フェーズで検討する
- 仕様・影響範囲が不明な場合は、先に docs または ChatGPT 側で整理する
```

複数 branch / 複数 worktree / 複数 Codex thread を使う場合は、作業前に branch / worktree plan を作成します。

## 4. Path-Based Guardrails

作業パスごとの扱いは以下です。

```text
作成・変更可能:
- /v4
  - 今後の V4 開発領域として、明示されたタスク範囲内で Codex app に作成・変更判断を任せます。
- docs
  - 明示されたタスク範囲内で変更できます。

保護領域:
- root index.html
- /v3
- /canary
- /archive
- README.md
- AGENTS.md
```

保護領域は、ユーザーの明示承認なしに変更しません。

`AGENTS.md` は通常は保護領域です。ただし、2026-06-09 の E6-4 作業では、Codex app 初期運用ガードレールを反映するための最小更新のみ許可されています。

## 5. Git Operation Rules

Git 操作のルールは以下です。

```text
branch:
- ユーザーが指定した場合のみ作成・切り替えます。
- 同名 branch が存在する場合は、勝手に上書きせず報告して止めます。

commit:
- ユーザーが「commitまでOK」と明示した場合のみ行います。

push:
- ユーザーが push を明示指示した場合のみ行います。

Pull Request:
- ユーザーが PR 作成を明示指示した場合のみ作成します。

main:
- main への直接 push は禁止します。

merge:
- merge は必ずユーザー判断です。
- Codex app は明示指示なしに merge しません。
```

## 6. Required Checks Before Work

作業前に、以下を確認します。

```text
- Step 全体像
- 現在地
- 作業 branch
- git status
- 変更対象ファイル
- 変更してはいけないファイル
- 想定差分
- 確認方法
```

保護領域に触れる可能性がある場合は、作業前にユーザー承認を確認します。

## 7. Required Checks After Work

作業後に、以下を確認します。

```text
- 変更ファイル一覧
- git status
- git diff --stat
- 変更要約
- 検証結果
- 残リスク・不明点
```

PR 作成前には、変更ファイルが許可範囲内であることを確認します。

## 8. Future Worktree Policy

将来的には、Codex app の worktree を使って以下のように役割分担する可能性があります。

```text
- implementation Agent
- docs Agent
- review Agent
```

ただし、現時点では worktree は作成しません。

worktree を使う場合は、事前に以下を整理します。

```text
- branch / worktree plan
- 各 worktree の目的
- 変更可能ファイル
- 変更禁止ファイル
- merge / PR への統合手順
- 衝突時の扱い
```
