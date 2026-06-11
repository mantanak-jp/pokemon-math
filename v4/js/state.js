export const state = {
  db: null,
  firebaseReady: false,
  selectedUserId: null,
  selectedUserLabel: "",
  currentUserData: null,
  currentGeneration: null,
  currentGenerationPokemonList: null,
  currentGenerationMasterPromise: null,
  currentGenerationMasterError: null,
  isLoadingUser: false,
  selectedLevel: 1,
  currentQuestionIndex: 0,
  correctCount: 0,
  currentCorrectAnswer: 0,
  isAnswered: false,
  quizTimerId: null,
  pendingRewardPokemon: [],
  pendingRewardPokemonList: [],
  isSavingReward: false,
  lastProgressResult: null,
  generationStartLevel: 1,
  generationStartTarget: null,
  selectedZukanGeneration: null,
  generationMasterCache: {},
  generationMasterPromises: {}
};

window.AppState = state;
