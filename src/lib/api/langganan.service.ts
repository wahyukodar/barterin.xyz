import api from '../utils/axios.util';

export const LanggananService = {
	list: async (params?: {
		page?: number;
		limit?: number;
		isActive?: number;
		search?: string;
		orderBy?: string;
	}) => await api.get('/langganan/list', { params }),

	listCombobox: async (params: { requester: string }) =>
		await api.get('/langganan/list/combobox', { params }),

	detail: async (requester: string) => await api.get(`/langganan/detail/${requester}`),

	create: async (payload: unknown) => await api.post('/langganan', payload),

	update: async (requester: string, payload: unknown) =>
		await api.put(`/langganan/${requester}`, payload),

	delete: async (requester: string) => await api.delete(`/langganan/${requester}`),

	restore: async (requester: string) => await api.put(`/langganan/restore/${requester}`)
};
