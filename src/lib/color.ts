const PIXELS = 16 * 16;

export type RGB = [number, number, number];

export function formatRGB(rgb: RGB) {
	const [r, g, b] = rgb;

	const R = `0${r.toString(16).toUpperCase()}`.slice(-2);
	const G = `0${g.toString(16).toUpperCase()}`.slice(-2);
	const B = `0${b.toString(16).toUpperCase()}`.slice(-2);

	return `#${R}${G}${B}`;
}

export function getBlockColor(blockTexture: ImageData): RGB {
	const { data } = blockTexture;

	let r = 0;
	let g = 0;
	let b = 0;

	for (let i = 0; i < PIXELS; i++) {
		r += data[i * 4];
		g += data[i * 4 + 1];
		b += data[i * 4 + 2];
	}

	const R = Math.round(r / PIXELS);
	const G = Math.round(g / PIXELS);
	const B = Math.round(b / PIXELS);

	return [R, G, B];
}

export function colorDistance(a: RGB, b: RGB) {
	return (
		(a[0] - b[0]) ** 2 * 2 + (a[1] - b[1]) ** 2 * 4 + (a[2] - b[2]) ** 2 * 3
	);
}
