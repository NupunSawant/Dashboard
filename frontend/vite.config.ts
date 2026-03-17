import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import obfuscator from "vite-plugin-javascript-obfuscator";

export default defineConfig({
	plugins: [
		react(),

		// ✅ Obfuscation plugin (ONLY for production)
		obfuscator({
			apply: "build",
			options: {
				compact: true,
				controlFlowFlattening: true,
				controlFlowFlatteningThreshold: 0.75,
				deadCodeInjection: true,
				deadCodeInjectionThreshold: 0.4,
				debugProtection: false,
				disableConsoleOutput: true,
				identifierNamesGenerator: "hexadecimal",
				renameGlobals: false,
				rotateStringArray: true,
				selfDefending: true,
				stringArray: true,
				stringArrayEncoding: ["base64"],
				stringArrayThreshold: 0.75,
			},
		}),
	],

	build: {
		sourcemap: false, // ❗ VERY IMPORTANT
		minify: "esbuild",
	},
});
