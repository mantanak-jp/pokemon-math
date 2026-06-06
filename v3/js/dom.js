(function() {
  "use strict";

  const appShell = document.getElementById("app-shell");
  const screens = {
    title: document.getElementById("screen-title"),
    user: document.getElementById("screen-user"),
    loading: document.getElementById("screen-loading"),
    menu: document.getElementById("screen-menu"),
    quiz: document.getElementById("screen-quiz"),
    result: document.getElementById("screen-result"),
    generationStart: document.getElementById("screen-generation-start"),
    generationClear: document.getElementById("screen-generation-clear"),
    allComplete: document.getElementById("screen-all-complete"),
    zukan: document.getElementById("screen-zukan"),
    error: document.getElementById("screen-error")
  };

  const startButton = document.getElementById("start-button");
  const loadingMainMessage = document.getElementById("loading-main-message");
  const loadingUserName = document.getElementById("loading-user-name");
  const menuDisplayName = document.getElementById("menu-display-name");
  const menuProgress = document.getElementById("menu-progress");
  const placeholderMessage = document.getElementById("placeholder-message");
  const quizGeneration = document.getElementById("quiz-generation");
  const quizCount = document.getElementById("quiz-count");
  const quizScore = document.getElementById("quiz-score");
  const quizProgress = document.getElementById("quiz-progress");
  const quizQuestion = document.getElementById("quiz-question");
  const quizAlert = document.getElementById("quiz-alert");
  const answerButtons = Array.from(document.querySelectorAll(".answer-button"));
  const resultScore = document.getElementById("result-score");
  const resultRewardImages = document.getElementById("result-reward-images");
  const resultMessage = document.getElementById("result-message");
  const resultSaveStatus = document.getElementById("result-save-status");
  const retryRewardButton = document.getElementById("retry-reward-button");
  const resultClearButton = document.getElementById("result-clear-button");
  const resultCompleteButton = document.getElementById("result-complete-button");
  const resultRetryButton = document.getElementById("result-retry-button");
  const resultZukanButton = document.getElementById("result-zukan-button");
  const resultMenuButton = document.getElementById("result-menu-button");
  const generationStartTitle = document.getElementById("generation-start-title");
  const generationStartMessage = document.getElementById("generation-start-message");
  const generationStartButton = document.getElementById("generation-start-button");
  const generationClearTitle = document.getElementById("generation-clear-title");
  const generationClearMessage = document.getElementById("generation-clear-message");
  const generationClearContinueButton = document.getElementById("generation-clear-continue-button");
  const generationClearZukanButton = document.getElementById("generation-clear-zukan-button");
  const allCompleteMessage = document.getElementById("all-complete-message");
  const zukanTabs = document.getElementById("zukan-tabs");
  const zukanGenerationName = document.getElementById("zukan-generation-name");
  const zukanGenerationCount = document.getElementById("zukan-generation-count");
  const zukanMessage = document.getElementById("zukan-message");
  const zukanGrid = document.getElementById("zukan-grid");
  const pokemonModalBackdrop = document.getElementById("pokemon-modal-backdrop");
  const pokemonModalPanel = document.querySelector(".pokemon-modal");
  const modalPokemonName = document.getElementById("modal-pokemon-name");
  const modalPokemonImage = document.getElementById("modal-pokemon-image");
  const modalPokemonTypes = document.getElementById("modal-pokemon-types");
  const modalPokemonHeight = document.getElementById("modal-pokemon-height");
  const modalPokemonWeight = document.getElementById("modal-pokemon-weight");
  const modalPokemonFlavor = document.getElementById("modal-pokemon-flavor");
  const errorMessage = document.getElementById("error-message");
  const retryButton = document.getElementById("retry-button");

  window.AppDom = {
    appShell, screens, startButton, loadingMainMessage, loadingUserName, menuDisplayName, menuProgress, placeholderMessage, quizGeneration, quizCount, quizScore, quizProgress, quizQuestion, quizAlert, answerButtons, resultScore, resultRewardImages, resultMessage, resultSaveStatus, retryRewardButton, resultClearButton, resultCompleteButton, resultRetryButton, resultZukanButton, resultMenuButton, generationStartTitle, generationStartMessage, generationStartButton, generationClearTitle, generationClearMessage, generationClearContinueButton, generationClearZukanButton, allCompleteMessage, zukanTabs, zukanGenerationName, zukanGenerationCount, zukanMessage, zukanGrid, pokemonModalBackdrop, pokemonModalPanel, modalPokemonName, modalPokemonImage, modalPokemonTypes, modalPokemonHeight, modalPokemonWeight, modalPokemonFlavor, errorMessage, retryButton
  };
})();