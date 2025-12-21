import api from '../utils/axios.util';

export const ProductVariationStockService = {
	upsert: async (productSlugName:string, productVariationSlugName: string, warehouseSlugName: string, payload: unknown) =>
		await api.put(
			`/product_variation_stock/product/${productSlugName}/product_variation/${productVariationSlugName}/warehouse/${warehouseSlugName}`,
			payload
		),

	delete: async (productSlugName:string, productVariationSlugName: string, warehouseSlugName: string) =>
		await api.delete(
			`/product_variation_stock/product/${productSlugName}/product_variation/${productVariationSlugName}/warehouse/${warehouseSlugName}`
		),

	move: async (
		productSlugName:string,
		productVariationSlugName: string,
		fromWarehouseSlugName: string,
		toWarehouseSlugName: string,
		payload: unknown
	) =>
		await api.put(
			`/product_variation_stock/move/product/${productSlugName}/product_variation/${productVariationSlugName}/from_warehouse/${fromWarehouseSlugName}/to_warehouse/${toWarehouseSlugName}`,
			payload
		)
};
