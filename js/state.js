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
  notify();
}

function getState() {
  return { ...state };
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
    console.warn("Nie udało się wczytać stanu z localStorage", error);
  }
}

function saveStorage() {
  localStorage.setItem("podcast-player-playlist", JSON.stringify(state.playlist));
  localStorage.setItem("podcast-player-playback", JSON.stringify(state.playbackPositions));
}

function updatePlaylist(playlist) {
  setState({ playlist });
  saveStorage();
}

function updatePlaybackPositions(playbackPositions) {
  setState({ playbackPositions });
  saveStorage();
}

loadFromStorage();

export { subscribe, unsubscribe, getState, setState, updatePlaylist, updatePlaybackPositions };
