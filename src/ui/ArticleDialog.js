import { articles } from "../data/articles.js";

export class ArticleDialog {
  constructor(documentRef = document) {
    this.document = documentRef;
    this.dialog = documentRef.querySelector("#article-dialog");
    this.abortController = null;
  }

  mount(page) {
    if (!this.dialog) throw new Error("The article dialog is missing from the application shell.");

    this.abortController = new AbortController();
    page.addEventListener("click", (event) => this.openArticle(event), {
      signal: this.abortController.signal,
    });
    this.dialog.addEventListener("click", (event) => this.handleDialogClick(event), {
      signal: this.abortController.signal,
    });

    return this;
  }

  openArticle(event) {
    const button = event.target.closest("button[data-article]");
    if (!button) return;

    const article = articles[button.dataset.article];
    if (!article) {
      console.error(`No article is registered for "${button.dataset.article}".`);
      return;
    }

    this.document.querySelector("#dialog-kicker").textContent = article.kicker;
    this.document.querySelector("#dialog-title").textContent = article.title;
    this.document.querySelector("#dialog-body").textContent = article.body;
    this.dialog.showModal();
  }

  handleDialogClick(event) {
    if (event.target.closest("[data-close-dialog]") || event.target === this.dialog) {
      this.dialog.close();
    }
  }

  destroy() {
    this.abortController?.abort();
  }
}
