import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    copyPublicDir: false,
  },
  plugins: [react()],
});
