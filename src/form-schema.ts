import * as v from 'valibot';

export const formSchema = v.object({
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
