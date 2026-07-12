const BASE_URL = "https://listen-api-test.listennotes.com/api/v2";

const DEFAULT_PODCASTS = [
  {
    id: "4d3fe717742d4963a85562e9f84d8c79",
    title: "The Daily",
    publisher: "The New York Times",
    thumbnail: "https://example.com/daily.jpg",
  },
  {
    id: "2f47eeabaf4a4a79b3b88b1c0f8d1aa2",
    title: "Syntax",
    publisher: "Wes Bos & Scott Tolinski",
    thumbnail: "https://example.com/syntax.jpg",
  },
  {
    id: "7c3ac1e0f6d74456aa6c89e2f4b16d61",
    title: "TED Radio Hour",
    publisher: "NPR",
    thumbnail: "https://example.com/ted.jpg",
  },
  {
    id: "5c64d01c41a34c229f0b3286a3a5302f",
    title: "99% Invisible",
    publisher: "NPR",
    thumbnail: "https://example.com/99pi.jpg",
  },
];

async function fetchJson(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
}

async function fetchBestPodcasts() {
  const url = `${BASE_URL}/best_podcasts?sort=recent_published_first&page=1`;
  try {
    const json = await fetchJson(url);
    return json.podcasts || DEFAULT_PODCASTS;
  } catch (error) {
    console.warn("Best podcasts API unavailable, using fallback data.", error);
    return DEFAULT_PODCASTS;
  }
}

async function searchPodcasts(query) {
  const encodedQuery = encodeURIComponent(query);
  const url = `${BASE_URL}/search?q=${encodedQuery}&type=podcast`;
  try {
    const json = await fetchJson(url);
    const results = json.results || [];
    return results.length ? results : DEFAULT_PODCASTS;
  } catch (error) {
    console.warn("Search API unavailable, using fallback data.", error);
    return DEFAULT_PODCASTS.filter((podcast) =>
      podcast.title.toLowerCase().includes(query.toLowerCase()) ||
      podcast.publisher.toLowerCase().includes(query.toLowerCase())
    );
  }
}

async function fetchPodcastDetails(id) {
  const url = `${BASE_URL}/podcasts/${encodeURIComponent(id)}`;
  const json = await fetchJson(url);
  return json;
}

export { fetchBestPodcasts, searchPodcasts, fetchPodcastDetails };
