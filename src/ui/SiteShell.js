export class SiteShell {
  constructor(documentRef = document) {
    this.document = documentRef;
    this.header = documentRef.querySelector(".site-header");
    this.menuToggle = documentRef.querySelector(".menu-toggle");
  }

  mount() {
    if (!this.header || !this.menuToggle) {
      throw new Error("The application shell is missing the site header or navigation toggle.");
    }

    const year = this.document.querySelector("#current-year");
    if (year) year.textContent = String(new Date().getFullYear());

    this.menuToggle.addEventListener("click", () => {
      const open = this.header.classList.toggle("menu-open");
      this.menuToggle.setAttribute("aria-expanded", String(open));
      this.menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    this.document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.header.classList.contains("menu-open")) {
        this.closeMenu();
        this.menuToggle.focus();
      }
    });
  }

  closeMenu() {
    this.header.classList.remove("menu-open");
    this.menuToggle.setAttribute("aria-expanded", "false");
    this.menuToggle.setAttribute("aria-label", "Open menu");
  }
}
