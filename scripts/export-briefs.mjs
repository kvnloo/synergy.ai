import { writeFileSync, mkdirSync } from "node:fs";
import { articles } from "../content.js";

mkdirSync("data", { recursive: true });
writeFileSync(
  "data/briefs.json",
  JSON.stringify(
    {
      schema: "synergy-briefs/v1",
      generated_at: new Date().toISOString(),
      source: "https://kvnloo.github.io/synergy.ai/",
      license: "CC-BY-4.0",
      count: articles.length,
      articles
    },
    null,
    2
  ) + "\n"
);
