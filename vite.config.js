import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		port: 5174,
		strictPort: true
	},
	preview: {
		port: 4174
	},
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
			include: ['src/lib/**'],
			exclude: [
				'src/routes/**',
				'src/lib/components/**',
				'src/lib/billing/**',
				'src/lib/index.js',
				'src/**/*.spec.{js,ts}',
				'src/**/*.test.{js,ts}',
				'src/app.html',
				'src/app.css',
				'**/*.config.{js,ts}',
				'**/vitest-setup*'
			],
			thresholds: {
				lines: 90,
				functions: 90,
				branches: 70,
				statements: 90
			}
		}
	}
});
