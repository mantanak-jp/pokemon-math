import "./config.js";
import "./constants.js";
import "./state.js";
import "./dom.js";
import "./ui.js";
import "./firestore.js";
import "./quiz.js";
import "./reward.js";
import "./zukan.js";

import { setupEvents } from "./app.js";

setupEvents();
window.AppFirestore.initFirebase();
