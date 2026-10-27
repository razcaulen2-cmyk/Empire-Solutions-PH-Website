export class AppRouter {
  constructor({ routes, pageView, onPageMounted, onRouteChange, documentRef = document, windowRef = window }) {
    this.routesByName = new Map(routes.map((route) => [route.name, route]));
    this.routesByPath = new Map(routes.map((route) => [route.path, route]));
    this.pageView = pageView;
    this.onPageMounted = onPageMounted;
    this.onRouteChange = onRouteChange;
    this.document = documentRef;
    this.window = windowRef;
    this.activeRoute = null;
    this.renderSequence = 0;
  }

  start() {
    this.window.history.scrollRestoration = "manual";
    this.document.addEventListener("click", (event) => this.handleClick(event));
    this.window.addEventListener("popstate", () => this.renderCurrentPath());

    const route = this.getRouteFromPath(this.window.location.pathname);
    if (route.path !== this.normalizePath(this.window.location.pathname)) {
      this.window.history.replaceState(null, "", route.path);
    }
    return this.renderRoute(route);
  }

  getRouteFromPath(pathname) {
    return this.routesByPath.get(this.normalizePath(pathname)) ?? this.routesByPath.get("/");
  }

  normalizePath(pathname) {
    return pathname.replace(/\/+$/, "") || "/";
  }

  handleClick(event) {
    if (event.defaultPrevented || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const retryButton = event.target.closest("button[data-route-retry]");
    if (retryButton && this.activeRoute) {
      event.preventDefault();
      this.renderRoute(this.activeRoute);
      return;
    }

    const link = event.target.closest("a[data-route]");
    if (!link || link.target || link.hasAttribute("download")) return;

    const route = this.routesByName.get(link.dataset.route);
    if (!route) return;

    event.preventDefault();
    this.navigate(route);
  }

  navigate(route) {
    if (route.path !== this.normalizePath(this.window.location.pathname)) {
      this.window.history.pushState(null, "", route.path);
    }
    this.renderRoute(route);
  }

  renderCurrentPath() {
    this.renderRoute(this.getRouteFromPath(this.window.location.pathname));
  }

  async renderRoute(route) {
    const sequence = ++this.renderSequence;
    this.activeRoute = route;
    this.onRouteChange(route);

    try {
      const page = this.pageView.render(route);
      if (sequence !== this.renderSequence) return;

      this.onPageMounted(route, page);
      this.document.title = `${route.title} — Empire Solutions PH`;
      this.updateNavigation(route);
      this.window.scrollTo({ top: 0, behavior: "instant" });
    } catch (error) {
      if (sequence !== this.renderSequence) return;
      this.pageView.showError();
      console.error(`Unable to render the "${route.name}" page.`, error);
    }
  }

  updateNavigation(route) {
    this.document.querySelectorAll("a[data-route]").forEach((link) => {
      if (link.dataset.route === route.name) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }
}
