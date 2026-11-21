import assert from "node:assert/strict";
import test from "node:test";
import { HomeParallax } from "../src/ui/HomeParallax.js";

function createHarness({ reducedMotion = false, bounds = { top: 100, height: 100 } } = {}) {
  const listeners = new Map();
  const frames = new Map();
  const styles = new Map();
  let nextFrame = 0;
  const element = {
    dataset: { parallaxSpeed: "0.1" },
    getBoundingClientRect: () => bounds,
    style: {
      setProperty(name, value) {
        styles.set(name, value);
      },
      removeProperty(name) {
        styles.delete(name);
      },
    },
  };
  const windowRef = {
    innerHeight: 600,
    matchMedia: () => ({ matches: reducedMotion }),
    addEventListener(name, listener) {
      listeners.set(name, listener);
    },
    removeEventListener(name) {
      listeners.delete(name);
    },
    requestAnimationFrame(callback) {
      const id = ++nextFrame;
      frames.set(id, callback);
      return id;
    },
    cancelAnimationFrame(id) {
      frames.delete(id);
    },
  };
  const page = { querySelectorAll: () => [element] };

  return { element, frames, listeners, page, styles, windowRef };
}

test("homepage parallax follows scroll and clears its offsets when destroyed", () => {
  const state = createHarness();
  const parallax = new HomeParallax({ windowRef: state.windowRef }).mount(state.page);

  assert.equal(state.styles.get("--parallax-offset"), "15.00px");

  state.element.getBoundingClientRect = () => ({ top: 450, height: 100 });
  state.listeners.get("scroll")();
  const frame = state.frames.values().next().value;
  frame();

  assert.equal(state.styles.get("--parallax-offset"), "-20.00px");

  parallax.destroy();
  assert.equal(state.styles.has("--parallax-offset"), false);
  assert.equal(state.listeners.has("scroll"), false);
  assert.equal(state.listeners.has("resize"), false);
});

test("homepage parallax stays disabled when reduced motion is requested", () => {
  const state = createHarness({ reducedMotion: true });

  new HomeParallax({ windowRef: state.windowRef }).mount(state.page);

  assert.equal(state.listeners.size, 0);
  assert.equal(state.styles.has("--parallax-offset"), false);
});
