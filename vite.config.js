import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	test: {
		environment: 'happy-dom',
		globals: true,
		setupFiles: ['./vitest-setup.js'],
		include: ['src/**/*.{test,spec}.{js,ts}'],
		exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'lcov'],
			reportsDirectory: './coverage',
			thresholds: {
				lines: 70,
				functions: 70,
				branches: 60,
				statements: 70
			},
			exclude: [
				'src/routes/**',
				'src/**/*.spec.{js,ts}',
				'src/**/*.test.{js,ts}',
				'src/app.html',
				'src/app.css',
				'**/*.config.{js,ts}',
				'**/vitest-setup*'
			]
		}
	}
});
