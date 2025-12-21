import { ProductVariationStockMutationService } from '$lib/api/product-variation-stock-mutation.service';
import type { QueryParams } from '$lib/types/query-param.type';
import { handleMutationSuccess } from '$lib/utils/query-handler.util';
import { BuildQueryParams } from '$lib/utils/query-param.util';
import { createQuery } from '@tanstack/svelte-query';

// LIST
export function useProductVariationStockMutations(params: QueryParams = {}) {
    const queryParams = BuildQueryParams(params);

    return createQuery({
        queryKey: ['product_variation_stock_mutations', queryParams],
        queryFn: async () => {
            const response = await ProductVariationStockMutationService.list(queryParams);
            return response.data;
        },
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000
    });
}

// Refresh list
export function RefreshProductVariationStockMutations() {
    handleMutationSuccess('', [['product_variation_stock_mutations']]);
}
