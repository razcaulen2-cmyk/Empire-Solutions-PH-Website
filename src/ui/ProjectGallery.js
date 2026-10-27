export class ProjectGallery {
  constructor({ windowRef = window } = {}) {
    this.window = windowRef;
    this.abortController = null;
    this.activeFilter = null;
    this.filterSequence = 0;
    this.gridAnimation = null;
  }

  mount(page) {
    this.buttons = [...page.querySelectorAll("[data-filter]")];
    this.cards = [...page.querySelectorAll(".project-card[data-storage]")];
    this.result = page.querySelector(".filter-result");
    this.grid = page.querySelector(".project-grid");

    if (!this.buttons.length || !this.cards.length || !this.result || !this.grid) {
      throw new Error("The project gallery is missing its filters, project cards, grid, or result summary.");
    }

    this.abortController = new AbortController();
    this.buttons.forEach((button) => {
      button.addEventListener("click", () => this.filter(button.dataset.filter), {
        signal: this.abortController.signal,
      });
    });
    this.filter("all");
    return this;
  }

  async filter(filter) {
    if (!["all", "battery", "inverter"].includes(filter)) {
      throw new Error(`Unknown project filter "${filter}".`);
    }

    if (this.activeFilter === filter) return;
    const isInitialFilter = this.activeFilter === null;
    const sequence = ++this.filterSequence;
    this.activeFilter = filter;
    this.gridAnimation?.cancel();
    this.gridAnimation = null;

    this.buttons.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    const matches = this.cards.filter((card) =>
      filter === "all" ||
      (filter === "battery" && card.dataset.storage === "yes") ||
      (filter === "inverter" && card.dataset.storage === "no"),
    );
    const hiddenCards = this.cards.filter((card) => !matches.includes(card));
    const shouldAnimate = !isInitialFilter &&
      !this.window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!shouldAnimate) {
      this.renderCards(matches, hiddenCards);
      this.updateResult(filter, matches.length);
      this.grid.setAttribute("aria-busy", "false");
      return;
    }

    this.grid.classList.add("is-filtering");
    this.grid.setAttribute("aria-busy", "true");
    this.renderCards(matches, hiddenCards);
    this.updateResult(filter, matches.length);

    if (typeof this.grid.animate === "function") {
      const animation = this.grid.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 220, easing: "ease-out" },
      );
      this.gridAnimation = animation;
      try {
        await animation.finished;
      } catch (error) {
        if (error.name !== "AbortError") throw error;
      } finally {
        if (this.gridAnimation === animation) {
          animation.cancel();
          this.gridAnimation = null;
        }
      }
    }

    if (!this.abortController.signal.aborted && sequence === this.filterSequence) {
      this.grid.classList.remove("is-filtering");
      this.grid.setAttribute("aria-busy", "false");
    }
  }

  renderCards(matches, hiddenCards) {
    matches.forEach((card) => {
      card.hidden = false;
      card.style.removeProperty("opacity");
      card.style.removeProperty("transform");
    });

    hiddenCards.forEach((card) => {
      card.hidden = true;
      card.style.removeProperty("opacity");
      card.style.removeProperty("transform");
    });
  }

  updateResult(filter, visibleCount) {
    this.result.textContent = filter === "all"
      ? `Showing all ${visibleCount} portfolio entries.`
      : `Showing ${visibleCount} ${filter === "battery" ? "entries with a battery listed" : "entry with an inverter listed; battery not shown"}.`;
  }

  destroy() {
    this.abortController?.abort();
  }
}
