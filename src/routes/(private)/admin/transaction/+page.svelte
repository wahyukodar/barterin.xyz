<script lang="ts">
	import DataTable from '$lib/components/DataTable.svelte';
	import { TransactionStatusType } from '$lib/constants/transaction-status.constant';
	import {
		RefreshTransactions,
		useCancelTransaction,
		useTransactions
	} from '$lib/hooks/transaction.hook';
	import { ConfirmAction } from '$lib/utils/alert.util';
	import { FormatCurrency } from '$lib/utils/currency.util';
	import { DefaultFormatters } from '$lib/utils/default-formatter.util';
	import { Tooltip } from '@skeletonlabs/skeleton-svelte';
	import { CircleCheck, Receipt, Search, Trash2 } from 'lucide-svelte';
	import TransactionCompleteForm from './TransactionCompleteForm.svelte';
	import TransactionForm from './TransactionForm.svelte';
	import TransactionPreviewInvoice from './TransactionPreviewInvoice.svelte';

	let page = $state(1);
	let limit = $state(10);
	let transactionStatus = $state(TransactionStatusType.DRAFT);
	let searchTerm = $state('');
	let orderBy = $state('createdAt:desc');
	let showForm = $state(false);
	let completeShowForm = $state(false);
	let showPreviewInvoice = $state(false);
	let selectedTransaction = $state(null);

	// For debouncing search
	let debouncedSearchTerm = $state('');
	let debounceTimer: ReturnType<typeof setTimeout>;

	// Query store
	const transactionsQuery = $derived(
		useTransactions({
			page,
			limit,
			status: transactionStatus,
			search: debouncedSearchTerm,
			orderBy
		})
	);

	// Derived values
	const transactions = $derived($transactionsQuery.data?.data?.data ?? []);
	const totalTransactions = $derived($transactionsQuery.data?.data?.total ?? 0);
	const totalPages = $derived(Math.ceil(totalTransactions / limit));
	const loading = $derived($transactionsQuery.isLoading);
	const error = $derived($transactionsQuery.error);

	function handleAddTransaction() {
		selectedTransaction = null;
		showForm = true;
	}

	function handleCompleteTransaction(transaction: any) {
		selectedTransaction = transaction;
		completeShowForm = true;
	}

	function handlePreviewInvoice(transaction: any) {
		selectedTransaction = transaction;
		showPreviewInvoice = true;
	}

	const cancelTransaction = useCancelTransaction();

	async function handleCancelTransaction(invoiceCode: string) {
		const confirmed = await ConfirmAction({
			title: 'Batalkan Transaksi',
			text: `Apakah Anda yakin ingin membatalkan transaksi "${invoiceCode}"?`,
			icon: 'warning',
			confirmButtonText: 'Ya, Batal!'
		});
		if (confirmed) {
			$cancelTransaction.mutate(invoiceCode);
		}
	}

	function toggleSort(field: string) {
		orderBy = orderBy.startsWith(field)
			? orderBy.endsWith('asc')
				? `${field}:desc`
				: `${field}:asc`
			: `${field}:asc`;
		page = 1;
	}

	function getSortDirection(field: string): string | null {
		return orderBy.startsWith(field) ? orderBy.split(':')[1] : null;
	}

	function handlePageChange(event: { page: number }) {
		page = event.page;
	}

	function handlePageSizeChange(event: { pageSize: number }) {
		limit = event.pageSize;
		page = 1;
	}

	// Debounce search input
	$effect(() => {
		const currentSearchTerm = searchTerm;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			debouncedSearchTerm = currentSearchTerm;
			page = 1;
		}, 500);

		return () => clearTimeout(debounceTimer);
	});

	const columns = [
		{
			field: 'customer',
			label: 'Customer',
			custom: (row: any) => {
				if (row.langgananCid) {
					// kalau IDType = PHONE, tambahin requester
					if (row.langganan?.langgananIDType === 'PHONE') {
						return `${row.langganan?.name ?? ''} (${row.langganan?.requester ?? ''})`;
					}
					return row.langganan?.name ?? '';
				}
				return row.guestCustomer ?? 'Tidak diketahui';
			},
			badges: (row: any) => {
				const result: { text: string; className: string }[] = [];
				if (row.langgananCid) {
					result.push({
						text: 'Langganan',
						className: 'bg-primary-900 ml-2 rounded px-2 py-1 font-semibold text-white !text-[10px]'
					});
				}
				return result;
			},
			align: 'left'
		},
		{
			field: 'invoice',
			label: 'Invoice',
			custom: (row: any) => row.invoice[0].invoiceCode
		},
		{
			field: 'transactionStatus',
			label: 'Status Transaksi'
		},
		{
			field: 'paymentStatus',
			label: 'Status Pembayaran',
			custom: (row: any) => row.invoice[0].status
		},
		{
			field: 'grandTotal',
			label: 'Grand Total',
			sortable: true,
			format: DefaultFormatters.currency
		},
		{
			field: 'paymentAmount',
			label: 'Pembayaran',
			custom: (row: any) => FormatCurrency(row.invoice[0].invoicePayment[0]?.paymentAmount)
		},
		{
			field: 'changeAmount',
			label: 'Kembalian',
			custom: (row: any) => FormatCurrency(row.invoice[0].invoicePayment[0]?.changeAmount)
		},
		{
			field: 'createdAt',
			label: 'Created At',
			sortable: true,
			format: DefaultFormatters.date
		},
		{
			field: 'updatedAt',
			label: 'Updated At',
			sortable: true,
			format: DefaultFormatters.date
		}
	];

	// state untuk kolom yang tampil
	let visibleColumns = $state(columns);

	// effect untuk filter kolom berdasarkan transactionStatus
	$effect(() => {
		visibleColumns = columns.filter((col) => {
			if (
				(col.field === 'paymentAmount' || col.field === 'changeAmount') &&
				transactionStatus !== TransactionStatusType.COMPLETED
			) {
				return false;
			}
			return true;
		});
	});
</script>

<svelte:head>
	<title>Manage Transactions</title>
</svelte:head>

<DataTable
	title="Daftar Transaksi"
	data={transactions}
	rowId={'cid'}
	total={totalTransactions}
	{page}
	pageSize={limit}
	{totalPages}
	{loading}
	{error}
	searchTerm={debouncedSearchTerm}
	columns={visibleColumns}
	showAction={transactionStatus !== TransactionStatusType.CANCELLED}
	{getSortDirection}
	{toggleSort}
	onPageChange={handlePageChange}
	onPageSizeChange={handlePageSizeChange}
>
	<!-- Header action -->
	{#snippet headerAction()}
		<button
			class="text-md bg-surface-600 hover:bg-surface-300 dark:hover:bg-surface-700 flex rounded-lg px-4 py-2 text-white shadow-md"
			onclick={handleAddTransaction}>+ Tambah Transaksi</button
		>
	{/snippet}

	<!-- Search -->
	{#snippet searchAction()}
		<div class="relative w-full sm:max-w-xs">
			<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				<Search class="text-primary-600 text:border-primary-400 size-4" />
			</div>
			<input
				type="text"
				class="border-surface-600 dark:border-surface-400 placeholder-surface-600 dark:placeholder-surface-400 focus:ring-surface-700 dark:focus:ring-surface-300 focus:border-surface-500 block w-full rounded-lg border p-2 pl-10 text-sm text-gray-900"
				placeholder="Cari transaksi..."
				bind:value={searchTerm}
			/>
		</div>
	{/snippet}

	<!-- Tabs Aktif / Tidak Aktif -->
	{#snippet isActiveAction()}
		<div class="bg-surface-200/90 dark:bg-surface-800/90 flex">
			<button
				class={`px-4 py-2 ${transactionStatus === TransactionStatusType.DRAFT ? 'border-primary-500 dark:border-primary-400 border-b-2' : 'hover:bg-surface-300 dark:hover:bg-surface-700'}`}
				onclick={() => {
					transactionStatus = TransactionStatusType.DRAFT;
					page = 1;
				}}
			>
				Status Transaksi Draft
			</button>
			<button
				class={`px-4 py-2 ${transactionStatus === TransactionStatusType.COMPLETED ? 'border-primary-500 dark:border-primary-400 border-b-2' : 'hover:bg-surface-300 dark:hover:bg-surface-700'}`}
				onclick={() => {
					transactionStatus = TransactionStatusType.COMPLETED;
					page = 1;
				}}
			>
				Status Transaksi Selesai
			</button>
			<button
				class={`px-4 py-2 ${transactionStatus === TransactionStatusType.CANCELLED ? 'border-primary-500 dark:border-primary-400 border-b-2' : 'hover:bg-surface-300 dark:hover:bg-surface-700'}`}
				onclick={() => {
					transactionStatus = TransactionStatusType.CANCELLED;
					page = 1;
				}}
			>
				Status Transaksi Batal
			</button>
		</div>
	{/snippet}

	<!-- Actions per row -->
	{#snippet actions({ row: transaction })}
		{#if transaction.transactionStatus == TransactionStatusType.DRAFT}
			<Tooltip
				positioning={{ placement: 'top' }}
				triggerBase="underline"
				contentBase="card preset-filled p-4"
				openDelay={100}
				zIndex={'1000'}
				arrow
			>
				{#snippet trigger()}<button
						type="button"
						onclick={() => handleCompleteTransaction(transaction)}
						class="text-secondary-800 hover:bg-secondary-100 dark:text-secondary-100 dark:hover:bg-secondary-100 dark:hover:text-secondary-800 rounded p-1"
						title="Detail Variasi Transaksi"
					>
						<CircleCheck size={20} />
					</button>{/snippet}
				{#snippet content()}Selesaikan Transaksi{/snippet}
			</Tooltip>
			<Tooltip
				positioning={{ placement: 'top' }}
				triggerBase="underline"
				contentBase="card preset-filled p-4"
				openDelay={100}
				zIndex={'1000'}
				arrow
			>
				{#snippet trigger()}
					<button
						type="button"
						onclick={() => handleCancelTransaction(transaction.invoice[0].invoiceCode)}
						class="text-error-800 hover:bg-error-100 dark:text-error-100 dark:hover:bg-error-100 dark:hover:text-error-800 rounded p-1"
						disabled={$cancelTransaction.isPending &&
							$cancelTransaction.variables === transaction.invoice[0].invoiceCode}
						title="Hapus"
					>
						{#if $cancelTransaction.isPending && $cancelTransaction.variables === transaction.invoice[0].invoiceCode}
							<span class="text-xs">...</span>
						{:else}
							<Trash2 size={20} />
						{/if}
					</button>
				{/snippet}
				{#snippet content()}Batalkan Transaksi{/snippet}
			</Tooltip>
		{:else if transaction.transactionStatus == TransactionStatusType.COMPLETED}
			<Tooltip
				positioning={{ placement: 'top' }}
				triggerBase="underline"
				contentBase="card preset-filled p-4"
				openDelay={100}
				zIndex={'1000'}
				arrow
			>
				{#snippet trigger()}
					<button
						type="button"
						onclick={() => handlePreviewInvoice(transaction)}
						class="text-secondary-800 hover:bg-secondary-100 dark:text-secondary-100 dark:hover:bg-secondary-100 dark:hover:text-secondary-800 rounded p-1"
						title="Detail Variasi Transaksi"
					>
						<Receipt size={20} />
					</button>
				{/snippet}
				{#snippet content()}Lihat Invoice{/snippet}
			</Tooltip>
		{/if}
	{/snippet}
</DataTable>
<TransactionForm
	{showForm}
	onClose={() => (showForm = false)}
	onSuccess={() => RefreshTransactions()}
/>
<TransactionCompleteForm
	{selectedTransaction}
	{completeShowForm}
	onClose={() => (completeShowForm = false)}
	onSuccess={() => RefreshTransactions()}
/>
<TransactionPreviewInvoice
	{selectedTransaction}
	{showPreviewInvoice}
	onClose={() => (showPreviewInvoice = false)}
	onSuccess={() => RefreshTransactions()}
/>
