export async function readAsImage(file: File) {
	return new Promise<HTMLImageElement>(resolve => {
		const reader = new FileReader();

		reader.onload = () => {
			const image = new Image();

			image.onload = () => resolve(image);

			image.src = reader.result as string;
		};

		reader.readAsDataURL(file);
	});
}
