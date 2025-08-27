import path from "node:path";
import fs from "node:fs";
import express, { type Express } from "express";

export function mountClient(app: Express) {
  // __dirname will be .../dist in production; walk back to repo root, then to dist/public
  const clientDist = path.resolve(import.meta.dirname, "../dist/public");

  // Serve all built static assets (JS/CSS/images)
  app.use(express.static(clientDist, { index: false, maxAge: "1h" }));

  // For every non-API route, return index.html (SPA fallback)
  app.get(/^\/(?!api\b).*/, (_req, res) => {
    const indexFile = path.join(clientDist, "index.html");
    fs.access(indexFile, fs.constants.F_OK, (err) => {
      if (err) {
        console.error("Client build missing at:", indexFile);
        return res
          .status(500)
          .send(
            "<h1>Build missing</h1><p>Run <code>npm run build</code> to generate dist/public</p>"
          );
      }
      res.sendFile(indexFile);
    });
  });
}