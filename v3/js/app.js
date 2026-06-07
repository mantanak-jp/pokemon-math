import { state } from "./state.js";
import { dom } from "./dom.js";
import { formatDevBuildInfo } from "./version.js";
import {
  continueAfterGenerationClear,
  renderFastMenu,
  showAllComplete,
  showError,
  showGenerationClear,
  showScreen
} from "./ui.js";
import {
  loadUserData,
  resetCachedMaster,
  retryLoadUserData
} from "./firestore.js";
import {
  answerQuestion,
  startLevelFlow,
  startQuiz
} from "./quiz.js";
import {
  handleRewardSave,
  showResult
} from "./reward.js";
import {
  closePokemonModal,
  openZukan,
  openZukanForAllComplete,
  openZukanForUnlockedGeneration
} from "./zukan.js";

function renderDevBuildInfo() {
  let buildInfo = dom.devBuildInfo;
  if (!buildInfo) {
    const firebaseStatus = document.getElementById("firebase-status");
    if (!firebaseStatus || !firebaseStatus.parentElement) return;

    buildInfo = document.createElement("p");
    buildInfo.id = "dev-build-info";
    buildInfo.className = "small";
    firebaseStatus.parentElement.appendChild(buildInfo);
  }
  buildInfo.textContent = formatDevBuildInfo();
}

export function setupEvents() {
  renderDevBuildInfo();

  dom.startButton.addEventListener("click", function() {
    if (!state.firebaseReady) {
      showError("Firebaseのじゅんびが まだできていません。");
      return;
    }
    showScreen("user");
  });

  document.querySelectorAll("[data-user-id]").forEach(function(button) {
    button.addEventListener("click", function() {
      loadUserData(button.dataset.userId);
    });
  });

  document.querySelectorAll("[data-level]").forEach(function(button) {
    button.addEventListener("click", function() {
      startLevelFlow(Number(button.dataset.level));
    });
  });

  dom.answerButtons.forEach(function(button) {
    button.addEventListener("click", function() {
      answerQuestion(button);
    });
  });

  document.getElementById("user-back-button").addEventListener("click", function() { showScreen("title"); });
  document.getElementById("open-zukan-button").addEventListener("click", openZukan);
  document.getElementById("zukan-menu-button").addEventListener("click", function() { renderFastMenu(state.currentUserData); });
  dom.pokemonModalBackdrop.addEventListener("click", closePokemonModal);
  dom.pokemonModalPanel.addEventListener("click", function(event) {
    event.stopPropagation();
  });
  document.getElementById("modal-close-button").addEventListener("click", closePokemonModal);

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
    resetCachedMaster();
    closePokemonModal();
    showScreen("user");
  });

  dom.resultRetryButton.addEventListener("click", function() {
    if (state.isSavingReward) return;
    startQuiz(state.selectedLevel);
  });
  dom.resultZukanButton.addEventListener("click", function() {
    if (state.isSavingReward) return;
    openZukan();
  });
  dom.resultMenuButton.addEventListener("click", function() {
    if (state.isSavingReward) return;
    renderFastMenu(state.currentUserData);
  });
  dom.resultClearButton.addEventListener("click", function() {
    if (state.isSavingReward) return;
    showGenerationClear();
  });
  dom.resultCompleteButton.addEventListener("click", function() {
    if (state.isSavingReward) return;
    showAllComplete();
  });
  dom.generationStartButton.addEventListener("click", function() {
    startQuiz(state.generationStartLevel || state.selectedLevel);
  });
  document.getElementById("generation-start-menu-button").addEventListener("click", function() {
    renderFastMenu(state.currentUserData);
  });
  dom.generationClearContinueButton.addEventListener("click", continueAfterGenerationClear);
  dom.generationClearZukanButton.addEventListener("click", openZukanForUnlockedGeneration);
  document.getElementById("generation-clear-menu-button").addEventListener("click", function() {
    renderFastMenu(state.currentUserData);
  });
  document.getElementById("all-complete-quiz-button").addEventListener("click", function() {
    startQuiz(state.selectedLevel);
  });
  document.getElementById("all-complete-zukan-button").addEventListener("click", openZukanForAllComplete);
  document.getElementById("all-complete-menu-button").addEventListener("click", function() {
    renderFastMenu(state.currentUserData);
  });
  dom.retryRewardButton.addEventListener("click", function() {
    if (state.isSavingReward) return;
    if (state.pendingRewardPokemon.length > 0) {
      handleRewardSave();
    } else {
      showResult();
    }
  });
  dom.retryButton.addEventListener("click", retryLoadUserData);
  document.getElementById("error-user-button").addEventListener("click", function() { showScreen("user"); });
}
