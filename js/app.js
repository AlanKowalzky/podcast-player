import { initRouter } from "./router.js";
import { initPlayer } from "./components/player.js";

function initApp() {
  initPlayer();
  initRouter();
}

initApp();
