import api from '../utils/axios.util';

export const LanggananProductVariationService = {
    list: async (params?: {
        page?: number;
        limit?: number;
        isActive?: number;
        search?: string;
        orderBy?: string;
    }) => await api.get('/langganan_product_variation/list', { params }),

    detail: async (requester: string, productVariationSlugName: number) =>
        await api.get(`/langganan_product_variation/detail/langganan/${requester}/product_variation/${productVariationSlugName}`),

    create: async (payload: unknown) => await api.post('/langganan_product_variation', payload),

    update: async (requester: string, productVariationSlugName: number, minQty: number, payload: unknown) =>
        await api.put(`/langganan_product_variation/langganan/${requester}/product_variation/${productVariationSlugName}/min_qty/${minQty}`, payload),

    delete: async (requester: string, productVariationSlugName: number, minQty: number) => await api.delete(`/langganan_product_variation/langganan/${requester}/product_variation/${productVariationSlugName}/min_qty/${minQty}`),

    restore: async (requester: string, productVariationSlugName: number, minQty: number) => await api.put(`/langganan_product_variation/langganan/${requester}/product_variation/${productVariationSlugName}/min_qty/${minQty}`)
};
