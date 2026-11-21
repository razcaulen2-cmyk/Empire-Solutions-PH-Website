export class HomeParallax {
  constructor({ windowRef = window } = {}) {
    this.window = windowRef;
    this.elements = [];
    this.frame = null;
  }

  mount(page) {
    this.destroy();
    if (this.window.matchMedia("(prefers-reduced-motion: reduce)").matches) return this;

    this.elements = Array.from(page.querySelectorAll("[data-parallax-speed]")).map((element) => {
      const speed = Number(element.dataset.parallaxSpeed);
      if (!Number.isFinite(speed)) throw new Error("A homepage parallax speed is invalid.");
      return { element, speed };
    });

    if (this.elements.length === 0) return this;
    this.window.addEventListener("scroll", this.schedule, { passive: true });
    this.window.addEventListener("resize", this.schedule, { passive: true });
    this.update();
    return this;
  }

  schedule = () => {
    if (this.frame !== null) return;
    this.frame = this.window.requestAnimationFrame(this.update);
  };

  update = () => {
    this.frame = null;
    const viewportCenter = this.window.innerHeight / 2;

    this.elements.forEach(({ element, speed }) => {
      const bounds = element.getBoundingClientRect();
      const distanceFromCenter = viewportCenter - (bounds.top + bounds.height / 2);
      const offset = Math.max(-48, Math.min(48, distanceFromCenter * speed));
      element.style.setProperty("--parallax-offset", `${offset.toFixed(2)}px`);
    });
  };

  destroy() {
    this.window.removeEventListener("scroll", this.schedule);
    this.window.removeEventListener("resize", this.schedule);
    if (this.frame !== null) this.window.cancelAnimationFrame(this.frame);
    this.elements.forEach(({ element }) => element.style.removeProperty("--parallax-offset"));
    this.elements = [];
    this.frame = null;
  }
}
