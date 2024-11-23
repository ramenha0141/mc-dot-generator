export class Palette {
	private index = 1;
	public data = new Map<string, number>([['minecraft:air', 0]]);

	public get(id: string) {
		if (this.data.has(id)) {
			return this.data.get(id)!;
		} else {
			this.data.set(id, this.index);
			return this.index++;
		}
	}
}
