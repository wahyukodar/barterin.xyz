import { z } from 'zod';

export const productSchema = z.object({
    name: z.string()
        .min(3, 'Nama produk harus minimal 3 karakter')
        .max(100, 'Nama produk maksimal 100 karakter'),
    basePrice: z.number()
        .min(0, 'Harga tidak boleh negatif')
        .max(1000000000, 'Harga terlalu besar'),
});

export type ProductFormValues = z.infer<typeof productSchema>;