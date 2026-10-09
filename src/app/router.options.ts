import type { RouterConfig } from "@nuxt/schema";
import { routes } from "../routes";

export default {
  // Ganti default file-based routes dengan custom routes
  routes: (_routes) => routes,
} satisfies RouterConfig;