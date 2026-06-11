import { GENERATION_NAMES } from "./constants.js";
import { state } from "./state.js";
import { dom } from "./dom.js";
import {
  showPlaceholderMessage,
  showScreen
} from "./ui.js";
import { getGenerationMaster } from "./firestore.js";

export function openZukanForUnlockedGeneration() {
  if (state.lastProgressResult && state.lastProgressResult.nextGeneration) {
    state.selectedZukanGeneration = state.lastProgressResult.nextGeneration;
  }
  openZukan();
}

export function openZukanForAllComplete() {
  state.selectedZukanGeneration = 9;
  openZukan();
}

export function getVisibleGenerations(userData) {
  if (!userData) return [];
  const maxGeneration = userData.cleared_generations === 9 ? 9 : userData.cleared_generations + 1;
  const generations = [];
  for (let generation = 1; generation <= maxGeneration; generation++) {
    generations.push(generation);
  }
  return generations;
}

export function isGenerationCleared(generation) {
  if (!state.currentUserData) return false;
  if (state.currentUserData.cleared_generations === 9) return true;
  return generation <= state.currentUserData.cleared_generations;
}

export function getOwnedSetForCurrentGeneration(pokemonList) {
  const validLocalIds = new Set(pokemonList.map(function(pokemon) {
    return pokemon.local_id;
  }));
  return new Set(state.currentUserData.current_gen_owned.filter(function(localId) {
    return validLocalIds.has(localId);
  }));
}

export function isPokemonOwnedInGeneration(generation, pokemon, pokemonList) {
  if (isGenerationCleared(generation)) return true;
  if (!state.currentUserData || state.currentUserData.cleared_generations === 9) return true;
  if (generation !== state.currentUserData.cleared_generations + 1) return false;
  return getOwnedSetForCurrentGeneration(pokemonList).has(pokemon.local_id);
}

export function calculateZukanOwnedCount(generation, pokemonList) {
  if (isGenerationCleared(generation)) return pokemonList.length;
  return getOwnedSetForCurrentGeneration(pokemonList).size;
}

export function renderZukanTabs() {
  const generations = getVisibleGenerations(state.currentUserData);
  dom.zukanTabs.innerHTML = "";

  generations.forEach(function(generation) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "generation-tab" + (generation === state.selectedZukanGeneration ? " active" : "");
    button.textContent = GENERATION_NAMES[generation];
    button.addEventListener("click", function() {
      state.selectedZukanGeneration = generation;
      renderZukanGeneration(generation);
    });
    dom.zukanTabs.appendChild(button);
  });
}

export function renderZukanLoading(generation) {
  dom.zukanGenerationName.textContent = GENERATION_NAMES[generation] || "世代が わかりません";
  dom.zukanGenerationCount.textContent = "";
  dom.zukanMessage.textContent = "";
  dom.zukanGrid.innerHTML = '<div class="zukan-loading">ポケモンデータを よみこんでいます...</div>';
}

export function renderZukanError(generation) {
  dom.zukanGenerationName.textContent = GENERATION_NAMES[generation] || "世代が わかりません";
  dom.zukanGenerationCount.textContent = "ポケモンデータを よみこめませんでした";
  dom.zukanMessage.textContent = "";
  dom.zukanGrid.innerHTML = "";
}

export function renderZukanGrid(generation, pokemonList) {
  const sortedPokemonList = pokemonList.slice().sort(function(a, b) {
    return a.local_id - b.local_id;
  });

  const ownedCount = calculateZukanOwnedCount(generation, sortedPokemonList);
  const totalCount = sortedPokemonList.length;

  dom.zukanGenerationName.textContent = GENERATION_NAMES[generation] || "世代が わかりません";
  dom.zukanGenerationCount.textContent = ownedCount + " / " + totalCount + " ひき ゲットずみ！";
  dom.zukanMessage.textContent = "";
  dom.zukanGrid.innerHTML = "";

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

    dom.zukanGrid.appendChild(card);
  });
}

export async function renderZukanGeneration(generation) {
  state.selectedZukanGeneration = generation;
  renderZukanTabs();
  renderZukanLoading(generation);

  try {
    const pokemonList = await getGenerationMaster(generation);
    renderZukanGrid(generation, pokemonList);
  } catch (error) {
    renderZukanError(generation);
  }
}

export function openZukan() {
  if (!state.currentUserData) {
    showScreen("user");
    return;
  }

  const visibleGenerations = getVisibleGenerations(state.currentUserData);
  if (visibleGenerations.length === 0) {
    showPlaceholderMessage("ずかんを ひらけませんでした");
    return;
  }

  if (!state.selectedZukanGeneration || !visibleGenerations.includes(state.selectedZukanGeneration)) {
    state.selectedZukanGeneration = visibleGenerations[visibleGenerations.length - 1];
  }

  showScreen("zukan");
  renderZukanTabs();
  renderZukanGeneration(state.selectedZukanGeneration);
}

export function showUncaughtMessage() {
  dom.zukanMessage.textContent = "まだ つかまえていないよ";
  window.setTimeout(function() {
    if (dom.zukanMessage.textContent === "まだ つかまえていないよ") {
      dom.zukanMessage.textContent = "";
    }
  }, 2200);
}

export function normalizeTypeValue(typeValue) {
  if (typeof typeValue === "string") return typeValue;
  if (typeValue && typeof typeValue === "object") {
    if (typeof typeValue.name === "string") return typeValue.name;
    if (typeof typeValue.type === "string") return typeValue.type;
    if (typeValue.type && typeof typeValue.type.name === "string") return typeValue.type.name;
  }
  return "";
}

export function formatPokemonTypes(pokemon) {
  const rawTypes = Array.isArray(pokemon.types)
    ? pokemon.types
    : (Array.isArray(pokemon.type) ? pokemon.type : []);

  const types = rawTypes.map(normalizeTypeValue).filter(function(typeName) {
    return typeName.trim() !== "";
  });

  return types.length > 0 ? types.join(" / ") : "ふめい";
}

export function formatPokemonHeight(pokemon) {
  if (typeof pokemon.height === "number" && Number.isFinite(pokemon.height) && pokemon.height > 0) {
    return pokemon.height + " m";
  }
  if (typeof pokemon.height === "string" && pokemon.height.trim() !== "") {
    return pokemon.height;
  }
  return "ふめい";
}

export function formatPokemonWeight(pokemon) {
  if (typeof pokemon.weight === "number" && Number.isFinite(pokemon.weight) && pokemon.weight > 0) {
    return pokemon.weight + " kg";
  }
  if (typeof pokemon.weight === "string" && pokemon.weight.trim() !== "") {
    return pokemon.weight;
  }
  return "ふめい";
}

export function openPokemonModal(pokemon) {
  dom.modalPokemonName.textContent = pokemon.name || "ポケモン";
  dom.modalPokemonImage.classList.remove("image-error");
  dom.modalPokemonImage.src = pokemon.image || "";
  dom.modalPokemonImage.alt = pokemon.name || "ポケモン";
  dom.modalPokemonImage.onerror = function() {
    dom.modalPokemonImage.classList.add("image-error");
  };
  dom.modalPokemonTypes.textContent = formatPokemonTypes(pokemon);
  dom.modalPokemonHeight.textContent = formatPokemonHeight(pokemon);
  dom.modalPokemonWeight.textContent = formatPokemonWeight(pokemon);
  dom.modalPokemonFlavor.textContent = typeof pokemon.flavor === "string" && pokemon.flavor.trim() !== ""
    ? pokemon.flavor.trim()
    : "せつめいは まだありません。";

  dom.pokemonModalBackdrop.classList.add("show");
  dom.pokemonModalBackdrop.setAttribute("aria-hidden", "false");
}

export function closePokemonModal() {
  dom.pokemonModalBackdrop.classList.remove("show");
  dom.pokemonModalBackdrop.setAttribute("aria-hidden", "true");
  dom.modalPokemonImage.removeAttribute("src");
}

window.AppZukan = {
  openZukanForUnlockedGeneration,
  openZukanForAllComplete,
  getVisibleGenerations,
  isGenerationCleared,
  getOwnedSetForCurrentGeneration,
  isPokemonOwnedInGeneration,
  calculateZukanOwnedCount,
  renderZukanTabs,
  renderZukanLoading,
  renderZukanError,
  renderZukanGrid,
  renderZukanGeneration,
  openZukan,
  showUncaughtMessage,
  normalizeTypeValue,
  formatPokemonTypes,
  formatPokemonHeight,
  formatPokemonWeight,
  openPokemonModal,
  closePokemonModal
};
