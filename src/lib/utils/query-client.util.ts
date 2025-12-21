import { QueryClient } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';

// Helper untuk memastikan error punya response.status
function isAxiosErrorWithStatus(error: unknown): error is AxiosError {
	return typeof error === 'object' && error !== null && 'response' in error;
}

export const QueryClientUtil = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30 * 1000, // Data dianggap fresh selama 30 detik
			gcTime: 5 * 60 * 1000, // Data disimpan di cache selama 5 menit
			refetchOnWindowFocus: false, // Tidak refetch saat window focus
			retry: (failureCount, error) => {
				// Jangan retry untuk client errors (4xx)
				if (isAxiosErrorWithStatus(error)) {
					const status = error.response?.status ?? 0;
					if (status >= 400 && status < 500) {
						return false;
					}
				}
				// Retry maksimal 2 kali untuk server errors
				return failureCount < 2;
			},
			retryDelay: (attempt) => Math.min(attempt * 1000, 30000), // Delay retry bertahap
			// Pastikan query enabled
			enabled: true,
			// Refetch on mount jika data sudah stale
			refetchOnMount: 'always',
			// Network mode untuk handling offline
			networkMode: 'online',
			// Throw error untuk error boundary handling
			throwOnError: false
		},
		mutations: {
			// Retry mutations sekali untuk network errors
			retry: (failureCount, error) => {
				if (isAxiosErrorWithStatus(error)) {
					const status = error.response?.status ?? 0;
					// Jangan retry untuk client errors
					if (status >= 400 && status < 500) {
						return false;
					}
				}
				return failureCount < 1;
			},
			retryDelay: (attempt) => Math.min(attempt * 1000, 10000),
			// Network mode untuk handling offline
			networkMode: 'online'
		}
	}
});
