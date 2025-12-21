import api from '../utils/axios.util';

export const TransactionService = {
	list: async (params?: {
		page?: number;
		limit?: number;
		isActive?: number;
		search?: string;
		orderBy?: string;
	}) => await api.get('/transaction/list', { params }),

	strataProduct: async (params: { customer: string; productSlugName: string; qty: number }) =>
		await api.get('/transaction/strata_product', { params }),

	strataProductVariation: async (params: {
		customer: string;
		productSlugName: string;
		productVariationSlugName: string;
		qty: number;
	}) => await api.get('/transaction/strata_product_variation', { params }),

	detail: async (invoiceCode: string) => await api.get(`/transaction/detail/${invoiceCode}`),

	create: async (payload: unknown) => await api.post('/transaction', payload),

	cancel: async (invoiceCode: string) => await api.delete(`/transaction/${invoiceCode}`),

	complete: async (payload: unknown) =>
		await api.put(`/transaction/complete`, payload)
};
