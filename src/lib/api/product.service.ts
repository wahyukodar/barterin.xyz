import api from '../utils/axios.util';

export const ProductService = {
	list: async (params?: {
		page?: number;
		limit?: number;
		isActive?: number;
		search?: string;
		orderBy?: string;
	}) => await api.get('/product/list', { params }),

	listCombobox: async (params: { name: string }) =>
			await api.get('/product/list/combobox', { params }),

	detail: async (productSlugName: string, variationIsActive: number) =>
		await api.get(`/product/detail/${productSlugName}/variation_status/${variationIsActive}`),

	create: async (payload: unknown) => await api.post('/product', payload),

	update: async (productSlugName: string, payload: unknown) =>
		await api.put(`/product/${productSlugName}`, payload),

	delete: async (productSlugName: string) => await api.delete(`/product/${productSlugName}`),

	restore: async (productSlugName: string) => await api.put(`/product/restore/${productSlugName}`)
};
