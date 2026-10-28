import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
  plugins: [
    laravel({
      input: [
        'resources/scss/app.scss',
        'resources/scss/staff.scss',
        'resources/scss/print.scss',
        'resources/js/app.js'
      ],
      refresh: [
        'resources/views/**',
        'Modules/**/resources/views/**'
      ],
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
      },
    },
  },
});
