import api from '../utils/axios.util';

export const ProductVariationStockMutationService = {
    list: async (params?: {
        page?: number;
        limit?: number;
        isActive?: number;
        search?: string;
        orderBy?: string;
    }) => await api.get('/product_variation_stock_mutation/list', { params }),
};
