import { initRouter } from "./router.js";
import { subscribe, getState } from "./state.js";
import { initPlayer } from "./components/player.js";

function renderShell() {
  const appElement = document.getElementById("app");
  if (!appElement) return;

  const state = getState();
  const playlistCount = state.playlist.length;
  const playerShell = document.getElementById("player-shell");

  if (playerShell) {
    playerShell.innerHTML = `
      <div class="player-placeholder">
        <p>Playlist items: ${playlistCount}</p>
        <p>The player is ready.</p>
      </div>
    `;
  }
}

function initApp() {
  initRouter();
  initPlayer();
  renderShell();
  subscribe(renderShell);
}

initApp();
