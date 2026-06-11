import { QUIZ_QUESTION_COUNT } from "./constants.js";
import { state } from "./state.js";
import { dom } from "./dom.js";
import { shuffleArray } from "./utils.js";
import {
  resetResultProgressActions,
  setResultActionDisabled,
  showResultClearOnlyAction,
  showScreen
} from "./ui.js";
import {
  getCurrentGenerationMaster,
  savePendingRewardWithRetry
} from "./firestore.js";

export function getRewardPlaceholderMessage(score) {
  if (score >= 4) {
    return "ポケモンを ゲットしているよ...";
  }
  return "おしい！\n同じレベルで つづけてみよう！";
}

export function getRewardCount(score) {
  if (score >= 5) return 2;
  if (score >= 4) return 1;
  return 0;
}

export function getFlagRewardCount(score) {
  if (score >= 5) return 2;
  if (score >= 3) return 1;
  return 0;
}

export function getFlagRewardPlaceholderMessage(score) {
  if (score >= 3) {
    return "ポケモンを ゲットしているよ...";
  }
  return "おしい！ 3もん せいかいで ポケモンを ゲット！";
}

export function getLevelPoolLimit(level, pokemonList) {
  const maxLocalId = pokemonList.reduce(function(maxValue, pokemon) {
    return Math.max(maxValue, pokemon.local_id);
  }, 0);

  if (level === 1 || level === 2) return Math.min(100, maxLocalId);
  if (level === 3) return Math.min(143, maxLocalId);
  return maxLocalId;
}

export function selectRewardPokemon(pokemonList, ownedIds, rewardCount, level) {
  if (rewardCount <= 0) return [];

  const ownedSet = new Set(ownedIds);
  const poolLimit = getLevelPoolLimit(level, pokemonList);
  const levelPoolCandidates = pokemonList.filter(function(pokemon) {
    return Number.isInteger(pokemon.local_id)
      && pokemon.local_id >= 1
      && pokemon.local_id <= poolLimit
      && !ownedSet.has(pokemon.local_id);
  });

  const fallbackCandidates = pokemonList.filter(function(pokemon) {
    return Number.isInteger(pokemon.local_id) && !ownedSet.has(pokemon.local_id);
  });

  const candidates = levelPoolCandidates.length > 0 ? levelPoolCandidates : fallbackCandidates;
  return shuffleArray(candidates).slice(0, rewardCount);
}

export async function prepareRewardState(rewardCount, rewardLevel = state.selectedLevel) {
  if (!state.currentUserData || state.currentUserData.cleared_generations === 9 || rewardCount <= 0) {
    state.pendingRewardPokemon = [];
    state.pendingRewardPokemonList = [];
    return [];
  }

  const pokemonList = await getCurrentGenerationMaster(state.currentUserData);
  const uniqueOwnedIds = Array.from(new Set(state.currentUserData.current_gen_owned));
  const selectedPokemon = selectRewardPokemon(pokemonList, uniqueOwnedIds, rewardCount, rewardLevel);

  state.pendingRewardPokemonList = pokemonList;
  state.pendingRewardPokemon = selectedPokemon;
  return selectedPokemon;
}

export function formatPokemonNames(pokemonList) {
  const names = pokemonList.map(function(pokemon) {
    return pokemon.name || ("local_id " + pokemon.local_id);
  });

  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  return names.slice(0, -1).join("と ") + "と " + names[names.length - 1];
}

export function renderRewardImages(pokemonList) {
  dom.resultRewardImages.innerHTML = "";
  if (!pokemonList || pokemonList.length === 0) {
    dom.resultRewardImages.classList.add("hidden");
    return;
  }

  pokemonList.forEach(function(pokemon) {
    const figure = document.createElement("figure");
    figure.className = "reward-card";

    const image = document.createElement("img");
    image.src = pokemon.image || "";
    image.alt = pokemon.name || "ゲットした ポケモン";
    image.loading = "lazy";
    image.onerror = function() {
      figure.classList.add("image-error");
    };

    const caption = document.createElement("figcaption");
    caption.className = "reward-name";
    caption.textContent = pokemon.name || "???";

    figure.appendChild(image);
    figure.appendChild(caption);
    dom.resultRewardImages.appendChild(figure);
  });

  dom.resultRewardImages.classList.remove("hidden");
}

export function renderRewardSaving() {
  state.isSavingReward = true;
  setResultActionDisabled(true);
  resetResultProgressActions();
  dom.retryRewardButton.classList.add("hidden");
  dom.retryRewardButton.disabled = true;
  dom.resultSaveStatus.className = "result-save-status";
  dom.resultSaveStatus.textContent = "";
  renderRewardImages([]);
  dom.resultMessage.textContent = "ポケモンを ゲットしているよ...";
}

export function renderRewardSuccess(saveResult) {
  const caughtPokemon = saveResult.caughtPokemon || [];
  state.isSavingReward = false;
  state.lastProgressResult = saveResult;
  setResultActionDisabled(false);
  dom.retryRewardButton.classList.add("hidden");
  dom.retryRewardButton.disabled = true;
  resetResultProgressActions();

  renderRewardImages(caughtPokemon);

  if (caughtPokemon.length > 0) {
    dom.resultMessage.textContent = formatPokemonNames(caughtPokemon) + "を ゲット！";
  } else if (saveResult.status === "already_all_completed") {
    dom.resultMessage.textContent = "もう ぜんぶ ゲットしているよ！\nクイズは つづけられるよ！";
  } else {
    dom.resultMessage.textContent = "このポケモンは ゲットずみです。";
  }

  dom.resultSaveStatus.className = "result-save-status success";
  if (saveResult.isAllComplete) {
    dom.resultSaveStatus.textContent = "ほぞんできました！\nすべての ポケモンを ゲットしたよ！";
    showResultClearOnlyAction(saveResult.clearedGeneration || 9);
  } else if (saveResult.isGenerationComplete) {
    dom.resultSaveStatus.textContent = "ほぞんできました！\nこの世代のポケモンを ぜんぶ ゲットしたよ！";
    showResultClearOnlyAction(saveResult.clearedGeneration);
  } else {
    dom.resultSaveStatus.textContent = "ほぞんできました！";
  }
}

export function renderAllCompleteQuizResult() {
  state.isSavingReward = false;
  state.lastProgressResult = {
    status: "already_all_completed",
    caughtPokemon: [],
    isGenerationComplete: false,
    isAllComplete: true,
    clearedGeneration: null,
    nextGeneration: null,
    displayName: state.currentUserData ? state.currentUserData.displayName : "",
    cleared_generations: 9,
    current_gen_owned: []
  };
  renderRewardImages([]);
  dom.retryRewardButton.classList.add("hidden");
  dom.retryRewardButton.disabled = true;
  resetResultProgressActions();
  dom.resultSaveStatus.className = "result-save-status success";
  dom.resultSaveStatus.textContent = "";
  dom.resultMessage.textContent = "もう ぜんぶ ゲットしているよ！\nクイズは つづけられるよ！";
  setResultActionDisabled(false);
}

export function renderRewardFailure() {
  state.isSavingReward = false;
  setResultActionDisabled(false);
  resetResultProgressActions();
  dom.resultRetryButton.classList.add("hidden");
  dom.resultZukanButton.classList.add("hidden");
  dom.resultMessage.textContent = "ゲットできませんでした";
  dom.resultSaveStatus.className = "result-save-status error";
  dom.resultSaveStatus.textContent = "";
  dom.retryRewardButton.classList.remove("hidden");
  dom.retryRewardButton.disabled = false;
}

export function renderNoRewardResult(score) {
  renderRewardImages([]);
  dom.retryRewardButton.classList.add("hidden");
  dom.retryRewardButton.disabled = true;
  dom.resultSaveStatus.className = "result-save-status";
  dom.resultSaveStatus.textContent = "";
  resetResultProgressActions();
  dom.resultMessage.textContent = getRewardPlaceholderMessage(score);
  setResultActionDisabled(false);
}

export function renderNoFlagRewardResult(score) {
  renderRewardImages([]);
  dom.retryRewardButton.classList.add("hidden");
  dom.retryRewardButton.disabled = true;
  dom.resultSaveStatus.className = "result-save-status";
  dom.resultSaveStatus.textContent = "";
  resetResultProgressActions();
  dom.resultRetryButton.textContent = "こっきクイズを もういちど";
  dom.resultMessage.textContent = getFlagRewardPlaceholderMessage(score);
  setResultActionDisabled(false);
}

export function renderNoAvailableReward() {
  renderRewardImages([]);
  dom.retryRewardButton.classList.add("hidden");
  dom.retryRewardButton.disabled = true;
  resetResultProgressActions();
  dom.resultMessage.textContent = "この世代のポケモンは\nぜんぶ ゲットずみ！";
  dom.resultSaveStatus.className = "result-save-status";
  dom.resultSaveStatus.textContent = "";
  setResultActionDisabled(false);
}

export function calculateGenerationComplete(userData, pokemonList) {
  if (!pokemonList || pokemonList.length === 0) return false;
  const validLocalIds = new Set(pokemonList.map(function(pokemon) {
    return pokemon.local_id;
  }));
  const ownedSet = new Set(userData.current_gen_owned);
  const validOwnedCount = Array.from(ownedSet).filter(function(localId) {
    return validLocalIds.has(localId);
  }).length;
  return validOwnedCount >= pokemonList.length;
}

export async function handleRewardSave() {
  if (state.isSavingReward || state.pendingRewardPokemon.length === 0) return;

  renderRewardSaving();

  try {
    const saveResult = await savePendingRewardWithRetry();
    renderRewardSuccess(saveResult);
  } catch (error) {
    renderRewardFailure();
  }
}

export async function showResult() {
  dom.quizProgress.style.width = "100%";
  dom.resultScore.textContent = QUIZ_QUESTION_COUNT + "もん中 " + state.correctCount + "もん せいかい！";
  dom.resultMessage.textContent = "";
  dom.resultSaveStatus.className = "result-save-status";
  dom.resultSaveStatus.textContent = "";
  dom.retryRewardButton.classList.add("hidden");
  dom.retryRewardButton.disabled = true;
  resetResultProgressActions();
  renderRewardImages([]);
  setResultActionDisabled(false);
  showScreen("result");

  const rewardCount = getRewardCount(state.correctCount);
  if (state.currentUserData && state.currentUserData.cleared_generations === 9 && rewardCount > 0) {
    renderAllCompleteQuizResult();
    return;
  }
  if (rewardCount <= 0) {
    renderNoRewardResult(state.correctCount);
    return;
  }

  renderRewardSaving();

  try {
    const selectedPokemon = await prepareRewardState(rewardCount);
    if (selectedPokemon.length === 0) {
      state.isSavingReward = false;
      renderNoAvailableReward();
      return;
    }
    state.isSavingReward = false;
    await handleRewardSave();
  } catch (error) {
    renderRewardFailure();
  }
}

export async function showFlagRewardResult() {
  dom.quizProgress.style.width = "100%";
  dom.resultScore.textContent = QUIZ_QUESTION_COUNT + "もん中 " + state.correctCount + "もん せいかい！";
  dom.resultMessage.textContent = "";
  dom.resultSaveStatus.className = "result-save-status";
  dom.resultSaveStatus.textContent = "";
  dom.retryRewardButton.classList.add("hidden");
  dom.retryRewardButton.disabled = true;
  resetResultProgressActions();
  renderRewardImages([]);
  dom.resultRetryButton.textContent = "こっきクイズを もういちど";
  setResultActionDisabled(false);
  showScreen("result");

  const rewardCount = getFlagRewardCount(state.correctCount);
  if (state.currentUserData && state.currentUserData.cleared_generations === 9 && rewardCount > 0) {
    renderAllCompleteQuizResult();
    dom.resultRetryButton.textContent = "こっきクイズを もういちど";
    return;
  }
  if (rewardCount <= 0) {
    renderNoFlagRewardResult(state.correctCount);
    return;
  }

  renderRewardSaving();

  try {
    const selectedPokemon = await prepareRewardState(rewardCount, 6);
    if (selectedPokemon.length === 0) {
      state.isSavingReward = false;
      renderNoAvailableReward();
      dom.resultRetryButton.textContent = "こっきクイズを もういちど";
      return;
    }
    state.isSavingReward = false;
    await handleRewardSave();
    dom.resultRetryButton.textContent = "こっきクイズを もういちど";
  } catch (error) {
    renderRewardFailure();
  }
}

window.AppReward = {
  getRewardPlaceholderMessage,
  getRewardCount,
  getFlagRewardCount,
  getFlagRewardPlaceholderMessage,
  getLevelPoolLimit,
  selectRewardPokemon,
  prepareRewardState,
  formatPokemonNames,
  renderRewardImages,
  renderRewardSaving,
  renderRewardSuccess,
  renderAllCompleteQuizResult,
  renderRewardFailure,
  renderNoRewardResult,
  renderNoFlagRewardResult,
  renderNoAvailableReward,
  calculateGenerationComplete,
  handleRewardSave,
  showResult,
  showFlagRewardResult
};
