type UV = [number, number, number, number];

const MCMETA = 'https://raw.githubusercontent.com/misode/mcmeta';

export class TextureLoader {
	private uvMap: Record<string, UV> | null = null;
	private atlas: OffscreenCanvasRenderingContext2D | null = null;

	public async init() {
		if (this.uvMap && this.atlas) return;
		[this.uvMap, this.atlas] = await Promise.all([
			fetch(`${MCMETA}/atlas/blocks/data.min.json`).then(
				res => res.json() as Promise<Record<string, UV>>,
			),
			new Promise<OffscreenCanvasRenderingContext2D>(resolve => {
				const image = new Image();
				image.onload = () => {
					const canvas = new OffscreenCanvas(image.width, image.height);
					const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
					ctx.drawImage(image, 0, 0);
					resolve(ctx);
				};
				image.crossOrigin = 'anonymous';
				image.src = `${MCMETA}/atlas/blocks/atlas.png`;
			}),
		]);
	}

	public getTexture(id: string): ImageData {
		if (!this.uvMap || !this.atlas) throw new Error();

		const _id = id.slice('minecraft:'.length);
		const uv = this.uvMap[`block/${_id}`] ?? this.uvMap[`block/${_id}_side`];
		if (!uv) throw new Error(`texture ${id} not found`);

		const texture = this.atlas.getImageData(...uv);

		return texture;
	}
}
