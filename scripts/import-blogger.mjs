// Import all posts from a Blogger blog's JSON feed into Jekyll _posts/.
// Usage (from repo root):  node scripts/import-blogger.mjs [blog-url]
// Idempotent: re-running rewrites the same files and skips images already downloaded.
import { mkdir, writeFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

const BLOG = (process.argv[2] || "https://mfjassociates.blogspot.com").replace(/\/$/, "");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const POSTS_DIR = path.join(ROOT, "_posts");
const IMG_DIR = path.join(ROOT, "assets", "images", "blogger");
const IMG_URL = "/assets/images/blogger";

const exists = (p) => access(p).then(() => true, () => false);

async function fetchAll() {
  const out = [];
  let start = 1, total = Infinity;
  while (out.length < total) {
    const url = `${BLOG}/feeds/posts/default?alt=json&max-results=150&start-index=${start}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} -> ${res.status}`);
    const feed = (await res.json()).feed;
    total = Number(feed["openSearch$totalResults"].$t);
    const entries = feed.entry || [];
    if (!entries.length) break;
    out.push(...entries);
    start += entries.length;
  }
  if (out.length !== total) throw new Error(`fetched ${out.length} of ${total} posts`);
  return out;
}

// Untrusted HTML: drop active content and event handlers before conversion.
function sanitize(html) {
  return html
    .replace(/<(script|style|iframe|object|embed)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|iframe|object|embed)\b[^>]*\/?>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, "")
    .replace(/<\/?(span|font|o:p)\b[^>]*>/gi, "")
    // Keep only attributes that carry content; drop Blogger/Word inline styling so the
    // site's own theme styles the post.
    .replace(/<([a-z][a-z0-9]*)\b([^>]*?)(\/?)>/gi, (m, tag, attrs, self) => {
      const keep = [];
      for (const a of attrs.matchAll(/\s([a-z:-]+)\s*=\s*("[^"]*"|'[^']*')/gi)) {
        const n = a[1].toLowerCase();
        if (["href", "src", "alt", "title", "colspan", "rowspan"].includes(n)) keep.push(` ${n}=${a[2]}`);
      }
      return `<${tag}${keep.join("")}${self}>`;
    });
}

async function localizeImages(html, slug, stats) {
  const seen = new Map();
  const re = /(<img\b[^>]*?\bsrc=")([^"]+)(")/gi;
  const jobs = [];
  html.replace(re, (_, _a, src) => { if (!seen.has(src)) seen.set(src, null); return _; });
  let n = 0;
  for (const src of seen.keys()) {
    n++;
    if (src.startsWith("data:image/")) {
      const m = src.match(/^data:image\/([a-z0-9.+-]+);base64,(.+)$/is);
      if (!m) continue;
      const ext = "." + ({ jpeg: "jpg", "svg+xml": "svg" }[m[1].toLowerCase()] || m[1].toLowerCase());
      const file = `${slug.slice(0, 60)}-${n}${ext}`;
      const dest = path.join(IMG_DIR, file);
      jobs.push((async () => {
        await mkdir(IMG_DIR, { recursive: true });
        await writeFile(dest, Buffer.from(m[2], "base64"));
        stats.imgDownloaded++;
        seen.set(src, `${IMG_URL}/${file}`);
      })());
      continue;
    }
    let url;
    try { url = new URL(src, BLOG); } catch { continue; }
    if (!/^https?:$/.test(url.protocol)) continue;
    // Blogger size tokens: ask for the large version.
    const big = url.href.replace(/\/(s\d+|w\d+-h\d+(-[a-z]+)*)(-c)?\//, "/s1600/");
    const ext = (path.extname(url.pathname).toLowerCase().match(/^\.(png|jpe?g|gif|webp|svg)$/) || [".jpg"])[0];
    const file = `${slug.slice(0, 60)}-${n}${ext}`;
    const dest = path.join(IMG_DIR, file);
    jobs.push((async () => {
      if (!(await exists(dest))) {
        const r = await fetch(big).catch(() => null);
        const ok = r && r.ok ? r : await fetch(url.href).catch(() => null);
        if (!ok || !ok.ok) { stats.imgFail.push(src); return; }
        await mkdir(IMG_DIR, { recursive: true });
        await writeFile(dest, Buffer.from(await ok.arrayBuffer()));
        stats.imgDownloaded++;
      }
      seen.set(src, `${IMG_URL}/${file}`);
    })());
  }
  await Promise.all(jobs);
  return html.replace(re, (m, a, src, c) => (seen.get(src) ? a + seen.get(src) + c : m));
}

const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced", bulletListMarker: "-" });
td.use(gfm);
td.remove(["script", "style", "iframe"]);
// Blogger wraps thumbnails in a link to the full image; keep just the image.
td.addRule("imgLink", {
  filter: (n) => n.nodeName === "A" && n.querySelector && n.querySelector("img") &&
    /googleusercontent|blogger\.com|blogspot\.com/.test(n.getAttribute("href") || ""),
  replacement: (content) => content,
});

const humanize = (s) => s.replace(/[-_]+/g, " ").replace(/^./, (c) => c.toUpperCase());

const entries = await fetchAll();
await mkdir(POSTS_DIR, { recursive: true });
const stats = { posts: 0, imgDownloaded: 0, imgFail: [], iframes: 0, written: [] };

for (const e of entries) {
  const alt = (e.link.find((l) => l.rel === "alternate") || {}).href;
  if (!alt) continue; // drafts have no public URL
  const slug = new URL(alt).pathname.split("/").pop().replace(/\.html$/, "")
    .toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || `post-${e.id.$t.split(".post-").pop()}`;
  const published = e.published.$t; // 2024-10-25T16:36:00.043-04:00
  const day = published.slice(0, 10);
  const off = published.slice(-6).replace(":", "");
  const date = `${day} ${published.slice(11, 19)} ${off}`;

  let html = e.content.$t || "";
  stats.iframes += (html.match(/<iframe\b/gi) || []).length;
  html = sanitize(html);
  html = await localizeImages(html, `${day}-${slug}`, stats);

  let title = (e.title.$t || "").trim();
  if (!title) {
    const h = html.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i);
    title = h ? h[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : "";
    if (!title) title = humanize(slug);
  }
  const tags = (e.category || []).map((c) => c.term);
  const body = td.turndown(html).replace(/\n{3,}/g, "\n\n").trim();

  const fm = [
    "---",
    `title: ${JSON.stringify(title)}`,
    `date: ${date}`,
    ...(tags.length ? [`tags: ${JSON.stringify(tags)}`] : []),
    `blogger_url: ${JSON.stringify(alt)}`,
    "---",
    "",
  ].join("\n");

  const file = path.join(POSTS_DIR, `${day}-${slug}.md`);
  await writeFile(file, `${fm}\n${body}\n`);
  stats.posts++;
  stats.written.push(path.basename(file));
}

console.log(`posts written: ${stats.posts} of ${entries.length}`);
console.log(`images downloaded: ${stats.imgDownloaded}; failed: ${stats.imgFail.length}`);
console.log(`iframes stripped: ${stats.iframes}`);
if (stats.imgFail.length) console.log(stats.imgFail.join("\n"));
