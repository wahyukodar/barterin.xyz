import { CompanyService } from '$lib/api/company.service';
import { handleMutationError, handleMutationSuccess } from '$lib/utils/query-handler.util';
import { createMutation, createQuery } from '@tanstack/svelte-query';

// Get
export function useCompanyProfile() {
	return createQuery({
		queryKey: ['company_profile'],
		queryFn: async () => {
			const response = await CompanyService.get();
			return response.data;
		},
		staleTime: 60 * 1000,
		gcTime: 5 * 60 * 1000
	});
}

// UPDATE
export function useUpdateCompany() {
	return createMutation({
		mutationFn: ({ data }: { data: unknown }) => CompanyService.update(data),
		onSuccess: () => handleMutationSuccess('Profile berhasil diperbarui', [['company_profile']]),
		onError: (error) => handleMutationError(error, 'Gagal memperbarui profile')
	});
}

// Refresh list
export function RefreshProducts() {
	handleMutationSuccess('', [['company_profile']]);
}
