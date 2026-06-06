(function() {
  "use strict";

  const config = window.AppConfig;
  const constants = window.AppConstants;
  const state = window.AppState;
  const dom = window.AppDom;

    function initFirebase() {
      try {
        if (typeof firebase === "undefined") {
          throw new Error("Firebase SDK を読み込めませんでした。");
        }
        if (!firebase.apps.length) {
          firebase.initializeApp(config.firebaseConfig);
        }
        state.db = firebase.firestore();
        state.firebaseReady = true;
        dom.startButton.disabled = false;
      } catch (error) {
        state.firebaseReady = false;
        dom.startButton.disabled = true;
        window.AppUI.showError("Firebaseのじゅんびに しっぱいしました。しばらくしてから もういちどためしてください。");
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

    function resetCachedMaster() {
      state.currentGenerationPokemonList = null;
      state.currentGenerationMasterPromise = null;
      state.currentGenerationMasterError = null;
    }

    async function loadCurrentGenerationMaster(userData) {
      if (userData.cleared_generations === 9) return [];
      state.currentGeneration = userData.cleared_generations + 1;
      const pokemonList = await getGenerationMaster(state.currentGeneration);
      state.currentGenerationPokemonList = pokemonList;
      return pokemonList;
    }

    function prefetchCurrentGenerationMaster(userData) {
      if (!state.firebaseReady || !state.db || !userData || userData.cleared_generations === 9) return;
      if (state.currentGenerationMasterPromise || state.currentGenerationPokemonList) return;
      state.currentGenerationMasterError = null;
      state.currentGeneration = userData.cleared_generations + 1;
      state.currentGenerationMasterPromise = getGenerationMaster(state.currentGeneration)
        .then(function(pokemonList) {
          state.currentGenerationPokemonList = pokemonList;
          return pokemonList;
        })
        .catch(function(error) {
          state.currentGenerationMasterError = error;
          state.currentGenerationMasterPromise = null;
          return null;
        });
    }

    async function getCurrentGenerationMaster(userData) {
      if (state.currentGenerationPokemonList) return state.currentGenerationPokemonList;
      if (state.currentGenerationMasterPromise) {
        const prefetchedPokemonList = await state.currentGenerationMasterPromise;
        if (prefetchedPokemonList) return prefetchedPokemonList;
      }
      if (state.currentGenerationMasterError) state.currentGenerationMasterError = null;
      state.currentGeneration = userData.cleared_generations + 1;
      state.currentGenerationMasterPromise = getGenerationMaster(state.currentGeneration)
        .then(function(pokemonList) {
          state.currentGenerationPokemonList = pokemonList;
          return pokemonList;
        })
        .finally(function() {
          state.currentGenerationMasterPromise = null;
        });
      return state.currentGenerationMasterPromise;
    }

    async function getGenerationMaster(generation) {
      if (state.generationMasterCache[generation]) return state.generationMasterCache[generation];
      if (state.generationMasterPromises[generation]) return state.generationMasterPromises[generation];

      state.generationMasterPromises[generation] = state.db.collection("masters").doc("gen_" + generation).get()
        .then(function(docSnap) {
          if (!docSnap.exists) throw new Error("ポケモンデータが まだありません。");
          const masterData = docSnap.data();
          const pokemonList = masterData ? masterData.pokemon_list : null;
          const validationError = validatePokemonList(pokemonList);
          if (validationError) throw new Error(validationError);

          const sortedPokemonList = pokemonList.slice().sort(function(a, b) {
            return a.local_id - b.local_id;
          });

          state.generationMasterCache[generation] = sortedPokemonList;
          delete state.generationMasterPromises[generation];
          return sortedPokemonList;
        })
        .catch(function(error) {
          delete state.generationMasterPromises[generation];
          throw error;
        });

      return state.generationMasterPromises[generation];
    }

    async function loadUserData(userId) {
      if (state.isLoadingUser) return;
      if (!state.firebaseReady || !state.db) {
        window.AppUI.showError("Firebaseのじゅんびが まだできていません。");
        return;
      }
      if (!constants.USER_OPTIONS[userId]) {
        window.AppUI.showError("えらんだ ユーザーが ただしくありません。");
        return;
      }
      state.selectedUserId = userId;
      state.selectedUserLabel = constants.USER_OPTIONS[userId].label;
      state.currentUserData = null;
      state.currentGeneration = null;
      state.selectedZukanGeneration = null;
      state.pendingRewardPokemon = [];
      state.pendingRewardPokemonList = [];
      state.lastProgressResult = null;
      state.generationStartTarget = null;
      resetCachedMaster();
      window.AppUI.setLoadingMessage("データを よみこんでいます。", state.selectedUserLabel + " のデータを よみこみ中");
      state.isLoadingUser = true;
      dom.retryButton.disabled = true;
      window.AppUI.showScreen("loading");
      try {
        const docSnap = await state.db.collection("users_v2").doc(userId).get();
        if (!docSnap.exists) throw new Error("ユーザーデータがまだありません。");
        const data = docSnap.data();
        const validationError = validateUserData(data);
        if (validationError) throw new Error(validationError);
        state.currentUserData = {
          displayName: data.displayName.trim(),
          cleared_generations: data.cleared_generations,
          current_gen_owned: data.current_gen_owned.slice()
        };
      } catch (error) {
        const message = error && error.message ? error.message : "Firestoreから データを よみこめませんでした。";
        window.AppUI.showError(message);
        return;
      } finally {
        state.isLoadingUser = false;
        dom.retryButton.disabled = false;
      }
      window.AppUI.renderFastMenu(state.currentUserData);
      prefetchCurrentGenerationMaster(state.currentUserData);
    }

    function retryLoadUserData() {
      if (!state.selectedUserId) {
        window.AppUI.showScreen("user");
        return;
      }
      loadUserData(state.selectedUserId);
    }

    async function savePendingRewardOnce() {
      if (!state.selectedUserId || !state.currentUserData || state.pendingRewardPokemon.length === 0) {
        return {
          status: "reward_saved",
          caughtPokemon: [],
          isGenerationComplete: false,
          isAllComplete: false,
          clearedGeneration: null,
          nextGeneration: null,
          displayName: state.currentUserData ? state.currentUserData.displayName : "",
          cleared_generations: state.currentUserData ? state.currentUserData.cleared_generations : 0,
          current_gen_owned: state.currentUserData ? state.currentUserData.current_gen_owned.slice() : []
        };
      }

      const rewardLocalIds = state.pendingRewardPokemon.map(function(pokemon) {
        return pokemon.local_id;
      });
      const currentClearedGenerations = state.currentUserData.cleared_generations;
      const currentDisplayName = state.currentUserData.displayName;
      const pokemonList = state.pendingRewardPokemonList.slice();
      const validLocalIds = new Set(pokemonList.map(function(pokemon) {
        return pokemon.local_id;
      }));
      const currentGenerationNumber = currentClearedGenerations + 1;

      const userDocRef = state.db.collection("users_v2").doc(state.selectedUserId);

      const transactionResult = await state.db.runTransaction(async function(transaction) {
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

      state.currentUserData = {
        displayName: transactionResult.displayName || currentDisplayName,
        cleared_generations: transactionResult.cleared_generations,
        current_gen_owned: transactionResult.current_gen_owned.slice()
      };

      if (transactionResult.isGenerationComplete || transactionResult.status === "already_advanced" || transactionResult.status === "already_all_completed") {
        resetCachedMaster();
        prefetchCurrentGenerationMaster(state.currentUserData);
      }

      const actuallyCaughtPokemon = state.pendingRewardPokemon.filter(function(pokemon) {
        return transactionResult.addedLocalIds.includes(pokemon.local_id);
      });

      const shownPokemon = actuallyCaughtPokemon.length > 0 ? actuallyCaughtPokemon : state.pendingRewardPokemon;

      return {
        status: transactionResult.status,
        caughtPokemon: shownPokemon,
        isGenerationComplete: transactionResult.isGenerationComplete,
        isAllComplete: transactionResult.isAllComplete,
        clearedGeneration: transactionResult.clearedGeneration,
        nextGeneration: transactionResult.nextGeneration,
        displayName: state.currentUserData.displayName,
        cleared_generations: state.currentUserData.cleared_generations,
        current_gen_owned: state.currentUserData.current_gen_owned.slice()
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

  window.AppFirestore = {
    initFirebase,
    validateUserData,
    validatePokemonList,
    resetCachedMaster,
    loadCurrentGenerationMaster,
    prefetchCurrentGenerationMaster,
    getCurrentGenerationMaster,
    getGenerationMaster,
    loadUserData,
    retryLoadUserData,
    savePendingRewardOnce,
    savePendingRewardWithRetry
  };
})();