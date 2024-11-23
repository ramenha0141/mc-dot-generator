const COLORS = [
	'white',
	'light_gray',
	'gray',
	'black',
	'brown',
	'red',
	'orange',
	'yellow',
	'lime',
	'green',
	'cyan',
	'light_blue',
	'blue',
	'purple',
	'magenta',
	'pink',
] as const;

const LOG_TYPE = [
	'oak',
	'spruce',
	'birch',
	'jungle',
	'acacia',
	'dark_oak',
	'cherry',
] as const;

export const wool = COLORS.map(color => `minecraft:${color}_wool`);

export const concrete = COLORS.map(color => `minecraft:${color}_concrete`);

export const terracotta = [
	'minecraft:terracotta',
	...COLORS.map(color => `minecraft:${color}_terracotta`),
];

export const stone = [
	'minecraft:stone',
	'minecraft:deepslate',
	'minecraft:granite',
	'minecraft:polished_granite',
	'minecraft:diorite',
	'minecraft:polished_diorite',
	'minecraft:andesite',
	'minecraft:polished_andesite',
	'minecraft:cobblestone',
	'minecraft:stone_bricks',
	'minecraft:sandstone',
	'minecraft:nether_bricks',
];

export const natural = [
	'minecraft:dirt',
	'minecraft:clay',
	'minecraft:netherrack',
	'minecraft:prismarine',
	'minecraft:prismarine_bricks',
	'minecraft:dark_prismarine',
	'minecraft:moss_block',
];

export const wood = [
	...LOG_TYPE.map(type => `minecraft:stripped_${type}_log`),
	...LOG_TYPE.map(type => `minecraft:${type}_planks`),
];

export const metal = [
	'minecraft:quartz_block',
	'minecraft:obsidian',
	'minecraft:redstone_block',
	'minecraft:lapis_block',
	'minecraft:gold_block',
	'minecraft:emerald_block',
	'minecraft:diamond_block',
];
