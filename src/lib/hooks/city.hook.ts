import { CityService } from "$lib/api/city.service";
import { createQuery } from "@tanstack/svelte-query";

// LIST COMBOBOX
export function useComboboxCity(queryParams: {
        cityType: string;
        cityName: string;
    }) {
    return createQuery({
        queryKey: ['combobox_cities', queryParams],
        queryFn: async () => {
            const response = await CityService.listCombobox(queryParams);
            return response.data;
        },
        enabled: Boolean(queryParams.cityType && queryParams.cityName), // ✅ hanya jalan kalau keduanya ada
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000
    });
}