import {
  QUIZ_QUESTION_COUNT,
  QUIZ_NEXT_DELAY_MS
} from "./constants.js";
import { state } from "./state.js";
import { dom } from "./dom.js";
import { randomInt, shuffleArray } from "./utils.js";
import {
  getGenerationText,
  hasShownGenerationStart,
  showGenerationStart,
  showScreen
} from "./ui.js";
import {
  getEnabledCountryMasters,
  prefetchCurrentGenerationMaster
} from "./firestore.js";
import {
  showFlagRewardResult,
  showResult
} from "./reward.js";

export function makeQuestionForLevel(level) {
  let n1;
  let n2;
  let op = "+";
  if (level === 1) {
    n1 = randomInt(1, 9);
    n2 = randomInt(1, 9);
    if (Math.random() > 0.5 && n1 >= n2) op = "-";
  } else if (level === 2) {
    n1 = randomInt(10, 29);
    n2 = randomInt(1, 9);
    if (Math.random() > 0.5) op = "-";
  } else if (level === 3) {
    n1 = randomInt(20, 69);
    n2 = randomInt(10, 49);
    if (Math.random() > 0.5 && n1 >= n2) op = "-";
  } else if (level === 4) {
    n1 = randomInt(1, 9);
    n2 = randomInt(1, 9);
    op = "×";
  } else if (level === 5) {
    return makeKukuDivisionQuestion();
  } else if (level === 6) {
    return makeTwoDigitDivisionQuestion();
  } else {
    n1 = randomInt(1, 9);
    n2 = randomInt(1, 9);
    op = "×";
  }
  const answer = op === "+" ? n1 + n2 : (op === "-" ? n1 - n2 : n1 * n2);
  return { text: n1 + " " + op + " " + n2 + " = ?", answer };
}

export function makeKukuDivisionQuestion() {
  const answer = randomInt(1, 9);
  const divisor = randomInt(1, 9);
  const dividend = answer * divisor;
  return { text: dividend + " ÷ " + divisor + " = ?", answer };
}

export function makeTwoDigitDivisionQuestion() {
  const candidates = [];
  for (let answer = 10; answer <= 24; answer++) {
    for (let divisor = 2; divisor <= 9; divisor++) {
      const dividend = answer * divisor;
      if (dividend >= 10 && dividend <= 99) {
        candidates.push({ dividend, divisor, answer });
      }
    }
  }
  const question = candidates[randomInt(0, candidates.length - 1)];
  return { text: question.dividend + " ÷ " + question.divisor + " = ?", answer: question.answer };
}

export function makeChoices(correctAnswer) {
  const choices = [correctAnswer];
  const candidates = [];
  for (let diff = -4; diff <= 4; diff++) {
    const candidate = correctAnswer + diff;
    if (candidate >= 0 && candidate !== correctAnswer) {
      candidates.push(candidate);
    }
  }
  shuffleArray(candidates).forEach(function(candidate) {
    if (choices.length < 4 && !choices.includes(candidate)) {
      choices.push(candidate);
    }
  });
  let fallback = 0;
  while (choices.length < 4) {
    if (!choices.includes(fallback)) {
      choices.push(fallback);
    }
    fallback += 1;
  }
  return shuffleArray(choices);
}

export function resetAnswerButtons() {
  dom.answerButtons.forEach(function(button) {
    button.classList.remove("correct", "wrong");
    button.disabled = false;
    button.textContent = "?";
    button.removeAttribute("data-country-id");
  });
}

export function shouldShowGenerationStartForLevel() {
  if (!state.currentUserData || state.currentUserData.cleared_generations === 9) return false;
  if (new Set(state.currentUserData.current_gen_owned).size !== 0) return false;
  const generation = state.currentUserData.cleared_generations + 1;
  return !hasShownGenerationStart(state.selectedUserId, generation);
}

export function startLevelFlow(level) {
  if (!state.currentUserData) {
    showScreen("user");
    return;
  }
  state.selectedLevel = level;
  if (shouldShowGenerationStartForLevel()) {
    showGenerationStart(state.currentUserData.cleared_generations + 1, state.selectedLevel);
    return;
  }
  startQuiz(state.selectedLevel);
}

export function startQuiz(level) {
  if (!state.currentUserData) {
    showScreen("user");
    return;
  }
  state.selectedLevel = level;
  state.quizType = "math";
  state.currentQuestionIndex = 0;
  state.correctCount = 0;
  state.isAnswered = false;
  state.pendingRewardPokemon = [];
  state.pendingRewardPokemonList = [];
  state.isSavingReward = false;
  state.lastProgressResult = null;
  if (state.quizTimerId) window.clearTimeout(state.quizTimerId);
  state.quizTimerId = null;
  dom.quizScore.textContent = "せいかい: 0";
  dom.quizAlert.textContent = "";
  dom.quizAlert.className = "quiz-alert";
  dom.answerGrid.classList.remove("flag-choices");
  dom.quizQuestion.classList.remove("flag-question-text");
  dom.flagQuizImageWrap.classList.add("hidden");
  dom.flagQuizImage.removeAttribute("src");
  dom.flagQuizImage.alt = "";
  dom.quizGeneration.textContent = getGenerationText(state.currentUserData.cleared_generations);
  prefetchCurrentGenerationMaster(state.currentUserData);
  showScreen("quiz");
  makeNextQuestion();
}

export async function startFlagQuiz() {
  if (!state.currentUserData) {
    showScreen("user");
    return;
  }
  if (!state.firebaseReady || !state.db) {
    dom.placeholderMessage.textContent = "Firebaseのじゅんびが まだできていません。";
    dom.placeholderMessage.classList.add("show");
    return;
  }

  state.quizType = "flag";
  state.currentQuestionIndex = 0;
  state.correctCount = 0;
  state.currentCorrectAnswer = "";
  state.currentCorrectCountryId = "";
  state.currentFlagQuestion = null;
  state.flagQuestions = [];
  state.isAnswered = false;
  state.pendingRewardPokemon = [];
  state.pendingRewardPokemonList = [];
  state.isSavingReward = false;
  state.lastProgressResult = null;
  if (state.quizTimerId) window.clearTimeout(state.quizTimerId);
  state.quizTimerId = null;

  dom.quizGeneration.textContent = "こっきクイズ";
  dom.quizScore.textContent = "せいかい: 0";
  dom.quizAlert.textContent = "";
  dom.quizAlert.className = "quiz-alert";
  dom.quizQuestion.textContent = "こっきを よみこみ中...";
  dom.answerGrid.classList.add("flag-choices");
  dom.quizQuestion.classList.add("flag-question-text");
  dom.flagQuizImageWrap.classList.add("hidden");
  resetAnswerButtons();
  dom.answerButtons.forEach(function(button) {
    button.disabled = true;
  });
  showScreen("quiz");

  try {
    const countries = await getEnabledCountryMasters();
    if (!countries || countries.length < 5) {
      throw new Error("こっきクイズの データが たりません。");
    }
    state.flagQuestions = makeFlagQuestions(countries);
    makeNextFlagQuestion();
  } catch (error) {
    dom.quizAlert.textContent = "こっきデータを よみこめませんでした。\nメニューへ もどります。";
    dom.quizAlert.className = "quiz-alert wrong";
    state.quizTimerId = window.setTimeout(function() {
      state.quizTimerId = null;
      renderFastMenuFallback();
    }, QUIZ_NEXT_DELAY_MS);
  }
}

function renderFastMenuFallback() {
  if (window.AppUI && typeof window.AppUI.renderFastMenu === "function" && state.currentUserData) {
    window.AppUI.renderFastMenu(state.currentUserData);
  } else {
    showScreen("menu");
  }
}

export function makeFlagQuestions(countries) {
  const enabledCountries = countries.filter(function(country) {
    return country && country.enabled === true && country.country_name_ja && country.flag_url;
  });
  const answers = shuffleArray(enabledCountries).slice(0, QUIZ_QUESTION_COUNT);
  return answers.map(function(answer) {
    const dummyCandidates = enabledCountries.filter(function(country) {
      return country.country_id !== answer.country_id && country.country_name_ja !== answer.country_name_ja;
    });
    const choices = [answer].concat(shuffleArray(dummyCandidates).slice(0, 3));
    return {
      answer,
      choices: shuffleArray(choices)
    };
  });
}

export function makeNextQuestion() {
  if (state.quizType === "flag") {
    makeNextFlagQuestion();
    return;
  }
  state.isAnswered = false;
  resetAnswerButtons();
  dom.answerGrid.classList.remove("flag-choices");
  dom.quizQuestion.classList.remove("flag-question-text");
  dom.flagQuizImageWrap.classList.add("hidden");
  dom.flagQuizImage.removeAttribute("src");
  dom.flagQuizImage.alt = "";
  dom.quizAlert.textContent = "";
  dom.quizAlert.className = "quiz-alert";
  state.currentQuestionIndex += 1;
  dom.quizCount.textContent = "だい " + state.currentQuestionIndex + " もん";
  dom.quizScore.textContent = "せいかい: " + state.correctCount;
  dom.quizProgress.style.width = ((state.currentQuestionIndex - 1) / QUIZ_QUESTION_COUNT * 100) + "%";
  const question = makeQuestionForLevel(state.selectedLevel);
  state.currentCorrectAnswer = question.answer;
  dom.quizQuestion.textContent = question.text;
  const choices = makeChoices(state.currentCorrectAnswer);
  dom.answerButtons.forEach(function(button, index) {
    button.textContent = choices[index];
  });
}

export function makeNextFlagQuestion() {
  state.isAnswered = false;
  resetAnswerButtons();
  dom.answerGrid.classList.add("flag-choices");
  dom.quizQuestion.classList.add("flag-question-text");
  dom.quizAlert.textContent = "";
  dom.quizAlert.className = "quiz-alert";
  state.currentQuestionIndex += 1;
  dom.quizCount.textContent = "だい " + state.currentQuestionIndex + " もん";
  dom.quizScore.textContent = "せいかい: " + state.correctCount;
  dom.quizProgress.style.width = ((state.currentQuestionIndex - 1) / QUIZ_QUESTION_COUNT * 100) + "%";

  const question = state.flagQuestions[state.currentQuestionIndex - 1];
  state.currentFlagQuestion = question;
  state.currentCorrectCountryId = question.answer.country_id;
  state.currentCorrectAnswer = question.answer.country_name_ja;
  dom.quizGeneration.textContent = "こっきクイズ";
  dom.quizQuestion.textContent = "この こっきは どこの くに？";
  dom.flagQuizImage.onload = function() {
    dom.flagQuizImageWrap.classList.remove("hidden");
  };
  dom.flagQuizImage.onerror = function() {
    dom.flagQuizImageWrap.classList.add("hidden");
    dom.quizAlert.textContent = "こっきの がぞうを よみこめませんでした。\nメニューへ もどります。";
    dom.quizAlert.className = "quiz-alert wrong";
    dom.answerButtons.forEach(function(button) {
      button.disabled = true;
    });
    state.quizTimerId = window.setTimeout(function() {
      state.quizTimerId = null;
      renderFastMenuFallback();
    }, QUIZ_NEXT_DELAY_MS);
  };
  dom.flagQuizImage.src = question.answer.flag_url;
  dom.flagQuizImage.alt = question.answer.country_name_ja + "の国旗";

  question.choices.forEach(function(country, index) {
    const button = dom.answerButtons[index];
    button.textContent = country.country_name_ja;
    button.dataset.countryId = country.country_id;
  });
}

export function answerQuestion(button) {
  if (state.isAnswered) return;
  state.isAnswered = true;
  dom.answerButtons.forEach(function(answerButton) {
    answerButton.disabled = true;
  });
  const selectedAnswer = state.quizType === "flag" ? button.dataset.countryId : Number(button.textContent);
  const isCorrect = state.quizType === "flag"
    ? selectedAnswer === state.currentCorrectCountryId
    : selectedAnswer === state.currentCorrectAnswer;
  if (isCorrect) {
    state.correctCount += 1;
    button.classList.add("correct");
    dom.quizAlert.textContent = "⭕ せいかい！";
    dom.quizAlert.className = "quiz-alert success";
    dom.quizScore.textContent = "せいかい: " + state.correctCount;
  } else {
    button.classList.add("wrong");
    dom.answerButtons.forEach(function(answerButton) {
      const answerValue = state.quizType === "flag" ? answerButton.dataset.countryId : Number(answerButton.textContent);
      const correctValue = state.quizType === "flag" ? state.currentCorrectCountryId : state.currentCorrectAnswer;
      if (answerValue === correctValue) {
        answerButton.classList.add("correct");
      }
    });
    dom.quizAlert.textContent = "❌ ざんねん！\nせいかいは " + state.currentCorrectAnswer;
    dom.quizAlert.className = "quiz-alert wrong";
  }
  state.quizTimerId = window.setTimeout(function() {
    state.quizTimerId = null;
    if (state.currentQuestionIndex < QUIZ_QUESTION_COUNT) {
      if (state.quizType === "flag") {
        makeNextFlagQuestion();
      } else {
        makeNextQuestion();
      }
    } else {
      if (state.quizType === "flag") {
        showFlagRewardResult();
      } else {
        showResult();
      }
    }
  }, QUIZ_NEXT_DELAY_MS);
}

window.AppQuiz = {
  randomInt,
  shuffleArray,
  makeQuestionForLevel,
  makeKukuDivisionQuestion,
  makeTwoDigitDivisionQuestion,
  makeChoices,
  resetAnswerButtons,
  shouldShowGenerationStartForLevel,
  startLevelFlow,
  startQuiz,
  startFlagQuiz,
  makeFlagQuestions,
  makeNextQuestion,
  makeNextFlagQuestion,
  answerQuestion
};
