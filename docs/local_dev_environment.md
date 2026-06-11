# Local Development Environment

最終更新: 2026-06-10

## 1. 目的

この文書は、PokeMath リポジトリで PC + Codex app + GitHub を使って作業するための初期開発環境と、ローカル表示確認方法を整理します。

E12 時点では、V4 開発開始前に環境構築メモを docs 化し、以後の Codex app 作業で同じ確認手順を再利用できる状態にすることを目的とします。

## 2. 環境準備フェーズ E0-E12 の位置づけ

E0-E12 は、V4 開発に入る前の開発環境・運用ルール・ドキュメント整備フェーズです。

このフェーズでは、実装を急がず、以下を優先します。

```text
- ローカル作業対象パスの確認
- Git / GitHub / Codex app の役割整理
- Main 直接変更を避ける branch 運用
- ローカル表示確認方法の標準化
- V4 開発前の計画整理
```

## 3. 導入済みツール

E12 時点で確認済みの主なツールは以下です。

| ツール | バージョン・状態 |
| --- | --- |
| Git for Windows | `git version 2.54.0.windows.1` |
| VS Code | `1.123.0 / x64` |
| Node.js | `v24.16.0` |
| npm | `11.13.0` |
| Codex app | 導入済み |

## 4. ローカルリポジトリ

作業対象のローカルリポジトリは以下です。

```text
C:\Users\manta\dev\pokemon-math
```

remote origin は以下です。

```text
https://github.com/mantanak-jp/pokemon-math.git
```

## 5. Git 基本設定

E12 時点の基本設定は以下です。

```text
user.name = mantanak
user.email = mantanak@gmail.com
core.editor = code --wait
```

## 6. Codex app 運用

Codex app で作業する前に、必ず作業対象パスを確認します。

```text
C:\Users\manta\dev\pokemon-math
```

Codex app の承認設定は「承認を求める」を基本とします。branch 作成、commit、push、PR 作成、merge などの状態変更操作は、ユーザーの明示承認に基づいて実行します。

詳細な運用ルールは以下を参照します。

```text
docs/codex_app_guardrails.md
```

## 7. ローカル表示確認方法

`file://` で HTML を直接開く方法は、正式な確認方法として採用しません。

理由は以下です。

```text
- JavaScript module の読み込み条件がブラウザや起動方法で変わる可能性がある
- fetch の挙動が HTTP 配信時と異なる可能性がある
- Firebase / Auth / Firestore の origin 制約で挙動が変わる可能性がある
- GitHub Pages 公開時の挙動と差が出る可能性がある
```

標準のローカル確認コマンドは以下です。

```powershell
cd "$HOME\dev\pokemon-math"
npx --yes http-server . -p 8080 -c-1
```

確認 URL は以下です。

```text
http://localhost:8080/
```

停止方法は、http-server を起動した PowerShell で `Ctrl + C` を押し、確認が出たら `Y` を入力します。

## 8. VS Code 拡張機能

E12 時点では、追加の VS Code 拡張機能は必須ではありません。

将来候補は以下です。

```text
- Markdown All in One
- markdownlint
- GitHub Pull Requests
- Live Server
```

ただし、現時点では npm / build / local server に強く依存する開発フローにはしません。

## 9. PowerShell と Codex app の役割分担

通常の確認作業は、できるだけ Codex app に寄せます。

```text
Codex app:
- リポジトリ状態確認
- ファイル内容確認
- docs 更新
- git status / git diff 確認
- 必要に応じたローカル検証補助

PowerShell / ユーザー:
- ブラウザ表示確認
- iPhone 実機確認
- GitHub 上での最終確認
- merge 判断
```

## 10. 作業終了時の手順

作業終了時は以下を確認します。

```text
1. http-server を起動している場合は停止する
2. Codex app は作業完了後に終了してよい
3. VS Code は作業完了後に終了してよい
4. localhost のブラウザタブを閉じる
5. git status を確認する
6. commit / push / PR 作成が必要な場合は、ユーザーが明示判断する
```

## 11. 注意事項

main への直接 push は禁止します。

commit、push、PR 作成、merge は明示承認制です。Codex app は、ユーザーが明示していない状態変更操作を行いません。

保護領域は、明示された Issue と承認なしに変更しません。

```text
- root index.html
- v3/
- canary/
- archive/
- README.md
- AGENTS.md
```
