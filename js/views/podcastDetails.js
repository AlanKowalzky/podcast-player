import { fetchPodcastDetails } from "../api.js";
import { loadEpisode } from "../components/player.js";
import { addEpisodeToPlaylist, getEpisodeKey, isEpisodeInPlaylist, normalizeEpisodeMetadata, removeEpisodeFromPlaylist, setState, getState } from "../state.js";

function formatEpisode(episode, podcast) {
  const durationMinutes = Math.floor(episode.audio_length_sec / 60);
  const durationSeconds = episode.audio_length_sec % 60;
  const formattedDuration = `${durationMinutes}:${durationSeconds.toString().padStart(2, "0")}`;
  const published = new Date(episode.pub_date_ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const episodeImage = episode.image || episode.thumbnail || "";
  const podcastId = podcast?.id || "";

  const normalizedEpisode = normalizeEpisodeMetadata({ ...episode, podcastId }, podcast);
  const inPlaylist = isEpisodeInPlaylist(normalizedEpisode);
  const playlistButtonText = inPlaylist ? "Remove from playlist" : "Add to playlist";
  const playlistButtonClass = inPlaylist ? "episode-playlist-remove" : "episode-playlist-add";

  return `
    <article class="episode-card" data-episode-id="${episode.id || ''}" data-audio-url="${episode.audio}" data-podcast-id="${podcastId}" data-podcast-title="${podcast.title || ''}" data-podcast-image="${podcast.image || ''}" data-podcast-publisher="${podcast.publisher || ''}" data-episode-image="${episodeImage}">
      <div class="episode-card-content">
        <h3>${episode.title}</h3>
        <p>${published} • ${formattedDuration}</p>
      </div>
      <div class="episode-actions">
        <button class="episode-play-button" data-episode-id="${episode.id || ''}" data-audio-url="${episode.audio}" data-podcast-id="${podcastId}" data-podcast-title="${podcast.title || ''}" data-podcast-image="${podcast.image || ''}" data-podcast-publisher="${podcast.publisher || ''}" data-episode-image="${episodeImage}">Play</button>
        <button class="${playlistButtonClass}" data-episode-id="${episode.id || ''}" data-audio-url="${episode.audio}" data-podcast-id="${podcastId}" data-podcast-title="${podcast.title || ''}" data-podcast-image="${podcast.image || ''}" data-podcast-publisher="${podcast.publisher || ''}" data-episode-image="${episodeImage}">${playlistButtonText}</button>
      </div>
    </article>
  `;
}

function renderPodcastDetails(podcast) {
  const episodes = podcast.episodes || [];
  return `
    <section>
      <button id="back-home" class="back-button">Back home</button>
      <div class="podcast-header">
        <img src="${podcast.image}" alt="${podcast.title}" class="podcast-header-image" />
        <div class="podcast-header-details">
          <h1 class="page-heading">${podcast.title}</h1>
          <p class="page-description">${podcast.publisher}</p>
          <p class="podcast-description">${podcast.description || "No description available."}</p>
        </div>
      </div>
      <div class="episodes-section">
        <h2>Episodes</h2>
        <div class="episode-list">
          ${episodes.map((episode) => formatEpisode(episode, podcast)).join("")}
        </div>
      </div>
    </section>
  `;
}

function resolvePodcastHeader(id, apiPodcast) {
  const active = getState().activePodcastContext;
  const playing = getState().currentEpisode;
  const currentViewPodcastId = String(id);
  const sourceFromActive = active && String(active.id) === currentViewPodcastId;
  const sourceFromEpisode = !sourceFromActive && playing && String(playing.podcastId) === currentViewPodcastId;

  const api = { ...apiPodcast };
  return {
    id: currentViewPodcastId,
    title:
      (sourceFromActive && active.title) ||
      (sourceFromEpisode && (playing.podcastTitle || playing.podcast?.title)) ||
      api.title ||
      "Unknown",
    image:
      (sourceFromActive && active.image) ||
      (sourceFromEpisode && (playing.podcastImage || playing.podcast?.image)) ||
      api.image ||
      "",
    publisher:
      (sourceFromActive && active.publisher) ||
      (sourceFromEpisode && (playing.podcastPublisher || playing.podcast?.publisher)) ||
      api.publisher ||
      "",
    description: api.description || "",
    episodes: api.episodes || [],
  };
}

function refreshPlaylistButtons(podcast) {
  document.querySelectorAll(".episode-card").forEach((card) => {
    const episodeId = card.dataset.episodeId;
    const podId = card.dataset.podcastId || podcast.id;
    const normalizedEpisode = normalizeEpisodeMetadata({ id: episodeId, podcastId: podId }, podcast);
    const inPlaylist = isEpisodeInPlaylist(normalizedEpisode);
    const button = card.querySelector(".episode-playlist-add, .episode-playlist-remove");
    if (!button) return;
    button.textContent = inPlaylist ? "Remove from playlist" : "Add to playlist";
    button.className = inPlaylist ? "episode-playlist-remove" : "episode-playlist-add";
  });
}

async function loadPodcastDetails(id) {
  const container = document.getElementById("podcast-detail-content");
  if (!container) return;
  container.innerHTML = `<div class="status-message">Loading podcast details...</div>`;
  try {
    const apiPodcast = await fetchPodcastDetails(id);
    const podcast = resolvePodcastHeader(id, apiPodcast);
    setState({ selectedPodcast: podcast });
    container.innerHTML = renderPodcastDetails(podcast);
    attachHandlers(podcast);
    refreshPlaylistButtons(podcast);
  } catch (error) {
    container.innerHTML = `<div class="status-message error">Could not load podcast details.</div>`;
    console.error(error);
  }
}

function attachHandlers(podcast) {
  const backButton = document.getElementById("back-home");
  if (backButton) {
    backButton.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.hash = "#/";
    });
  }

  const episodeList = document.querySelector(".episode-list");
  if (!episodeList) return;

  episodeList.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || !episodeList.contains(button)) return;

    const card = button.closest(".episode-card");
    if (!card) return;

    const episodeId = card.dataset.episodeId;
    const podcastId = card.dataset.podcastId || podcast.id;
    const titleElement = card.querySelector("h3");
    const title = titleElement ? titleElement.textContent : "Episode";
    const audioUrl = button.dataset.audioUrl || card.dataset.audioUrl;
    const episodeImage = card.dataset.episodeImage || "";
    const podcastTitle = card.dataset.podcastTitle || podcast.title;
    const podcastImage = card.dataset.podcastImage || podcast.image;
    const podcastPublisher = card.dataset.podcastPublisher || podcast.publisher;

    if (button.classList.contains("episode-play-button")) {
      loadEpisode({
        id: episodeId,
        title,
        audio: audioUrl,
        podcastId: podcast.id,
        podcastTitle: podcast.title,
        podcastImage: podcast.image,
        podcastPublisher: podcast.publisher,
      }, null, { autoPlay: true }, podcast);
      return;
    }

    if (button.classList.contains("episode-playlist-add")) {
      addEpisodeToPlaylist(normalizeEpisodeMetadata({
        id: episodeId,
        title,
        audio: audioUrl,
        image: episodeImage,
        episodeImage,
        podcastId,
        podcastTitle,
        podcastImage,
        podcastPublisher,
      }, podcast));
      refreshPlaylistButtons(podcast);
      return;
    }

    if (button.classList.contains("episode-playlist-remove")) {
      const episodeKey = getEpisodeKey(normalizeEpisodeMetadata({ id: episodeId, podcastId }, podcast));
      removeEpisodeFromPlaylist(episodeKey);
      refreshPlaylistButtons(podcast);
    }
  });
}

export default function podcastDetailsView(params) {
  setTimeout(() => {
    loadPodcastDetails(params[0]);
  }, 0);
  return `
    <section id="podcast-detail-content">
      <div class="status-message">Preparing podcast details...</div>
    </section>
  `;
}
