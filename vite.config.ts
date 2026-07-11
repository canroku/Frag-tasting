import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    // TEK_DOSYA=1: tek dosyalık dağıtım (Artifact) için kod bölmeyi kapat.
    // Normal derleme: 29 binlik katalog ayrı parçada, arka planda yüklenir.
    rollupOptions: process.env.TEK_DOSYA
      ? { output: { inlineDynamicImports: true } }
      : {},
    chunkSizeWarningLimit: 10000,
  },
});
