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
    if (!this.apiClient.isConfigured) return;

    this.emailNote.textContent = "Your enquiry is sent securely to the Empire Solutions PH team.";
    const button = this.form.querySelector("[type='submit']");
    if (button) button.firstChild.textContent = "Send enquiry ";
  }

  async submit(event) {
    event.preventDefault();
    if (!this.form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(this.form).entries());
    if (!this.apiClient.isConfigured) {
      this.prepareEmail(data);
      return;
    }

    const button = this.form.querySelector("[type='submit']");
    if (button) button.disabled = true;
    this.status.textContent = "Sending your enquiry…";
    const { signal } = this.abortController;

    try {
      await this.apiClient.request("/contact", { method: "POST", body: data, signal });
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

  prepareEmail(data) {
    const subject = `Solar enquiry: ${data.interest}`;
    const body = [
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Enquiry: ${data.interest}`,
      "",
      String(data.message),
    ].join("\n");

    this.status.textContent = "Your email draft is ready. If your email app didn't open, write to info@empireph.com.";
    this.window.location.href = `mailto:info@empireph.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  destroy() {
    this.abortController?.abort();
  }
}
