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

test("the brand type system maps supplied Garet files to headline, subhead, and body roles", async () => {
  const stylesheet = await readFile(new URL("../src/styles/main.css", import.meta.url), "utf8");
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.match(stylesheet, /font-family: "Garet Headline";\s+src: url\("\/assets\/fonts\/Garet-Bold-Italic\.ttf"\)/);
  assert.match(stylesheet, /font-family: "Garet Regular";\s+src: url\("\/assets\/fonts\/Garet-Regular\.ttf"\)/);
  assert.match(stylesheet, /font-family: "Garet Book";\s+src: url\("\/assets\/fonts\/Garet-Book\.ttf"\)/);
  assert.match(stylesheet, /--headline: "Garet Headline"/);
  assert.match(stylesheet, /--subhead: "Garet Regular"/);
  assert.match(stylesheet, /--body: "Garet Book"/);
  assert.match(stylesheet, /h1, h2 \{ font-family: var\(--headline\); font-style: italic; font-weight: 700; \}/);
  assert.match(stylesheet, /h3, h4 \{ font-family: var\(--subhead\); font-style: normal; font-weight: 400; \}/);
  assert.match(html, /startup-screen__wordmark[^}]*font-family: "Garet Headline"[^}]*font-style: italic; font-weight: 700/);
  assert.doesNotMatch(stylesheet, /Urbanist/);
});

test("the brand color system uses the supplied Empire palette", async () => {
  const stylesheet = await readFile(new URL("../src/styles/main.css", import.meta.url), "utf8");

  assert.match(stylesheet, /--ink: #000814;/);
  assert.match(stylesheet, /--black: #000000;/);
  assert.match(stylesheet, /--orange: #ff914d;/);
  assert.match(stylesheet, /--red: #ff3131;/);
  assert.match(stylesheet, /--gold: #ffc300;/);
  assert.match(stylesheet, /--yellow: #ffcf00;/);
  assert.match(stylesheet, /--cream: #fffbe8;/);
  assert.match(stylesheet, /--white: #ffffff;/);
  assert.match(stylesheet, /-webkit-text-fill-color: var\(--red\)/);
  assert.doesNotMatch(stylesheet, /#fffdf6|#fffdf8|#fff5d5|#fff8e6|#b6a08b/);
});

test("large page surfaces use white and cream with controlled brand elements", async () => {
  const stylesheet = await readFile(new URL("../src/styles/main.css", import.meta.url), "utf8");

  assert.match(stylesheet, /\.hero \{[^}]*var\(--white\)/s);
  assert.match(stylesheet, /\.featured-project \{[^}]*background: var\(--cream\);/);
  assert.match(stylesheet, /\.home-story \{[^}]*background: var\(--white\);/s);
  assert.match(stylesheet, /\.journal-strip \{[^}]*background: var\(--cream\);/);
  assert.match(stylesheet, /\.interior-hero \{[^}]*background: var\(--cream\);/);
  assert.match(stylesheet, /\.roadmap-card \{[^}]*background: var\(--white\);/);
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

test("the About page introduces the company and lists its team in role order", async () => {
  const about = await readFile(new URL("../src/pages/about.html", import.meta.url), "utf8");
  const introduction = about.indexOf("development and deployment of sustainable energy solutions");
  const leadershipStart = about.indexOf('aria-label="Company leadership, listed by position"');
  const teamEnd = about.indexOf('class="team-founders"', leadershipStart);
  const valuesStart = about.indexOf('class="values-section');
  const leadership = about.slice(leadershipStart, teamEnd);

  assert.notEqual(introduction, -1);
  assert.ok(introduction < leadershipStart);
  assert.ok(leadershipStart < valuesStart);
  assert.match(about, /Engineering<\/li><li><span>02<\/span>Procurement<\/li><li><span>03<\/span>Construction/);
  assert.deepEqual(
    [...leadership.matchAll(/<h3>([^<]+)<\/h3>/g)].map(([, name]) => name),
    ["Yolanda Vitan", "Zildjian Quemada", "Andrea Vitan"],
  );
  assert.deepEqual(
    [...leadership.matchAll(/<p class="team-role">([^<]+)<\/p>/g)].map(([, role]) => role),
    ["Chief Executive Officer", "Chief Operating Officer", "Chief Commercial Officer"],
  );
  assert.deepEqual(
    [...about.slice(teamEnd, valuesStart).matchAll(/<h3>([^<]+)<\/h3>/g)].map(([, name]) => name),
    ["Co-founders", "Miguel Uy", "Matt Young"],
  );
});
