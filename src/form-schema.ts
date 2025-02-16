import * as v from 'valibot';

export enum Direction {
	Horizontal = 'horizontal',
	Vertical = 'vertical',
}

export const formSchema = v.object({
	image: v.instance(File, '画像を選択してください'),
	width: v.pipe(
		v.string('横幅を指定してください'),
		v.transform(input => Number.parseInt(input)),
		v.integer('横幅を整数で設定してください'),
		v.minValue(1, '横幅を1以上で設定してください'),
	),
	useMetalBlocks: v.boolean(),
	direction: v.enum(Direction, '方向を選択してください'),
	name: v.optional(v.string()),
});
