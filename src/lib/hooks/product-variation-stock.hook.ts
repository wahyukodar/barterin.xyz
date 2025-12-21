import { ProductVariationStockService } from '$lib/api/product-variation-stock.service';
import { handleMutationError, handleMutationSuccess } from '$lib/utils/query-handler.util';
import { createMutation } from '@tanstack/svelte-query';

// UPSERT
export function useUpsertProductVariationStock() {
	return createMutation({
		mutationFn: ({
			productSlugName,
			productVariationSlugName,
			warehouseSlugName,
			data
		}: {
			productSlugName: string;
			productVariationSlugName: string;
			warehouseSlugName: string;
			data: unknown;
		}) => ProductVariationStockService.upsert(productSlugName, productVariationSlugName, warehouseSlugName, data),
		onSuccess: (_, variables) =>
			handleMutationSuccess('Stok Variasi Produk berhasil diperbarui', [
				['product_variation_stock'],
				['product_variation_stock', variables.productVariationSlugName]
			]),
		onError: (error) => handleMutationError(error, 'Gagal memperbarui stok variasi produk')
	});
}

// DELETE
export function useDeleteProductVariationStock() {
	return createMutation({
		mutationFn: ({
			productSlugName,
			productVariationSlugName,
			warehouseSlugName
		}: {
			productSlugName: string;
			productVariationSlugName: string;
			warehouseSlugName: string;
		}) => ProductVariationStockService.delete(productSlugName, productVariationSlugName, warehouseSlugName),
		onSuccess: () =>
			handleMutationSuccess('Stok Variasi Produk berhasil dihapus', [['product_variation_stock']]),
		onError: (error) => handleMutationError(error, 'Gagal menghapus stok variasi produk')
	});
}

// MOVE
export function useMoveProductVariationStock() {
	return createMutation({
		mutationFn: ({
			productSlugName,
			productVariationSlugName,
			fromWarehouseSlugName,
			toWarehouseSlugName,
			data
		}: {
			productSlugName: string;
			productVariationSlugName: string;
			fromWarehouseSlugName: string;
			toWarehouseSlugName: string;
			data: unknown;
		}) =>
			ProductVariationStockService.move(
				productSlugName,
				productVariationSlugName,
				fromWarehouseSlugName,
				toWarehouseSlugName,
				data
			),
		onSuccess: (_, variables) =>
			handleMutationSuccess('Stok Variasi Produk berhasil diperbarui', [
				['product_variation_stock'],
				['product_variation_stock', variables.productVariationSlugName]
			]),
		onError: (error) => handleMutationError(error, 'Gagal memperbarui stok variasi produk')
	});
}

// Refresh list
export function RefreshProductVariationStock() {
    handleMutationSuccess('', [['product_variation_stock']]);
}
