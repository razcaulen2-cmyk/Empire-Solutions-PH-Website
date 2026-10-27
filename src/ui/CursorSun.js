export class CursorSun {
  constructor({ documentRef = document, windowRef = window } = {}) {
    this.document = documentRef;
    this.window = windowRef;
    this.element = null;
    this.frame = null;
    this.position = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };
    this.enabled = false;
  }

  mount() {
    this.enabled = this.window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    ).matches;
    if (!this.enabled) return this;

    this.element = this.document.createElement("div");
    this.element.className = "cursor-sun";
    this.element.setAttribute("aria-hidden", "true");
    this.element.innerHTML = `
      <span class="cursor-sun__glow">
        <span class="cursor-sun__light"></span>
        <span class="cursor-sun__halftone"></span>
      </span>`;
    this.document.body.append(this.element);

    this.window.addEventListener("pointermove", this.handlePointerMove);
    this.window.addEventListener("pointerout", this.handlePointerOut);
    this.window.addEventListener("blur", this.handleWindowBlur);
    return this;
  }

  handlePointerMove = (event) => {
    if (event.pointerType && event.pointerType !== "mouse") return;

    this.target.x = event.clientX;
    this.target.y = event.clientY;

    if (!this.element.classList.contains("is-visible")) {
      this.position.x = this.target.x;
      this.position.y = this.target.y;
      this.element.style.transform = `translate3d(${this.position.x}px, ${this.position.y}px, 0) translate(-50%, -50%)`;
    }

    this.element.classList.add("is-visible");

    if (this.frame === null) {
      this.frame = this.window.requestAnimationFrame(this.animate);
    }
  };

  handlePointerOut = (event) => {
    if (event.relatedTarget !== null) return;
    this.hide();
  };

  handleWindowBlur = () => this.hide();

  animate = () => {
    this.frame = null;
    this.position.x += (this.target.x - this.position.x) * 0.18;
    this.position.y += (this.target.y - this.position.y) * 0.18;
    this.element.style.transform = `translate3d(${this.position.x}px, ${this.position.y}px, 0) translate(-50%, -50%)`;

    const remainingX = this.target.x - this.position.x;
    const remainingY = this.target.y - this.position.y;
    if (Math.abs(remainingX) > 0.35 || Math.abs(remainingY) > 0.35) {
      this.frame = this.window.requestAnimationFrame(this.animate);
      return;
    }

    this.position.x = this.target.x;
    this.position.y = this.target.y;
    this.element.style.transform = `translate3d(${this.position.x}px, ${this.position.y}px, 0) translate(-50%, -50%)`;
  };

  hide() {
    this.element?.classList.remove("is-visible");
  }

  destroy() {
    if (this.frame !== null) this.window.cancelAnimationFrame(this.frame);
    this.window.removeEventListener("pointermove", this.handlePointerMove);
    this.window.removeEventListener("pointerout", this.handlePointerOut);
    this.window.removeEventListener("blur", this.handleWindowBlur);
    this.element?.remove();
    this.element = null;
    this.frame = null;
  }
}
