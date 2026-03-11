import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { nodePolyfills } from "vite-plugin-node-polyfills"; // 1. Import the plugin
import fs from "fs";
import dotenv from "dotenv";

// Load env from parent project root when this package is nested.
const parentEnv = path.resolve(__dirname, "../.env");
if (fs.existsSync(parentEnv)) {
  dotenv.config({ path: parentEnv });
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    nodePolyfills(), // 2. Add polyfills here
    react(), 
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
