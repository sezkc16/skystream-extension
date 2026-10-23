
(function () {
  const baseUrl = manifest.baseUrl.replace(/\/+$/, "");

  const cache = new Map();

  async function fetchPage(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.text();
  }

  function decodeHtml(value) {
    return String(value || "")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&#x27;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
  }

  function extractObjects(html, key) {
    const results = [];
    const pattern = new RegExp(
      `"${key}"\\s*:\\s*`,
      "g"
    );

    let match;

    while ((match = pattern.exec(html))) {
      const start = pattern.lastIndex;
      const opening = html[start];

      if (opening !== "[" && opening !== "{") {
        continue;
      }

      const closing = opening === "[" ? "]" : "}";
      let depth = 0;
      let inString = false;
      let escaped = false;

      for (let i = start; i < html.length; i++) {
        const char = html[i];

        if (inString) {
          if (escaped) {
            escaped = false;
          } else if (char === "\\") {
            escaped = true;
          } else if (char === '"') {
            inString = false;
          }
          continue;
        }

        if (char === '"') {
          inString = true;
        } else if (char === opening) {
          depth++;
        } else if (char === closing) {
          depth--;

          if (depth === 0) {
            try {
              results.push(
                JSON.parse(html.slice(start, i + 1))
              );
            } catch (_) {}
            break;
          }
        }
      }
    }

    return results;
  }

  function findItems(value, depth = 0) {
    if (!value || depth > 12) return null;

    if (Array.isArray(value)) {
      if (
        value.some(
          x => x && typeof x === "object" &&
          (x.slug || x.post_title)
        )
      ) {
        return value;
      }

      for (const child of value) {
        const result = findItems(child, depth + 1);
        if (result) return result;
      }
    } else if (typeof value === "object") {
      for (const child of Object.values(value)) {
        const result = findItems(child, depth + 1);
        if (result) return result;
      }
    }

    return null;
  }

  function extractCatalog(html) {
    const arrays = extractObjects(html, "items");

    for (const arr of arrays) {
      const found = findItems(arr);
      if (found) return found;
    }

    return [];
  }

  function absoluteUrl(value) {
    if (!value) return "";

    try {
      return new URL(value, baseUrl + "/").href;
    } catch (_) {
      if (value.startsWith("/")) {
        return baseUrl + value;
      }
      return baseUrl + "/" + value;
    }
  }

  function getPoster(item) {
    const poster =
      item.thumbnail_image ||
      item.poster ||
      item.image ||
      "";

    if (!poster) return "";

    if (poster.startsWith("http")) return poster;

    return absoluteUrl(poster);
  }

  function toMedia(item) {
    const title = decodeHtml(
      item.post_title || item.title || "Untitled"
    );

    const slug = item.slug || "";

    const url = slug.startsWith("http")
      ? slug
      : `${baseUrl}/${slug.replace(/^\/|\/$/g, "")}/`;

    const yearMatch = title.match(/\b(?:19|20)\d{2}\b/);

    return new MultimediaItem({
      title,
      url,
      posterUrl: getPoster(item),
      type: "series",
      year: yearMatch ? Number(yearMatch[0]) : undefined
    });
  }

  async function getCatalog() {
    const html = await fetchPage(baseUrl + "/");
    return extractCatalog(html);
  }

  async function getHome(cb) {
    try {
      const items = await getCatalog();

      cb({
        success: true,
        data: {
          "Latest Dramas & Anime": items.map(toMedia)
        }
      });
    } catch (error) {
      console.error("KatDrama home:", error);

      cb({
        success: false,
        data: {}
      });
    }
  }

  async function search(query, cb) {
    try {
      const items = await getCatalog();
      const term = query.trim().toLowerCase();

      const matches = items.filter(item =>
        String(item.post_title || item.title || "")
          .toLowerCase()
          .includes(term)
      );

      cb({
        success: true,
        data: matches.map(toMedia)
      });
    } catch (error) {
      console.error("KatDrama search:", error);

      cb({
        success: false,
        data: []
      });
    }
  }

  function extractContent(html) {
    const marker = '"post_content":';
    const index = html.indexOf(marker);

    if (index === -1) return "";

    const start = index + marker.length;

    try {
      const remaining = html.slice(start);
      const match = remaining.match(
        /^("(?:\\.|[^"\\])*")/
      );

      if (match) return JSON.parse(match[1]);
    } catch (_) {}

    return "";
  }

  function extractLinks(content) {
    const links = [];
    const regex =
      /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

    let match;

    while ((match = regex.exec(content))) {
      const href = decodeHtml(match[1]);
      const label = decodeHtml(
        match[2].replace(/<[^>]*>/g, " ")
      ).trim();

      if (!href.startsWith("http")) continue;

      links.push({ href, label });
    }

    return links;
  }

  function extractEpisodes(content) {
    const links = extractLinks(content);
    const episodes = [];
    const seen = new Set();

    let currentEpisode = 1;

    for (const link of links) {
      const combined = `${link.label} ${link.href}`;

      const episodeMatch = combined.match(
        /(?:episode|ep)[\s._-]*(\d+)/i
      );

      if (episodeMatch) {
        currentEpisode = Number(episodeMatch[1]);
      }

      const isVideoLink =
        /links\.kmhd\.me\/(?:file|play)/i.test(link.href) ||
        /\.(?:mp4|m3u8)(?:[?#]|$)/i.test(link.href);

      if (!isVideoLink) continue;

      const episodeNumber = currentEpisode;
      const qualityMatch = link.label.match(
        /\b(1080p|720p|480p|360p)\b/i
      );

      const quality = qualityMatch
        ? qualityMatch[1]
        : "Auto";

      const key = `${episodeNumber}:${link.href}`;

      if (seen.has(key)) continue;
      seen.add(key);

      episodes.push({
        number: episodeNumber,
        quality,
        link: link.href
      });
    }

    return episodes;
  }

  async function load(url, cb) {
    try {
      const html = await fetchPage(url);
      const content = extractContent(html);

      const slug = url.split("/").filter(Boolean).pop();

      const title = decodeHtml(
        slug.replace(/-/g, " ")
      );

      const episodeLinks = extractEpisodes(content);
      const groups = new Map();

      for (const entry of episodeLinks) {
        if (!groups.has(entry.number)) {
          groups.set(entry.number, []);
        }
        groups.get(entry.number).push(entry);
      }

      const episodes = [];

      for (const [number, sources] of groups) {
        const episodeUrl = `${url}#episode-${number}`;

        cache.set(episodeUrl, sources);

        episodes.push(
          new Episode({
            name: `Episode ${number}`,
            url: episodeUrl,
            season: 1,
            episode: number
          })
        );
      }

      episodes.sort((a, b) => a.episode - b.episode);

      const description = decodeHtml(
        content.replace(/<[^>]*>/g, " ")
      ).replace(/\s+/g, " ").slice(0, 500);

      const media = new MultimediaItem({
        title,
        url,
        type: "series",
        description,
        episodes
      });

      cb({
        success: true,
        data: media
      });
    } catch (error) {
      console.error("KatDrama details:", error);

      cb({
        success: false,
        data: null
      });
    }
  }

  async function loadStreams(url, cb) {
    try {
      let sources = cache.get(url);

      if (!sources) {
        const pageUrl = url.split("#")[0];
        const episodeMatch = url.match(/#episode-(\d+)/);
        const episodeNumber = episodeMatch
          ? Number(episodeMatch[1])
          : 1;

        const html = await fetchPage(pageUrl);
        const content = extractContent(html);

        sources = extractEpisodes(content).filter(
          item => item.number === episodeNumber
        );
      }

      const streams = sources
        .filter(item =>
          /\.(?:mp4|m3u8)(?:[?#]|$)/i.test(item.link)
        )
        .map(item =>
          new StreamResult({
            url: item.link,
            source: "KatDrama",
            quality: item.quality
          })
        );

      cb({
        success: true,
        data: streams
      });
    } catch (error) {
      console.error("KatDrama streams:", error);

      cb({
        success: false,
        data: []
      });
    }
  }

  globalThis.getHome = getHome;
  globalThis.search = search;
  globalThis.load = load;
  globalThis.loadStreams = loadStreams;
})();
