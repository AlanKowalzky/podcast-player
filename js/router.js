const routes = [
  { path: /^\/$/, view: () => import("./views/home.js") },
  { path: /^\/podcast\/(.+)$/, view: () => import("./views/podcastDetails.js") },
  { path: /^\/playlist$/, view: () => import("./views/playlist.js") },
];

function matchRoute(pathname) {
  return routes.find((route) => route.path.test(pathname));
}

function navigateTo(url) {
  history.pushState(null, null, url);
  renderRoute();
}

async function renderRoute() {
  const pathname = window.location.pathname;
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
