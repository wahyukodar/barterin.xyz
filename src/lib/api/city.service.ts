import api from '../utils/axios.util';

export const CityService = {
    listCombobox: async (params: {
        cityType: string;
        cityName: string;
    }) => await api.get('/city/list/combobox', { params }),
};
