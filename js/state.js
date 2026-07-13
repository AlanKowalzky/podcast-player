const state = {
  podcasts: [],
  selectedPodcast: null,
  episodes: [],
  currentEpisode: null,
  activePodcastContext: null,
  playlist: [],
  playbackPositions: {},
  isPlaying: false,
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
  saveStorage();
  notify();
}

function getState() {
  return { ...state };
}

function normalizeEpisodeMetadata(episode, fallbackPodcast = null) {
  if (!episode) return null;

  const cleanEpisode = { ...episode };
  const podcast = fallbackPodcast || cleanEpisode.podcast || null;
  const podcastId = (podcast && podcast.id) || cleanEpisode.podcastId || cleanEpisode.podcast_id || "";
  const podcastImage = (podcast && podcast.image) || cleanEpisode.podcastImage || cleanEpisode.podcast_image || cleanEpisode.podcast?.image || "";
  const podcastTitle = (podcast && podcast.title) || cleanEpisode.podcastTitle || cleanEpisode.podcast_title || "Unknown";
  const podcastPublisher = (podcast && podcast.publisher) || cleanEpisode.podcastPublisher || cleanEpisode.publisher || "";

  return {
    ...cleanEpisode,
    podcastId,
    podcastImage,
    podcastTitle,
    podcastPublisher,
  };
}

function getEpisodeKey(episode) {
  if (!episode) return null;
  const episodeId = episode.id ? String(episode.id) : null;
  const podcastId = episode.podcastId ? String(episode.podcastId) : null;
  const podcastTitle = episode.podcastTitle ? String(episode.podcastTitle) : null;
  const audio = episode.audio ? String(episode.audio) : null;

  if (episodeId && podcastId) {
    return `${podcastId}:${episodeId}`;
  }
  if (episodeId && podcastTitle) {
    return `${podcastTitle}:${episodeId}`;
  }
  if (episodeId) {
    return episodeId;
  }
  if (podcastId && audio) {
    return `${podcastId}:${audio}`;
  }
  if (podcastTitle && audio) {
    return `${podcastTitle}:${audio}`;
  }
  return audio ? audio : null;
}

function addEpisodeToPlaylist(episode) {
  if (!episode || !episode.audio) return;
  const normalizedEpisode = normalizeEpisodeMetadata(episode);
  const key = getEpisodeKey(normalizedEpisode);
  if (!key) return;
  const exists = state.playlist.some((item) => getEpisodeKey(item) === key);
  if (exists) return;

  const playlistItem = normalizeEpisodeMetadata(normalizedEpisode);

  state.playlist = [...state.playlist, playlistItem];
  try {
    const legacyKey = episode.audio ? String(episode.audio) : null;
    if (legacyKey && state.playbackPositions[legacyKey] !== undefined && state.playbackPositions[key] === undefined) {
      state.playbackPositions = {
        ...state.playbackPositions,
        [key]: state.playbackPositions[legacyKey],
      };
      const { [legacyKey]: _, ...rest } = state.playbackPositions;
      state.playbackPositions = rest;
    }
  } catch (e) {
    // ignore migration errors
  }

  saveStorage();
  notify();
}

function removeEpisodeFromPlaylist(episodeOrKey) {
  const normalizedEpisode = typeof episodeOrKey === "string" ? null : normalizeEpisodeMetadata(episodeOrKey);
  const key = typeof episodeOrKey === "string" ? episodeOrKey : getEpisodeKey(normalizedEpisode);
  if (!key) return;
  state.playlist = state.playlist.filter((item) => getEpisodeKey(item) !== key);
  
  // Also clear saved playback position for this episode
  if (state.playbackPositions[key] !== undefined) {
    const { [key]: _, ...rest } = state.playbackPositions;
    state.playbackPositions = rest;
  }
  
  saveStorage();
  notify();
}

function isEpisodeInPlaylist(episode) {
  if (!episode) return false;
  const normalizedEpisode = normalizeEpisodeMetadata(episode);
  const key = getEpisodeKey(normalizedEpisode);
  return state.playlist.some((item) => getEpisodeKey(item) === key);
}

function updatePlaybackPosition(episode, position) {
  const normalizedEpisode = normalizeEpisodeMetadata(episode);
  let key = getEpisodeKey(normalizedEpisode);
  // if episode has no id but audio matches a playlist item, use that item's key
  if (!key && episode && episode.audio) {
    const match = state.playlist.find((item) => item.audio === episode.audio);
    if (match) key = getEpisodeKey(match);
  }
  if (!key) return;
  state.playbackPositions = {
    ...state.playbackPositions,
    [key]: position,
  };
  saveStorage();
  notify();
}

function setPlaybackPositionTransient(episode, position) {
  const normalizedEpisode = normalizeEpisodeMetadata(episode);
  let key = getEpisodeKey(normalizedEpisode);
  if (!key && episode && episode.audio) {
    const match = state.playlist.find((item) => item.audio === episode.audio);
    if (match) key = getEpisodeKey(match);
  }
  if (!key) return;
  state.playbackPositions = {
    ...state.playbackPositions,
    [key]: position,
  };
  // notify listeners but don't persist to localStorage (transient UI update)
  notify();
  // dispatch a DOM event so views can react immediately
  try {
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent("playback:transient", { detail: { key, position } }));
    }
  } catch (e) {
    // ignore
  }
}

function getSavedPlaybackPosition(episode) {
  const normalizedEpisode = normalizeEpisodeMetadata(episode);
  const key = getEpisodeKey(normalizedEpisode);
  if (!key) return 0;
  const saved = state.playbackPositions[key];
  if (typeof saved === "number") return saved;
  if (episode && episode.audio) {
    return state.playbackPositions[episode.audio] || 0;
  }
  return 0;
}

function applyStoredState() {
  try {
    const playlist = JSON.parse(localStorage.getItem("podcast-player-playlist") || "null");
    const playbackPositions = JSON.parse(localStorage.getItem("podcast-player-playback") || "null");
    const currentEpisode = JSON.parse(localStorage.getItem("podcast-player-current-episode") || "null");

    if (Array.isArray(playlist)) {
      state.playlist = playlist.map((item) => normalizeEpisodeMetadata(item));
    } else {
      state.playlist = [];
    }

    if (playbackPositions && typeof playbackPositions === "object") {
      state.playbackPositions = playbackPositions;
    } else {
      state.playbackPositions = {};
    }

    if (currentEpisode && typeof currentEpisode === "object") {
      state.currentEpisode = currentEpisode;
    } else {
      state.currentEpisode = null;
    }

    const isPlaying = JSON.parse(localStorage.getItem("podcast-player-is-playing") || "null");
    state.isPlaying = typeof isPlaying === "boolean" ? isPlaying : false;
  } catch (error) {
    console.warn("Failed to read state from localStorage", error);
  }
}

function loadFromStorage() {
  applyStoredState();
  notify();
}

function clearPersistedState() {
  state.playlist = [];
  state.playbackPositions = {};
  state.currentEpisode = null;
  state.isPlaying = false;

  try {
    localStorage.removeItem("podcast-player-playlist");
    localStorage.removeItem("podcast-player-playback");
    localStorage.removeItem("podcast-player-current-episode");
    localStorage.removeItem("podcast-player-is-playing");
  } catch (error) {
    console.warn("Failed to clear persisted state", error);
  }

  notify();
}

function saveStorage() {
  try {
    localStorage.setItem("podcast-player-playlist", JSON.stringify(state.playlist));
    localStorage.setItem("podcast-player-playback", JSON.stringify(state.playbackPositions));
    localStorage.setItem("podcast-player-current-episode", JSON.stringify(state.currentEpisode));
    localStorage.setItem("podcast-player-is-playing", JSON.stringify(state.isPlaying));
  } catch (error) {
    console.warn("Failed to save state to localStorage", error);
  }
}

if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener("storage", (event) => {
    if (event.key && event.key.startsWith("podcast-player-")) {
      loadFromStorage();
    }
  });
  window.addEventListener("focus", loadFromStorage);
  window.addEventListener("pageshow", loadFromStorage);
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
  setPlaybackPositionTransient,
  getEpisodeKey,
  normalizeEpisodeMetadata,
  clearPersistedState,
};
