import assert from "node:assert/strict";
import test from "node:test";
import { ContactForm } from "../src/ui/ContactForm.js";

function createContactForm({ response = { ok: true }, apiConfigured = false } = {}) {
  const values = {
    "form-name": "company-contact",
    "bot-field": "",
    name: "Alex Santos",
    email: "alex@example.com",
    interest: "A residential solar assessment",
    message: "I would like to discuss solar for my home.",
  };
  const requests = [];
  const button = { disabled: false, firstChild: { textContent: "" } };
  const form = {
    addEventListener(name, listener, options) {
      this.listener = listener;
      this.signal = options.signal;
    },
    querySelector: () => button,
    reportValidity: () => true,
    reset() {
      this.wasReset = true;
    },
  };
  const status = { textContent: "" };
  const emailNote = { textContent: "" };
  const windowRef = {
    FormData: class {
      entries() {
        return Object.entries(values)[Symbol.iterator]();
      }
    },
    async fetch(...args) {
      requests.push(args);
      return response;
    },
  };
  const apiClient = {
    isConfigured: apiConfigured,
    async request(...args) {
      requests.push(args);
      return null;
    },
  };
  const page = {
    querySelector(selector) {
      return {
        "#contact-form": form,
        "#contact-status": status,
        ".form-note": emailNote,
      }[selector];
    },
  };
  const controller = new ContactForm({ apiClient, windowRef }).mount(page);

  return { apiClient, button, controller, emailNote, form, requests, status, values };
}

function submit(controller) {
  let defaultPrevented = false;
  return controller.submit({
    preventDefault() {
      defaultPrevented = true;
    },
    get defaultPrevented() {
      return defaultPrevented;
    },
  });
}

test("contact form sends submissions to Netlify Forms by default", async () => {
  const state = createContactForm();

  await submit(state.controller);

  assert.equal(state.requests.length, 1);
  assert.equal(state.requests[0][0], "/");
  assert.equal(state.requests[0][1].method, "POST");
  assert.equal(state.requests[0][1].headers["Content-Type"], "application/x-www-form-urlencoded");
  assert.deepEqual(
    Object.fromEntries(new URLSearchParams(state.requests[0][1].body)),
    state.values,
  );
  assert.equal(state.status.textContent, "Thank you. Your enquiry has been received.");
  assert.equal(state.form.wasReset, true);
  assert.equal(state.button.disabled, false);
});

test("contact form reports service failures without claiming submission succeeded", async () => {
  const state = createContactForm({ response: { ok: false, status: 503 } });
  const originalError = console.error;
  console.error = () => {};

  try {
    await submit(state.controller);
  } finally {
    console.error = originalError;
  }

  assert.match(state.status.textContent, /couldn't send your enquiry/);
  assert.equal(state.form.wasReset, undefined);
  assert.equal(state.button.disabled, false);
});

test("a configured custom API receives only the enquiry fields", async () => {
  const state = createContactForm({ apiConfigured: true });

  await submit(state.controller);

  assert.equal(state.requests[0][0], "/contact");
  assert.deepEqual(state.requests[0][1].body, {
    name: "Alex Santos",
    email: "alex@example.com",
    interest: "A residential solar assessment",
    message: "I would like to discuss solar for my home.",
  });
});
