export function resizeImage(
	image: HTMLImageElement,
	width: number,
	height: number,
): ImageData {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d')!;
	ctx.drawImage(image, 0, 0, width, height);
	return ctx.getImageData(0, 0, width, height);
}
