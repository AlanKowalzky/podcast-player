import { setState, updatePlaybackPosition, getSavedPlaybackPosition, addEpisodeToPlaylist, removeEpisodeFromPlaylist, isEpisodeInPlaylist } from "../state.js";

let audio = null;
let currentEpisode = null;
let elements = null;
let lastSavedSecond = 0;
let resumePosition = 0;

function formatTime(seconds) {
  const rounded = Math.floor(seconds);
  const minutes = Math.floor(rounded / 60);
  const secs = rounded % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function renderPlayer() {
  const playerShell = document.getElementById("player-shell");
  if (!playerShell) return;

  if (!playerShell.querySelector(".player-container")) {
    playerShell.innerHTML = `
      <div class="player-container">
        <div class="player-info">
          <div>
            <p class="player-label">Now playing</p>
            <p id="player-title" class="player-title">No episode selected</p>
          </div>
        </div>
        <div class="player-controls">
          <div class="player-control-row">
            <button id="player-toggle" class="player-toggle" disabled>Play</button>
            <button id="player-add" class="player-add" disabled>Add</button>
          </div>
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
      addBtn: document.getElementById("player-add"),
      progress: document.getElementById("player-progress"),
      progressBar: document.getElementById("player-progress-bar"),
      currentTime: document.getElementById("player-current-time"),
      duration: document.getElementById("player-duration"),
    };

    attachPlayerEvents();
  }
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
    if (resumePosition > 0) {
      audio.currentTime = resumePosition;
      resumePosition = 0;
    }
    elements.currentTime.textContent = formatTime(audio.currentTime || 0);
  });

  audio.addEventListener("timeupdate", () => {
    if (!elements) return;
    const current = audio.currentTime || 0;
    const duration = audio.duration || 1;
    const progress = Math.min(100, (current / duration) * 100);
    elements.currentTime.textContent = formatTime(current);
    elements.progressBar.style.width = `${progress}%`;

    if (current - lastSavedSecond >= 5) {
      lastSavedSecond = current;
      if (currentEpisode) {
        updatePlaybackPosition(currentEpisode, current);
      }
    }
  });

  audio.addEventListener("pause", () => {
    if (elements) {
      elements.toggle.textContent = "Play";
    }
    if (currentEpisode) {
      updatePlaybackPosition(currentEpisode, audio.currentTime || 0);
    }
  });

  audio.addEventListener("ended", () => {
    if (currentEpisode) {
      updatePlaybackPosition(currentEpisode, audio.duration || 0);
    }
  });

  elements.progress.addEventListener("click", (event) => {
    const rect = elements.progress.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    audio.currentTime = percent * (audio.duration || 0);
  });

  if (elements.addBtn) {
    elements.addBtn.addEventListener("click", () => {
      if (!currentEpisode) return;
      if (isEpisodeInPlaylist(currentEpisode)) {
        removeEpisodeFromPlaylist(currentEpisode);
        elements.addBtn.textContent = "Add";
      } else {
        addEpisodeToPlaylist(currentEpisode);
        elements.addBtn.textContent = "Remove";
      }
    });
  }
}

function initPlayer() {
  audio = new Audio();
  audio.preload = "metadata";
  renderPlayer();
}

function loadEpisode(episode, startPosition = null) {
  if (!audio || !elements) return;
  if (!episode || !episode.audio) return;

  const title = episode.title || "Unknown episode";

  currentEpisode = episode;
  setState({ currentEpisode: episode });

  audio.src = episode.audio;

  const savedPosition = getSavedPlaybackPosition(episode);
  const initialPosition = typeof startPosition === "number" && startPosition > 0
    ? startPosition
    : savedPosition > 0
      ? Math.max(0, savedPosition - 10)
      : 0;

  resumePosition = initialPosition;
  lastSavedSecond = 0;

  audio.load();
  audio.play().catch((error) => {
    console.warn("Playback failed:", error);
  });

  elements.title.textContent = title;
  elements.toggle.disabled = false;
  if (elements.addBtn) {
    elements.addBtn.disabled = false;
    elements.addBtn.textContent = isEpisodeInPlaylist(episode) ? "Remove" : "Add";
  }
}

export { initPlayer, loadEpisode };
