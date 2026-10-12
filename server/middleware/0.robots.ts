export default defineEventHandler((event) => {
  const path = (event.path || "").split("?")[0];

  if (path === "/robots.txt") {
    const res = event.node.res;
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.end("User-agent: *\nAllow: /\n");
    // hentikan pipeline Nuxt supaya tidak render HTML
    return;
  }
});