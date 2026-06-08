# V3.1 / Phase 3 算数レベル5・6 実装設計

作成日: 2026-06-08  
対象: `v3/`  
位置づけ: V3.1 / Phase 3 算数拡張実装前設計

## 1. 全体像と現在地

```text
V3 Phase 1: 完了
V3 Phase 2: ES Modules化完了
V3 Phase 3 / V3.1: 算数レベル5・6追加 + main昇格判断 ← 本ドキュメント
V3 Phase 4 / V3.2: 国旗クイズ追加予定
```

V3.1 / Phase 3では、国旗クイズや `country_masters` は扱わない。

本ドキュメントは、V3.1 / Phase 3で実装する算数レベル5・6の設計を定義する。

## 2. 目的

V3.1 / Phase 3では、既存の算数クイズ仕様を維持しながら、割り算クイズを追加する。

```text
目的:
- 既存レベル1〜4を壊さない
- レベル5として九九のわり算を追加する
- レベル6として2けた ÷ 1けた の余りなし割り算を追加する
- 既存の5問・4択・報酬・図鑑仕様を維持する
- 実機確認後、V3の main昇格判断へ進める状態にする
```

## 3. 現行構造

### 3.1 レベル選択UI

現行の `v3/index.html` では、メニュー画面にレベル1〜4のボタンが直接表示されている。

```html
<button class="level-button" type="button" data-level="1">レベル 1（1けたの たし・ひき）</button>
<button class="level-button" type="button" data-level="2">レベル 2（2けた と 1けた）</button>
<button class="level-button" type="button" data-level="3">レベル 3（2けたの たし・ひき）</button>
<button class="level-button" type="button" data-level="4">レベル 4（かけざん 九九）</button>
```

### 3.2 イベント登録

現行の `v3/js/app.js` では、`[data-level]` を持つボタンに一括でイベント登録している。

```js
document.querySelectorAll("[data-level]").forEach(function(button) {
  button.addEventListener("click", function() {
    startLevelFlow(Number(button.dataset.level));
  });
});
```

そのため、`v3/index.html` に `data-level="5"` / `data-level="6"` のボタンを追加すれば、イベント登録側は基本的に変更不要である。

### 3.3 問題生成

現行の `v3/js/quiz.js` では、`makeQuestionForLevel(level)` に問題生成が集約されている。

現状は以下の分岐である。

```text
level === 1: 1けたの たし・ひき
level === 2: 2けた と 1けた
level === 3: 2けたの たし・ひき
else: かけざん 九九
```

重要な注意点として、現行実装では `level === 1/2/3` 以外がすべて掛け算扱いになる。

そのため、レベル5・6のUIボタンだけを追加すると、レベル5・6も掛け算として出題されてしまう。

## 4. V3.1 の実装方針

V3.1では、国旗クイズを扱わないため、クイズエンジンの大規模な汎用化は行わない。

```text
やる:
- レベル選択UIにレベル5・6を追加する
- makeQuestionForLevel(level) に level 5 / 6 の分岐を追加する
- 既存の makeChoices(correctAnswer) を流用する
- 既存の正誤判定・報酬・図鑑処理を維持する

やらない:
- クイズ種別選択
- こっきクイズ
- country_masters
- choices label/value 構造への移行
- imageUrl 対応
- quizId ベースの大規模整理
```

## 5. レベル5: 九九のわり算

### 5.1 目的

九九の逆算として、余りのない割り算を出題する。

### 5.2 問題例

```text
12 ÷ 3 = ?
24 ÷ 6 = ?
56 ÷ 7 = ?
```

### 5.3 生成ルール

```text
答え: 1〜9
割る数: 1〜9
割られる数: 答え × 割る数
```

### 5.4 実装イメージ

```js
function makeKukuDivisionQuestion() {
  const answer = randomInt(1, 9);
  const divisor = randomInt(1, 9);
  const dividend = answer * divisor;

  return {
    text: dividend + " ÷ " + divisor + " = ?",
    answer
  };
}
```

### 5.5 要件

```text
1. 必ず割り切れること
2. 答えは1〜9であること
3. 割る数は1〜9であること
4. 4択で回答できること
5. 既存の報酬仕様に乗ること
6. 不正解時に正解が表示されること
```

## 6. レベル6: 2けた ÷ 1けた の余りなし割り算

### 6.1 目的

九九のわり算の次段階として、2けたの数を1けたで割る問題を出題する。

### 6.2 問題例

```text
36 ÷ 3 = ?
48 ÷ 4 = ?
84 ÷ 7 = ?
96 ÷ 8 = ?
```

### 6.3 生成ルール

初期版では、難易度を抑える。

```text
割る数: 2〜9
答え: 2〜12
割られる数: 割る数 × 答え
条件: 割られる数が2けたであること
```

### 6.4 実装イメージ

```js
function makeTwoDigitDivisionQuestion() {
  let answer;
  let divisor;
  let dividend;

  do {
    answer = randomInt(2, 12);
    divisor = randomInt(2, 9);
    dividend = answer * divisor;
  } while (dividend < 10 || dividend > 99);

  return {
    text: dividend + " ÷ " + divisor + " = ?",
    answer
  };
}
```

### 6.5 要件

```text
1. 必ず割り切れること
2. 割られる数は2けたであること
3. 割る数は1けたであること
4. 初期版では答えは2〜12に抑えること
5. 4択で回答できること
6. 既存の報酬仕様に乗ること
7. 不正解時に正解が表示されること
```

## 7. makeQuestionForLevel の分岐方針

V3.1では、`makeQuestionForLevel(level)` を以下のように明示的な分岐へ整理する。

```text
level === 1: 1けたの たし・ひき
level === 2: 2けた と 1けた
level === 3: 2けたの たし・ひき
level === 4: かけざん 九九
level === 5: 九九のわり算
level === 6: 2けた ÷ 1けた の余りなし割り算
その他: level 4 相当、または安全なフォールバック
```

現行の `else` で掛け算へ流す実装は、レベル5・6追加後には誤動作の原因になる。

そのため、少なくとも level 4 / 5 / 6 を明示的に分離する。

## 8. 選択肢生成方針

V3.1では、既存の `makeChoices(correctAnswer)` を流用する。

現行仕様では、正解値の周辺 `-4` 〜 `+4` を候補にし、4択を作る。

```text
例:
正解 8 → 4〜12付近から誤答候補
正解 12 → 8〜16付近から誤答候補
```

レベル5・6の答えは主に1〜12の範囲なので、既存の数値4択生成で十分対応可能と判断する。

ただし、正解が1の場合、候補は0以上に制限されるため、`0` が選択肢に入る可能性がある。初期実装では許容する。

将来的に子ども向けの自然さを上げる場合は、割り算専用の誤答生成を検討できる。

## 9. 正誤判定・報酬・図鑑

V3.1では、既存処理を維持する。

```text
正誤判定:
- Number(button.textContent) と state.currentCorrectAnswer を比較

正解時:
- correct 表示
- 正解数加算

不正解時:
- wrong 表示
- 正解ボタンを correct 表示
- 「せいかいは X」を表示

報酬:
- 5問中4問以上正解で報酬処理

図鑑:
- 既存仕様を維持
```

レベル5・6の正解も数値であるため、既存の `Number(button.textContent)` ベースの判定を維持できる。

## 10. UI変更範囲

V3.1では、`v3/index.html` のレベル選択ボタンを追加する。

追加するボタン案:

```html
<button class="level-button" type="button" data-level="5">レベル 5（九九の わり算）</button>
<button class="level-button" type="button" data-level="6">レベル 6（2けた ÷ 1けた）</button>
```

V3.1では、クイズ種別選択画面は追加しない。

## 11. 変更対象ファイル

想定される変更対象は以下。

```text
v3/index.html
v3/js/quiz.js
```

必要に応じて以下を確認する。

```text
v3/js/app.js
v3/js/state.js
v3/js/constants.js
v3/css/app.css
```

ただし、現時点の確認では、`app.js` は `[data-level]` 一括イベント登録のため変更不要見込みである。

## 12. 変更しないもの

V3.1 / Phase 3では、以下を変更しない。

```text
- root index.html
- canary/
- archive/
- Firestoreデータ構造
- users_v2
- users
- masters/gen_{1..9}
- ryoma / sara の実データ
- country_masters
- 国旗クイズ
- クイズ種別選択
- 報酬保存構造
- 図鑑保存構造
```

## 13. テスト観点

### 13.1 レベル選択

```text
- レベル1〜6がメニューに表示される
- レベル1を選択できる
- レベル2を選択できる
- レベル3を選択できる
- レベル4を選択できる
- レベル5を選択できる
- レベル6を選択できる
```

### 13.2 問題生成

```text
レベル5:
- 「÷」を含む問題が出る
- 割られる数 = 答え × 割る数 になっている
- 答えが1〜9に収まる

レベル6:
- 「÷」を含む問題が出る
- 割られる数が2けた
- 割る数が2〜9
- 答えが2〜12
- 余りが出ない
```

### 13.3 クイズ共通

```text
- 5問進行する
- 正解時に correct 表示される
- 不正解時に wrong 表示される
- 不正解時に正解ボタンが correct 表示される
- 不正解時に「せいかいは X」が表示される
- 5問中4問以上正解で報酬処理に進む
- 図鑑を開ける
- メニューへ戻れる
```

### 13.4 回帰確認

```text
- 既存レベル1〜4が従来通り動作する
- 報酬・図鑑・世代進行が壊れていない
- guestで確認できる
- ryoma / sara は不用意に変更しない
```

## 14. 推奨PR分割

V3.1の算数レベル追加は小さめの差分で済む見込みのため、実装PRは1本でよい。

```text
PR 1:
算数レベル5・6追加
- v3/index.html
- v3/js/quiz.js

PR 2:
実機確認後の軽微修正があれば別PR

PR 3:
Phase 3完了報告・docs更新
```

## 15. main昇格判断との関係

V3.1 / Phase 3 の実装・実機確認が完了したら、main昇格判断に進む。

main昇格は、Phase 3実装PRとは別に行う。

```text
Phase 3実装:
/pokemon-math/v3/ にレベル5・6を追加

Phase 3完了:
実機確認・完了報告

main昇格:
root index.html への反映方針を別途整理し、別PRで実施
```

## 16. 完了条件

この設計に基づくV3.1 / Phase 3実装は、以下を満たしたら完了とする。

```text
1. レベル1〜6が表示される
2. レベル5が九九のわり算として出題される
3. レベル6が2けた ÷ 1けたの余りなし割り算として出題される
4. レベル1〜4が従来通り動作する
5. 5問進行する
6. 正解・不正解表示が動作する
7. 4問以上正解で報酬処理される
8. 図鑑・世代進行が壊れていない
9. guestで実機確認済み
10. Firestore既存構造を変更していない
```
