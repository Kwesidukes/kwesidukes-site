// Vercel Serverless Function: /api/kev
//
// Fetches the CISA Known Exploited Vulnerabilities (KEV) catalog
// server-side (avoids browser CORS issues and needs no API key — the
// feed is fully public) and returns a small, sanitized summary for the
// site's cyber threat intelligence ticker: total catalog size, how many
// entries share the most recent "date added", and the most recently
// added entries themselves.
//
// Response is cached at the CDN edge (see Cache-Control below) so a
// normal flow of visitors does not each trigger a fresh upstream fetch.
// On any failure this returns { ok: false } with HTTP 200 — the client
// treats that identically to a network error and simply keeps whatever
// static fallback content is already in the page.

const KEV_URL =
  "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";
const MAX_ITEMS = 15;
const UPSTREAM_TIMEOUT_MS = 8000;

let memoryCache = { payload: null, fetchedAt: 0 };
const MEMORY_TTL_MS = 30 * 60 * 1000; // 30 minutes, best-effort on warm instances only

function truncate(value, maxLen) {
  if (typeof value !== "string") return "";
  const cleaned = value.replace(/[\r\n\t]+/g, " ").trim();
  return cleaned.length > maxLen ? cleaned.slice(0, maxLen) : cleaned;
}

function isValidDate(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

async function fetchKevCatalog() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const response = await fetch(KEV_URL, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent":
          "kwesidukes.au-cyber-ticker/1.0 (+https://kwesidukes.au/)",
      },
    });
    if (!response.ok) {
      throw new Error("CISA KEV upstream responded with " + response.status);
    }
    const data = await response.json();
    const vulnerabilities = Array.isArray(data.vulnerabilities)
      ? data.vulnerabilities
      : [];
    if (!vulnerabilities.length) {
      throw new Error("CISA KEV upstream returned no vulnerabilities");
    }

    const sorted = vulnerabilities
      .filter((v) => v && isValidDate(v.dateAdded))
      .slice()
      .sort((a, b) => Date.parse(b.dateAdded) - Date.parse(a.dateAdded));

    const latestDate = sorted.length ? sorted[0].dateAdded : null;
    const latestAdditions = latestDate
      ? sorted.filter((v) => v.dateAdded === latestDate).length
      : 0;

    const items = sorted.slice(0, MAX_ITEMS).map((v) => ({
      cveID: truncate(v.cveID, 20),
      vendorProject: truncate(v.vendorProject, 60),
      product: truncate(v.product, 60),
      dateAdded: truncate(v.dateAdded, 10),
    }));

    return {
      ok: true,
      source: "CISA Known Exploited Vulnerabilities (KEV) Catalog",
      sourceUrl: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
      catalogVersion: truncate(data.catalogVersion, 20) || null,
      dateReleased: truncate(data.dateReleased, 30) || null,
      totalCount: vulnerabilities.length,
      latestAdditions,
      items,
      fetchedAt: new Date().toISOString(),
    };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = async (req, res) => {
  const now = Date.now();

  if (memoryCache.payload && now - memoryCache.fetchedAt < MEMORY_TTL_MS) {
    res.setHeader(
      "Cache-Control",
      "public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400",
    );
    res.status(200).json(memoryCache.payload);
    return;
  }

  try {
    const payload = await fetchKevCatalog();
    memoryCache = { payload, fetchedAt: now };
    res.setHeader(
      "Cache-Control",
      "public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400",
    );
    res.status(200).json(payload);
  } catch (err) {
    // Serve a stale cached copy rather than nothing, if we have one.
    if (memoryCache.payload) {
      res.setHeader("Cache-Control", "public, max-age=300, s-maxage=900");
      res.status(200).json(memoryCache.payload);
      return;
    }
    res.setHeader("Cache-Control", "public, max-age=120, s-maxage=300");
    res.status(200).json({ ok: false, reason: "unavailable" });
  }
};
