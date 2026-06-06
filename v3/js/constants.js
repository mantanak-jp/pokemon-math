(function() {
  "use strict";

  const USER_OPTIONS = {
    ryoma: { label: "りょうま" },
    sara: { label: "さら" },
    guest: { label: "ゲスト" }
  };

  const GENERATION_NAMES = [
    "",
    "第1世代（カントー）",
    "第2世代（ジョウト）",
    "第3世代（ホウエン）",
    "第4世代（シンオウ）",
    "第5世代（イッシュ）",
    "第6世代（カロス）",
    "第7世代（アローラ）",
    "第8世代（ガラル）",
    "第9世代（パルデア）"
  ];

  const GENERATION_REGION_NAMES = [
    "",
    "カントー",
    "ジョウト",
    "ホウエン",
    "シンオウ",
    "イッシュ",
    "カロス",
    "アローラ",
    "ガラル",
    "パルデア"
  ];

  const QUIZ_QUESTION_COUNT = 5;
  const QUIZ_NEXT_DELAY_MS = 1200;

  window.AppConstants = {
    USER_OPTIONS,
    GENERATION_NAMES,
    GENERATION_REGION_NAMES,
    QUIZ_QUESTION_COUNT,
    QUIZ_NEXT_DELAY_MS
  };
})();