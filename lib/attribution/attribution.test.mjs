// Run with: npm test  (Node 24 loads the .ts module with built-in type stripping)
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  sanitizeValue,
  sanitizePath,
  externalReferrerHost,
  buildAttribution,
  serializeAttribution,
  parseAttribution,
  toUtmRecord,
  formatSource,
} from "./attribution.ts";

test("sanitizeValue lowercases and keeps only allowed characters", () => {
  assert.equal(sanitizeValue("Instagram"), "instagram");
  assert.equal(sanitizeValue("qr-Cafe_Lviv.1"), "qr-cafe_lviv.1");
  assert.equal(sanitizeValue("  Designers Outreach "), "designers-outreach");
  assert.equal(sanitizeValue("<script>alert(1)</script>"), "scriptalert1script");
  assert.equal(sanitizeValue("инста"), undefined);
});

test("sanitizeValue drops empty and non-string input", () => {
  assert.equal(sanitizeValue(""), undefined);
  assert.equal(sanitizeValue("   "), undefined);
  assert.equal(sanitizeValue("!!!"), undefined);
  assert.equal(sanitizeValue(null), undefined);
  assert.equal(sanitizeValue(42), undefined);
});

test("sanitizeValue cuts to 64 characters", () => {
  assert.equal(sanitizeValue("a".repeat(100)).length, 64);
});

test("sanitizePath keeps slashes and requires a leading slash", () => {
  assert.equal(sanitizePath("/"), "/");
  assert.equal(sanitizePath("/paintings/Loner"), "/paintings/loner");
  assert.equal(sanitizePath("gallery"), undefined);
  assert.equal(sanitizePath("/" + "a".repeat(100)).length, 64);
});

test("externalReferrerHost returns external hosts only", () => {
  assert.equal(externalReferrerHost("https://l.instagram.com/?u=x", "shop.test"), "l.instagram.com");
  assert.equal(externalReferrerHost("https://shop.test/gallery", "shop.test"), undefined);
  assert.equal(externalReferrerHost("not a url", "shop.test"), undefined);
  assert.equal(externalReferrerHost(null, "shop.test"), undefined);
});

test("buildAttribution needs utm_source and fills the other fields", () => {
  const a = buildAttribution({
    searchParams: new URLSearchParams("utm_source=Instagram&utm_medium=bio&utm_campaign=series-1"),
    pathname: "/",
    referer: "https://l.instagram.com/",
    host: "shop.test",
    now: 1000,
  });
  assert.deepEqual(a, { s: "instagram", m: "bio", c: "series-1", l: "/", r: "l.instagram.com", t: 1000 });

  const minimal = buildAttribution({
    searchParams: new URLSearchParams("utm_source=pinterest"),
    pathname: "/gallery",
    now: 5,
  });
  assert.deepEqual(minimal, { s: "pinterest", l: "/gallery", t: 5 });

  assert.equal(
    buildAttribution({ searchParams: new URLSearchParams("utm_medium=bio"), pathname: "/" }),
    null,
  );
  assert.equal(
    buildAttribution({ searchParams: new URLSearchParams("utm_source=%21%21"), pathname: "/" }),
    null,
  );
});

test("serialize and parse round-trip", () => {
  const a = { s: "instagram", m: "bio", l: "/", t: 1700000000000 };
  const raw = serializeAttribution(a);
  assert.deepEqual(parseAttribution(raw), a);
  assert.deepEqual(parseAttribution(encodeURIComponent(raw)), a);
});

test("parseAttribution rejects malformed values", () => {
  assert.equal(parseAttribution(undefined), null);
  assert.equal(parseAttribution(""), null);
  assert.equal(parseAttribution("{broken"), null);
  assert.equal(parseAttribution("[]"), null);
  assert.equal(parseAttribution(JSON.stringify({ m: "bio", t: 1 })), null);
  assert.equal(parseAttribution(JSON.stringify({ s: "instagram" })), null);
  assert.equal(parseAttribution(JSON.stringify({ s: "instagram", t: -1 })), null);
});

test("parseAttribution re-sanitizes values that were tampered with", () => {
  const raw = JSON.stringify({ s: "<b>Insta</b>", m: "Bio Link", r: "Evil.COM", l: "no-slash", t: 1 });
  assert.deepEqual(parseAttribution(raw), { s: "binstab", m: "bio-link", r: "evil.com", t: 1 });
});

test("toUtmRecord maps to the stored shape", () => {
  assert.deepEqual(toUtmRecord({ s: "instagram", m: "bio", l: "/", t: 0 }), {
    source: "instagram",
    medium: "bio",
    campaign: null,
    landing_path: "/",
    referrer_host: null,
    first_seen_at: "1970-01-01T00:00:00.000Z",
  });
});

test("formatSource", () => {
  assert.equal(formatSource("instagram", "bio"), "instagram / bio");
  assert.equal(formatSource("instagram"), "instagram");
  assert.equal(formatSource(null), "site");
});
