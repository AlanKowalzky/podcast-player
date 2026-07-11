const state = {
  podcasts: [],
  selectedPodcast: null,
  episodes: [],
  currentEpisode: null,
  playlist: [],
  playbackPositions: {},
};

const listeners = new Set();

function subscribe(listener) {
  listeners.add(listener);
}

function unsubscribe(listener) {
  listeners.delete(listener);
}

function notify() {
  listeners.forEach((listener) => listener(state));
}

function setState(partial) {
  Object.assign(state, partial);
  if (Object.prototype.hasOwnProperty.call(partial, "playlist") || Object.prototype.hasOwnProperty.call(partial, "playbackPositions")) {
    saveStorage();
  }
  notify();
}

function getState() {
  return { ...state };
}

function getEpisodeKey(episode) {
  if (!episode) return null;
  return episode.id ? String(episode.id) : episode.audio ? String(episode.audio) : null;
}

function addEpisodeToPlaylist(episode) {
  if (!episode || !episode.audio) return;
  const key = getEpisodeKey(episode);
  if (!key) return;
  const exists = state.playlist.some((item) => getEpisodeKey(item) === key);
  if (exists) return;

  state.playlist = [...state.playlist, episode];
  saveStorage();
  notify();
}

function removeEpisodeFromPlaylist(episodeOrKey) {
  const key = typeof episodeOrKey === "string" ? episodeOrKey : getEpisodeKey(episodeOrKey);
  if (!key) return;
  state.playlist = state.playlist.filter((item) => getEpisodeKey(item) !== key);
  saveStorage();
  notify();
}

function isEpisodeInPlaylist(episode) {
  if (!episode) return false;
  const key = getEpisodeKey(episode);
  return state.playlist.some((item) => getEpisodeKey(item) === key);
}

function updatePlaybackPosition(episode, position) {
  const key = getEpisodeKey(episode);
  if (!key) return;
  state.playbackPositions = {
    ...state.playbackPositions,
    [key]: position,
  };
  saveStorage();
  notify();
}

function getSavedPlaybackPosition(episode) {
  const key = getEpisodeKey(episode);
  if (!key) return 0;
  return state.playbackPositions[key] || 0;
}

function loadFromStorage() {
  try {
    const playlist = JSON.parse(localStorage.getItem("podcast-player-playlist") || "null");
    const playbackPositions = JSON.parse(localStorage.getItem("podcast-player-playback") || "null");
    if (Array.isArray(playlist)) {
      state.playlist = playlist;
    }
    if (playbackPositions && typeof playbackPositions === "object") {
      state.playbackPositions = playbackPositions;
    }
  } catch (error) {
    console.warn("Failed to read state from localStorage", error);
  }
}

function saveStorage() {
  localStorage.setItem("podcast-player-playlist", JSON.stringify(state.playlist));
  localStorage.setItem("podcast-player-playback", JSON.stringify(state.playbackPositions));
}

loadFromStorage();

export {
  subscribe,
  unsubscribe,
  getState,
  setState,
  addEpisodeToPlaylist,
  removeEpisodeFromPlaylist,
  isEpisodeInPlaylist,
  updatePlaybackPosition,
  getSavedPlaybackPosition,
};
