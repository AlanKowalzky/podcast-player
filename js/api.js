const BASE_URL = "https://listen-api-test.listennotes.com/api/v2";

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
  const json = await fetchJson(url);
  return json.podcasts || [];
}

async function searchPodcasts(query) {
  const encodedQuery = encodeURIComponent(query);
  const url = `${BASE_URL}/search?q=${encodedQuery}&type=podcast`;
  const json = await fetchJson(url);
  return json.results || [];
}

export { fetchBestPodcasts, searchPodcasts };
