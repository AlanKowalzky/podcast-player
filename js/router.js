const routes = [
  { path: /^\/$/, view: () => import("./views/home.js") },
  { path: /^\/podcast\/(.+)$/, view: () => import("./views/podcastDetails.js") },
  { path: /^\/playlist$/, view: () => import("./views/playlist.js") },
];

// Wykrywamy czy jesteśmy na GitHub Pages i definiujemy bazową ścieżkę
const basePath = window.location.hostname.includes('github.io') ? '/podcast-player' : '';

function matchRoute(pathname) {
  return routes.find((route) => route.path.test(pathname));
}

function navigateTo(url) {
  let targetUrl = url;

  // Jeśli przechodzimy do wewnętrznego linku na GH Pages, upewniamy się, że ma prefiks bazy
  if (basePath && !targetUrl.includes(basePath) && targetUrl.startsWith(window.location.origin)) {
    const pathWithoutOrigin = targetUrl.replace(window.location.origin, '');
    targetUrl = `${window.location.origin}${basePath}${pathWithoutOrigin}`;
  }

  history.pushState(null, null, targetUrl);
  renderRoute();
}

async function renderRoute() {
  let pathname = window.location.pathname;

  // Odcinamy "/podcast-player" przed dopasowaniem regexu, żeby pasowało do reguł routes
  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length) || '/';
  }

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
    navigateTo(anchor.href);
  });
}

function initRouter() {
  window.addEventListener("popstate", renderRoute);
  attachLinkHandlers();
  renderRoute();
}

export { initRouter, navigateTo };