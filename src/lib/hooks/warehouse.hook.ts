import { WarehouseService } from '$lib/api/warehouse.service';
import type { QueryParams } from '$lib/types/query-param.type';
import { handleMutationError, handleMutationSuccess } from '$lib/utils/query-handler.util';
import { BuildQueryParams } from '$lib/utils/query-param.util';
import { createMutation, createQuery } from '@tanstack/svelte-query';

// LIST
export function useWarehouses(params: QueryParams = {}) {
	const queryParams = BuildQueryParams(params);

	return createQuery({
		queryKey: ['warehouses', queryParams],
		queryFn: async () => {
			const response = await WarehouseService.list(queryParams);
			return response.data;
		},
		staleTime: 60 * 1000,
		gcTime: 5 * 60 * 1000
	});
}

// LIST COMBOBOX
export function useComboboxWarehouses(queryParams: { name?: string }) {
	return createQuery({
		queryKey: ['combobox_warehouses', queryParams],
		queryFn: async () => {
			const response = await WarehouseService.listCombobox(queryParams);
			return response.data;
		},
		staleTime: 60 * 1000,
		gcTime: 5 * 60 * 1000
	});
}

// Details
export function useWarehouseDetails(warehouseSlugName: string, productVariationIsActive: number) {
	return createQuery({
		queryKey: ['warehouse_details'],
		enabled: !!warehouseSlugName,
		queryFn: async () => {
			const response = await WarehouseService.detail(warehouseSlugName, productVariationIsActive);
			return response.data;
		},
		staleTime: 60 * 1000,
		gcTime: 5 * 60 * 1000
	});
}

// CREATE
export function useCreateWarehouse() {
	return createMutation({
		mutationFn: (data: unknown) => WarehouseService.create(data),
		onSuccess: () => handleMutationSuccess('Gudang berhasil ditambahkan', [['warehouses']]),
		onError: (error) => handleMutationError(error, 'Gagal menambahkan warehouse')
	});
}

// UPDATE
export function useUpdateWarehouse() {
	return createMutation({
		mutationFn: ({ warehouseSlugName, data }: { warehouseSlugName: string; data: unknown }) =>
			WarehouseService.update(warehouseSlugName, data),
		onSuccess: (_, variables) =>
			handleMutationSuccess('Gudang berhasil diperbarui', [
				['warehouses'],
				['warehouse', variables.warehouseSlugName]
			]),
		onError: (error) => handleMutationError(error, 'Gagal memperbarui warehouse')
	});
}

// DELETE
export function useDeleteWarehouse() {
	return createMutation({
		mutationFn: (warehouseSlugName: string) => WarehouseService.delete(warehouseSlugName),
		onSuccess: () => handleMutationSuccess('Gudang berhasil dihapus', [['warehouses']]),
		onError: (error) => handleMutationError(error, 'Gagal menghapus productVariationIsActive')
	});
}

// RESTORE
export function useRestoreWarehouse() {
	return createMutation({
		mutationFn: (warehouseSlugName: string) => WarehouseService.restore(warehouseSlugName),
		onSuccess: () => handleMutationSuccess('Gudang berhasil diaktifkan', [['warehouses']]),
		onError: (error) => handleMutationError(error, 'Gagal mengaktifkan warehouse')
	});
}

// Refresh list
export function RefreshWarehouses() {
	handleMutationSuccess('', [['warehouses']]);
}
