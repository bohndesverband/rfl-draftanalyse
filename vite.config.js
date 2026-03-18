import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import mkcert from "vite-plugin-mkcert";

// https://vite.dev/config/
export default defineConfig({
	// base: "/rfl-draftanalyse/",
	plugins: [vue(), mkcert()],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
			"~": fileURLToPath(new URL("./node_modules", import.meta.url)),
		},
	},
});
