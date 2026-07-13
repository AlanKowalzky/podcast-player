import {
  setState,
  updatePlaybackPosition,
  getSavedPlaybackPosition,
  addEpisodeToPlaylist,
  removeEpisodeFromPlaylist,
  isEpisodeInPlaylist,
  getState,
  setPlaybackPositionTransient,
  normalizeEpisodeMetadata,
} from "../state.js";
import { navigateTo } from "../router.js";

let audio = null;
let currentEpisode = null;
let elements = null;
let lastSavedSecond = 0;
let resumePosition = 0;

function persistPlaybackPosition(force = false) {
  if (!audio || !currentEpisode) return;

  const position = audio.currentTime || 0;
  try {
    setPlaybackPositionTransient(currentEpisode, position);
  } catch (e) {}

  if (force || position - lastSavedSecond >= 5) {
    lastSavedSecond = position;
    updatePlaybackPosition(currentEpisode, position);
  }
}

function formatTime(seconds) {
  const rounded = Math.floor(seconds || 0);
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
          <img id="player-art" class="player-art" src="" alt="cover" />
          <div>
            <p class="player-label">Now playing</p>
            <p id="player-title" class="player-title"><button id="player-link-button" type="button" class="player-playing-icon" aria-label="Open podcast details"><span class="bar b1"></span><span class="bar b2"></span><span class="bar b3"></span></button><span id="player-title-text">No episode selected</span></p>
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
      art: document.getElementById("player-art"),
      title: document.getElementById("player-title"),
      titleText: document.getElementById("player-title-text"),
      playIcon: document.getElementById("player-link-button"),
      toggle: document.getElementById("player-toggle"),
      addBtn: document.getElementById("player-add"),
      progress: document.getElementById("player-progress"),
      progressBar: document.getElementById("player-progress-bar"),
      currentTime: document.getElementById("player-current-time"),
      duration: document.getElementById("player-duration"),
    }; 

    // make play icon and artwork clickable: navigate to podcast details
    try {
      const navigateToPodcast = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        
        // 1. Pobieramy aktualnie odtwarzany odcinek ze stanu aplikacji (Źródło Prawdy)
        const playing = getState().currentEpisode || currentEpisode;
        if (!playing) return;
        
        // 2. JAWNE ROZJAŚNIENIE ŹRÓDŁA ID:
        // Priorytet ma zawsze 'podcastId', ponieważ tam wstrzyknęliśmy unikalny identyfikator twórcy.
        // Unikamy głębokiego sprawdzania 'playing.podcast.id', bo tam siedzi zmockowane Star Wars z API.
        const truePodcastId = playing.podcastId || null;
        
        if (!truePodcastId) {
          console.warn("Player Navigation: Brak poprawnego podcastId w metadanych odcinka.");
          return;
        }
        
        // 3. Bezpieczne przekierowanie do odizolowanego widoku autora
        navigateTo(`/podcast/${truePodcastId}`);
      };

      if (elements.playIcon) {
        elements.playIcon.addEventListener("click", navigateToPodcast);
      }
      if (elements.art) {
        elements.art.addEventListener("click", navigateToPodcast);
        elements.art.setAttribute("role", "button");
        elements.art.setAttribute("aria-label", "Open podcast details");
      }
    } catch (e) {
      console.warn("Player navigation binding failed", e);
    }

    attachPlayerEvents();
  }
}

function attachPlayerEvents() {
  if (!audio || !elements) return;

  // toggle play/pause
  elements.toggle.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().then(() => {
        if (elements.playIcon) elements.playIcon.classList.add("visible");
      }).catch(() => {});
    } else {
      audio.pause();
      if (elements.playIcon) elements.playIcon.classList.remove("visible");
    }
  });

  // add/remove playlist
  elements.addBtn.addEventListener("click", () => {
    if (!currentEpisode) return;
    const episodeForPlaylist = normalizeEpisodeMetadata(currentEpisode, currentEpisode.podcast || null);

    if (isEpisodeInPlaylist(episodeForPlaylist)) {
      removeEpisodeFromPlaylist(episodeForPlaylist);
      elements.addBtn.textContent = "Add";
    } else {
      addEpisodeToPlaylist(episodeForPlaylist);
      elements.addBtn.textContent = "Remove";
    }
  });

  // audio events
  audio.addEventListener("play", () => {
    if (elements) {
      elements.toggle.textContent = "Pause";
      if (elements.playIcon) elements.playIcon.classList.add("visible");
    }
    setState({ isPlaying: true });
  });

  audio.addEventListener("pause", () => {
    if (elements) {
      elements.toggle.textContent = "Play";
      if (elements.playIcon) elements.playIcon.classList.remove("visible");
    }
    setState({ isPlaying: false });
    persistPlaybackPosition(true);
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
    persistPlaybackPosition();
  });

  audio.addEventListener("ended", () => {
    if (currentEpisode) updatePlaybackPosition(currentEpisode, audio.duration || 0);
    if (elements && elements.playIcon) elements.playIcon.classList.remove("visible");
    setState({ isPlaying: false });
  });

  window.addEventListener("pagehide", () => persistPlaybackPosition(true));
  window.addEventListener("beforeunload", () => persistPlaybackPosition(true));
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") persistPlaybackPosition(true); });

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

  const restoredEpisode = getState().currentEpisode;
  if (restoredEpisode?.audio) {
    const savedPosition = getSavedPlaybackPosition(restoredEpisode);
    const initialPosition = savedPosition > 0 ? Math.max(0, savedPosition - 10) : 0;
    const shouldPlay = getState().isPlaying === true;
    loadEpisode(restoredEpisode, initialPosition, { autoPlay: shouldPlay }, restoredEpisode.podcast || null);
  }
}

function loadEpisode(episode, startPosition = null, opts = { autoPlay: true }, fallbackPodcast = null) {
  if (!episode || !episode.audio) return;

  if (!audio) {
    audio = new Audio();
    audio.preload = "metadata";
  }

  renderPlayer();

  const title = episode.title || "Unknown episode";
  const podcastContext = fallbackPodcast || episode?.podcast || null;
  const normalizedEpisode = normalizeEpisodeMetadata(episode, podcastContext);
  const currentEpisodeWithPodcast = podcastContext ? { ...normalizedEpisode, podcast: podcastContext } : normalizedEpisode;

  currentEpisode = currentEpisodeWithPodcast;
  const resetState = {
    currentEpisode: currentEpisodeWithPodcast,
    isPlaying: false,
  };
  setState(resetState);

  try { audio.pause(); } catch (e) {}
  audio.currentTime = 0;
  audio.src = episode.audio;

  const savedPosition = getSavedPlaybackPosition(episode);
  const initialPosition = typeof startPosition === "number"
    ? startPosition
    : savedPosition > 0
      ? Math.max(0, savedPosition - 10)
      : 0;

  resumePosition = initialPosition;
  lastSavedSecond = 0;

  try { setPlaybackPositionTransient(currentEpisode, resumePosition); } catch (e) {}

  audio.load();
  if (opts.autoPlay) {
    audio.play().then(() => {
      setState({ isPlaying: true });
    }).catch((error) => {
      console.warn("Playback failed:", error);
      setState({ isPlaying: false });
    });
  }

  if (elements) {
    if (elements.titleText) elements.titleText.textContent = title; else if (elements.title) elements.title.textContent = title;
    elements.toggle.disabled = false;
    if (elements.addBtn) {
      elements.addBtn.disabled = false;
      const episodeNormalized = normalizeEpisodeMetadata(episode, currentEpisode?.podcast || null);
      elements.addBtn.textContent = isEpisodeInPlaylist(episodeNormalized) ? "Remove" : "Add";
    }
    // set artwork if available
    try {
      const image = (currentEpisode && (currentEpisode.podcastImage || currentEpisode.podcast?.image || currentEpisode.image)) || "";
      if (elements.art) {
        if (image) {
          elements.art.src = image;
          elements.art.style.display = "block";
        } else {
          elements.art.src = "";
          elements.art.style.display = "none";
        }
      }
    } catch (e) {}
  }
}

export { initPlayer, loadEpisode };
