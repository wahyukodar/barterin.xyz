export function FormatPrice(value: string) {
	return value
		.replace(/[^\d]/g, '') // hapus semua karakter non-digit
		.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // tambahkan titik pemisah ribuan
}

export function FormatCurrency(amount: number, prefix?: string): string {
	try {
		const formattedCurrency = new Intl.NumberFormat('id-ID', {
			style: 'decimal',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
		return `${prefix ?? 'Rp'}${formattedCurrency}`;
	} catch (error) {
		console.error(`Error formatting currency: ${error}`);
        return 'N/A';
	}
}

export function ParseCurrencyExcel(value: unknown): number {
	if (typeof value === 'number') return value;

	throw new Error(`Invalid currency format: ${value}`);
}

export function FormatTerbilang(nominal: number): string {
	if (nominal >= 1_000_000_000) {
		// Miliar
		return (
			(nominal / 1_000_000_000)
				.toFixed(nominal % 1_000_000_000 === 0 ? 0 : 1)
				.replace('.', ',') + 'M'
		);
	} else if (nominal >= 1_000_000) {
		// Juta
		return (
			(nominal / 1_000_000)
				.toFixed(nominal % 1_000_000 === 0 ? 0 : 1)
				.replace('.', ',') + 'Jt'
		);
	} else if (nominal >= 1_000) {
		// Ribu
		return (
			(nominal / 1_000)
				.toFixed(nominal % 1_000 === 0 ? 0 : 1)
				.replace('.', ',') + 'Rb'
		);
	} else {
		// Angka kecil, tampilkan apa adanya
		return nominal.toString();
	}
}
