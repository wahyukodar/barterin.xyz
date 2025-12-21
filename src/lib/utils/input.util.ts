/**
 * Handler untuk input quantity/number
 * - Hilangkan leading zero
 * - Cegah angka negatif
 * - Boleh kosong (user sedang hapus input)
 */
export function HandleQtyInput(setter: (val: string) => void) {
	return (e: Event) => {
		const raw = (e.currentTarget as HTMLInputElement).value;

		// Jika kosong → biarkan kosong
		if (raw === '') {
			setter('');
			return;
		}

		// Hanya ambil digit
		const onlyNumbers = raw.replace(/\D/g, '');

		// Hilangkan leading zero (kecuali "0")
		const cleaned = onlyNumbers.replace(/^0+(\d)/, '$1');

		// Convert ke number
		let num = Number(cleaned);

		// Kalau NaN atau < 0 → paksa 0
		if (isNaN(num) || num < 0) {
			num = 0;
		}

		setter(String(num));
	};
}
