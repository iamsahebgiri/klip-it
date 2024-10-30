import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
    return {
        esbuild: {
            pure: mode === 'production' ? ['console'] : [],
            legalComments: 'none',
        }
    }
});