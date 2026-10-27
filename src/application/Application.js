import { ApiClient } from "../services/ApiClient.js";
import { ArticleDialog } from "../ui/ArticleDialog.js";
import { ContactForm } from "../ui/ContactForm.js";
import { CursorSun } from "../ui/CursorSun.js";
import { PageAnimator } from "../ui/PageAnimator.js";
import { ProjectGallery } from "../ui/ProjectGallery.js";
import { SiteShell } from "../ui/SiteShell.js";
import { AppRouter } from "./AppRouter.js";
import { PageView } from "./PageView.js";

export class Application {
  constructor({ routes, apiBaseUrl, documentRef = document, windowRef = window }) {
    this.document = documentRef;
    this.window = windowRef;
    this.apiClient = new ApiClient({ baseUrl: apiBaseUrl });
    this.pageView = new PageView(this.getOutlet());
    this.animator = new PageAnimator();
    this.cursorSun = new CursorSun({
      documentRef: this.document,
      windowRef: this.window,
    });
    this.siteShell = new SiteShell(this.document);
    this.pageControllers = [];
    this.router = new AppRouter({
      routes,
      pageView: this.pageView,
      onPageMounted: (route, page) => this.mountPage(route, page),
      onRouteChange: () => this.closeMenu(),
      documentRef: this.document,
      windowRef: this.window,
    });
  }

  start() {
    this.siteShell.mount();
    this.cursorSun.mount();
    this.router.start();
    this.dismissStartupScreen();
  }

  dismissStartupScreen() {
    const screen = this.document.querySelector("#startup-screen");
    if (!screen) return;

    const reducedMotion = this.window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fadeDuration = reducedMotion ? 0 : 340;

    this.window.setTimeout(() => {
      screen.setAttribute("aria-hidden", "true");
      screen.classList.add("is-exiting");
      this.window.setTimeout(() => screen.remove(), fadeDuration);
    }, reducedMotion ? 0 : 420);
  }

  getOutlet() {
    const outlet = this.document.querySelector("[data-page-outlet]");
    if (!outlet) throw new Error("The application page outlet is missing.");
    return outlet;
  }

  mountPage(route, page) {
    this.destroyPage();
    this.animator.observe(page);
    this.pageControllers = [];

    if (route.name === "news") {
      this.pageControllers.push(new ArticleDialog(this.document).mount(page));
    }

    if (route.name === "projects") {
      this.pageControllers.push(new ProjectGallery({
        windowRef: this.window,
      }).mount(page));
    }

    if (route.name === "contact") {
      this.pageControllers.push(new ContactForm({
        apiClient: this.apiClient,
        windowRef: this.window,
      }).mount(page));
    }
  }

  destroyPage() {
    this.animator.disconnect();
    this.pageControllers.forEach((controller) => controller.destroy());
    this.pageControllers = [];
  }

  closeMenu() {
    this.siteShell.closeMenu();
    const dialog = this.document.querySelector("#article-dialog");
    if (dialog?.open) dialog.close();
  }
}
