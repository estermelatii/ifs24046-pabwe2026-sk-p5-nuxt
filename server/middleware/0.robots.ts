export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname;
  if (path === "/robots.txt") {
    setResponseHeader(event, "Content-Type", "text/plain; charset=utf-8");
    setResponseHeader(event, "Cache-Control", "public, max-age=86400");
    return "User-agent: *\nAllow: /\n";
  }
});