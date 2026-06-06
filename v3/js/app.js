(function() {
  "use strict";

  const state = window.AppState;
  const dom = window.AppDom;

    function setupEvents() {
      dom.startButton.addEventListener("click", function() {
        if (!state.firebaseReady) {
          window.AppUI.showError("Firebaseのじゅんびが まだできていません。");
          return;
        }
        window.AppUI.showScreen("user");
      });
      document.querySelectorAll("[data-user-id]").forEach(function(button) {
        button.addEventListener("click", function() {
          window.AppFirestore.loadUserData(button.dataset.userId);
        });
      });
      document.querySelectorAll("[data-level]").forEach(function(button) {
        button.addEventListener("click", function() {
          window.AppQuiz.startLevelFlow(Number(button.dataset.level));
        });
      });
      dom.answerButtons.forEach(function(button) {
        button.addEventListener("click", function() {
          window.AppQuiz.answerQuestion(button);
        });
      });
      document.getElementById("user-back-button").addEventListener("click", function() { window.AppUI.showScreen("title"); });
      document.getElementById("open-zukan-button").addEventListener("click", window.AppZukan.openZukan);
      document.getElementById("zukan-menu-button").addEventListener("click", function() { window.AppUI.renderFastMenu(state.currentUserData); });
      dom.pokemonModalBackdrop.addEventListener("click", window.AppZukan.closePokemonModal);
      dom.pokemonModalPanel.addEventListener("click", function(event) {
        event.stopPropagation();
      });
      document.getElementById("modal-close-button").addEventListener("click", window.AppZukan.closePokemonModal);
      document.getElementById("change-user-button").addEventListener("click", function() {
        state.selectedUserId = null;
        state.selectedUserLabel = "";
        state.currentUserData = null;
        state.currentGeneration = null;
        state.selectedZukanGeneration = null;
        state.pendingRewardPokemon = [];
        state.pendingRewardPokemonList = [];
        state.lastProgressResult = null;
        state.generationStartTarget = null;
        window.AppFirestore.resetCachedMaster();
        window.AppZukan.closePokemonModal();
        window.AppUI.showScreen("user");
      });
      dom.resultRetryButton.addEventListener("click", function() {
        if (state.isSavingReward) return;
        window.AppQuiz.startQuiz(state.selectedLevel);
      });
      dom.resultZukanButton.addEventListener("click", function() {
        if (state.isSavingReward) return;
        window.AppZukan.openZukan();
      });
      dom.resultMenuButton.addEventListener("click", function() {
        if (state.isSavingReward) return;
        window.AppUI.renderFastMenu(state.currentUserData);
      });
      dom.resultClearButton.addEventListener("click", function() {
        if (state.isSavingReward) return;
        window.AppUI.showGenerationClear();
      });
      dom.resultCompleteButton.addEventListener("click", function() {
        if (state.isSavingReward) return;
        window.AppUI.showAllComplete();
      });
      dom.generationStartButton.addEventListener("click", function() {
        window.AppQuiz.startQuiz(state.generationStartLevel || state.selectedLevel);
      });
      document.getElementById("generation-start-menu-button").addEventListener("click", function() {
        window.AppUI.renderFastMenu(state.currentUserData);
      });
      dom.generationClearContinueButton.addEventListener("click", window.AppUI.continueAfterGenerationClear);
      dom.generationClearZukanButton.addEventListener("click", window.AppZukan.openZukanForUnlockedGeneration);
      document.getElementById("generation-clear-menu-button").addEventListener("click", function() {
        window.AppUI.renderFastMenu(state.currentUserData);
      });
      document.getElementById("all-complete-quiz-button").addEventListener("click", function() {
        window.AppQuiz.startQuiz(state.selectedLevel);
      });
      document.getElementById("all-complete-zukan-button").addEventListener("click", window.AppZukan.openZukanForAllComplete);
      document.getElementById("all-complete-menu-button").addEventListener("click", function() {
        window.AppUI.renderFastMenu(state.currentUserData);
      });
      dom.retryRewardButton.addEventListener("click", function() {
        if (state.isSavingReward) return;
        if (state.pendingRewardPokemon.length > 0) {
          window.AppReward.handleRewardSave();
        } else {
          window.AppReward.showResult();
        }
      });
      dom.retryButton.addEventListener("click", window.AppFirestore.retryLoadUserData);
      document.getElementById("error-user-button").addEventListener("click", function() { window.AppUI.showScreen("user"); });
    }

  setupEvents();
  window.AppFirestore.initFirebase();
})();