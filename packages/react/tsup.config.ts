import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/components/icons/index.ts"],
	format: ["cjs", "esm"],
	dts: {
		resolve: true,
	},
	splitting: false,
	sourcemap: true,
	clean: true,
	external: ["react", "react-dom"],
	outDir: "dist",
	tsconfig: "tsconfig.lib.json",
	esbuildOptions(options) {
		options.banner = {
			js: '"use client";',
		};
	},
});
