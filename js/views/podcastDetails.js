import { fetchPodcastDetails } from "../api.js";
import { loadEpisode } from "../components/player.js";
import { addEpisodeToPlaylist, isEpisodeInPlaylist, removeEpisodeFromPlaylist } from "../state.js";

function formatEpisode(episode) {
  const durationMinutes = Math.floor(episode.audio_length_sec / 60);
  const durationSeconds = episode.audio_length_sec % 60;
  const formattedDuration = `${durationMinutes}:${durationSeconds.toString().padStart(2, "0")}`;
  const published = new Date(episode.pub_date_ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const inPlaylist = isEpisodeInPlaylist(episode);
  const playlistButtonText = inPlaylist ? "Remove from playlist" : "Add to playlist";
  const playlistButtonClass = inPlaylist ? "episode-playlist-remove" : "episode-playlist-add";

  return `
    <article class="episode-card" data-episode-id="${episode.id || ''}" data-audio-url="${episode.audio}">
      <div class="episode-card-content">
        <h3>${episode.title}</h3>
        <p>${published} • ${formattedDuration}</p>
      </div>
      <div class="episode-actions">
        <button class="episode-play-button" data-episode-id="${episode.id || ''}" data-audio-url="${episode.audio}">Play</button>
        <button class="${playlistButtonClass}" data-episode-id="${episode.id || ''}" data-audio-url="${episode.audio}">${playlistButtonText}</button>
      </div>
    </article>
  `;
}

function renderPodcastDetails(podcast) {
  const episodes = podcast.episodes || [];
  return `
    <section>
      <button id="back-home" class="back-button">Back to Home</button>
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
          ${episodes.map(formatEpisode).join("")}
        </div>
      </div>
    </section>
  `;
}

async function loadPodcastDetails(id) {
  const container = document.getElementById("podcast-detail-content");
  if (!container) return;
  container.innerHTML = `<div class="status-message">Loading podcast details...</div>`;
  try {
    const podcast = await fetchPodcastDetails(id);
    container.innerHTML = renderPodcastDetails(podcast);
    attachHandlers();
  } catch (error) {
    container.innerHTML = `<div class="status-message error">Could not load podcast details.</div>`;
    console.error(error);
  }
}

function attachHandlers() {
  const backButton = document.getElementById("back-home");
  if (backButton) {
    backButton.addEventListener("click", (event) => {
      event.preventDefault();
      window.history.pushState(null, null, "/");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
  }

  document.querySelectorAll(".episode-play-button").forEach((button) => {
    button.addEventListener("click", () => {
      const audioUrl = button.dataset.audioUrl;
      const titleElement = button.closest(".episode-card").querySelector("h3");
      const title = titleElement ? titleElement.textContent : "Episode";
      loadEpisode({ title, audio: audioUrl });
    });
  });

  document.querySelectorAll(".episode-playlist-add").forEach((button) => {
    button.addEventListener("click", () => {
      const audioUrl = button.dataset.audioUrl;
      const episodeId = button.dataset.episodeId;
      const titleElement = button.closest(".episode-card").querySelector("h3");
      const title = titleElement ? titleElement.textContent : "Episode";
      addEpisodeToPlaylist({ id: episodeId, title, audio: audioUrl });
      loadPodcastDetails(window.location.pathname.split("/").pop());
    });
  });

  document.querySelectorAll(".episode-playlist-remove").forEach((button) => {
    button.addEventListener("click", () => {
      const episodeId = button.dataset.episodeId;
      removeEpisodeFromPlaylist(episodeId);
      loadPodcastDetails(window.location.pathname.split("/").pop());
    });
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
