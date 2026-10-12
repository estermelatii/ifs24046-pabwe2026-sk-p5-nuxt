import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
  srcDir: "src/",
  modules: ["@pinia/nuxt"],
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    public: {
      delcomBaseUrl:
        process.env.NUXT_PUBLIC_DELCOM_BASEURL ||
        "https://open-api.delcom.org/api/v1",
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: "id" },
      title: "Delcom Cash Flow",
      meta: [
        {
          name: "description",
          content:
            "Aplikasi pencatatan arus kas Delcom — kelola pemasukan, pengeluaran, dan saldo.",
        },
        { name: "theme-color", content: "#4f46e5" },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },
  nitro: {
    compressPublicAssets: true,
    routeRules: {
      "/robots.txt": {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      },
    },
  },
});