const { defineConfig } = require("tsup");
module.exports = defineConfig({
	entry: ["src"],
	splitting: false,
	sourcemap: false,
	clean: true,
	bundle: true,
	minify: true,
	outDir: "dist",
	watch: true
});