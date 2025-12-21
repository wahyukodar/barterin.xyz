<script lang="ts">
	import DataTable from '$lib/components/DataTable.svelte';
	import { STATUS_ACTIVE, STATUS_INACTIVE } from '$lib/constants/status.constant';
	import {
		RefreshCashiers,
		useCashiers,
		useDeleteCashier,
		useRestoreCashier
	} from '$lib/hooks/cashier.hook';
	import { ConfirmAction } from '$lib/utils/alert.util';
	import { DefaultFormatters } from '$lib/utils/default-formatter.util';
	import { Pencil, RotateCcw, Search, Trash2 } from 'lucide-svelte';
	import CashierForm from './CashierForm.svelte';

	let page = $state(1);
	let limit = $state(10);
	let isActive = $state(STATUS_ACTIVE);
	let searchTerm = $state('');
	let orderBy = $state('createdAt:desc');
	let showForm = $state(false);
	let selectedCashier = $state(null);

	// For debouncing search
	let debouncedSearchTerm = $state('');
	let debounceTimer: ReturnType<typeof setTimeout>;

	// Query store
	const cashiersQuery = $derived(
		useCashiers({
			page,
			limit,
			isActive,
			search: debouncedSearchTerm,
			orderBy
		})
	);

	// Derived values
	const cashiers = $derived($cashiersQuery.data?.data?.data ?? []);
	const totalCashiers = $derived($cashiersQuery.data?.data?.total ?? 0);
	const totalPages = $derived(Math.ceil(totalCashiers / limit));
	const loading = $derived($cashiersQuery.isLoading);
	const error = $derived($cashiersQuery.error);

	function handleAddCashier() {
		selectedCashier = null;
		showForm = true;
	}

	function handleEditCashier(cashier: any) {
		selectedCashier = cashier;
		showForm = true;
	}

	const deleteCashier = useDeleteCashier();
	const restoreCashier = useRestoreCashier();

	async function handleDeleteCashier(cashierSlugName: string) {
		const confirmed = await ConfirmAction({
			title: 'Hapus Kasir',
			text: `Apakah Anda yakin ingin menghapus kasir "${cashierSlugName}"?`,
			icon: 'warning',
			confirmButtonText: 'Ya, hapus!'
		});
		if (confirmed) {
			$deleteCashier.mutate(cashierSlugName);
		}
	}

	async function handleRestoreCashier(cashierSlugName: string) {
		const confirmed = await ConfirmAction({
			title: 'Aktifkan Kasir',
			text: `Apakah Anda yakin ingin mengaktifkan kasir "${cashierSlugName}"?`,
			icon: 'question',
			confirmButtonText: 'Ya, aktifkan!'
		});
		if (confirmed) {
			$restoreCashier.mutate(cashierSlugName);
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
		{ field: 'name', label: 'Nama Kasir', sortable: true, align: 'left' },
		{
			field: 'phone',
			label: 'Telepon',
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
</script>

<svelte:head>
	<title>Manage Cashiers</title>
</svelte:head>

<DataTable
	title="Daftar Kasir"
	data={cashiers}
	rowId={"slugName"}
	total={totalCashiers}
	{page}
	pageSize={limit}
	{totalPages}
	{loading}
	{error}
	searchTerm={debouncedSearchTerm}
	{columns}
	{getSortDirection}
	{toggleSort}
	onPageChange={handlePageChange}
	onPageSizeChange={handlePageSizeChange}
>
	<!-- Header action -->
	{#snippet headerAction()}
		<button
			class="text-md bg-surface-600 text-white hover:bg-surface-300 dark:hover:bg-surface-700 flex rounded-lg px-4 py-2 shadow-md"
			onclick={handleAddCashier}>+ Tambah Kasir</button
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
				placeholder="Cari kasir..."
				bind:value={searchTerm}
			/>
		</div>
	{/snippet}

	<!-- Tabs Aktif / Tidak Aktif -->
	{#snippet isActiveAction()}
		<div class="bg-surface-200/90 dark:bg-surface-800/90 flex">
			<button
				class={`px-4 py-2 ${isActive === STATUS_ACTIVE ? 'border-primary-500 dark:border-primary-400 border-b-2' : 'hover:bg-surface-300 dark:hover:bg-surface-700'}`}
				onclick={() => {
					isActive = STATUS_ACTIVE;
					page = 1;
				}}
			>
				Aktif
			</button>
			<button
				class={`px-4 py-2 ${isActive === STATUS_INACTIVE ? 'border-primary-500 dark:border-primary-400 border-b-2' : 'hover:bg-surface-300 dark:hover:bg-surface-700'}`}
				onclick={() => {
					isActive = STATUS_INACTIVE;
					page = 1;
				}}
			>
				Tidak Aktif
			</button>
		</div>
	{/snippet}

	<!-- Actions per row -->
	{#snippet actions({ row: cashier })}
		{#if cashier.isActive == STATUS_ACTIVE}
			<button
				type="button"
				onclick={() => handleEditCashier(cashier)}
				class="text-primary-800 hover:bg-primary-100 dark:text-primary-100 dark:hover:bg-primary-100 dark:hover:text-primary-800 rounded p-1"
				title="Edit"
			>
				<Pencil size={16} />
			</button>
			<button
				type="button"
				onclick={() => handleDeleteCashier(cashier.phone)}
				class="text-error-800 hover:bg-error-100 dark:text-error-100 dark:hover:bg-error-100 dark:hover:text-error-800 rounded p-1"
				disabled={$deleteCashier.isPending && $deleteCashier.variables === cashier.phone}
				title="Hapus"
			>
				{#if $deleteCashier.isPending && $deleteCashier.variables === cashier.phone}
					<span class="text-xs">...</span>
				{:else}
					<Trash2 size={16} />
				{/if}
			</button>
		{:else}
			<button
				type="button"
				onclick={() => handleRestoreCashier(cashier.phone)}
				class="text-success-800 hover:bg-success-100 dark:text-success-100 dark:hover:bg-success-100 dark:hover:text-success-800 rounded p-1"
				disabled={$restoreCashier.isPending && $restoreCashier.variables === cashier.phone}
				title="Restore"
			>
				{#if $restoreCashier.isPending && $restoreCashier.variables === cashier.phone}
					<span class="text-xs">...</span>
				{:else}
					<RotateCcw size={16} />
				{/if}
			</button>
		{/if}
	{/snippet}
</DataTable>
<CashierForm
	{showForm}
	{selectedCashier}
	onClose={() => (showForm = false)}
	onSuccess={() => RefreshCashiers()}
/>
