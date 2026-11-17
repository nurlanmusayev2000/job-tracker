import type { NextConfig } from "next";

// GitHub Pages serves this site from /<repository-name>/, so the deploy
// workflow passes that path in. Locally the variable is not set and the app
// runs at "/".
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Build plain HTML, CSS and JS files into `out/`. There is no server.
  output: "export",
  basePath,
  // Do not create an AGENTS.md file for AI coding tools during `next dev`.
  agentRules: false,
};

export default nextConfig;
