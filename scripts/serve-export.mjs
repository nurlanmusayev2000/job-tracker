// Serves the static export in `out/` the way GitHub Pages does: under a base
// path such as /job-tracker. The Playwright smoke test uses it, so the test
// checks the same files and the same URLs that get deployed.
//
// Usage: PAGES_BASE_PATH=/job-tracker PORT=4173 node scripts/serve-export.mjs
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, sep } from "node:path";

const outDir = join(import.meta.dirname, "..", "out");
const basePath = process.env.PAGES_BASE_PATH ?? "";
const port = Number(process.env.PORT ?? 4173);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

/** Turns a URL path into a file inside `out/`, or null if it is not ours. */
function toFilePath(urlPath) {
  if (!urlPath.startsWith(basePath)) return null;

  let relativePath = decodeURIComponent(urlPath.slice(basePath.length));
  if (relativePath === "" || relativePath.endsWith("/")) {
    relativePath += "/index.html";
  }

  const filePath = join(outDir, relativePath);
  // Never serve a file outside `out/` (for example for "/../package.json").
  return filePath.startsWith(outDir + sep) ? filePath : null;
}

const server = createServer(async (request, response) => {
  const { pathname } = new URL(request.url ?? "/", "http://localhost");
  const filePath = toFilePath(pathname);

  try {
    if (filePath === null) throw new Error("Not found");
    const body = await readFile(filePath);
    const contentType =
      contentTypes[extname(filePath)] ?? "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType });
    response.end(body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(port, () => {
  console.log(`Serving out/ at http://localhost:${port}${basePath}/`);
});
