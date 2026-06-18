import react from "@vitejs/plugin-react";
import { writeFileSync } from "fs";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import { DEFAULT_BASE_PATH, normalizeBasePath } from "./src/config/base-path";

/** 构建时按 base 路径生成 Netlify/Cloudflare Pages SPA 回退规则 */
function spaRedirectsPlugin(basePath: string) {
  return {
    name: "spa-redirects",
    closeBundle() {
      const rule =
        basePath === "/"
          ? "/*    /index.html   200"
          : `${basePath}*    ${basePath}index.html   200`;
      writeFileSync(path.resolve(__dirname, "dist/_redirects"), `${rule}\n`);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = normalizeBasePath(env.VITE_BASE_PATH || DEFAULT_BASE_PATH);

  return {
    base,
    build: {
      copyPublicDir: false,
    },
    plugins: [react(), spaRedirectsPlugin(base)],
    server: {
      port: 5173,
      strictPort: false,
    },
    preview: {
      port: 4173,
    },
  };
});
