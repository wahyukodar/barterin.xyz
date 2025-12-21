import api from '../utils/axios.util';

export const CashierService = {
    list: async (params?: {
        page?: number;
        limit?: number;
        isActive?: number;
        search?: string;
        orderBy?: string;
    }) => await api.get('/cashier/list', { params }),

    create: async (payload: unknown) => await api.post('/cashier', payload),

    update: async (phone: string, payload: unknown) =>
        await api.put(`/cashier/${phone}`, payload),

    delete: async (phone: string) => await api.delete(`/cashier/${phone}`),

    restore: async (phone: string) => await api.put(`/cashier/restore/${phone}`)
};
