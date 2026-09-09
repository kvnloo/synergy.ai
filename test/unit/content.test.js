/** @feature F-catalog — see TRACEABILITY.json */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { articles } from "../../content.js";

describe("content catalog invariants", () => {
  it("exports a non-empty article list", () => {
    assert.ok(Array.isArray(articles));
    assert.ok(articles.length >= 5);
  });

  it("every article has id, title, visual, reviewed, and 5 slides", () => {
    for (const article of articles) {
      assert.ok(article.id, "id");
      assert.ok(article.title, "title");
      assert.ok(article.visual, "visual");
      assert.match(String(article.reviewed || ""), /^\d{4}-\d{2}-\d{2}$/);
      assert.equal(article.slides.length, 5, article.id);
      for (const slide of article.slides) {
        assert.ok(slide.title, `${article.id} slide title`);
        assert.ok(slide.kind, `${article.id} slide kind`);
        assert.ok(Array.isArray(slide.sources), `${article.id} sources`);
      }
    }
  });

  it("article ids are unique", () => {
    const ids = articles.map((a) => a.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it("flagships carry multi-source slides", () => {
    for (const id of ["sudan-access", "heat-health"]) {
      const article = articles.find((a) => a.id === id);
      assert.ok(article, id);
      const rich = article.slides.filter((s) => (s.sources || []).length >= 2);
      assert.ok(rich.length >= 1, `${id} needs multi-source slides`);
    }
  });

  it("source urls are http(s) when present", () => {
    for (const article of articles) {
      for (const slide of article.slides) {
        for (const source of slide.sources || []) {
          if (!source.url) continue;
          assert.match(source.url, /^https?:\/\//, source.title || article.id);
        }
      }
    }
  });
});
