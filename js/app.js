import { initRouter } from "./router.js";
import { subscribe, getState } from "./state.js";

function renderShell() {
  const appElement = document.getElementById("app");
  if (!appElement) return;

  const state = getState();
  const playlistCount = state.playlist.length;
  const playerShell = document.getElementById("player-shell");

  if (playerShell) {
    playerShell.innerHTML = `
      <div class="player-placeholder">
        <p>Playlista: ${playlistCount} elementów</p>
        <p>Odtwarzacz jest gotowy.</p>
      </div>
    `;
  }
}

function initApp() {
  initRouter();
  renderShell();
  subscribe(renderShell);
}

initApp();
