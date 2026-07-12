import { fetchBestPodcasts, searchPodcasts } from "../api.js";

const debounce = (fn, delay = 300) => {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
};

function formatPodcastCard(podcast) {
  return `
    <a href="/podcast/${podcast.id}" data-link class="podcast-card">
      <img src="${podcast.thumbnail}" alt="${podcast.title}" class="podcast-card-image" />
      <div class="podcast-card-content">
        <h2>${podcast.title}</h2>
        <p>${podcast.publisher}</p>
      </div>
    </a>
  `;
}

function renderPodcasts(podcasts) {
  if (!podcasts.length) {
    return `<div class="status-message">No podcasts found.</div>`;
  }

  return `<div class="podcast-grid">${podcasts.map(formatPodcastCard).join("")}</div>`;
}

async function loadHomeView() {
  const container = document.getElementById("home-content");
  if (!container) return;

  container.innerHTML = `<div class="status-message">Loading podcasts...</div>`;

  try {
    const podcasts = await fetchBestPodcasts();
      container.innerHTML = renderPodcasts(podcasts);
  } catch (error) {
    container.innerHTML = `<div class="status-message error">Could not load podcasts.</div>`;
    console.error(error);
  }
}

const searchHandler = debounce(async () => {
  const input = document.getElementById("podcast-search");
  const container = document.getElementById("home-content");
  if (!input || !container) return;

  const query = input.value.trim();
  if (!query) {
    loadHomeView();
    return;
  }

  container.innerHTML = `<div class="status-message">Loading search results...</div>`;

  try {
    const podcasts = await searchPodcasts(query);
    container.innerHTML = renderPodcasts(podcasts);
  } catch (error) {
    container.innerHTML = `<div class="status-message error">Search failed.</div>`;
    console.error(error);
  }
}, 400);

window.addEventListener("input", (event) => {
  if (event.target && event.target.id === "podcast-search") {
    searchHandler();
  }
});

export default function homeView() {
  setTimeout(loadHomeView, 0);
  return `
    <section>
      <h1 class="page-heading">Welcome to Podcast Player</h1>
      <p class="page-description">Start by searching or browse featured podcasts.</p>
      <div class="search-panel">
        <input id="podcast-search" type="text" placeholder="Search podcasts..." autocomplete="off" />
      </div>
      <p class="api-note">Search results may be limited by the Listen Notes test API and may not match every query.</p>
      <div id="home-content" class="home-content"></div>
    </section>
  `;
}
