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
    <article class="podcast-card" data-id="${podcast.id}">
      <img src="${podcast.thumbnail}" alt="${podcast.title}" class="podcast-card-image" />
      <div class="podcast-card-content">
        <h2>${podcast.title}</h2>
        <p>${podcast.publisher}</p>
      </div>
    </article>
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
    attachCardHandlers();
  } catch (error) {
    container.innerHTML = `<div class="status-message error">Could not load podcasts.</div>`;
    console.error(error);
  }
}

function attachCardHandlers() {
  document.querySelectorAll(".podcast-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      window.history.pushState(null, null, `/podcast/${id}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
  });
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
    attachCardHandlers();
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
      <div id="home-content" class="home-content"></div>
    </section>
  `;
}
