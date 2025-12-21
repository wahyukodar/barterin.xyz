export function FormatPhoneNumber(value: string) {
	const cleaned = value.replace(/\D/g, '');
	if (cleaned.length > 0 && !cleaned.startsWith('62')) {
		if (cleaned.startsWith('0')) return '62' + cleaned.slice(1);
		return '62' + cleaned;
	}
	return cleaned;
}
