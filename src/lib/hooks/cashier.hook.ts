import { CashierService } from '$lib/api/cashier.service';
import type { QueryParams } from '$lib/types/query-param.type';
import { handleMutationError, handleMutationSuccess } from '$lib/utils/query-handler.util';
import { BuildQueryParams } from '$lib/utils/query-param.util';
import { createMutation, createQuery } from '@tanstack/svelte-query';

// LIST
export function useCashiers(params: QueryParams = {}) {
    const queryParams = BuildQueryParams(params);

    return createQuery({
        queryKey: ['cashiers', queryParams],
        queryFn: async () => {
            const response = await CashierService.list(queryParams);
            return response.data;
        },
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000
    });
}

// CREATE
export function useCreateCashier() {
    return createMutation({
        mutationFn: (data: unknown) => CashierService.create(data),
        onSuccess: () =>
            handleMutationSuccess('Kasir berhasil ditambahkan', [['cashiers']]),
        onError: (error) => handleMutationError(error, 'Gagal menambahkan kasir')
    });
}

// UPDATE
export function useUpdateCashier() {
    return createMutation({
        mutationFn: ({ phone, data }: { phone: string; data: unknown }) =>
            CashierService.update(phone, data),
        onSuccess: (_, variables) =>
            handleMutationSuccess('Kasir berhasil diperbarui', [
                ['cashiers'],
                ['cashier', variables.phone]
            ]),
        onError: (error) => handleMutationError(error, 'Gagal memperbarui kasir')
    });
}

// DELETE
export function useDeleteCashier() {
    return createMutation({
        mutationFn: (phone: string) => CashierService.delete(phone),
        onSuccess: () =>
            handleMutationSuccess('Kasir berhasil dihapus', [['cashiers']]),
        onError: (error) => handleMutationError(error, 'Gagal menghapus kasir')
    });
}

// RESTORE
export function useRestoreCashier() {
    return createMutation({
        mutationFn: (phone: string) => CashierService.restore(phone),
        onSuccess: () =>
            handleMutationSuccess('Kasir berhasil diaktifkan', [['cashiers']]),
        onError: (error) => handleMutationError(error, 'Gagal mengaktifkan kasir')
    });
}

// Refresh list
export function RefreshCashiers() {
    handleMutationSuccess('', [['cashiers']]);
}
