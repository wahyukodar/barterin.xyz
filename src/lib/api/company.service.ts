import api from '../utils/axios.util';

export const CompanyService = {
    get: async () =>
        await api.get(`/company`),

    update: async (payload: unknown) =>
        await api.put(`/company`, payload),
};
