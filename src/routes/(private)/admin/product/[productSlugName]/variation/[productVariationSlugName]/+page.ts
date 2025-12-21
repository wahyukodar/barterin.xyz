import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
    return {
        productSlugName: params.productSlugName,
        productVariationSlugName: params.productVariationSlugName
    };
};
