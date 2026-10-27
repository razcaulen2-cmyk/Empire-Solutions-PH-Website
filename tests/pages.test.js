import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const routeNames = ["home", "news", "services", "projects", "about", "contact"];
const expectedPaths = ["/", "/news", "/services", "/projects", "/about", "/contact"];

test("the initial document shows a branded loading screen before the app starts", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.match(html, /id="startup-screen" role="status" aria-live="polite"/);
  assert.match(html, /Preparing your page/);
  assert.ok(html.indexOf('id="startup-screen"') < html.indexOf('<script type="module"'));
  assert.doesNotMatch(html, /class="page-loading"/);
});

test("Netlify can detect the contact form and serve clean routes", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const netlifyConfig = await readFile(new URL("../netlify.toml", import.meta.url), "utf8");
  const redirects = await readFile(new URL("../public/_redirects", import.meta.url), "utf8");

  assert.match(html, /<form name="company-contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" hidden>/);
  for (const field of ["name", "email", "interest", "message", "bot-field"]) {
    assert.match(html, new RegExp(`<input name="${field}"|<textarea name="${field}"`));
  }
  assert.match(netlifyConfig, /command = "npm run build"/);
  assert.match(netlifyConfig, /publish = "dist"/);
  assert.match(redirects, /^\/\* \/index\.html 200$/m);
});

test("every application route owns a separate page file", async () => {
  const app = await readFile(new URL("../src/app.js", import.meta.url), "utf8");
  const routes = [...app.matchAll(/\{ name: "([^"]+)", path: "([^"]+)", title: "[^"]+", markup: ([a-zA-Z]+) \}/g)];

  assert.deepEqual(routes.map(([, name]) => name), routeNames);
  assert.deepEqual(routes.map(([, , routePath]) => routePath), expectedPaths);
  assert.equal(new Set(routes.map(([, , routePath]) => routePath)).size, routes.length);

  for (const [index, routeName] of routeNames.entries()) {
    const page = await readFile(new URL(`../src/pages/${routeName}.html`, import.meta.url), "utf8");
    const importName = `${routeName}Page`;
    assert.match(app, new RegExp(`import ${importName} from "\\.\\/pages\\/${routeName}\\.html\\?raw"`));
    assert.match(page, new RegExp(`id=["']page-${routeName}["']`));
    assert.equal(routes[index][3], importName);
  }
});

test("separately routed pages use valid local image paths", async () => {
  for (const routeName of routeNames) {
    const pageFile = new URL(`../src/pages/${routeName}.html`, import.meta.url);
    const html = await readFile(pageFile, "utf8");
    const images = [...html.matchAll(/<img\b[^>]*\bsrc=["']\/assets\/([^"']+)["']/gi)];
    for (const [, filename] of images) {
      await assert.doesNotReject(readFile(new URL(`../public/assets/${filename}`, import.meta.url)));
    }
    assert.doesNotMatch(html, /\bsrc=["']\.\/assets\//);
  }
});
