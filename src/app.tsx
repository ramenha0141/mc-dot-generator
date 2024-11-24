import { valibotResolver } from '@hookform/resolvers/valibot';
import { GithubIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as v from 'valibot';

import { OutputCard } from '~/components/output';
import { buttonVariants } from '~/components/ui/button';
import * as blockRegistry from '~/lib/blocks';
import { type RGB, colorDistance, getBlockColor } from '~/lib/color';
import { readAsImage } from '~/lib/file';
import { generateLitematicaSchematic } from '~/lib/litematica';
import { Palette } from '~/lib/palette';
import { resizeImage } from '~/lib/resize';
import { TextureLoader } from '~/lib/texture';
import { cn } from '~/lib/utils';

import { OptionsCard } from './components/options';
import RenderWorker from './render-worker?worker';
import type { Output, Status } from './types';

const textureLoader = new TextureLoader();

const formSchema = v.object({
	image: v.instance(File, '画像を選択してください'),
	width: v.pipe(
		v.string('横幅を指定してください'),
		v.transform(input => Number.parseInt(input)),
		v.integer('横幅を整数で設定してください'),
		v.minValue(1, '横幅を1以上で設定してください'),
	),
	useMetalBlocks: v.boolean(),
	name: v.optional(v.string()),
});

export function App() {
	const form = useForm<v.InferInput<typeof formSchema>>({
		resolver: valibotResolver(formSchema),
		defaultValues: {
			width: '128',
			useMetalBlocks: true,
		},
	});
	const [status, setStatus] = useState<Status>('idle');
	const [output, setOutput] = useState<Output | null>(null);

	async function onSubmit(options: v.InferInput<typeof formSchema>) {
		setStatus('transform');

		const textureMap = new Map<string, ImageData>();
		const colorMap = new Map<string, RGB>();

		{
			await textureLoader.init();

			let blocks = Object.values(blockRegistry).flat();
			if (!options.useMetalBlocks) {
				blocks = blocks.filter(id => !blockRegistry.metal.includes(id));
			}
			for (const id of blocks) {
				const texture = textureLoader.getTexture(id);
				const color = getBlockColor(texture);

				textureMap.set(id, texture);
				colorMap.set(id, color);
			}
		}

		const image = await readAsImage(options.image);
		const width = Number.parseInt(options.width);
		const height = Math.round((image.height / image.width) * width);
		const resizedImage = resizeImage(image, width, height);
		const size = width * height;
		const colorMapArray = Array.from(colorMap.entries());
		const palette = new Palette();
		const blocks = new Uint8Array(size);

		{
			const imageData = resizedImage.data;
			for (let i = 0; i < size; i++) {
				const color: RGB = [
					imageData[i * 4],
					imageData[i * 4 + 1],
					imageData[i * 4 + 2],
				];

				const nearestBlockId = colorMapArray.reduce(
					(previous, [id, blockColor]) => {
						const distance = colorDistance(color, blockColor);
						if (distance < previous.distance) {
							return {
								id,
								distance,
							};
						} else {
							return previous;
						}
					},
					{
						id: '',
						distance: Number.POSITIVE_INFINITY,
					},
				).id;

				blocks[i] = palette.get(nearestBlockId);
			}
		}

		const materialArray = new Array<number>(palette.data.size).fill(0);

		for (const block of blocks) {
			materialArray[block]++;
		}

		const materialList = Array.from(palette.data.entries())
			.slice(1)
			.map(([id, i]) => ({ id, amount: materialArray[i] }))
			.toSorted((a, b) => b.amount - a.amount);

		setStatus('schematic');

		const name = options.name ?? options.image.name.split('.')[0];
		const schematic = generateLitematicaSchematic({
			name,
			width,
			height,
			palette,
			blocks,
		});
		const schematicUrl = URL.createObjectURL(new Blob([schematic]));

		setStatus('render');

		const worker = new RenderWorker();
		{
			const renderPalette = new Array<string>(palette.data.size);
			const renderTextureMap = new Map<string, ImageBitmap>();
			for (const [id, index] of palette.data) {
				if (id === 'minecraft:air') continue;
				renderPalette[index] = id;
				renderTextureMap.set(id, await createImageBitmap(textureMap.get(id)!));
			}
			worker.postMessage(
				{
					width,
					height,
					palette: renderPalette,
					blocks,
					textureMap: renderTextureMap,
				},
				[blocks.buffer, ...renderTextureMap.values()],
			);
		}
		const imageUrl = await new Promise<string>(resolve => {
			worker.onmessage = (e: MessageEvent<string>) => resolve(e.data);
		});

		setOutput(old => {
			if (old) {
				URL.revokeObjectURL(old.schematicUrl);
				URL.revokeObjectURL(old.imageUrl);
			}

			return {
				name,
				width,
				height,
				total: size,
				totalTypes: palette.data.size - 1,
				materialList,
				schematicUrl,
				imageUrl,
			};
		});
		setStatus('idle');
	}

	return (
		<main className='mx-auto grid max-w-[48rem] gap-8 bg-background px-4 py-8'>
			<div className='mx-auto flex flex-wrap items-center justify-center gap-2 font-bold text-2xl'>
				<div className='flex gap-2'>
					<img src='/favicon.webp' className='h-8' />
					<h1>Minecraft壁画生成</h1>
				</div>
				<div className='flex gap-2'>
					<p className='text-muted-foreground'>/</p>
					<p className='text-muted-foreground'>dot.chamame.org</p>
				</div>
			</div>

			<OptionsCard status={status} form={form} onSubmit={onSubmit} />

			{output && <OutputCard output={output} />}

			<div className='flex items-center justify-center gap-2'>
				<p className='font-bold'>v{__VERSION__}</p>
				<p>/</p>
				<a
					href='https://github.com/ramenha0141/mc-dot-generator'
					className={cn(
						buttonVariants({
							variant: 'link',
						}),
						'gap-1 p-0 text-foreground',
					)}
				>
					<GithubIcon />
					Repository
				</a>
				<p>/</p>
				<a
					href='https://github.com/ramenha0141'
					className={cn(
						buttonVariants({
							variant: 'link',
						}),
						'p-0 text-foreground',
					)}
				>
					ramenha0141
				</a>
			</div>
		</main>
	);
}
