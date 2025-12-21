import { ProductVariationService } from '$lib/api/product-variation.service';
import { handleMutationError, handleMutationSuccess } from '$lib/utils/query-handler.util';
import { createMutation, createQuery } from '@tanstack/svelte-query';

// Details
export function useProductVariationDetails(
	productSlugName: string,
	productVariationSlugName: string
) {
	return createQuery({
		queryKey: ['product_variation_stock'],
		enabled: !!productVariationSlugName,
		queryFn: async () => {
			const response = await ProductVariationService.detail(
				productSlugName,
				productVariationSlugName
			);
			return response.data;
		},
		staleTime: 60 * 1000,
		gcTime: 5 * 60 * 1000
	});
}

// LIST COMBOBOX
export function useComboboxProductVariations(queryParams: {
	productSlugName: string;
	name: string;
}) {
	return createQuery({
		queryKey: ['combobox_product_variations', queryParams],
		queryFn: async () => {
			const response = await ProductVariationService.listCombobox(queryParams);
			return response.data;
		},
		enabled: Boolean(queryParams.productSlugName && queryParams.name),
		staleTime: 60 * 1000,
		gcTime: 5 * 60 * 1000
	});
}

// CREATE
export function useCreateProductVariation() {
	return createMutation({
		mutationFn: ({ productSlugName, data }: { productSlugName: string; data: unknown }) =>
			ProductVariationService.create(productSlugName, data),
		onSuccess: () =>
			handleMutationSuccess('Variasi Produk berhasil ditambahkan', [['product_variations']]),
		onError: (error) => handleMutationError(error, 'Gagal menambahkan variasi produk')
	});
}

// UPDATE
export function useUpdateProductVariation() {
	return createMutation({
		mutationFn: ({
			productSlugName,
			productVariationSlugName,
			data
		}: {
			productSlugName: string;
			productVariationSlugName: string;
			data: unknown;
		}) => ProductVariationService.update(productSlugName, productVariationSlugName, data),
		onSuccess: (_, variables) =>
			handleMutationSuccess('Variasi Produk berhasil diperbarui', [
				['product_variations'],
				['product_variation', variables.productVariationSlugName]
			]),
		onError: (error) => handleMutationError(error, 'Gagal memperbarui variasi produk')
	});
}

// DELETE
export function useDeleteProductVariation() {
	return createMutation({
		mutationFn: ({
			productSlugName,
			productVariationSlugName
		}: {
			productSlugName: string;
			productVariationSlugName: string;
		}) => ProductVariationService.delete(productSlugName, productVariationSlugName),
		onSuccess: () =>
			handleMutationSuccess('Variasi Produk berhasil dihapus', [['product_variations']]),
		onError: (error) => handleMutationError(error, 'Gagal menghapus variasi produk')
	});
}

// RESTORE
export function useRestoreProductVariation() {
	return createMutation({
		mutationFn: ({
			productSlugName,
			productVariationSlugName
		}: {
			productSlugName: string;
			productVariationSlugName: string;
		}) => ProductVariationService.restore(productSlugName, productVariationSlugName),
		onSuccess: () =>
			handleMutationSuccess('Variasi Produk berhasil diaktifkan', [['product_variations']]),
		onError: (error) => handleMutationError(error, 'Gagal mengaktifkan variasi produk')
	});
}

// Refresh list
export function RefreshProductVariations() {
	handleMutationSuccess('', [['product_variations']]);
}
