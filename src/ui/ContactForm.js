export class ContactForm {
  constructor({ apiClient, windowRef = window }) {
    this.apiClient = apiClient;
    this.window = windowRef;
    this.abortController = null;
  }

  mount(page) {
    this.form = page.querySelector("#contact-form");
    this.status = page.querySelector("#contact-status");
    this.emailNote = page.querySelector(".form-note");

    if (!this.form || !this.status || !this.emailNote) {
      throw new Error("The contact form is missing a required form, status, or email-notice element.");
    }

    this.abortController = new AbortController();
    this.form.addEventListener("submit", (event) => this.submit(event), {
      signal: this.abortController.signal,
    });
    this.updateFormMode();
    return this;
  }

  updateFormMode() {
    this.emailNote.textContent = this.apiClient.isConfigured
      ? "Your enquiry is sent securely to the Empire Solutions PH team."
      : "Your enquiry will be sent to the Empire Solutions PH team.";
    const button = this.form.querySelector("[type='submit']");
    if (button) button.firstChild.textContent = "Send enquiry ";
  }

  async submit(event) {
    event.preventDefault();
    if (!this.form.reportValidity()) return;

    const formData = new (this.window.FormData ?? FormData)(this.form);
    const data = Object.fromEntries(formData.entries());
    const button = this.form.querySelector("[type='submit']");
    if (button) button.disabled = true;
    this.status.textContent = "Sending your enquiry…";
    const { signal } = this.abortController;

    try {
      if (this.apiClient.isConfigured) {
        const { name, email, interest, message } = data;
        await this.apiClient.request("/contact", {
          method: "POST",
          body: { name, email, interest, message },
          signal,
        });
      } else {
        const response = await this.window.fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(data).toString(),
          signal,
        });
        if (!response.ok) {
          throw new Error(`The contact form service returned HTTP ${response.status}.`);
        }
      }

      if (signal.aborted) return;
      this.status.textContent = "Thank you. Your enquiry has been received.";
      this.form.reset();
    } catch (error) {
      if (signal.aborted) return;
      console.error("Unable to submit the contact enquiry.", error);
      this.status.textContent = "We couldn't send your enquiry. Please email info@empireph.com or try again.";
    } finally {
      if (button && !signal.aborted) button.disabled = false;
    }
  }

  destroy() {
    this.abortController?.abort();
  }
}
