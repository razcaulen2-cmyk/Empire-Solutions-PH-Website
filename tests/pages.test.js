import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const routeNames = ["home", "services", "projects", "about", "contact"];
const expectedPaths = ["/", "/services", "/projects", "/about", "/contact"];

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
  assert.match(stylesheet, /h1, h2 \{[\s\S]*font-family: var\(--headline\);[\s\S]*font-style: italic;[\s\S]*font-weight: 700;/);
  assert.match(stylesheet, /h3, h4 \{[\s\S]*font-family: var\(--subhead\);[\s\S]*font-style: normal;[\s\S]*font-weight: 400;/);
  assert.match(html, /startup-screen__wordmark[^}]*font-family: "Garet Headline"[^}]*font-style: italic; font-weight: 700/);
  assert.doesNotMatch(stylesheet, /Urbanist/);
});

test("the brand color system uses the supplied Empire palette", async () => {
  const stylesheet = await readFile(new URL("../src/styles/main.css", import.meta.url), "utf8");

  assert.match(stylesheet, /--ink: #000814;/);
  assert.match(stylesheet, /--orange: #ff914d;/);
  assert.match(stylesheet, /--red: #ff3131;/);
  assert.match(stylesheet, /--gold: #ffc300;/);
  assert.match(stylesheet, /--yellow: #ffcf00;/);
  assert.match(stylesheet, /--cream: #fffbe8;/);
  assert.match(stylesheet, /--white: #ffffff;/);
  assert.match(stylesheet, /background: linear-gradient\(90deg, var\(--red\), var\(--orange\)\)/);
  assert.match(stylesheet, /-webkit-text-fill-color: transparent;/);
  assert.doesNotMatch(stylesheet, /#fffdf6|#fffdf8|#fff5d5|#fff8e6|#b6a08b/);
});

test("the app does not mount a custom cursor effect", async () => {
  const application = await readFile(new URL("../src/application/Application.js", import.meta.url), "utf8");
  const stylesheet = await readFile(new URL("../src/styles/main.css", import.meta.url), "utf8");

  assert.doesNotMatch(application, /CursorSun|cursorSun/);
  assert.doesNotMatch(stylesheet, /\.cursor-sun/);
});

test("the homepage uses an immersive brand-colored Empire hero", async () => {
  const shell = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const stylesheet = await readFile(new URL("../src/styles/main.css", import.meta.url), "utf8");
  const home = await readFile(new URL("../src/pages/home.html", import.meta.url), "utf8");
  const animator = await readFile(new URL("../src/ui/PageAnimator.js", import.meta.url), "utf8");
  const thermalContours = await readFile(new URL("../public/assets/thermal-contours.svg", import.meta.url), "utf8");
  const thermalWave = await readFile(new URL("../public/assets/thermal-wave.svg", import.meta.url), "utf8");

  assert.match(stylesheet, /body:has\(\.page-home\) \.site-header \{[\s\S]*position: absolute;/);
  assert.match(stylesheet, /\.page-home \.hero \{[\s\S]*min-height: max\(760px, 100svh\);[\s\S]*background: var\(--ink\);/);
  assert.match(stylesheet, /\.page-home \.hero > \.hero-backdrop \{[\s\S]*url\("\/assets\/stock-solar-field\.jpg"\)/);
  assert.match(shell, /<span class="brand-wordmark-image" aria-hidden="true">[\s\S]*<img src="\/assets\/empire-solutions-ph\.png" alt="">/);
  assert.match(home, /<h1 id="home-title" class="hero-logo">[\s\S]*<img src="\/assets\/empire-solutions-ph-wordmark\.png" alt="Empire Solutions PH">[\s\S]*<\/h1>/);
  assert.match(stylesheet, /\.page-home \.hero h1\.hero-logo \{[\s\S]*width: min\(100%, 448px\);/);
  assert.match(stylesheet, /\.brand-wordmark-image img \{[\s\S]*width: 230%;/);
  assert.match(stylesheet, /\.page-home \.hero h1\.hero-logo img \{[\s\S]*width: 100%;[\s\S]*height: auto;/);
  assert.match(stylesheet, /\.page-home \.hero::before \{[\s\S]*top: 0;[\s\S]*right: 0;[\s\S]*radial-gradient\(ellipse at top right/);
  assert.match(stylesheet, /\.page-home \.hero::after \{[\s\S]*right: 0;[\s\S]*bottom: 0;/);
  assert.doesNotMatch(home, /hero-brand-watermark/);
  assert.match(stylesheet, /\.page-home \.hero h1\.hero-logo \{[\s\S]*font-size: 0;[\s\S]*line-height: 0;/);
  assert.match(stylesheet, /\.page-home \.hero-subtitle \{[\s\S]*margin: clamp\(48px, 5\.5vh, 60px\) 0 0;[\s\S]*font-size: clamp\(16px, 1\.8vw, 22px\);/);
  assert.match(stylesheet, /\.page-home \.hero-copy \{[\s\S]*top: clamp\(144px, 18vh, 184px\);/);
  assert.match(stylesheet, /\.page-home \.hero-bottom \{[\s\S]*bottom: clamp\(144px, 18vh, 168px\);/);
  assert.match(stylesheet, /\.page-home \.hero-bottom \{[^}]*bottom: 220px;/);
  assert.match(animator, /"\.hero-bottom"/);
  assert.match(stylesheet, /\.page-home \.hero-copy\.is-visible \.eyebrow[\s\S]*animation: home-text-arrive/);
  assert.match(stylesheet, /\.page-home \.hero-copy\.is-visible h1 \{ animation-delay: 190ms; \}/);
  assert.match(stylesheet, /\.page-home \.hero-lead \{[\s\S]*font-size: 16px;[\s\S]*line-height: 1\.7;/);
  assert.match(stylesheet, /\.page-home \.service-teaser p[\s\S]*font-size: 15px;/);
  assert.match(home, /<div class="home-panels">[\s\S]*<section class="home-services[\s\S]*<section class="featured-project/);
  assert.match(stylesheet, /\.home-panels \{[\s\S]*background: var\(--white\);[\s\S]*\.home-panels::before \{[\s\S]*url\("\/assets\/thermal-contours\.svg"\) center \/ 100% 100% no-repeat,[\s\S]*radial-gradient\(ellipse at 42% 42%,[\s\S]*linear-gradient\(120deg,[\s\S]*url\("\/assets\/thermal-wave\.svg"\) center \/ 100% 100% no-repeat;/);
  assert.match(thermalContours, /viewBox="0 0 1600 1200"/);
  assert.match(thermalContours, /<g fill="none" stroke="#FFFFFF" stroke-opacity=".52" stroke-width="1\.5"/);
  assert.doesNotMatch(thermalContours, /contour-flow|contour-loop/);
  assert.match(thermalWave, /viewBox="0 0 1000 1000"/);
  assert.match(thermalWave, /FFCF00[\s\S]*FF914D[\s\S]*FF3131/);
  assert.match(thermalWave, /feGaussianBlur stdDeviation="16"/);
  assert.match(stylesheet, /\.service-teaser,\s*\.featured-project-copy \{[\s\S]*background: linear-gradient\(135deg, rgba\(255, 255, 255, \.52\),[\s\S]*backdrop-filter: blur\(14px\) saturate\(135%\);/);
  assert.match(stylesheet, /\.(?:home-services|featured-project) \{[^}]*background: transparent;/);
  assert.doesNotMatch(stylesheet, /\.(?:home-services|featured-project)::before\s*\{|\.home-panel-transition/);
  assert.doesNotMatch(home, /home-panel-transition/);
  assert.match(stylesheet, /\.home-story \{[\s\S]*url\("\/assets\/stock-clean-energy\.jpg"\)/);
  assert.match(stylesheet, /\.interior-hero \{[\s\S]*background: linear-gradient\(110deg, var\(--cream\), var\(--white\) 72%\);/);
  assert.doesNotMatch(stylesheet, /\.(?:featured-project|interior-hero) \{[^}]*url\(/);
  assert.doesNotMatch(stylesheet, /#page-(?:services|projects|about|contact) \.interior-hero\s*\{[^}]*url\(/);
  assert.match(stylesheet, /\.roadmap-card \{[^}]*background: var\(--white\);/);
});

test("key page sections include stock or portfolio imagery", async () => {
  const home = await readFile(new URL("../src/pages/home.html", import.meta.url), "utf8");
  const services = await readFile(new URL("../src/pages/services.html", import.meta.url), "utf8");
  const projects = await readFile(new URL("../src/pages/projects.html", import.meta.url), "utf8");
  const about = await readFile(new URL("../src/pages/about.html", import.meta.url), "utf8");
  const contact = await readFile(new URL("../src/pages/contact.html", import.meta.url), "utf8");
  const stylesheet = await readFile(new URL("../src/styles/main.css", import.meta.url), "utf8");

  assert.equal((home.match(/<img\s/g) ?? []).length >= 4, true);
  assert.match(home, /stock-solar-worker\.jpg/);
  assert.match(services, /interior-hero-media/);
  assert.match(projects, /interior-hero-media/);
  assert.match(about, /interior-hero-media/);
  assert.match(contact, /interior-hero-media/);
  assert.match(stylesheet, /\.page-home \.hero > \.hero-backdrop \{[\s\S]*stock-solar-field\.jpg/);
  assert.match(stylesheet, /\.interior-hero-media \{[^}]*display: none;/);
  assert.match(stylesheet, /\.interior-hero > :not\(\.interior-hero-media\)/);
});

test("the loading screen and page backgrounds use restrained brand patterns", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const stylesheet = await readFile(new URL("../src/styles/main.css", import.meta.url), "utf8");

  assert.match(html, /\.startup-screen \{[\s\S]*radial-gradient[\s\S]*linear-gradient/);
  assert.match(html, /\.startup-screen::before[\s\S]*radial-gradient/);
  assert.match(stylesheet, /\/\* Empire brand backgrounds \*\//);
  assert.match(stylesheet, /\.page::before,[\s\S]*radial-gradient\(circle, rgba\(255, 195, 0, \.62\)/);
  assert.match(stylesheet, /scroll-snap-type: x mandatory/);
  assert.match(stylesheet, /\.service-detail-band,[\s\S]*var\(--cream\)/);
});

test("the homepage keeps its background pattern subtle and decorative", async () => {
  const home = await readFile(new URL("../src/pages/home.html", import.meta.url), "utf8");
  const stylesheet = await readFile(new URL("../src/styles/main.css", import.meta.url), "utf8");

  assert.doesNotMatch(home, /home-gradient-thread/);
  assert.match(home, /data-parallax-speed=/);
  assert.match(stylesheet, /\.hero::after \{[\s\S]*radial-gradient\(circle, rgba\(255, 195, 0, \.72\)/);
  assert.match(stylesheet, /\.hero::after \{[\s\S]*mask-image: radial-gradient\(ellipse at bottom right/);

  for (const routeName of routeNames.slice(1)) {
    const page = await readFile(new URL(`../src/pages/${routeName}.html`, import.meta.url), "utf8");
    assert.doesNotMatch(page, /data-parallax-speed=/);
  }
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
  const shell = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const home = await readFile(new URL("../src/pages/home.html", import.meta.url), "utf8");
  const routes = [...app.matchAll(/\{ name: "([^"]+)", path: "([^"]+)", title: "[^"]+", markup: ([a-zA-Z]+) \}/g)];

  assert.deepEqual(routes.map(([, name]) => name), routeNames);
  assert.deepEqual(routes.map(([, , routePath]) => routePath), expectedPaths);
  assert.equal(new Set(routes.map(([, , routePath]) => routePath)).size, routes.length);
  assert.doesNotMatch(app, /news|ArticleDialog/i);
  assert.doesNotMatch(shell, /href="\/news"|News &amp; Blogs|article-dialog/i);
  assert.doesNotMatch(home, /journal-strip|href="\/news"/i);

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
