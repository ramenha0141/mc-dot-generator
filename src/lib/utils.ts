import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatBlockAmount(amount: number) {
	const shulkerBox = Math.floor(amount / (64 * 27));
	const stack = Math.floor(amount / 64) % 27;
	const block = amount % 64;

	const texts: string[] = [];

	if (shulkerBox) texts.push(`${shulkerBox} SB`);
	if (stack) texts.push(`${stack} stack`);
	if (block) texts.push(`${block} block`);

	return texts.join(' + ');
}
