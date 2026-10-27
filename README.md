# Empire-Solutions-PH-Website

A website dedicated to Empire Solutions PH. This project uses Vite to serve a
multi-page company website with a shared responsive navigation shell.

## Requirements

- Node.js 20.19+ (or 22.12+) and npm.

## Develop

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. Each page has a clean URL: `/`, `/news`,
`/services`, `/projects`, `/about`, and `/contact`. Use the site navigation to
move between pages. Vite serves the application shell for direct navigation and
browser refreshes on these routes.

## Build and preview

```powershell
npm run check
npm run preview
```

`npm run check` runs the automated tests and creates a production build in
`dist/`. Deploy the contents of `dist/` to a static host configured to serve
`index.html` for the six application routes. The included Vite preview server
provides this fallback for local verification.

## Deploy to Netlify

The site is configured for Netlify in `netlify.toml`. Connect the GitHub
repository to Netlify and deploy the `main` branch. Netlify runs `npm run build`
and publishes `dist/`; `public/_redirects` keeps the clean page routes working
when visitors open or refresh them directly.

The contact form uses **Netlify Forms** by default. A static form in `index.html`
lets Netlify detect it during the build, while the visible form submits its
entries securely over HTTPS. After the first deploy:

1. In Netlify, open the site’s **Forms** settings and enable form detection if
   prompted, then trigger a fresh deploy.
2. Submit a test enquiry and confirm it appears in the `company-contact`
   submissions list.
3. Configure an email notification for form submissions addressed to
   `info@empireph.com`.

Netlify stores received submissions in the site dashboard; email delivery
depends on the notification being configured. Review the account’s current
submission limits and retention settings before going live.

To use a separate contact API instead, copy `.env.example` to `.env.local` and
set `VITE_API_BASE_URL` to the API's absolute HTTP(S) base URL. The site then
sends a JSON `POST` to `/contact` containing `name`, `email`, `interest`, and
`message`; the endpoint must allow requests from the deployed site through
CORS.
