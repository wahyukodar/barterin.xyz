import { TransactionService } from '$lib/api/transaction.service';
import type { QueryParams } from '$lib/types/query-param.type';
import { handleMutationError, handleMutationSuccess } from '$lib/utils/query-handler.util';
import { BuildQueryParams } from '$lib/utils/query-param.util';
import { createMutation, createQuery } from '@tanstack/svelte-query';

// LIST
export function useTransactions(params: QueryParams = {}) {
	const queryParams = BuildQueryParams(params);
	if (params.status) {
		queryParams.status = params.status;
	}

	return createQuery({
		queryKey: ['transactions', queryParams],
		queryFn: async () => {
			const response = await TransactionService.list(queryParams);
			return response.data;
		},
		staleTime: 60 * 1000,
		gcTime: 5 * 60 * 1000
	});
}

// STRATA PRODUCT
export function useStrataProduct(queryParams: {
	customer: string;
	productSlugName: string;
	qty: number;
}) {
	return createQuery({
		queryKey: ['transaction_strata_product', queryParams],
		queryFn: async () => {
			const response = await TransactionService.strataProduct(queryParams);
			return response.data;
		},
		enabled: Boolean(queryParams.customer && queryParams.productSlugName && queryParams.qty),
		staleTime: 60 * 1000,
		gcTime: 5 * 60 * 1000
	});
}

// STRATA PRODUCT VARIATION
export function useStrataProductVariation(queryParams: {
	customer: string;
	productSlugName: string;
	productVariationSlugName: string;
	qty: number;
}) {
	return createQuery({
		queryKey: ['transaction_strata_product_variation', queryParams],
		queryFn: async () => {
			const response = await TransactionService.strataProductVariation(queryParams);
			return response.data;
		},
		enabled: Boolean(
			queryParams.customer &&
				queryParams.productSlugName &&
				queryParams.productVariationSlugName &&
				queryParams.qty
		),
		staleTime: 60 * 1000,
		gcTime: 5 * 60 * 1000
	});
}

// Details
export function useTransactionDetails(invoiceCode: string) {
	return createQuery({
		queryKey: ['transaction_details'],
		enabled: !!invoiceCode,
		queryFn: async () => {
			const response = await TransactionService.detail(invoiceCode);
			return response.data;
		},
		staleTime: 60 * 1000,
		gcTime: 5 * 60 * 1000
	});
}

// CREATE
export function useCreateTransaction() {
	return createMutation({
		mutationFn: (data: unknown) => TransactionService.create(data),
		onSuccess: () => handleMutationSuccess('Berhasil membuat transaksi!!', [['transactions']]),
		onError: (error) => handleMutationError(error, 'Gagal membuat transaksi')
	});
}

// CANCEL
export function useCancelTransaction() {
	return createMutation({
		mutationFn: (invoiceCode: string) => TransactionService.cancel(invoiceCode),
		onSuccess: () => handleMutationSuccess('Transaksi berhasil dibatalkan', [['transactions']]),
		onError: (error) => handleMutationError(error, 'Gagal membatalkan transaksi')
	});
}

// COMPLETE
export function useCompleteTransaction() {
	return createMutation({
		mutationFn: ({ data }: { data: unknown }) => TransactionService.complete(data),
		onSuccess: () => handleMutationSuccess('Transaksi berhasil diselesaikan', [['transactions']]),
		onError: (error) => handleMutationError(error, 'Gagal menyelesaikan transaksi')
	});
}

// Refresh list
export function RefreshTransactions() {
	handleMutationSuccess('', [['transactions']]);
}
