import { fetchBestPodcasts, searchPodcasts } from "../api.js";
import { setState } from "../state.js";

const debounce = (fn, delay = 300) => {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
};

function formatPodcastCard(podcast) {
  const podcastId = podcast.id || podcast.podcast?.id || podcast.podcast_id || "";
  const title = podcast.title || podcast.podcast?.title_original || podcast.podcast?.title || "Unknown title";
  const publisher = podcast.publisher || podcast.podcast?.publisher_original || "Unknown publisher";
  const image = podcast.thumbnail || podcast.image || podcast.podcast?.thumbnail || podcast.podcast?.image || "";

  // safe base64 encode for unicode
  function toBase64(str) {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
      try { return btoa(str); } catch (e2) { return ""; }
    }
  }

  const ctx = { id: podcastId, title, publisher, image };
  const ctxB64 = podcastId ? toBase64(JSON.stringify(ctx)) : "";

  return `
    <a href="#/podcast/${podcastId}" data-link class="podcast-card" data-podcast-context="${ctxB64}">
      <img src="${image}" alt="${title}" class="podcast-card-image" />
      <div class="podcast-card-content">
        <h2>${title}</h2>
        <p>${publisher}</p>
        ${podcastId ? `<p class="podcast-card-meta">ID: ${podcastId}</p>` : ""}
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

// capture clicks on podcast cards to preserve clean podcast context
function fromBase64(b64) {
  try {
    return decodeURIComponent(escape(atob(b64)));
  } catch (e) {
    try { return atob(b64); } catch (e2) { return null; }
  }
}

document.body.addEventListener(
  "click",
  (event) => {
    const card = event.target.closest && event.target.closest(".podcast-card");
    if (!card) return;
    const ctxB64 = card.getAttribute("data-podcast-context");
    if (!ctxB64) return;
    try {
      const json = fromBase64(ctxB64);
      if (!json) return;
      const ctx = JSON.parse(json);
      setState({ activePodcastContext: ctx });
    } catch (e) {
      // ignore
    }
  },
  true
);
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
