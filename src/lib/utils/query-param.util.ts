import { STATUS_ACTIVE } from '$lib/constants/status.constant';
import type { QueryParams } from '$lib/types/query-param.type';

// Helper function to build query params
export function BuildQueryParams(params: QueryParams) {
	const { page = 1, limit = 10, isActive = STATUS_ACTIVE, search, orderBy } = params;

	const queryParams: Record<string, string | number> = {
		page,
		limit,
		isActive
	};

	// Only include search if it has value
	if (search && search.trim().length > 0) {
		queryParams.search = search.trim();
	}

	if (orderBy) {
		queryParams.orderBy = orderBy;
	}

	return queryParams;
}
