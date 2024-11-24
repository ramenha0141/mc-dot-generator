import { memo } from 'react';

import { formatBlockAmount } from '~/lib/utils';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from './ui/table';

export const MaterialList = memo(
	({ materialList }: { materialList: { id: string; amount: number }[] }) => {
		return (
			<Table className='font-mono'>
				<TableHeader>
					<TableRow>
						<TableHead>ID</TableHead>
						<TableHead>ブロック数</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{materialList.map(({ id, amount }) => (
						<TableRow key={id}>
							<TableCell>{id}</TableCell>
							<TableCell>
								{amount}{' '}
								<span className='text-muted-foreground'>
									({formatBlockAmount(amount)})
								</span>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		);
	},
);
