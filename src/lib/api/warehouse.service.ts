import api from '../utils/axios.util';

export const WarehouseService = {
	list: async (params?: {
		page?: number;
		limit?: number;
		isActive?: number;
		search?: string;
		orderBy?: string;
	}) => await api.get('/warehouse/list', { params }),

	listCombobox: async (params: { name?: string }) =>
		await api.get('/warehouse/list/combobox', { params }),

	detail: async (warehouseSlugName: string, productVariationIsActive: number) =>
		await api.get(
			`/warehouse/detail/${warehouseSlugName}/product_variation_status/${productVariationIsActive}`
		),

	create: async (payload: unknown) => await api.post('/warehouse', payload),

	update: async (warehouseSlugName: string, payload: unknown) =>
		await api.put(`/warehouse/${warehouseSlugName}`, payload),

	delete: async (warehouseSlugName: string) => await api.delete(`/warehouse/${warehouseSlugName}`),

	restore: async (warehouseSlugName: string) =>
		await api.put(`/warehouse/restore/${warehouseSlugName}`)
};
