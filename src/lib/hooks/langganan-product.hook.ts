import { LanggananProductService } from '$lib/api/langganan-product.service';
import type { QueryParams } from '$lib/types/query-param.type';
import { handleMutationError, handleMutationSuccess } from '$lib/utils/query-handler.util';
import { BuildQueryParams } from '$lib/utils/query-param.util';
import { createMutation, createQuery } from '@tanstack/svelte-query';

// LIST
export function useLanggananProducts(params: QueryParams = {}) {
	const queryParams = BuildQueryParams(params);

	return createQuery({
		queryKey: ['langganan_products', queryParams],
		queryFn: async () => {
			const response = await LanggananProductService.list(queryParams);
			return response.data;
		},
		staleTime: 60 * 1000,
		gcTime: 5 * 60 * 1000
	});
}

// Details
export function useLanggananProductDetails(requester: string, productSlugName: number) {
	return createQuery({
		queryKey: ['langganan_product_variations'],
		enabled: !!requester,
		queryFn: async () => {
			const response = await LanggananProductService.detail(requester, productSlugName);
			return response.data;
		},
		staleTime: 60 * 1000,
		gcTime: 5 * 60 * 1000
	});
}

// CREATE
export function useCreateLanggananProduct() {
	return createMutation({
		mutationFn: (data: unknown) => LanggananProductService.create(data),
		onSuccess: () =>
			handleMutationSuccess('Langganan Produk berhasil ditambahkan', [['langganan_products']]),
		onError: (error) => handleMutationError(error, 'Gagal menambahkan langganan produk')
	});
}

// UPDATE
export function useUpdateLanggananProduct() {
	return createMutation({
		mutationFn: ({
			requester,
			productSlugName,
			minQty,
			data
		}: {
			requester: string;
			productSlugName: number;
			minQty: number;
			data: unknown;
		}) => LanggananProductService.update(requester, productSlugName, minQty, data),
		onSuccess: (_, variables) =>
			handleMutationSuccess('LanggananProduk berhasil diperbarui', [
				['langganan_products'],
				['langganan_product', variables.requester]
			]),
		onError: (error) => handleMutationError(error, 'Gagal memperbarui langganan produk')
	});
}

// DELETE
export function useDeleteLanggananProduct() {
	return createMutation({
		mutationFn: ({
			requester,
			productSlugName,
			minQty
		}: {
			requester: string;
			productSlugName: number;
			minQty: number;
		}) => LanggananProductService.delete(requester, productSlugName, minQty),
		onSuccess: () => handleMutationSuccess('Langganan Produk berhasil dihapus', [['langganan_products']]),
		onError: (error) => handleMutationError(error, 'Gagal menghapus langganan produk')
	});
}

// RESTORE
export function useRestoreLanggananProduct() {
	return createMutation({
		mutationFn: ({
			requester,
			productSlugName,
			minQty
		}: {
			requester: string;
			productSlugName: number;
			minQty: number;
		}) => LanggananProductService.restore(requester, productSlugName, minQty),
		onSuccess: () => handleMutationSuccess('Langganan Produk berhasil diaktifkan', [['langganan_products']]),
		onError: (error) => handleMutationError(error, 'Gagal mengaktifkan langganan produk')
	});
}

// Refresh list
export function RefreshLanggananProducts() {
	handleMutationSuccess('', [['langganan_products']]);
}
