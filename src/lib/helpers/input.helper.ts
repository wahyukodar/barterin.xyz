import { FormatPrice } from "$lib/utils/currency.util";

export function HandlePriceInput(setValue: (val: string) => void) {
	return (e: Event & { currentTarget: HTMLInputElement }) => {
		const raw = e.currentTarget.value;
		const numeric = raw.replace(/[^\d]/g, '');
		setValue(numeric);
		e.currentTarget.value = numeric ? FormatPrice(numeric) : '';
	};
}