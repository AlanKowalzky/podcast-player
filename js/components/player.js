import { setState } from "../state.js";

let audio = null;
let currentEpisode = null;
let elements = null;

function formatTime(seconds) {
  const rounded = Math.floor(seconds);
  const minutes = Math.floor(rounded / 60);
  const secs = rounded % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function renderPlayer() {
  const playerShell = document.getElementById("player-shell");
  if (!playerShell) return;

  playerShell.innerHTML = `
    <div class="player-container">
      <div class="player-info">
        <div>
          <p class="player-label">Now playing</p>
          <p id="player-title" class="player-title">No episode selected</p>
        </div>
      </div>
      <div class="player-controls">
        <button id="player-toggle" class="player-toggle" disabled>Play</button>
        <div class="player-progress-wrapper">
          <span id="player-current-time">0:00</span>
          <div id="player-progress" class="player-progress">
            <div id="player-progress-bar" class="player-progress-bar"></div>
          </div>
          <span id="player-duration">0:00</span>
        </div>
      </div>
    </div>
  `;

  elements = {
    title: document.getElementById("player-title"),
    toggle: document.getElementById("player-toggle"),
    progress: document.getElementById("player-progress"),
    progressBar: document.getElementById("player-progress-bar"),
    currentTime: document.getElementById("player-current-time"),
    duration: document.getElementById("player-duration"),
  };

  attachPlayerEvents();
}

function attachPlayerEvents() {
  if (!audio || !elements) return;

  elements.toggle.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", () => {
    if (elements) {
      elements.toggle.textContent = "Pause";
    }
  });

  audio.addEventListener("pause", () => {
    if (elements) {
      elements.toggle.textContent = "Play";
    }
  });

  audio.addEventListener("loadedmetadata", () => {
    if (!elements) return;
    elements.duration.textContent = formatTime(audio.duration || 0);
    elements.currentTime.textContent = formatTime(audio.currentTime || 0);
  });

  audio.addEventListener("timeupdate", () => {
    if (!elements) return;
    const current = audio.currentTime || 0;
    const duration = audio.duration || 1;
    const progress = Math.min(100, (current / duration) * 100);
    elements.currentTime.textContent = formatTime(current);
    elements.progressBar.style.width = `${progress}%`;
  });

  elements.progress.addEventListener("click", (event) => {
    const rect = elements.progress.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    audio.currentTime = percent * (audio.duration || 0);
  });
}

function initPlayer() {
  audio = new Audio();
  audio.preload = "metadata";
  renderPlayer();
}

function loadEpisode(episode) {
  if (!audio || !elements) return;
  if (!episode || !episode.audio) return;

  const title = episode.title || "Unknown episode";

  currentEpisode = episode;
  setState({ currentEpisode: episode });

  audio.src = episode.audio;
  audio.load();
  audio.play().catch((error) => {
    console.warn("Playback failed:", error);
  });

  elements.title.textContent = title;
  elements.toggle.disabled = false;
}

export { initPlayer, loadEpisode };
