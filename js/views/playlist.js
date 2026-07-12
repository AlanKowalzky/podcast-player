import { getState, removeEpisodeFromPlaylist } from "../state.js";

function formatPlaylistItem(episode) {
  return `
    <article class="playlist-card" data-audio-url="${episode.audio}">
      <div>
        <h3>${episode.title}</h3>
        <p>${episode.audio}</p>
      </div>
      <button class="playlist-remove-button" data-audio-url="${episode.audio}">Remove</button>
    </article>
  `;
}

function renderPlaylistItems() {
  const { playlist } = getState();
  if (!playlist.length) {
    return `<div class="status-message">Your playlist is empty.</div>`;
  }

  return `<div class="playlist-list">${playlist.map(formatPlaylistItem).join("")}</div>`;
}

function attachPlaylistHandlers() {
  document.querySelectorAll(".playlist-remove-button").forEach((button) => {
    button.addEventListener("click", () => {
      const audioUrl = button.dataset.audioUrl;
      removeEpisodeFromPlaylist(audioUrl);
      renderPlaylist();
    });
  });
}

function renderPlaylist() {
  const container = document.getElementById("playlist-content");
  if (!container) return;
  container.innerHTML = renderPlaylistItems();
  attachPlaylistHandlers();
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
