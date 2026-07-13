import { getState, removeEpisodeFromPlaylist, subscribe, getSavedPlaybackPosition, getEpisodeKey } from "../state.js";
import { loadEpisode } from "../components/player.js";

let playlistSubscription = null;

function ensurePlaylistSubscription() {
  if (playlistSubscription) return;
  playlistSubscription = () => renderPlaylist();
  subscribe(playlistSubscription);
  // also listen to transient playback events for immediate UI refresh
  try {
    if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
      window.addEventListener("playback:transient", playlistSubscription);
    }
  } catch (e) {}
}

function formatTime(seconds) {
  const totalSeconds = Math.max(0, Math.floor(seconds || 0));
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function getProgressMeta(episode, playbackPositions) {
  const savedPosition = getSavedPlaybackPosition(episode);
  const durationSec = Number(episode.durationSec || episode.audio_length_sec || 0);
  const safeDuration = durationSec > 0 ? durationSec : 0;
  const listenedSec = safeDuration > 0 ? Math.min(savedPosition, safeDuration) : savedPosition;
  const progressPercent = safeDuration > 0 ? Math.min(100, Math.round((listenedSec / safeDuration) * 100)) : 0;
  const isNearEnd = safeDuration > 0 && listenedSec >= Math.max(0, safeDuration - 10);

  let listenedText = "Not started yet";
  if (safeDuration > 0) {
    listenedText = `${formatTime(listenedSec)} / ${formatTime(safeDuration)} (${progressPercent}%)`;
  } else if (savedPosition > 0) {
    listenedText = `${formatTime(savedPosition)} listened`;
  }

  return { listenedText, progressPercent, isNearEnd };
}

function renderPlaylist() {
  ensurePlaylistSubscription();

  const container = document.getElementById("playlist-content");
  if (!container) return;

  const state = getState();
  const list = state.playlist || [];
  const playbackPositions = state.playbackPositions || {};

  if (!list.length) {
    container.innerHTML = `<div class="status-message">Your playlist is empty.</div>`;
    return;
  }

  container.innerHTML = `
    <div class="playlist-list">
      ${list
        .map((ep) => {
          const { listenedText, progressPercent, isNearEnd } = getProgressMeta(ep, playbackPositions);
          const nearEndClass = isNearEnd ? "is-near-end" : "";
          const podcastImage = ep.podcastImage || ep.podcast_image || ep.image || ep.thumbnail || "";
          const episodeImage = ep.episodeImage || ep.image || ep.thumbnail || "";
          const podcastIdDisplay = ep.podcastId || ep.podcast_id || ep.id || "";
          const podcastTitleDisplay = ep.podcastTitle || ep.podcast_title || "";
          const podcastPublisherDisplay = ep.podcastPublisher || ep.publisher || "";
          const podcastInfo = podcastTitleDisplay ? `${podcastTitleDisplay}${podcastPublisherDisplay ? ` • ${podcastPublisherDisplay}` : ""}` : "";
          const episodeKey = getEpisodeKey(ep);
          const displayTitle = ep.title || "Episode";
          const displayPodcastTitle = podcastTitleDisplay || displayTitle;
          return `
            <article class="episode-card ${nearEndClass}" data-episode-key="${episodeKey || ""}" data-episode-id="${ep.id || ""}" data-audio-url="${ep.audio || ""}" data-podcast-id="${podcastIdDisplay}" data-podcast-title="${podcastTitleDisplay}" data-podcast-image="${podcastImage}" data-podcast-publisher="${podcastPublisherDisplay}">
              <div class="playlist-icons">
                ${podcastImage ? `<img src="${podcastImage}" alt="Podcast cover for ${displayPodcastTitle}" class="playlist-artist-icon" />` : ""}
                ${episodeImage && episodeImage !== podcastImage ? `<img src="${episodeImage}" alt="Episode cover for ${displayTitle}" class="playlist-episode-icon" />` : ""}
              </div>
              <div class="episode-card-content">
                <h3>${displayTitle}</h3>
                ${podcastInfo ? `<p class="playlist-podcast-info">${podcastInfo}</p>` : ""}
                ${podcastIdDisplay || podcastTitleDisplay || podcastPublisherDisplay ? `<p class="playlist-podcast-meta">${podcastTitleDisplay ? `Podcast: ${podcastTitleDisplay}` : ""}${podcastPublisherDisplay ? `${podcastTitleDisplay ? " • " : ""}Artist: ${podcastPublisherDisplay}` : ""}${podcastIdDisplay ? `${podcastTitleDisplay || podcastPublisherDisplay ? " • " : ""}id: ${podcastIdDisplay}` : ""}</p>` : ""}
                <p class="playlist-episode-note">${listenedText}${isNearEnd ? " • Last 10s" : ""}</p>
                ${progressPercent > 0 ? `<p class="playlist-progress-caption">${progressPercent}% listened</p>` : ""}
                <div class="playlist-progress-shell" aria-hidden="true">
                  <div class="playlist-progress-bar" style="width: ${progressPercent}%"></div>
                </div>
              </div>
              <div class="episode-actions">
                <button class="playlist-play-button" data-episode-key="${episodeKey || ""}" data-audio-url="${ep.audio || ""}">Play</button>
                <button class="playlist-remove-button" data-episode-key="${episodeKey || ""}">Remove</button>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;

  const playlistEntries = list;

  document.querySelectorAll(".playlist-play-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const episodeKey = btn.dataset.episodeKey;
      const card = btn.closest(".episode-card");
      const storedEpisode = playlistEntries.find((item) => getEpisodeKey(item) === episodeKey);
      const audio = card.dataset.audioUrl;
      const title = card.querySelector("h3").textContent;
      const podcastId = card.dataset.podcastId;
      const podcastTitle = card.dataset.podcastTitle;
      const podcastImage = card.dataset.podcastImage;
      const podcastPublisher = card.dataset.podcastPublisher;
      const episodeId = card.dataset.episodeId;
      const episodeToLoad = storedEpisode || {
        id: episodeId,
        title,
        audio,
        podcastId,
        podcastTitle,
        podcastImage,
        podcastPublisher,
      };
      const saved = getSavedPlaybackPosition(episodeToLoad) || 0;
      const startPos = saved > 0 ? Math.max(0, saved - 10) : 0;
      loadEpisode(episodeToLoad, startPos);
    });
  });

  document.querySelectorAll(".playlist-remove-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const episodeKey = btn.dataset.episodeKey;
      if (episodeKey) {
        removeEpisodeFromPlaylist(episodeKey);
      } else {
        const card = btn.closest(".episode-card");
        const episodeId = card.dataset.episodeId;
        const podcastId = card.dataset.podcastId;
        removeEpisodeFromPlaylist({ id: episodeId, podcastId });
      }
      renderPlaylist();
    });
  });
}

export default function playlistView() {
  setTimeout(() => {
    ensurePlaylistSubscription();
    renderPlaylist();
  }, 0);
  return `
    <section>
      <h1 class="page-heading">Playlist</h1>
      <p class="page-description">Saved episodes will appear here.</p>
      <div id="playlist-content" class="playlist-content"></div>
    </section>
  `;
}
