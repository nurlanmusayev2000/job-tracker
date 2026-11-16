# Job Search Tracker

A web app where one person tracks their job applications: what they saved, where they applied, and what to do
next. All data stays in the browser. There is no backend and no account.

> **Status:** in progress. Milestone 1 of 6 is done: the project setup, the checks and an empty page. The
> features, screenshots and the full README arrive in the next milestones.

## Stack

Next.js (App Router, static export) · React · TypeScript (strict) · Tailwind CSS · Vitest + React Testing
Library · Playwright · ESLint + Prettier · GitHub Actions

Redux Toolkit and Zod are added in the milestones that first use them.

## Run it locally

You need Node.js 22 or later.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Scripts

| Script                 | What it does                                                  |
| ---------------------- | ------------------------------------------------------------- |
| `npm run dev`          | Start the development server                                  |
| `npm run build`        | Build the static site into `out/`                             |
| `npm run lint`         | Check the code with ESLint                                    |
| `npm run format`       | Format every file with Prettier                               |
| `npm run format:check` | Check the formatting without changing files                   |
| `npm run typecheck`    | Check the TypeScript types                                    |
| `npm test`             | Run the unit and component tests once                         |
| `npm run test:watch`   | Run them again on every change                                |
| `npm run test:e2e`     | Build the site and run the Playwright smoke test in a browser |

Before the first `npm run test:e2e`, install the test browser:

```bash
npx playwright install chromium
```

## Deployment

Every push to `main` builds the static site and deploys it to GitHub Pages. Pages serves the site from
`/job-tracker/`, so the deploy workflow builds with that base path. The smoke test builds and serves the site
the same way, so a broken asset path fails the test before it reaches the live site.

## License

[MIT](LICENSE)
