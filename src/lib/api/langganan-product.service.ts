import api from '../utils/axios.util';

export const LanggananProductService = {
    list: async (params?: {
        page?: number;
        limit?: number;
        isActive?: number;
        search?: string;
        orderBy?: string;
    }) => await api.get('/langganan_product/list', { params }),

    detail: async (requester: string, productSlugName: number) =>
        await api.get(`/langganan_product/detail/langganan/${requester}/product/${productSlugName}`),

    create: async (payload: unknown) => await api.post('/langganan_product', payload),

    update: async (requester: string, productSlugName: number, minQty: number, payload: unknown) =>
        await api.put(`/langganan_product/langganan/${requester}/product/${productSlugName}/min_qty/${minQty}`, payload),

    delete: async (requester: string, productSlugName: number, minQty: number) => await api.delete(`/langganan_product/langganan/${requester}/product/${productSlugName}/min_qty/${minQty}`),

    restore: async (requester: string, productSlugName: number, minQty: number) => await api.put(`/langganan_product/langganan/${requester}/product/${productSlugName}/min_qty/${minQty}`)
};
