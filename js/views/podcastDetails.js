import { fetchPodcastDetails } from "../api.js";
import { loadEpisode } from "../components/player.js";

function formatEpisode(episode) {
  const durationMinutes = Math.floor(episode.audio_length_sec / 60);
  const published = new Date(episode.pub_date_ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return `
    <article class="episode-card">
      <div class="episode-card-content">
        <h3>${episode.title}</h3>
        <p>${published} • ${durationMinutes} min</p>
      </div>
      <button class="episode-play-button" data-audio-url="${episode.audio}">Play</button>
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
