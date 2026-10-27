import assert from "node:assert/strict";
import test from "node:test";
import { ProjectGallery } from "../src/ui/ProjectGallery.js";

class FakeElement {
  constructor(dataset = {}) {
    this.dataset = dataset;
    this.hidden = false;
    this.attributes = {};
    this.classes = new Set();
    this.style = { removeProperty() {} };
    this.listeners = new Map();
    this.textContent = "";
    this.animatedFrames = [];
    this.classList = {
      add: (value) => this.classes.add(value),
      remove: (value) => this.classes.delete(value),
      toggle: (value, enabled) => enabled ? this.classes.add(value) : this.classes.delete(value),
    };
  }

  addEventListener(name, listener) {
    this.listeners.set(name, listener);
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  animate(keyframes, options) {
    this.animatedFrames.push({ keyframes, options });
    if (this.deferredAnimation) {
      return {
        finished: new Promise((resolve) => {
          this.resolveAnimation = resolve;
        }),
        cancel() {},
      };
    }
    return { finished: Promise.resolve(), cancel() {} };
  }
}

function createGallery({ reducedMotion = false } = {}) {
  const allButton = new FakeElement({ filter: "all" });
  const batteryButton = new FakeElement({ filter: "battery" });
  const inverterButton = new FakeElement({ filter: "inverter" });
  const buttons = [allButton, batteryButton, inverterButton];
  const cards = [
    new FakeElement({ storage: "yes" }),
    new FakeElement({ storage: "yes" }),
    new FakeElement({ storage: "no" }),
  ];
  const result = new FakeElement();
  const grid = new FakeElement();
  grid.setAttribute = FakeElement.prototype.setAttribute;
  const page = {
    querySelectorAll(selector) {
      return selector === "[data-filter]" ? buttons : cards;
    },
    querySelector(selector) {
      return selector === ".filter-result" ? result : grid;
    },
  };
  const gallery = new ProjectGallery({
    windowRef: {
      matchMedia: () => ({ matches: reducedMotion }),
      setTimeout: globalThis.setTimeout,
    },
  }).mount(page);

  return { gallery, buttons, cards, result, grid };
}

test("gallery fades the entire grid once when switching categories", async () => {
  const { gallery, cards, result, grid } = createGallery();

  await gallery.filter("battery");

  assert.deepEqual(cards.map((card) => card.hidden), [false, false, true]);
  assert.equal(cards[0].animatedFrames.length, 0);
  assert.equal(cards[1].animatedFrames.length, 0);
  assert.equal(cards[2].animatedFrames.length, 0);
  assert.equal(grid.animatedFrames.length, 1);
  assert.equal(grid.animatedFrames[0].options.duration, 220);
  assert.deepEqual(grid.animatedFrames[0].keyframes, [{ opacity: 0 }, { opacity: 1 }]);
  assert.equal(result.textContent, "Showing 2 entries with a battery listed.");
  assert.equal(grid.attributes["aria-busy"], "false");

  await gallery.filter("inverter");

  assert.deepEqual(cards.map((card) => card.hidden), [true, true, false]);
  assert.deepEqual(cards.map((card) => card.animatedFrames.length), [0, 0, 0]);
  assert.equal(grid.animatedFrames.length, 2);
  assert.equal(result.textContent, "Showing 1 entry with an inverter listed; battery not shown.");
  assert.equal(grid.attributes["aria-busy"], "false");
});

test("gallery respects reduced-motion preference when switching categories", async () => {
  const { gallery, cards, grid } = createGallery({ reducedMotion: true });

  await gallery.filter("battery");

  assert.deepEqual(cards.map((card) => card.hidden), [false, false, true]);
  assert.deepEqual(cards.map((card) => card.animatedFrames.length), [0, 0, 0]);
  assert.equal(grid.animatedFrames.length, 0);
});

test("gallery applies one simultaneous fade when returning to all projects", async () => {
  const { gallery, cards } = createGallery();
  await gallery.filter("battery");
  await gallery.filter("inverter");

  await gallery.filter("all");

  assert.deepEqual(cards.map((card) => card.hidden), [false, false, false]);
  assert.deepEqual(cards.map((card) => card.animatedFrames.length), [0, 0, 0]);
  assert.equal(gallery.grid.animatedFrames.length, 3);
});
