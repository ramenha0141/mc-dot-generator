import { Loader2 } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import type { InferInput } from 'valibot';

import { Direction, type formSchema } from '~/form-schema';
import { cn } from '~/lib/utils';
import type { Status } from '~/types';

import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';

const widthPresets = ['64', '96', '128', '192', '256'];

export function OptionsCard({
	status,
	form,
	onSubmit,
}: {
	status: Status;
	form: UseFormReturn<InferInput<typeof formSchema>>;
	onSubmit: (options: InferInput<typeof formSchema>) => void;
}) {
	return (
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
													className={cn(
														'px-1 sm:px-1.5',
														field.value === width && 'underline',
													)}
													onClick={() => field.onChange(width)}
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
							name='direction'
							render={({ field: { onChange, ...field } }) => (
								<FormItem>
									<FormLabel>方向</FormLabel>
									<FormControl>
										<Select
											onValueChange={value => onChange(value as Direction)}
											{...field}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value={Direction.Horizontal}>横</SelectItem>
												<SelectItem value={Direction.Vertical}>縦</SelectItem>
											</SelectContent>
										</Select>
									</FormControl>
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
											placeholder={form.getValues('image')?.name.split('.')[0]}
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
	);
}
