import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Plugin to remove console statements in production
const removeConsolePlugin = () => ({
  name: 'remove-console',
  transform(code: string, id: string) {
    if (id.includes('node_modules')) return null;
    
    // Remove console statements in production builds
    return code.replace(
      /\bconsole\.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\s*\([^)]*\)/g,
      'void 0'
    );
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'production' && removeConsolePlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
