export class PageView {
  constructor(outlet) {
    this.outlet = outlet;
  }

  render(route) {
    const template = this.outlet.ownerDocument.createElement("template");
    template.innerHTML = route.markup.trim();
    const page = template.content.querySelector(".page");

    if (!page || page.id !== `page-${route.name}`) {
      throw new Error(`The "${route.name}" page file is missing its expected page section.`);
    }

    page.removeAttribute("hidden");
    this.outlet.replaceChildren(template.content);
    this.outlet.setAttribute("aria-busy", "false");
    return this.outlet.firstElementChild;
  }

  showError() {
    this.outlet.setAttribute("aria-busy", "false");
    const documentRef = this.outlet.ownerDocument;
    const section = documentRef.createElement("section");
    section.className = "route-error page-gutter";

    const heading = documentRef.createElement("h1");
    heading.textContent = "This page couldn't be displayed.";
    const explanation = documentRef.createElement("p");
    explanation.textContent = "Please try again. If the problem persists, contact info@empireph.com.";
    const button = documentRef.createElement("button");
    button.className = "button button-dark";
    button.type = "button";
    button.dataset.routeRetry = "";
    button.textContent = "Try again";

    section.append(heading, explanation, button);
    this.outlet.replaceChildren(section);
  }
}
