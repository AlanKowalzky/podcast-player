const routes = [
  { path: /^\/$/, view: () => import("./views/home.js") },
  { path: /^\/podcast\/(.+)$/, view: () => import("./views/podcastDetails.js") },
  { path: /^\/playlist$/, view: () => import("./views/playlist.js") },
];

function getPathFromHash() {
  const rawHash = window.location.hash || "#/";
  const cleaned = rawHash.startsWith("#") ? rawHash.slice(1) : rawHash;
  return cleaned || "/";
}

function matchRoute(pathname) {
  return routes.find((route) => route.path.test(pathname));
}

function normalizeHash(url) {
  if (!url) return "#/";
  const hashIndex = url.indexOf("#");
  if (hashIndex !== -1) {
    return url.slice(hashIndex) || "#/";
  }
  if (url.startsWith("/")) {
    return `#${url}`;
  }
  return `#/${url}`;
}

function navigateTo(url) {
  const hashUrl = normalizeHash(url);
  if (window.location.hash !== hashUrl) {
    window.location.hash = hashUrl;
  } else {
    renderRoute();
  }
}

async function renderRoute() {
  const pathname = getPathFromHash();
  const route = matchRoute(pathname);
  const appElement = document.getElementById("app");

  if (!route) {
    appElement.innerHTML = `<h1>404</h1><p>Page not found.</p>`;
    return;
  }

  const match = pathname.match(route.path);
  const params = match?.slice(1) || [];

  const viewModule = await route.view();
  const viewHtml = viewModule.default(params);
  appElement.innerHTML = viewHtml;
}

function attachLinkHandlers() {
  document.body.addEventListener("click", (event) => {
    const anchor = event.target.closest("a[data-link]");
    if (!anchor) return;
    event.preventDefault();
    const href = anchor.getAttribute("href") || anchor.href;
    navigateTo(href);
  });
}

function initRouter() {
  window.addEventListener("hashchange", renderRoute);
  window.addEventListener("load", renderRoute);
  attachLinkHandlers();
  renderRoute();
}

export { initRouter, navigateTo };
