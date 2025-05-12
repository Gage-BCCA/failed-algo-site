// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    markdown: {
        shikiConfig: {
          theme: 'github-dark',
        },
      },
    site: 'https://failedalgorithm.com'
});
