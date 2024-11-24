import { ArrowDownToLineIcon } from 'lucide-react';
import { useRef } from 'react';

import type { Output } from '~/types';

import { MaterialList } from './material-list';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from './ui/accordion';
import { buttonVariants } from './ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from './ui/card';

export function OutputCard({ output }: { output: Output }) {
	const ref = useRef<HTMLDivElement>(null);

	return (
		<Card ref={ref} className='min-w-0'>
			<CardHeader>
				<CardTitle>出力</CardTitle>
				<CardDescription>
					出力サイズ：{output.width}x{output.height}, ブロック：
					{output.total}, ブロックの種類：{output.totalTypes}
				</CardDescription>
			</CardHeader>
			<CardContent className='space-y-4'>
				<img
					id='rendered'
					className='w-[stretch]'
					src={output.imageUrl}
					onLoad={() => ref.current!.scrollIntoView({ behavior: 'smooth' })}
				/>
				<Accordion type='single' collapsible>
					<AccordionItem value='material-list'>
						<AccordionTrigger>ブロックリスト</AccordionTrigger>
						<AccordionContent>
							<MaterialList materialList={output.materialList} />
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</CardContent>
			<CardFooter className='flex gap-4'>
				<a
					href={output.imageUrl}
					download={`${output.name}.png`}
					className={buttonVariants()}
				>
					<ArrowDownToLineIcon />
					<p>
						画像<span className='hidden sm:inline'>をダウンロード</span>
					</p>
				</a>
				<a
					href={output.schematicUrl}
					download={`${output.name}.litematic`}
					className={buttonVariants()}
				>
					<ArrowDownToLineIcon />
					<p>
						設計図<span className='hidden sm:inline'>をダウンロード</span>
					</p>
				</a>
			</CardFooter>
		</Card>
	);
}
