    "use strict";

    const firebaseConfig = {
      apiKey: "AIzaSyDeFo0Xwsr4QgwCHVKrc5kIT03Rvfe7xQw",
      authDomain: "pokemon-math-app.firebaseapp.com",
      projectId: "pokemon-math-app",
      storageBucket: "pokemon-math-app.firebasestorage.app",
      messagingSenderId: "1002462273438",
      appId: "1:1002462273438:web:646cd240932dfaf6cd808f"
    };

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

    let db = null;
    let firebaseReady = false;
    let selectedUserId = null;
    let selectedUserLabel = "";
    let currentUserData = null;
    let currentGeneration = null;
    let currentGenerationPokemonList = null;
    let currentGenerationMasterPromise = null;
    let currentGenerationMasterError = null;
    let isLoadingUser = false;
    let selectedLevel = 1;
    let currentQuestionIndex = 0;
    let correctCount = 0;
    let currentCorrectAnswer = 0;
    let isAnswered = false;
    let quizTimerId = null;
    let pendingRewardPokemon = [];
    let pendingRewardPokemonList = [];
    let isSavingReward = false;
    let lastProgressResult = null;
    let generationStartLevel = 1;
    let generationStartTarget = null;
    let selectedZukanGeneration = null;
    const generationMasterCache = {};
    const generationMasterPromises = {};

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

    function showScreen(screenName) {
      Object.values(screens).forEach(function(screen) {
        screen.classList.remove("active");
      });
      screens[screenName].classList.add("active");
      appShell.classList.toggle("hide-header", screenName !== "title" && screenName !== "user");
      hidePlaceholderMessage();
    }

    function showError(message) {
      errorMessage.textContent = message;
      showScreen("error");
    }

    function showPlaceholderMessage(message) {
      placeholderMessage.textContent = message || "";
      placeholderMessage.classList.add("show");
      window.setTimeout(function() {
        placeholderMessage.classList.remove("show");
      }, 2400);
    }
    function hidePlaceholderMessage() {
      placeholderMessage.classList.remove("show");
    }

    function setLoadingMessage(mainMessage, detailMessage) {
      loadingMainMessage.textContent = mainMessage;
      loadingUserName.textContent = detailMessage || "";
    }

    function initFirebase() {
      try {
        if (typeof firebase === "undefined") {
          throw new Error("Firebase SDK を読み込めませんでした。");
        }
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
        firebaseReady = true;
        startButton.disabled = false;
      } catch (error) {
        firebaseReady = false;
        startButton.disabled = true;
        showError("Firebaseのじゅんびに しっぱいしました。しばらくしてから もういちどためしてください。");
      }
    }

    function validateUserData(data) {
      if (!data || typeof data !== "object") return "ユーザーデータが ただしくありません。";
      if (typeof data.displayName !== "string" || data.displayName.trim() === "") return "displayName が ありません。";
      if (!Number.isInteger(data.cleared_generations) || data.cleared_generations < 0 || data.cleared_generations > 9) return "cleared_generations は 0から9の せいすうにしてください。";
      if (!Array.isArray(data.current_gen_owned)) return "current_gen_owned が はいれつでは ありません。";
      if (data.current_gen_owned.some(function(value) { return !Number.isInteger(value); })) return "current_gen_owned は せいすうだけの はいれつにしてください。";
      return "";
    }

    function validatePokemonList(pokemonList) {
      if (!Array.isArray(pokemonList)) return "pokemon_list が はいれつでは ありません。";
      if (pokemonList.some(function(pokemon) { return !pokemon || typeof pokemon !== "object" || !Number.isInteger(pokemon.local_id); })) return "pokemon_list の local_id が ただしくありません。";
      return "";
    }

    function getRegionName(generation) {
      return GENERATION_REGION_NAMES[generation] || "ポケモン";
    }

    function getGenerationLabel(generation) {
      return "第" + generation + "世代";
    }

    function normalizeGenerationNumber(value, fallbackValue) {
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

    function getGenerationStartStorageKey(userId, generation) {
      return "v2_start_screen_shown_" + userId + "_gen_" + generation;
    }

    function hasShownGenerationStart(userId, generation) {
      try {
        return window.sessionStorage.getItem(getGenerationStartStorageKey(userId, generation)) === "1";
      } catch (error) {
        return false;
      }
    }

    function markGenerationStartShown(userId, generation) {
      try {
        window.sessionStorage.setItem(getGenerationStartStorageKey(userId, generation), "1");
      } catch (error) {
        // sessionStorage が使えない場合も、プレイは止めません。
      }
    }

    function getGenerationText(clearedGenerations) {
      if (clearedGenerations === 9) return "全世代コンプリート！";
      const nextGeneration = clearedGenerations + 1;
      return GENERATION_NAMES[nextGeneration] || "世代が わかりません";
    }

    function resetCachedMaster() {
      currentGenerationPokemonList = null;
      currentGenerationMasterPromise = null;
      currentGenerationMasterError = null;
    }

    function renderFastMenu(userData) {
      const ownedCount = new Set(userData.current_gen_owned).size;
      menuDisplayName.textContent = userData.displayName;
      if (userData.cleared_generations === 9) {
        menuProgress.textContent = "全世代コンプリート！\nさんすうに ちょうせんできるよ！";
      } else {
        menuProgress.textContent = getGenerationText(userData.cleared_generations) + "  " + ownedCount + "ひき ゲットずみ！";
      }
      showScreen("menu");
    }

    async function loadCurrentGenerationMaster(userData) {
      if (userData.cleared_generations === 9) return [];
      currentGeneration = userData.cleared_generations + 1;
      const pokemonList = await getGenerationMaster(currentGeneration);
      currentGenerationPokemonList = pokemonList;
      return pokemonList;
    }

    function prefetchCurrentGenerationMaster(userData) {
      if (!firebaseReady || !db || !userData || userData.cleared_generations === 9) return;
      if (currentGenerationMasterPromise || currentGenerationPokemonList) return;
      currentGenerationMasterError = null;
      currentGeneration = userData.cleared_generations + 1;
      currentGenerationMasterPromise = getGenerationMaster(currentGeneration)
        .then(function(pokemonList) {
          currentGenerationPokemonList = pokemonList;
          return pokemonList;
        })
        .catch(function(error) {
          currentGenerationMasterError = error;
          currentGenerationMasterPromise = null;
          return null;
        });
    }

    async function getCurrentGenerationMaster(userData) {
      if (currentGenerationPokemonList) return currentGenerationPokemonList;
      if (currentGenerationMasterPromise) {
        const prefetchedPokemonList = await currentGenerationMasterPromise;
        if (prefetchedPokemonList) return prefetchedPokemonList;
      }
      if (currentGenerationMasterError) currentGenerationMasterError = null;
      currentGeneration = userData.cleared_generations + 1;
      currentGenerationMasterPromise = getGenerationMaster(currentGeneration)
        .then(function(pokemonList) {
          currentGenerationPokemonList = pokemonList;
          return pokemonList;
        })
        .finally(function() {
          currentGenerationMasterPromise = null;
        });
      return currentGenerationMasterPromise;
    }

    async function getGenerationMaster(generation) {
      if (generationMasterCache[generation]) return generationMasterCache[generation];
      if (generationMasterPromises[generation]) return generationMasterPromises[generation];

      generationMasterPromises[generation] = db.collection("masters").doc("gen_" + generation).get()
        .then(function(docSnap) {
          if (!docSnap.exists) throw new Error("ポケモンデータが まだありません。");
          const masterData = docSnap.data();
          const pokemonList = masterData ? masterData.pokemon_list : null;
          const validationError = validatePokemonList(pokemonList);
          if (validationError) throw new Error(validationError);

          const sortedPokemonList = pokemonList.slice().sort(function(a, b) {
            return a.local_id - b.local_id;
          });

          generationMasterCache[generation] = sortedPokemonList;
          delete generationMasterPromises[generation];
          return sortedPokemonList;
        })
        .catch(function(error) {
          delete generationMasterPromises[generation];
          throw error;
        });

      return generationMasterPromises[generation];
    }

    async function loadUserData(userId) {
      if (isLoadingUser) return;
      if (!firebaseReady || !db) {
        showError("Firebaseのじゅんびが まだできていません。");
        return;
      }
      if (!USER_OPTIONS[userId]) {
        showError("えらんだ ユーザーが ただしくありません。");
        return;
      }
      selectedUserId = userId;
      selectedUserLabel = USER_OPTIONS[userId].label;
      currentUserData = null;
      currentGeneration = null;
      selectedZukanGeneration = null;
      pendingRewardPokemon = [];
      pendingRewardPokemonList = [];
      lastProgressResult = null;
      generationStartTarget = null;
      resetCachedMaster();
      setLoadingMessage("データを よみこんでいます。", selectedUserLabel + " のデータを よみこみ中");
      isLoadingUser = true;
      retryButton.disabled = true;
      showScreen("loading");
      try {
        const docSnap = await db.collection("users_v2").doc(userId).get();
        if (!docSnap.exists) throw new Error("ユーザーデータがまだありません。");
        const data = docSnap.data();
        const validationError = validateUserData(data);
        if (validationError) throw new Error(validationError);
        currentUserData = {
          displayName: data.displayName.trim(),
          cleared_generations: data.cleared_generations,
          current_gen_owned: data.current_gen_owned.slice()
        };
      } catch (error) {
        const message = error && error.message ? error.message : "Firestoreから データを よみこめませんでした。";
        showError(message);
        return;
      } finally {
        isLoadingUser = false;
        retryButton.disabled = false;
      }
      renderFastMenu(currentUserData);
      prefetchCurrentGenerationMaster(currentUserData);
    }

    function retryLoadUserData() {
      if (!selectedUserId) {
        showScreen("user");
        return;
      }
      loadUserData(selectedUserId);
    }

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
      answerButtons.forEach(function(button) {
        button.classList.remove("correct", "wrong");
        button.disabled = false;
        button.textContent = "?";
      });
    }

    function shouldShowGenerationStartForLevel() {
      if (!currentUserData || currentUserData.cleared_generations === 9) return false;
      if (new Set(currentUserData.current_gen_owned).size !== 0) return false;
      const generation = currentUserData.cleared_generations + 1;
      return !hasShownGenerationStart(selectedUserId, generation);
    }

    function startLevelFlow(level) {
      if (!currentUserData) {
        showScreen("user");
        return;
      }
      selectedLevel = level;
      if (shouldShowGenerationStartForLevel()) {
        showGenerationStart(currentUserData.cleared_generations + 1, selectedLevel);
        return;
      }
      startQuiz(selectedLevel);
    }

    function showGenerationStart(generation, level) {
      generationStartLevel = level || selectedLevel || 1;
      generationStartTarget = generation;
      markGenerationStartShown(selectedUserId, generation);
      generationStartTitle.textContent = getRegionName(generation) + "ちほうへ！";
      generationStartMessage.textContent = getGenerationLabel(generation) + "の ポケモンを\nゲットしにいこう！";
      generationStartButton.disabled = false;
      showScreen("generationStart");
    }

    function startQuiz(level) {
      if (!currentUserData) {
        showScreen("user");
        return;
      }
      selectedLevel = level;
      currentQuestionIndex = 0;
      correctCount = 0;
      isAnswered = false;
      pendingRewardPokemon = [];
      pendingRewardPokemonList = [];
      isSavingReward = false;
      lastProgressResult = null;
      if (quizTimerId) window.clearTimeout(quizTimerId);
      quizTimerId = null;
      quizScore.textContent = "せいかい: 0";
      quizAlert.textContent = "";
      quizAlert.className = "quiz-alert";
      quizGeneration.textContent = getGenerationText(currentUserData.cleared_generations);
      prefetchCurrentGenerationMaster(currentUserData);
      showScreen("quiz");
      makeNextQuestion();
    }

    function makeNextQuestion() {
      isAnswered = false;
      resetAnswerButtons();
      quizAlert.textContent = "";
      quizAlert.className = "quiz-alert";
      currentQuestionIndex += 1;
      quizCount.textContent = "だい " + currentQuestionIndex + " もん";
      quizScore.textContent = "せいかい: " + correctCount;
      quizProgress.style.width = ((currentQuestionIndex - 1) / QUIZ_QUESTION_COUNT * 100) + "%";
      const question = makeQuestionForLevel(selectedLevel);
      currentCorrectAnswer = question.answer;
      quizQuestion.textContent = question.text;
      const choices = makeChoices(currentCorrectAnswer);
      answerButtons.forEach(function(button, index) {
        button.textContent = choices[index];
      });
    }

    function answerQuestion(button) {
      if (isAnswered) return;
      isAnswered = true;
      answerButtons.forEach(function(answerButton) {
        answerButton.disabled = true;
      });
      const selectedAnswer = Number(button.textContent);
      if (selectedAnswer === currentCorrectAnswer) {
        correctCount += 1;
        button.classList.add("correct");
        quizAlert.textContent = "⭕ せいかい！";
        quizAlert.className = "quiz-alert success";
        quizScore.textContent = "せいかい: " + correctCount;
      } else {
        button.classList.add("wrong");
        quizAlert.textContent = "❌ ざんねん！";
        quizAlert.className = "quiz-alert wrong";
      }
      quizTimerId = window.setTimeout(function() {
        quizTimerId = null;
        if (currentQuestionIndex < QUIZ_QUESTION_COUNT) {
          makeNextQuestion();
        } else {
          showResult();
        }
      }, QUIZ_NEXT_DELAY_MS);
    }

    function getRewardPlaceholderMessage(score) {
      if (score >= 4) {
        return "ポケモンを ゲットしているよ...";
      }
      return "おしい！\n同じレベルで つづけてみよう！";
    }

    function getRewardCount(score) {
      if (score >= 5) return 2;
      if (score >= 4) return 1;
      return 0;
    }

    function getLevelPoolLimit(level, pokemonList) {
      const maxLocalId = pokemonList.reduce(function(maxValue, pokemon) {
        return Math.max(maxValue, pokemon.local_id);
      }, 0);

      if (level === 1 || level === 2) return Math.min(100, maxLocalId);
      if (level === 3) return Math.min(143, maxLocalId);
      return maxLocalId;
    }

    function selectRewardPokemon(pokemonList, ownedIds, rewardCount, level) {
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

    async function prepareRewardState(rewardCount) {
      if (!currentUserData || currentUserData.cleared_generations === 9 || rewardCount <= 0) {
        pendingRewardPokemon = [];
        pendingRewardPokemonList = [];
        return [];
      }

      const pokemonList = await getCurrentGenerationMaster(currentUserData);
      const uniqueOwnedIds = Array.from(new Set(currentUserData.current_gen_owned));
      const selectedPokemon = selectRewardPokemon(pokemonList, uniqueOwnedIds, rewardCount, selectedLevel);

      pendingRewardPokemonList = pokemonList;
      pendingRewardPokemon = selectedPokemon;
      return selectedPokemon;
    }

    function formatPokemonNames(pokemonList) {
      const names = pokemonList.map(function(pokemon) {
        return pokemon.name || ("local_id " + pokemon.local_id);
      });

      if (names.length === 0) return "";
      if (names.length === 1) return names[0];
      return names.slice(0, -1).join("と ") + "と " + names[names.length - 1];
    }

    function renderRewardImages(pokemonList) {
      resultRewardImages.innerHTML = "";
      if (!pokemonList || pokemonList.length === 0) {
        resultRewardImages.classList.add("hidden");
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
        resultRewardImages.appendChild(figure);
      });

      resultRewardImages.classList.remove("hidden");
    }

    function setResultActionDisabled(disabled) {
      resultRetryButton.disabled = disabled;
      resultZukanButton.disabled = disabled;
      resultMenuButton.disabled = disabled;
      resultClearButton.disabled = disabled;
      resultCompleteButton.disabled = disabled;
    }

    function resetResultProgressActions() {
      resultClearButton.classList.add("hidden");
      resultCompleteButton.classList.add("hidden");
      resultRetryButton.classList.remove("hidden");
      resultZukanButton.classList.remove("hidden");
      resultMenuButton.classList.remove("hidden");
      resultClearButton.textContent = "第1世代クリア！";
      resultRetryButton.textContent = "同じレベルでつづける";
    }

    function showResultClearOnlyAction(clearedGeneration) {
      const generation = normalizeGenerationNumber(clearedGeneration, currentUserData ? currentUserData.cleared_generations : 1);
      resultClearButton.textContent = getGenerationLabel(generation) + "クリア！";
      resultClearButton.classList.remove("hidden");
      resultCompleteButton.classList.add("hidden");
      resultRetryButton.classList.add("hidden");
      resultZukanButton.classList.add("hidden");
      resultMenuButton.classList.add("hidden");
    }

    function renderRewardSaving() {
      isSavingReward = true;
      setResultActionDisabled(true);
      resetResultProgressActions();
      retryRewardButton.classList.add("hidden");
      retryRewardButton.disabled = true;
      resultSaveStatus.className = "result-save-status";
      resultSaveStatus.textContent = "";
      renderRewardImages([]);
      resultMessage.textContent = "ポケモンを ゲットしているよ...";
    }

    function renderRewardSuccess(saveResult) {
      const caughtPokemon = saveResult.caughtPokemon || [];
      isSavingReward = false;
      lastProgressResult = saveResult;
      setResultActionDisabled(false);
      retryRewardButton.classList.add("hidden");
      retryRewardButton.disabled = true;
      resetResultProgressActions();

      renderRewardImages(caughtPokemon);

      if (caughtPokemon.length > 0) {
        resultMessage.textContent = formatPokemonNames(caughtPokemon) + "を ゲット！";
      } else if (saveResult.status === "already_all_completed") {
        resultMessage.textContent = "もう ぜんぶ ゲットしているよ！\nさんすうは つづけられるよ！";
      } else {
        resultMessage.textContent = "このポケモンは ゲットずみです。";
      }

      resultSaveStatus.className = "result-save-status success";
      if (saveResult.isAllComplete) {
        resultSaveStatus.textContent = "ほぞんできました！\nすべての ポケモンを ゲットしたよ！";
        showResultClearOnlyAction(saveResult.clearedGeneration || 9);
      } else if (saveResult.isGenerationComplete) {
        resultSaveStatus.textContent = "ほぞんできました！\nこの世代のポケモンを ぜんぶ ゲットしたよ！";
        showResultClearOnlyAction(saveResult.clearedGeneration);
      } else {
        resultSaveStatus.textContent = "ほぞんできました！";
      }
    }

    function renderAllCompleteQuizResult() {
      isSavingReward = false;
      lastProgressResult = {
        status: "already_all_completed",
        caughtPokemon: [],
        isGenerationComplete: false,
        isAllComplete: true,
        clearedGeneration: null,
        nextGeneration: null,
        displayName: currentUserData ? currentUserData.displayName : "",
        cleared_generations: 9,
        current_gen_owned: []
      };
      renderRewardImages([]);
      retryRewardButton.classList.add("hidden");
      retryRewardButton.disabled = true;
      resetResultProgressActions();
      resultSaveStatus.className = "result-save-status success";
      resultSaveStatus.textContent = "";
      resultMessage.textContent = "もう ぜんぶ ゲットしているよ！\nさんすうは つづけられるよ！";
      setResultActionDisabled(false);
    }

    function renderRewardFailure() {
      isSavingReward = false;
      setResultActionDisabled(false);
      resetResultProgressActions();
      resultRetryButton.classList.add("hidden");
      resultZukanButton.classList.add("hidden");
      resultMessage.textContent = "ゲットできませんでした";
      resultSaveStatus.className = "result-save-status error";
      resultSaveStatus.textContent = "";
      retryRewardButton.classList.remove("hidden");
      retryRewardButton.disabled = false;
    }

    function renderNoRewardResult(score) {
      renderRewardImages([]);
      retryRewardButton.classList.add("hidden");
      retryRewardButton.disabled = true;
      resultSaveStatus.className = "result-save-status";
      resultSaveStatus.textContent = "";
      resetResultProgressActions();
      resultMessage.textContent = getRewardPlaceholderMessage(score);
      setResultActionDisabled(false);
    }

    function renderNoAvailableReward() {
      renderRewardImages([]);
      retryRewardButton.classList.add("hidden");
      retryRewardButton.disabled = true;
      resetResultProgressActions();
      resultMessage.textContent = "この世代のポケモンは\nぜんぶ ゲットずみ！";
      resultSaveStatus.className = "result-save-status";
      resultSaveStatus.textContent = "";
      setResultActionDisabled(false);
    }

    function calculateGenerationComplete(userData, pokemonList) {
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

    async function savePendingRewardOnce() {
      if (!selectedUserId || !currentUserData || pendingRewardPokemon.length === 0) {
        return {
          status: "reward_saved",
          caughtPokemon: [],
          isGenerationComplete: false,
          isAllComplete: false,
          clearedGeneration: null,
          nextGeneration: null,
          displayName: currentUserData ? currentUserData.displayName : "",
          cleared_generations: currentUserData ? currentUserData.cleared_generations : 0,
          current_gen_owned: currentUserData ? currentUserData.current_gen_owned.slice() : []
        };
      }

      const rewardLocalIds = pendingRewardPokemon.map(function(pokemon) {
        return pokemon.local_id;
      });
      const currentClearedGenerations = currentUserData.cleared_generations;
      const currentDisplayName = currentUserData.displayName;
      const pokemonList = pendingRewardPokemonList.slice();
      const validLocalIds = new Set(pokemonList.map(function(pokemon) {
        return pokemon.local_id;
      }));
      const currentGenerationNumber = currentClearedGenerations + 1;

      const userDocRef = db.collection("users_v2").doc(selectedUserId);

      const transactionResult = await db.runTransaction(async function(transaction) {
        const docSnap = await transaction.get(userDocRef);
        if (!docSnap.exists) {
          throw new Error("ユーザーデータがまだありません。");
        }

        const latestData = docSnap.data();
        const validationError = validateUserData(latestData);
        if (validationError) {
          throw new Error(validationError);
        }

        const latestDisplayName = latestData.displayName.trim();

        if (latestData.cleared_generations === 9) {
          return {
            status: "already_all_completed",
            displayName: latestDisplayName,
            cleared_generations: 9,
            current_gen_owned: [],
            addedLocalIds: [],
            isGenerationComplete: false,
            isAllComplete: true,
            clearedGeneration: null,
            nextGeneration: null
          };
        }

        if (latestData.cleared_generations > currentClearedGenerations) {
          return {
            status: "already_advanced",
            displayName: latestDisplayName,
            cleared_generations: latestData.cleared_generations,
            current_gen_owned: latestData.current_gen_owned.slice(),
            addedLocalIds: [],
            isGenerationComplete: false,
            isAllComplete: latestData.cleared_generations === 9,
            clearedGeneration: latestData.cleared_generations,
            nextGeneration: latestData.cleared_generations < 9 ? latestData.cleared_generations + 1 : null
          };
        }

        if (latestData.cleared_generations !== currentClearedGenerations) {
          throw new Error("ユーザーデータの 世代が ただしくありません。もういちど よみこんでください。");
        }

        const latestOwned = Array.from(new Set(latestData.current_gen_owned));
        const latestOwnedSet = new Set(latestOwned);
        const idsToAdd = rewardLocalIds.filter(function(localId) {
          return validLocalIds.has(localId) && !latestOwnedSet.has(localId);
        });
        const nextOwned = latestOwned.concat(idsToAdd);
        const nextOwnedSet = new Set(nextOwned);
        const validOwnedCount = Array.from(nextOwnedSet).filter(function(localId) {
          return validLocalIds.has(localId);
        }).length;
        const isGenerationComplete = pokemonList.length > 0 && validOwnedCount >= pokemonList.length;

        if (isGenerationComplete) {
          const nextClearedGenerations = Math.min(currentGenerationNumber, 9);
          transaction.update(userDocRef, {
            cleared_generations: nextClearedGenerations,
            current_gen_owned: [],
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });

          return {
            status: nextClearedGenerations === 9 ? "all_completed" : "generation_cleared",
            displayName: latestDisplayName,
            cleared_generations: nextClearedGenerations,
            current_gen_owned: [],
            addedLocalIds: idsToAdd,
            isGenerationComplete: true,
            isAllComplete: nextClearedGenerations === 9,
            clearedGeneration: currentGenerationNumber,
            nextGeneration: nextClearedGenerations < 9 ? nextClearedGenerations + 1 : null
          };
        }

        transaction.update(userDocRef, {
          current_gen_owned: nextOwned,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        return {
          status: "reward_saved",
          displayName: latestDisplayName,
          cleared_generations: latestData.cleared_generations,
          current_gen_owned: nextOwned,
          addedLocalIds: idsToAdd,
          isGenerationComplete: false,
          isAllComplete: false,
          clearedGeneration: null,
          nextGeneration: null
        };
      });

      currentUserData = {
        displayName: transactionResult.displayName || currentDisplayName,
        cleared_generations: transactionResult.cleared_generations,
        current_gen_owned: transactionResult.current_gen_owned.slice()
      };

      if (transactionResult.isGenerationComplete || transactionResult.status === "already_advanced" || transactionResult.status === "already_all_completed") {
        resetCachedMaster();
        prefetchCurrentGenerationMaster(currentUserData);
      }

      const actuallyCaughtPokemon = pendingRewardPokemon.filter(function(pokemon) {
        return transactionResult.addedLocalIds.includes(pokemon.local_id);
      });

      const shownPokemon = actuallyCaughtPokemon.length > 0 ? actuallyCaughtPokemon : pendingRewardPokemon;

      return {
        status: transactionResult.status,
        caughtPokemon: shownPokemon,
        isGenerationComplete: transactionResult.isGenerationComplete,
        isAllComplete: transactionResult.isAllComplete,
        clearedGeneration: transactionResult.clearedGeneration,
        nextGeneration: transactionResult.nextGeneration,
        displayName: currentUserData.displayName,
        cleared_generations: currentUserData.cleared_generations,
        current_gen_owned: currentUserData.current_gen_owned.slice()
      };
    }

    async function savePendingRewardWithRetry() {
      try {
        return await savePendingRewardOnce();
      } catch (firstError) {
        try {
          return await savePendingRewardOnce();
        } catch (secondError) {
          throw secondError;
        }
      }
    }

    async function handleRewardSave() {
      if (isSavingReward || pendingRewardPokemon.length === 0) return;

      renderRewardSaving();

      try {
        const saveResult = await savePendingRewardWithRetry();
        renderRewardSuccess(saveResult);
      } catch (error) {
        renderRewardFailure();
      }
    }

    async function showResult() {
      quizProgress.style.width = "100%";
      resultScore.textContent = QUIZ_QUESTION_COUNT + "もん中 " + correctCount + "もん せいかい！";
      resultMessage.textContent = "";
      resultSaveStatus.className = "result-save-status";
      resultSaveStatus.textContent = "";
      retryRewardButton.classList.add("hidden");
      retryRewardButton.disabled = true;
      resetResultProgressActions();
      renderRewardImages([]);
      setResultActionDisabled(false);
      showScreen("result");

      const rewardCount = getRewardCount(correctCount);
      if (currentUserData && currentUserData.cleared_generations === 9 && rewardCount > 0) {
        renderAllCompleteQuizResult();
        return;
      }
      if (rewardCount <= 0) {
        renderNoRewardResult(correctCount);
        return;
      }

      renderRewardSaving();

      try {
        const selectedPokemon = await prepareRewardState(rewardCount);
        if (selectedPokemon.length === 0) {
          isSavingReward = false;
          renderNoAvailableReward();
          return;
        }
        isSavingReward = false;
        await handleRewardSave();
      } catch (error) {
        renderRewardFailure();
      }
    }

    function showGenerationClear() {
      if (!lastProgressResult || !lastProgressResult.clearedGeneration) {
        renderFastMenu(currentUserData);
        return;
      }
      if (lastProgressResult.isAllComplete || currentUserData.cleared_generations === 9) {
        showAllComplete();
        return;
      }
      const clearedGeneration = lastProgressResult.clearedGeneration;
      const nextGeneration = lastProgressResult.nextGeneration || (currentUserData.cleared_generations + 1);
      generationClearTitle.textContent = getGenerationLabel(clearedGeneration) + " クリア！";
      generationClearMessage.textContent = getRegionName(clearedGeneration) + "ちほうの ポケモンを\nぜんぶ ゲットしたよ！\n\n" +
        getGenerationLabel(nextGeneration) + "（" + getRegionName(nextGeneration) + "）が\nあたらしく 解放されたよ！";
      showScreen("generationClear");
    }

    function showAllComplete() {
      allCompleteMessage.textContent = "すべての ポケモンを\nゲットしたよ！";
      showScreen("allComplete");
    }

    function continueAfterGenerationClear() {
      if (!currentUserData) {
        renderFastMenu(currentUserData);
        return;
      }
      startQuiz(selectedLevel);
    }

    function openZukanForUnlockedGeneration() {
      if (lastProgressResult && lastProgressResult.nextGeneration) {
        selectedZukanGeneration = lastProgressResult.nextGeneration;
      }
      openZukan();
    }

    function openZukanForAllComplete() {
      selectedZukanGeneration = 9;
      openZukan();
    }

    function getVisibleGenerations(userData) {
      if (!userData) return [];
      const maxGeneration = userData.cleared_generations === 9 ? 9 : userData.cleared_generations + 1;
      const generations = [];
      for (let generation = 1; generation <= maxGeneration; generation++) {
        generations.push(generation);
      }
      return generations;
    }

    function isGenerationCleared(generation) {
      if (!currentUserData) return false;
      if (currentUserData.cleared_generations === 9) return true;
      return generation <= currentUserData.cleared_generations;
    }

    function getOwnedSetForCurrentGeneration(pokemonList) {
      const validLocalIds = new Set(pokemonList.map(function(pokemon) {
        return pokemon.local_id;
      }));
      return new Set(currentUserData.current_gen_owned.filter(function(localId) {
        return validLocalIds.has(localId);
      }));
    }

    function isPokemonOwnedInGeneration(generation, pokemon, pokemonList) {
      if (isGenerationCleared(generation)) return true;
      if (!currentUserData || currentUserData.cleared_generations === 9) return true;
      if (generation !== currentUserData.cleared_generations + 1) return false;
      return getOwnedSetForCurrentGeneration(pokemonList).has(pokemon.local_id);
    }

    function calculateZukanOwnedCount(generation, pokemonList) {
      if (isGenerationCleared(generation)) return pokemonList.length;
      return getOwnedSetForCurrentGeneration(pokemonList).size;
    }

    function renderZukanTabs() {
      const generations = getVisibleGenerations(currentUserData);
      zukanTabs.innerHTML = "";

      generations.forEach(function(generation) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "generation-tab" + (generation === selectedZukanGeneration ? " active" : "");
        button.textContent = GENERATION_NAMES[generation];
        button.addEventListener("click", function() {
          selectedZukanGeneration = generation;
          renderZukanGeneration(generation);
        });
        zukanTabs.appendChild(button);
      });
    }

    function renderZukanLoading(generation) {
      zukanGenerationName.textContent = GENERATION_NAMES[generation] || "世代が わかりません";
      zukanGenerationCount.textContent = "";
      zukanMessage.textContent = "";
      zukanGrid.innerHTML = '<div class="zukan-loading">ポケモンデータを よみこんでいます...</div>';
    }

    function renderZukanError(generation) {
      zukanGenerationName.textContent = GENERATION_NAMES[generation] || "世代が わかりません";
      zukanGenerationCount.textContent = "ポケモンデータを よみこめませんでした";
      zukanMessage.textContent = "";
      zukanGrid.innerHTML = "";
    }
function renderZukanGrid(generation, pokemonList) {
      const sortedPokemonList = pokemonList.slice().sort(function(a, b) {
        return a.local_id - b.local_id;
      });

      const ownedCount = calculateZukanOwnedCount(generation, sortedPokemonList);
      const totalCount = sortedPokemonList.length;

      zukanGenerationName.textContent = GENERATION_NAMES[generation] || "世代が わかりません";
      zukanGenerationCount.textContent = ownedCount + " / " + totalCount + " ひき ゲットずみ！";
      zukanMessage.textContent = "";
      zukanGrid.innerHTML = "";

      sortedPokemonList.forEach(function(pokemon) {
        const owned = isPokemonOwnedInGeneration(generation, pokemon, sortedPokemonList);
        const card = document.createElement("button");
        card.type = "button";
        card.className = "zukan-card " + (owned ? "owned" : "locked");

        if (owned) {
          const image = document.createElement("img");
          image.className = "zukan-card-image";
          image.src = pokemon.image || "";
          image.alt = pokemon.name || "ポケモン";
          image.loading = "lazy";
          image.onerror = function() {
            image.style.display = "none";
          };

          const name = document.createElement("div");
          name.className = "zukan-card-name";
          name.textContent = pokemon.name || "???";

          card.appendChild(image);
          card.appendChild(name);
          card.addEventListener("click", function() {
            openPokemonModal(pokemon);
          });
        } else {
          const question = document.createElement("div");
          question.className = "zukan-card-question";
          question.textContent = "?";

          const name = document.createElement("div");
          name.className = "zukan-card-name";
          name.textContent = "???";

          card.appendChild(question);
          card.appendChild(name);
          card.addEventListener("click", showUncaughtMessage);
        }

        zukanGrid.appendChild(card);
      });
    }

    async function renderZukanGeneration(generation) {
      selectedZukanGeneration = generation;
      renderZukanTabs();
      renderZukanLoading(generation);

      try {
        const pokemonList = await getGenerationMaster(generation);
        renderZukanGrid(generation, pokemonList);
      } catch (error) {
        renderZukanError(generation);
      }
    }

    function openZukan() {
      if (!currentUserData) {
        showScreen("user");
        return;
      }

      const visibleGenerations = getVisibleGenerations(currentUserData);
      if (visibleGenerations.length === 0) {
        showPlaceholderMessage("ずかんを ひらけませんでした");
        return;
      }

      if (!selectedZukanGeneration || !visibleGenerations.includes(selectedZukanGeneration)) {
        selectedZukanGeneration = visibleGenerations[visibleGenerations.length - 1];
      }

      showScreen("zukan");
      renderZukanTabs();
      renderZukanGeneration(selectedZukanGeneration);
    }

    function showUncaughtMessage() {
      zukanMessage.textContent = "まだ つかまえていないよ";
      window.setTimeout(function() {
        if (zukanMessage.textContent === "まだ つかまえていないよ") {
          zukanMessage.textContent = "";
        }
      }, 2200);
    }

    function normalizeTypeValue(typeValue) {
      if (typeof typeValue === "string") return typeValue;
      if (typeValue && typeof typeValue === "object") {
        if (typeof typeValue.name === "string") return typeValue.name;
        if (typeof typeValue.type === "string") return typeValue.type;
        if (typeValue.type && typeof typeValue.type.name === "string") return typeValue.type.name;
      }
      return "";
    }

    function formatPokemonTypes(pokemon) {
      const rawTypes = Array.isArray(pokemon.types)
        ? pokemon.types
        : (Array.isArray(pokemon.type) ? pokemon.type : []);

      const types = rawTypes.map(normalizeTypeValue).filter(function(typeName) {
        return typeName.trim() !== "";
      });

      return types.length > 0 ? types.join(" / ") : "ふめい";
    }

    function formatPokemonHeight(pokemon) {
      if (typeof pokemon.height === "number" && Number.isFinite(pokemon.height) && pokemon.height > 0) {
        return pokemon.height + " m";
      }
      if (typeof pokemon.height === "string" && pokemon.height.trim() !== "") {
        return pokemon.height;
      }
      return "ふめい";
    }

    function formatPokemonWeight(pokemon) {
      if (typeof pokemon.weight === "number" && Number.isFinite(pokemon.weight) && pokemon.weight > 0) {
        return pokemon.weight + " kg";
      }
      if (typeof pokemon.weight === "string" && pokemon.weight.trim() !== "") {
        return pokemon.weight;
      }
      return "ふめい";
    }
    function openPokemonModal(pokemon) {
      modalPokemonName.textContent = pokemon.name || "ポケモン";
      modalPokemonImage.classList.remove("image-error");
      modalPokemonImage.src = pokemon.image || "";
      modalPokemonImage.alt = pokemon.name || "ポケモン";
      modalPokemonImage.onerror = function() {
        modalPokemonImage.classList.add("image-error");
      };
      modalPokemonTypes.textContent = formatPokemonTypes(pokemon);
      modalPokemonHeight.textContent = formatPokemonHeight(pokemon);
      modalPokemonWeight.textContent = formatPokemonWeight(pokemon);
      modalPokemonFlavor.textContent = typeof pokemon.flavor === "string" && pokemon.flavor.trim() !== ""
        ? pokemon.flavor.trim()
        : "せつめいは まだありません。";

      pokemonModalBackdrop.classList.add("show");
      pokemonModalBackdrop.setAttribute("aria-hidden", "false");
    }

    function closePokemonModal() {
      pokemonModalBackdrop.classList.remove("show");
      pokemonModalBackdrop.setAttribute("aria-hidden", "true");
      modalPokemonImage.removeAttribute("src");
    }

    function setupEvents() {
      startButton.addEventListener("click", function() {
        if (!firebaseReady) {
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
      answerButtons.forEach(function(button) {
        button.addEventListener("click", function() {
          answerQuestion(button);
        });
      });
      document.getElementById("user-back-button").addEventListener("click", function() { showScreen("title"); });
      document.getElementById("open-zukan-button").addEventListener("click", openZukan);
      document.getElementById("zukan-menu-button").addEventListener("click", function() { renderFastMenu(currentUserData); });
      pokemonModalBackdrop.addEventListener("click", closePokemonModal);
      pokemonModalPanel.addEventListener("click", function(event) {
        event.stopPropagation();
      });
      document.getElementById("modal-close-button").addEventListener("click", closePokemonModal);
      document.getElementById("change-user-button").addEventListener("click", function() {
        selectedUserId = null;
        selectedUserLabel = "";
        currentUserData = null;
        currentGeneration = null;
        selectedZukanGeneration = null;
        pendingRewardPokemon = [];
        pendingRewardPokemonList = [];
        lastProgressResult = null;
        generationStartTarget = null;
        resetCachedMaster();
        closePokemonModal();
        showScreen("user");
      });
      resultRetryButton.addEventListener("click", function() {
        if (isSavingReward) return;
        startQuiz(selectedLevel);
      });
      resultZukanButton.addEventListener("click", function() {
        if (isSavingReward) return;
        openZukan();
      });
      resultMenuButton.addEventListener("click", function() {
        if (isSavingReward) return;
        renderFastMenu(currentUserData);
      });
      resultClearButton.addEventListener("click", function() {
        if (isSavingReward) return;
        showGenerationClear();
      });
      resultCompleteButton.addEventListener("click", function() {
        if (isSavingReward) return;
        showAllComplete();
      });
      generationStartButton.addEventListener("click", function() {
        startQuiz(generationStartLevel || selectedLevel);
      });
      document.getElementById("generation-start-menu-button").addEventListener("click", function() {
        renderFastMenu(currentUserData);
      });
      generationClearContinueButton.addEventListener("click", continueAfterGenerationClear);
      generationClearZukanButton.addEventListener("click", openZukanForUnlockedGeneration);
      document.getElementById("generation-clear-menu-button").addEventListener("click", function() {
        renderFastMenu(currentUserData);
      });
      document.getElementById("all-complete-quiz-button").addEventListener("click", function() {
        startQuiz(selectedLevel);
      });
      document.getElementById("all-complete-zukan-button").addEventListener("click", openZukanForAllComplete);
      document.getElementById("all-complete-menu-button").addEventListener("click", function() {
        renderFastMenu(currentUserData);
      });
      retryRewardButton.addEventListener("click", function() {
        if (isSavingReward) return;
        if (pendingRewardPokemon.length > 0) {
          handleRewardSave();
        } else {
          showResult();
        }
      });
      retryButton.addEventListener("click", retryLoadUserData);
      document.getElementById("error-user-button").addEventListener("click", function() { showScreen("user"); });
    }

    setupEvents();
    initFirebase();