import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://corporacionmatiasrestrepo.org",
  integrations: [sitemap()],
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    routing: {
      prefixDefaultLocale: false, // Esto hace que el español sea la raíz (/) y el inglés use /en/
    },
  },
});
