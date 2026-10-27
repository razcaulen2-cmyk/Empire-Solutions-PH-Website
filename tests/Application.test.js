import assert from "node:assert/strict";
import test from "node:test";
import { Application } from "../src/application/Application.js";

function createApplication({ reducedMotion = false } = {}) {
  const timeouts = [];
  const attributes = {};
  const classes = [];
  let removed = false;
  const screen = {
    setAttribute(name, value) {
      attributes[name] = value;
    },
    classList: {
      add(name) {
        classes.push(name);
      },
    },
    remove() {
      removed = true;
    },
  };
  const application = Object.create(Application.prototype);
  application.document = { querySelector: () => screen };
  application.window = {
    matchMedia: () => ({ matches: reducedMotion }),
    setTimeout(callback, delay) {
      timeouts.push({ callback, delay });
      return timeouts.length;
    },
  };

  return {
    application,
    attributes,
    classes,
    get removed() {
      return removed;
    },
    timeouts,
  };
}

test("startup screen fades away and is removed after the first page is ready", () => {
  const state = createApplication();

  state.application.dismissStartupScreen();

  assert.equal(state.timeouts.length, 1);
  assert.equal(state.timeouts[0].delay, 420);
  state.timeouts[0].callback();
  assert.equal(state.attributes["aria-hidden"], "true");
  assert.deepEqual(state.classes, ["is-exiting"]);
  assert.equal(state.timeouts[1].delay, 340);
  state.timeouts[1].callback();
  assert.equal(state.removed, true);
});

test("startup screen skips the exit delay for reduced motion", () => {
  const applicationState = createApplication({ reducedMotion: true });

  applicationState.application.dismissStartupScreen();
  assert.equal(applicationState.timeouts[0].delay, 0);
  applicationState.timeouts[0].callback();
  assert.equal(applicationState.timeouts[1].delay, 0);
  applicationState.timeouts[1].callback();
  assert.equal(applicationState.removed, true);
});
