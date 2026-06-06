(function() {
  "use strict";

  const constants = window.AppConstants;
  const state = window.AppState;
  const dom = window.AppDom;

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffleArray(values) {
    const shuffled = values.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = tmp;
    }
    return shuffled;
  }

  function makeQuestionForLevel(level) {
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
    } else {
      n1 = randomInt(1, 9);
      n2 = randomInt(1, 9);
      op = "×";
    }
    const answer = op === "+" ? n1 + n2 : (op === "-" ? n1 - n2 : n1 * n2);
    return { text: n1 + " " + op + " " + n2 + " = ?", answer };
  }

  function makeChoices(correctAnswer) {
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

  function resetAnswerButtons() {
    dom.answerButtons.forEach(function(button) {
      button.classList.remove("correct", "wrong");
      button.disabled = false;
      button.textContent = "?";
    });
  }

  function shouldShowGenerationStartForLevel() {
    if (!state.currentUserData || state.currentUserData.cleared_generations === 9) return false;
    if (new Set(state.currentUserData.current_gen_owned).size !== 0) return false;
    const generation = state.currentUserData.cleared_generations + 1;
    return !window.AppUI.hasShownGenerationStart(state.selectedUserId, generation);
  }

  function startLevelFlow(level) {
    if (!state.currentUserData) {
      window.AppUI.showScreen("user");
      return;
    }
    state.selectedLevel = level;
    if (shouldShowGenerationStartForLevel()) {
      window.AppUI.showGenerationStart(state.currentUserData.cleared_generations + 1, state.selectedLevel);
      return;
    }
    startQuiz(state.selectedLevel);
  }

  function startQuiz(level) {
    if (!state.currentUserData) {
      window.AppUI.showScreen("user");
      return;
    }
    state.selectedLevel = level;
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
    dom.quizGeneration.textContent = window.AppUI.getGenerationText(state.currentUserData.cleared_generations);
    window.AppFirestore.prefetchCurrentGenerationMaster(state.currentUserData);
    window.AppUI.showScreen("quiz");
    makeNextQuestion();
  }

  function makeNextQuestion() {
    state.isAnswered = false;
    resetAnswerButtons();
    dom.quizAlert.textContent = "";
    dom.quizAlert.className = "quiz-alert";
    state.currentQuestionIndex += 1;
    dom.quizCount.textContent = "だい " + state.currentQuestionIndex + " もん";
    dom.quizScore.textContent = "せいかい: " + state.correctCount;
    dom.quizProgress.style.width = ((state.currentQuestionIndex - 1) / constants.QUIZ_QUESTION_COUNT * 100) + "%";
    const question = makeQuestionForLevel(state.selectedLevel);
    state.currentCorrectAnswer = question.answer;
    dom.quizQuestion.textContent = question.text;
    const choices = makeChoices(state.currentCorrectAnswer);
    dom.answerButtons.forEach(function(button, index) {
      button.textContent = choices[index];
    });
  }

  function answerQuestion(button) {
    if (state.isAnswered) return;
    state.isAnswered = true;
    dom.answerButtons.forEach(function(answerButton) {
      answerButton.disabled = true;
    });
    const selectedAnswer = Number(button.textContent);
    if (selectedAnswer === state.currentCorrectAnswer) {
      state.correctCount += 1;
      button.classList.add("correct");
      dom.quizAlert.textContent = "⭕ せいかい！";
      dom.quizAlert.className = "quiz-alert success";
      dom.quizScore.textContent = "せいかい: " + state.correctCount;
    } else {
      button.classList.add("wrong");
      dom.answerButtons.forEach(function(answerButton) {
        if (Number(answerButton.textContent) === state.currentCorrectAnswer) {
          answerButton.classList.add("correct");
        }
      });
      dom.quizAlert.textContent = "❌ ざんねん！\nせいかいは " + state.currentCorrectAnswer;
      dom.quizAlert.className = "quiz-alert wrong";
    }
    state.quizTimerId = window.setTimeout(function() {
      state.quizTimerId = null;
      if (state.currentQuestionIndex < constants.QUIZ_QUESTION_COUNT) {
        makeNextQuestion();
      } else {
        window.AppReward.showResult();
      }
    }, constants.QUIZ_NEXT_DELAY_MS);
  }

  window.AppQuiz = {
    randomInt,
    shuffleArray,
    makeQuestionForLevel,
    makeChoices,
    resetAnswerButtons,
    shouldShowGenerationStartForLevel,
    startLevelFlow,
    startQuiz,
    makeNextQuestion,
    answerQuestion
  };
})();