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

## Contact API integration

The contact form uses the email-draft fallback until an API is configured. To
connect a backend, copy `.env.example` to `.env.local`, set
`VITE_API_BASE_URL` to the backend's base URL, then rebuild the site. The form
submits a JSON `POST` to `/contact` containing `name`, `email`, `interest`, and
`message`. The endpoint must allow requests from the deployed site through
CORS. A successful 2xx response displays a confirmation; a failed request shows
an error and the company's email address. No backend is included in this project.
