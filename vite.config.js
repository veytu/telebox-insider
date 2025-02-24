/* eslint-env node */
import path from "path";
import { defineConfig } from "vite";
// import excludeDependenciesFromBundle from "rollup-plugin-exclude-dependencies-from-bundle";

export default defineConfig(({ mode }) => {
    const isProd = mode === "production";

    return {
        build: {
            lib: {
                entry: path.resolve(__dirname, "src/index.ts"),
                formats: ["es", "cjs"],
            },
            outDir: "dist",
            sourcemap: isProd,
            rollupOptions: {
                external: ["react"],
            },
            minify: false,
        },
        // plugins: [excludeDependenciesFromBundle()],
    };
});
