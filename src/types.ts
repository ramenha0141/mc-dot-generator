export type Status = 'idle' | 'transform' | 'schematic' | 'render';

export interface Output {
	name: string;
	width: number;
	height: number;
	total: number;
	totalTypes: number;
	materialList: { id: string; amount: number }[];
	schematicUrl: string;
	imageUrl: string;
}
