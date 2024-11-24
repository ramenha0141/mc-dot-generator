import { resolve } from 'node:path';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'~': resolve(__dirname, './src'),
		},
	},
	define: {
		__VERSION__: JSON.stringify(process.env.npm_package_version),
	},
});
