import { ProductService } from '$lib/api/product.service';
import type { QueryParams } from '$lib/types/query-param.type';
import { handleMutationError, handleMutationSuccess } from '$lib/utils/query-handler.util';
import { BuildQueryParams } from '$lib/utils/query-param.util';
import { createMutation, createQuery } from '@tanstack/svelte-query';

// LIST
export function useProducts(params: QueryParams = {}) {
	const queryParams = BuildQueryParams(params);

	return createQuery({
		queryKey: ['products', queryParams],
		queryFn: async () => {
			const response = await ProductService.list(queryParams);
			return response.data;
		},
		staleTime: 60 * 1000,
		gcTime: 5 * 60 * 1000
	});
}

// LIST COMBOBOX
export function useComboboxProducts(queryParams:{ name: string }) {
	return createQuery({
		queryKey: ['combobox_products', queryParams],
		queryFn: async () => {
			const response = await ProductService.listCombobox(queryParams);
			return response.data;
		},
		enabled: Boolean(queryParams.name),
		staleTime: 60 * 1000,
		gcTime: 5 * 60 * 1000
	});
}

// Details
export function useProductDetails(productSlugName: string, variationIsActive: number) {
	return createQuery({
		// sama kan key dengan product variation, karena ketika delete, restore, dan create bisa dapet reactivenya karena key nya sama dengan yang ada di prodcut-variation.hook
		queryKey: ['product_variations'], 
		enabled: !!productSlugName,
		queryFn: async () => {
			const response = await ProductService.detail(productSlugName, variationIsActive);
			return response.data;
		},
		staleTime: 60 * 1000,
		gcTime: 5 * 60 * 1000
	});
}

// CREATE
export function useCreateProduct() {
	return createMutation({
		mutationFn: (data: unknown) => ProductService.create(data),
		onSuccess: () =>
			handleMutationSuccess('Produk berhasil ditambahkan', [['products']]),
		onError: (error) => handleMutationError(error, 'Gagal menambahkan produk')
	});
}

// UPDATE
export function useUpdateProduct() {
	return createMutation({
		mutationFn: ({ productSlugName, data }: { productSlugName: string; data: unknown }) =>
			ProductService.update(productSlugName, data),
		onSuccess: (_, variables) =>
			handleMutationSuccess('Produk berhasil diperbarui', [
				['products'],
				['product', variables.productSlugName]
			]),
		onError: (error) => handleMutationError(error, 'Gagal memperbarui produk')
	});
}

// DELETE
export function useDeleteProduct() {
	return createMutation({
		mutationFn: (productSlugName: string) => ProductService.delete(productSlugName),
		onSuccess: () =>
			handleMutationSuccess('Produk berhasil dihapus', [['products']]),
		onError: (error) => handleMutationError(error, 'Gagal menghapus produk')
	});
}

// RESTORE
export function useRestoreProduct() {
	return createMutation({
		mutationFn: (productSlugName: string) => ProductService.restore(productSlugName),
		onSuccess: () =>
			handleMutationSuccess('Produk berhasil diaktifkan', [['products']]),
		onError: (error) => handleMutationError(error, 'Gagal mengaktifkan produk')
	});
}

// Refresh list
export function RefreshProducts() {
	handleMutationSuccess('', [['products']]);
}
