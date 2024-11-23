self.onmessage = async ({
	data: { width, height, palette, blocks, textureMap },
}: MessageEvent<{
	width: number;
	height: number;
	palette: Array<string>;
	blocks: Uint8Array;
	textureMap: Map<string, ImageBitmap>;
}>) => {
	const canvas = new OffscreenCanvas(width * 16, height * 16);
	const ctx = canvas.getContext('2d')!;

	const size = width * height;
	for (let i = 0; i < size; i++) {
		const id = palette[blocks[i]];
		const texture = textureMap.get(id)!;
		const x = i % width;
		const y = Math.floor(i / width);
		ctx.drawImage(texture, x * 16, y * 16);
	}

	const url = URL.createObjectURL(await canvas.convertToBlob());
	self.postMessage(url);

	for (const [_, texture] of textureMap) {
		texture.close();
	}
};
