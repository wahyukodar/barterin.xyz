import api from '../utils/axios.util';

export const ProductVariationService = {
	detail: async (productSlugName: string, productVariationSlugName: string) =>
		await api.get(
			`/product_variation/detail/product/${productSlugName}/variation/${productVariationSlugName}`
		),

	listCombobox: async (params: { productSlugName: string; name?: string }) =>
		await api.get('/product_variation/list/combobox', { params }),

	create: async (productSlugName: string, payload: unknown) =>
		await api.post(`/product_variation/${productSlugName}`, payload),

	update: async (productSlugName: string, productVariationSlugName: string, payload: unknown) =>
		await api.put(
			`/product_variation/product/${productSlugName}/variation/${productVariationSlugName}`,
			payload
		),

	delete: async (productSlugName: string, productVariationSlugName: string) =>
		await api.delete(
			`/product_variation/product/${productSlugName}/variation/${productVariationSlugName}`
		),

	restore: async (productSlugName: string, productVariationSlugName: string) =>
		await api.put(
			`/product_variation/restore/product/${productSlugName}/variation/${productVariationSlugName}`
		)
};
