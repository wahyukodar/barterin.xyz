import { LanggananProductVariationService } from '$lib/api/langganan-product-variation.service';
import type { QueryParams } from '$lib/types/query-param.type';
import { handleMutationError, handleMutationSuccess } from '$lib/utils/query-handler.util';
import { BuildQueryParams } from '$lib/utils/query-param.util';
import { createMutation, createQuery } from '@tanstack/svelte-query';

// LIST
export function useLanggananProductVariations(params: QueryParams = {}) {
    const queryParams = BuildQueryParams(params);

    return createQuery({
        queryKey: ['langganan_product_variations', queryParams],
        queryFn: async () => {
            const response = await LanggananProductVariationService.list(queryParams);
            return response.data;
        },
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000
    });
}

// Details
export function useLanggananProductVariationDetails(requester: string, product_variationSlugName: number) {
    return createQuery({
        queryKey: ['langganan_product_variation_details'],
        enabled: !!requester,
        queryFn: async () => {
            const response = await LanggananProductVariationService.detail(requester, product_variationSlugName);
            return response.data;
        },
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000
    });
}

// CREATE
export function useCreateLanggananProductVariation() {
    return createMutation({
        mutationFn: (data: unknown) => LanggananProductVariationService.create(data),
        onSuccess: () =>
            handleMutationSuccess('Langganan Variasi Produk berhasil ditambahkan', [['langganan_product_variations']]),
        onError: (error) => handleMutationError(error, 'Gagal menambahkan langganan variasi produk')
    });
}

// UPDATE
export function useUpdateLanggananProductVariation() {
    return createMutation({
        mutationFn: ({
            requester,
            product_variationSlugName,
            minQty,
            data
        }: {
            requester: string;
            product_variationSlugName: number;
            minQty: number;
            data: unknown;
        }) => LanggananProductVariationService.update(requester, product_variationSlugName, minQty, data),
        onSuccess: (_, variables) =>
            handleMutationSuccess('Langganan Variasi Produk berhasil diperbarui', [
                ['langganan_product_variations'],
                ['langganan_product_variation', variables.requester]
            ]),
        onError: (error) => handleMutationError(error, 'Gagal memperbarui langganan variasi produk')
    });
}

// DELETE
export function useDeleteLanggananProductVariation() {
    return createMutation({
        mutationFn: ({
            requester,
            product_variationSlugName,
            minQty
        }: {
            requester: string;
            product_variationSlugName: number;
            minQty: number;
        }) => LanggananProductVariationService.delete(requester, product_variationSlugName, minQty),
        onSuccess: () => handleMutationSuccess('Langganan Variasi Produk berhasil dihapus', [['langganan_product_variations']]),
        onError: (error) => handleMutationError(error, 'Gagal menghapus langganan variasi produk')
    });
}

// RESTORE
export function useRestoreLanggananProductVariation() {
    return createMutation({
        mutationFn: ({
            requester,
            product_variationSlugName,
            minQty
        }: {
            requester: string;
            product_variationSlugName: number;
            minQty: number;
        }) => LanggananProductVariationService.restore(requester, product_variationSlugName, minQty),
        onSuccess: () => handleMutationSuccess('Langganan Variasi Produk berhasil diaktifkan', [['langganan_product_variations']]),
        onError: (error) => handleMutationError(error, 'Gagal mengaktifkan langganan variasi produk')
    });
}

// Refresh list
export function RefreshLanggananProductVariations() {
    handleMutationSuccess('', [['langganan_product_variations']]);
}
