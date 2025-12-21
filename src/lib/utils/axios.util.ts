import { getAuthToken } from '$lib/stores/auth.store';
import { CapitalizeFirstLetter } from '$lib/utils/string-manipulation.util';
import { translateToId } from '$lib/utils/translator.util';
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:6111';
const TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT || 10000);

export const api = axios.create({
	baseURL: BASE,
	timeout: TIMEOUT,
	headers: { 'Content-Type': 'application/json' }
});

// interceptor attaches token
api.interceptors.request.use((config) => {
	try {
		const token = getAuthToken();
		if (token && config.headers) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}
	} catch (e) {
		console.error(e);
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response) {
			const { status, data } = error.response;

			if (status === 422) {
				const property = data?.message?.[0]?.property;
				const validationMessage = property
					? `${CapitalizeFirstLetter(translateToId(property))} tidak diisi dengan benar`
					: 'Error Validasi';

				return Promise.reject({
					status,
					message: validationMessage,
					errors: data?.message || null
				});
			} else if (status === 403) {
				const property = data?.message?.[0]?.property;
				const validationMessage = property
					? `Tidak dapat diakses!!`
					: 'Tidak dapat diakses!!';

				return Promise.reject({
					status,
					message: validationMessage,
					errors: data?.message || null
				});
			}
		}

		return Promise.reject(error);
	}
);

export default api;
