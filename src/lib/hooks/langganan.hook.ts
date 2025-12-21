import { LanggananService } from '$lib/api/langganan.service';
import type { QueryParams } from '$lib/types/query-param.type';
import { handleMutationError, handleMutationSuccess } from '$lib/utils/query-handler.util';
import { BuildQueryParams } from '$lib/utils/query-param.util';
import { createMutation, createQuery } from '@tanstack/svelte-query';

// LIST
export function useLangganans(params: QueryParams = {}) {
    const queryParams = BuildQueryParams(params);

    return createQuery({
        queryKey: ['langganans', queryParams],
        queryFn: async () => {
            const response = await LanggananService.list(queryParams);
            return response.data;
        },
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000
    });
}

// LIST COMBOBOX
export function useComboboxLangganans(queryParams:{ requester: string }) {
    return createQuery({
        queryKey: ['combobox_langganans', queryParams],
        queryFn: async () => {
            const response = await LanggananService.listCombobox(queryParams);
            return response.data;
        },
        enabled: Boolean(queryParams.requester), // ✅ hanya jalan kalau requester ada
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000
    });
}

// Details
export function useLanggananDetails(requester: string) {
    return createQuery({
        queryKey: ['langganan_details'], 
        enabled: !!requester,
        queryFn: async () => {
            const response = await LanggananService.detail(requester);
            return response.data;
        },
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000
    });
}

// CREATE
export function useCreateLangganan() {
    return createMutation({
        mutationFn: (data: unknown) => LanggananService.create(data),
        onSuccess: () =>
            handleMutationSuccess('Pelangganan berhasil ditambahkan', [['langganans']]),
        onError: (error) => handleMutationError(error, 'Gagal menambahkan Pelangganan')
    });
}

// UPDATE
export function useUpdateLangganan() {
    return createMutation({
        mutationFn: ({ requester, data }: { requester: string; data: unknown }) =>
            LanggananService.update(requester, data),
        onSuccess: (_, variables) =>
            handleMutationSuccess('Pelangganan berhasil diperbarui', [
                ['langganans'],
                ['langganan', variables.requester]
            ]),
        onError: (error) => handleMutationError(error, `Gagal memperbarui Pelangganan!! ${error.message}`)
    });
}

// DELETE
export function useDeleteLangganan() {
    return createMutation({
        mutationFn: (requester: string) => LanggananService.delete(requester),
        onSuccess: () =>
            handleMutationSuccess('Pelangganan berhasil dihapus', [['langganans']]),
        onError: (error) => handleMutationError(error, 'Gagal menghapus Pelangganan')
    });
}

// RESTORE
export function useRestoreLangganan() {
    return createMutation({
        mutationFn: (requester: string) => LanggananService.restore(requester),
        onSuccess: () =>
            handleMutationSuccess('Pelangganan berhasil diaktifkan', [['langganans']]),
        onError: (error) => handleMutationError(error, 'Gagal mengaktifkan Pelangganan')
    });
}

// Refresh list
export function RefreshLangganans() {
    handleMutationSuccess('', [['langganans']]);
}
