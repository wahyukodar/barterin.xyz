import { persisted } from 'svelte-persisted-store';

export const printerStore = persisted<string | null>('selected-printer', null);

export function setPrinter(printer: string) {
	printerStore.set(printer);
}

export function clearPrinter() {
	printerStore.set(null);
	if (typeof localStorage !== 'undefined') {
		localStorage.removeItem('selected-printer');
	}
}

export function getPrinter(): string | null {
	let data: string | null = null;
	printerStore.subscribe((v) => (data = v))();
	return data;
}
