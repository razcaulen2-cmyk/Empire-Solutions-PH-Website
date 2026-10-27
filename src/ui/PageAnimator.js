const revealSelector = [
  ".hero-copy",
  ".hero-visual",
  ".quick-points",
  ".home-services .section-heading",
  ".service-teaser",
  ".featured-project-image",
  ".featured-project-copy",
  ".home-story",
  ".journal-strip",
  ".interior-hero > .eyebrow",
  ".interior-hero > h1",
  ".interior-hero > p",
  ".interior-hero .button",
  ".journal-card",
  ".journal-callout",
  ".process-step",
  ".service-detail-heading",
  ".service-detail-list",
  ".roadmap-card",
  ".filter-label",
  ".filter-buttons",
  ".portfolio-disclaimer",
  ".about-visual",
  ".about-copy",
  ".values-heading",
  ".value-list article",
  ".about-manifesto > *",
  ".contact-information",
  ".contact-form",
  ".contact-signoff > *",
].join(", ");

export class PageAnimator {
  constructor({ windowRef = window } = {}) {
    this.window = windowRef;
    this.observer = null;
  }

  observe(page) {
    this.disconnect();
    if (!("IntersectionObserver" in this.window) ||
      this.window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    this.observer = new this.window.IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });

    page.querySelectorAll(revealSelector).forEach((element) => {
      const group = element.closest(".service-teaser-grid, .journal-grid, .service-process, .roadmap-grid, .project-grid, .value-list");
      const position = group ? Array.from(group.children).indexOf(element) : 0;
      element.style.setProperty("--reveal-delay", `${Math.min(position, 4) * 85}ms`);
      element.classList.add("reveal");
      this.observer.observe(element);
    });
  }

  disconnect() {
    this.observer?.disconnect();
    this.observer = null;
  }
}
