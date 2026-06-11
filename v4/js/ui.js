import {
  GENERATION_NAMES,
  GENERATION_REGION_NAMES
} from "./constants.js";
import { state } from "./state.js";
import { dom } from "./dom.js";

export function showScreen(screenName) {
  Object.values(dom.screens).forEach(function(screen) {
    screen.classList.remove("active");
  });
  dom.screens[screenName].classList.add("active");
  dom.appShell.classList.toggle("hide-header", screenName !== "title" && screenName !== "user");
  hidePlaceholderMessage();
}

export function showError(message) {
  dom.errorMessage.textContent = message;
  showScreen("error");
}

export function showPlaceholderMessage(message) {
  dom.placeholderMessage.textContent = message || "";
  dom.placeholderMessage.classList.add("show");
  window.setTimeout(function() {
    dom.placeholderMessage.classList.remove("show");
  }, 2400);
}

export function hidePlaceholderMessage() {
  dom.placeholderMessage.classList.remove("show");
}

export function setLoadingMessage(mainMessage, detailMessage) {
  dom.loadingMainMessage.textContent = mainMessage;
  dom.loadingUserName.textContent = detailMessage || "";
}

export function getRegionName(generation) {
  return GENERATION_REGION_NAMES[generation] || "ポケモン";
}

export function getGenerationLabel(generation) {
  return "第" + generation + "世代";
}

export function normalizeGenerationNumber(value, fallbackValue) {
  const numericValue = Number(value);
  if (Number.isInteger(numericValue) && numericValue >= 1 && numericValue <= 9) {
    return numericValue;
  }
  const numericFallback = Number(fallbackValue);
  if (Number.isInteger(numericFallback) && numericFallback >= 1 && numericFallback <= 9) {
    return numericFallback;
  }
  return 1;
}

export function getGenerationStartStorageKey(userId, generation) {
  return "v2_start_screen_shown_" + userId + "_gen_" + generation;
}

export function hasShownGenerationStart(userId, generation) {
  try {
    return window.sessionStorage.getItem(getGenerationStartStorageKey(userId, generation)) === "1";
  } catch (error) {
    return false;
  }
}

export function markGenerationStartShown(userId, generation) {
  try {
    window.sessionStorage.setItem(getGenerationStartStorageKey(userId, generation), "1");
  } catch (error) {
    // sessionStorage が使えない場合も、プレイは止めません。
  }
}

export function getGenerationText(clearedGenerations) {
  if (clearedGenerations === 9) return "全世代コンプリート！";
  const nextGeneration = clearedGenerations + 1;
  return GENERATION_NAMES[nextGeneration] || "世代が わかりません";
}

export function renderFastMenu(userData) {
  const ownedCount = new Set(userData.current_gen_owned).size;
  dom.menuDisplayName.textContent = userData.displayName;
  dom.quizTypeStack.classList.remove("hidden");
  dom.mathLevelStack.classList.add("hidden");
  if (userData.cleared_generations === 9) {
    dom.menuProgress.textContent = "全世代コンプリート！\nさんすうに ちょうせんできるよ！";
  } else {
    dom.menuProgress.textContent = getGenerationText(userData.cleared_generations) + "  " + ownedCount + "ひき ゲットずみ！";
  }
  showScreen("menu");
}

export function showMathLevelSelect() {
  dom.quizTypeStack.classList.add("hidden");
  dom.mathLevelStack.classList.remove("hidden");
}

export function showGenerationStart(generation, level) {
  state.generationStartLevel = level || state.selectedLevel || 1;
  state.generationStartTarget = generation;
  markGenerationStartShown(state.selectedUserId, generation);
  dom.generationStartTitle.textContent = getRegionName(generation) + "ちほうへ！";
  dom.generationStartMessage.textContent = getGenerationLabel(generation) + "の ポケモンを\nゲットしにいこう！";
  dom.generationStartButton.disabled = false;
  showScreen("generationStart");
}

export function setResultActionDisabled(disabled) {
  dom.resultRetryButton.disabled = disabled;
  dom.resultZukanButton.disabled = disabled;
  dom.resultMenuButton.disabled = disabled;
  dom.resultClearButton.disabled = disabled;
  dom.resultCompleteButton.disabled = disabled;
}

export function resetResultProgressActions() {
  dom.resultClearButton.classList.add("hidden");
  dom.resultCompleteButton.classList.add("hidden");
  dom.resultRetryButton.classList.remove("hidden");
  dom.resultZukanButton.classList.remove("hidden");
  dom.resultMenuButton.classList.remove("hidden");
  dom.resultClearButton.textContent = "第1世代クリア！";
  dom.resultRetryButton.textContent = "同じレベルでつづける";
}

export function showResultClearOnlyAction(clearedGeneration) {
  const generation = normalizeGenerationNumber(clearedGeneration, state.currentUserData ? state.currentUserData.cleared_generations : 1);
  dom.resultClearButton.textContent = getGenerationLabel(generation) + "クリア！";
  dom.resultClearButton.classList.remove("hidden");
  dom.resultCompleteButton.classList.add("hidden");
  dom.resultRetryButton.classList.add("hidden");
  dom.resultZukanButton.classList.add("hidden");
  dom.resultMenuButton.classList.add("hidden");
}

export function showGenerationClear() {
  if (!state.lastProgressResult || !state.lastProgressResult.clearedGeneration) {
    renderFastMenu(state.currentUserData);
    return;
  }
  if (state.lastProgressResult.isAllComplete || state.currentUserData.cleared_generations === 9) {
    showAllComplete();
    return;
  }
  const clearedGeneration = state.lastProgressResult.clearedGeneration;
  const nextGeneration = state.lastProgressResult.nextGeneration || (state.currentUserData.cleared_generations + 1);
  dom.generationClearTitle.textContent = getGenerationLabel(clearedGeneration) + " クリア！";
  dom.generationClearMessage.textContent = getRegionName(clearedGeneration) + "ちほうの ポケモンを\nぜんぶ ゲットしたよ！\n\n" +
    getGenerationLabel(nextGeneration) + "（" + getRegionName(nextGeneration) + "）が\nあたらしく 解放されたよ！";
  showScreen("generationClear");
}

export function showAllComplete() {
  dom.allCompleteMessage.textContent = "すべての ポケモンを\nゲットしたよ！";
  showScreen("allComplete");
}

export function continueAfterGenerationClear() {
  if (!state.currentUserData) {
    renderFastMenu(state.currentUserData);
    return;
  }
  window.AppQuiz.startQuiz(state.selectedLevel);
}

window.AppUI = {
  showScreen,
  showError,
  showPlaceholderMessage,
  hidePlaceholderMessage,
  setLoadingMessage,
  getRegionName,
  getGenerationLabel,
  normalizeGenerationNumber,
  getGenerationStartStorageKey,
  hasShownGenerationStart,
  markGenerationStartShown,
  getGenerationText,
  renderFastMenu,
  showMathLevelSelect,
  showGenerationStart,
  setResultActionDisabled,
  resetResultProgressActions,
  showResultClearOnlyAction,
  showGenerationClear,
  showAllComplete,
  continueAfterGenerationClear
};
