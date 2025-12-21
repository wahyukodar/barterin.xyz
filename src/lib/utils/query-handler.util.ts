import { AlertError, AlertSuccess } from '$lib/utils/alert.util';
import { QueryClientUtil } from '$lib/utils/query-client.util';

export function handleMutationError(error: unknown, defaultMessage: string) {
	let message = defaultMessage;

	// Cek kalau error berasal dari Axios
	if (typeof error === 'object' && error !== null && 'response' in error) {
		const err = error as { response?: { data?: { message?: string } } };
		message = err.response?.data?.message || message;
	}
	// Fallback kalau cuma Error biasa
	else if (error instanceof Error) {
		message = error.message || message;
	}

	console.error(message, error);
	AlertError(message);
}

export function handleMutationSuccess(
	successMessage: string,
	invalidateKeys: (string | string[])[]
) {
	invalidateKeys.forEach((key) =>
		QueryClientUtil.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] })
	);
	if (successMessage && successMessage != '') {
		AlertSuccess(successMessage);
	}
}
