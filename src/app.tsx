import { valibotResolver } from '@hookform/resolvers/valibot';
import { ArrowDownToLineIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as v from 'valibot';

import { Button, buttonVariants } from '~/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Switch } from '~/components/ui/switch';

import * as blockRegistry from './lib/blocks';
import { type RGB, colorDistance, getBlockColor } from './lib/color';
import { readAsImage } from './lib/file';
import { generateLitematicaSchematic } from './lib/litematica';
import { Palette } from './lib/palette';
import { resizeImage } from './lib/resize';
import { TextureLoader } from './lib/texture';

import RenderWorker from './render-worker?worker';

const textureLoader = new TextureLoader();

const widthPresets = [64, 96, 128, 192, 256];

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

interface Output {
	name: string;
	width: number;
	height: number;
	total: number;
	totalTypes: number;
	schematicUrl: string;
	imageUrl: string;
}

export function App() {
	const form = useForm<v.InferInput<typeof formSchema>>({
		resolver: valibotResolver(formSchema),
		defaultValues: {
			width: '128',
			useMetalBlocks: true,
		},
	});
	const [status, setStatus] = useState<
		'idle' | 'transform' | 'schematic' | 'render'
	>('idle');
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
				schematicUrl,
				imageUrl,
			};
		});
		setStatus('idle');
	}

	return (
		<main className='mx-auto grid max-w-[48rem] gap-8 bg-background p-8'>
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

			<Card>
				<CardHeader>
					<CardTitle>設定</CardTitle>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
							<FormField
								control={form.control}
								name='image'
								render={({ field: { value, onChange, ...field } }) => (
									<FormItem>
										<FormLabel>画像</FormLabel>
										<FormControl>
											<Input
												type='file'
												accept='image/*'
												className='cursor-pointer'
												onChange={e => {
													onChange(e.target.files?.[0]);
												}}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='width'
								render={({ field }) => (
									<FormItem>
										<FormLabel>横幅</FormLabel>
										<div className='flex gap-1'>
											<FormControl>
												<Input type='number' className='grow' {...field} />
											</FormControl>
											<div className='shrink-0'>
												{widthPresets.map(width => (
													<Button
														key={width}
														type='button'
														variant='link'
														className='px-1.5'
														onClick={() => field.onChange(width.toString())}
													>
														{width}
													</Button>
												))}
											</div>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='useMetalBlocks'
								render={({ field: { value, onChange, ...field } }) => (
									<FormItem>
										<FormLabel>鉱石系のブロックを使用する</FormLabel>
										<FormDescription>
											鉄ブロック, 金ブロック, ダイアモンドブロックなど
										</FormDescription>
										<FormControl>
											<Switch
												checked={value}
												onCheckedChange={onChange}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='name'
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											名前
											<span className='font-normal text-muted-foreground'>
												（オプション）
											</span>
										</FormLabel>
										<FormDescription>ファイルダウンロード用</FormDescription>
										<FormControl>
											<Input
												placeholder={
													form.getValues('image')?.name.split('.')[0]
												}
												autoComplete='off'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className='flex items-center gap-4'>
								<Button type='submit' disabled={status !== 'idle'}>
									{status !== 'idle' && <Loader2 className='animate-spin' />}
									変換
								</Button>
								<p className='font-bold text-muted-foreground text-sm'>
									{
										{
											idle: null,
											transform: '変換中...',
											schematic: '出力中...',
											render: '描画中...',
										}[status]
									}
								</p>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>

			{output && (
				<Card>
					<CardHeader>
						<CardTitle>出力</CardTitle>
						<CardDescription>
							出力サイズ：{output.width}x{output.height}, ブロック：
							{output.total}, ブロックの種類：{output.totalTypes}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<img
							id='rendered'
							className='w-[stretch]'
							src={output.imageUrl}
							onLoad={e =>
								e.currentTarget.parentElement!.parentElement!.scrollIntoView({
									behavior: 'smooth',
								})
							}
						/>
					</CardContent>
					<CardFooter className='flex gap-4'>
						<a
							href={output.imageUrl}
							download={`${output.name}.png`}
							className={buttonVariants()}
						>
							<ArrowDownToLineIcon />
							画像をダウンロード
						</a>
						<a
							href={output.schematicUrl}
							download={`${output.name}.litematic`}
							className={buttonVariants()}
						>
							<ArrowDownToLineIcon />
							設計図をダウンロード
						</a>
					</CardFooter>
				</Card>
			)}
		</main>
	);
}
