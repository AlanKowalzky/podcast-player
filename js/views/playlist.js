import { getState, removeEpisodeFromPlaylist } from "../state.js";
import { loadEpisode } from "../components/player.js";

function renderPlaylist() {
  const container = document.getElementById("playlist-content");
    if (!container) return;
    const state = getState();
    const list = state.playlist || [];

    if (!list.length) {
      container.innerHTML = `<div class="status-message">Your playlist is empty.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="playlist-list">
        ${list
          .map(
            (ep) => `
          <article class="episode-card" data-episode-id="${ep.id}" data-audio-url="${ep.audio}">
            <div class="episode-card-content">
              <h3>${ep.title}</h3>
              <p class="playlist-episode-note">${ep.audio}</p>
            </div>
            <div class="episode-actions">
              <button class="playlist-play-button" data-episode-id="${ep.id}" data-audio-url="${ep.audio}">Play</button>
              <button class="playlist-remove-button" data-episode-id="${ep.id}">Remove</button>
            </div>
          </article>
        `
          )
          .join("")}
      </div>
    `;

    // attach handlers
    document.querySelectorAll(".playlist-play-button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const audio = btn.dataset.audioUrl;
        const title = btn.closest(".episode-card").querySelector("h3").textContent;
        loadEpisode({ id: btn.closest(".episode-card").dataset.episodeId, title, audio }, 0);
      });
    });

    document.querySelectorAll(".playlist-remove-button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.episodeId;
        removeEpisodeFromPlaylist(id);
        renderPlaylist();
      });
    });
}

export default function playlistView() {
  setTimeout(renderPlaylist, 0);
  return `
    <section>
      <h1 class="page-heading">Playlist</h1>
      <p class="page-description">Saved episodes will appear here.</p>
      <div id="playlist-content" class="playlist-content"></div>
    </section>
  `;
}
