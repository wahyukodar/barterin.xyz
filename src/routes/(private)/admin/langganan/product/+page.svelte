<script lang="ts">
	import { goto } from '$app/navigation';
	import DataTable from '$lib/components/DataTable.svelte';
	import { STATUS_ACTIVE } from '$lib/constants/status.constant';
	import {
		RefreshLanggananProducts,
		useDeleteLanggananProduct,
		useLanggananProducts,
		useRestoreLanggananProduct
	} from '$lib/hooks/langganan-product.hook';
	import { ConfirmAction } from '$lib/utils/alert.util';
	import { DefaultFormatters } from '$lib/utils/default-formatter.util';
	import { Tooltip } from '@skeletonlabs/skeleton-svelte';
	import { Pencil, RotateCcw, Search, Trash2 } from 'lucide-svelte';
	import LanggananProductForm from './LanggananProductForm.svelte';

	let page = $state(1);
	let limit = $state(10);
	let isActive = $state(STATUS_ACTIVE);
	let searchTerm = $state('');
	let orderBy = $state('createdAt:desc');
	let showForm = $state(false);
	let selectedLanggananProduct = $state(null);

	let debouncedSearchTerm = $state('');
	let debounceTimer: ReturnType<typeof setTimeout>;

	// Query
	const langgananProductsQuery = $derived(
		useLanggananProducts({
			page,
			limit,
			isActive,
			search: debouncedSearchTerm,
			orderBy
		})
	);

	// Derived
	const langgananProducts = $derived($langgananProductsQuery.data?.data?.data ?? []);
	const total = $derived($langgananProductsQuery.data?.data?.total ?? 0);
	const totalPages = $derived(Math.ceil(total / limit));
	const loading = $derived($langgananProductsQuery.isLoading);
	const error = $derived($langgananProductsQuery.error);

	// Actions
	function handleAddLanggananProduct() {
		selectedLanggananProduct = null;
		showForm = true;
	}
	function handleEditLanggananProduct(row: any) {
		selectedLanggananProduct = row;
		showForm = true;
	}

	const deleteLanggananProduct = useDeleteLanggananProduct();
	const restoreLanggananProduct = useRestoreLanggananProduct();

	async function handleDeleteLanggananProduct(row: any) {
		const confirmed = await ConfirmAction({
			title: 'Hapus Langganan Produk',
			text: `Apakah Anda yakin ingin menghapus produk "${row.productName}" untuk pelanggan "${row.langgananName}"?`,
			icon: 'warning',
			confirmButtonText: 'Ya, hapus!'
		});
		if (confirmed) {
			$deleteLanggananProduct.mutate({
				requester: row.requester,
				productSlugName: row.productSlugName,
				minQty: row.minQty
			});
		}
	}

	async function handleRestoreLanggananProduct(row: any) {
		const confirmed = await ConfirmAction({
			title: 'Aktifkan Langganan Produk',
			text: `Apakah Anda yakin ingin mengaktifkan produk "${row.productName}" untuk pelanggan "${row.langgananName}"?`,
			icon: 'question',
			confirmButtonText: 'Ya, aktifkan!'
		});
		if (confirmed) {
			$restoreLanggananProduct.mutate({
				requester: row.requester,
				productSlugName: row.productSlugName,
				minQty: row.minQty
			});
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

	// debounce search
	$effect(() => {
		const current = searchTerm;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			debouncedSearchTerm = current;
			page = 1;
		}, 500);
		return () => clearTimeout(debounceTimer);
	});

	// Kolom tabel
	const columns = [
		{
			field: 'langgananName',
			label: 'Pelanggan',
			sortable: true,
			align: 'left'
		},
		{
			field: 'productName',
			label: 'Produk',
			sortable: true
		},
		{
			field: 'price',
			label: 'Harga',
			format: DefaultFormatters.currency
		},
		{
			field: 'minQty',
			label: 'Min Qty'
		},
		{
			field: 'createdAt',
			label: 'Created At',
			format: DefaultFormatters.date
		}
	];
</script>

<svelte:head>
	<title>Manage Langganan Produk</title>
</svelte:head>

<DataTable
	title="Daftar Langganan Produk"
	data={langgananProducts}
	rowId={'id'}
	{total}
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
	{#snippet headerAction()}
		<button
			class="bg-surface-600 hover:bg-surface-300 text-md rounded-lg px-4 py-2 text-white shadow-md"
			onclick={handleAddLanggananProduct}>+ Tambah Langganan Produk</button
		>
	{/snippet}

	{#snippet searchAction()}
		<div class="relative w-full sm:max-w-xs">
			<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				<Search class="text-primary-600 size-4" />
			</div>
			<input
				type="text"
				class="border-surface-600 focus:ring-surface-700 focus:border-surface-500 block w-full rounded-lg border p-2 pl-10 text-sm text-gray-900"
				placeholder="Cari produk atau pelanggan..."
				bind:value={searchTerm}
			/>
		</div>
	{/snippet}

	<!-- Actions per row -->
	{#snippet actions({ row: langganan })}
		{#if langganan.isActive == STATUS_ACTIVE}
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
						onclick={() => goto(`/admin/langganan/detail/${langganan.requester}`)}
						class="text-secondary-800 hover:bg-secondary-100 dark:text-secondary-100 dark:hover:bg-secondary-100 dark:hover:text-secondary-800 rounded p-1"
						title="Detail Pelanggan"
					>
						<Search size={16} />
					</button>{/snippet}
				{#snippet content()}Lihat Detail Pelanggan{/snippet}
			</Tooltip>
			<button
				type="button"
				onclick={() => handleEditLanggananProduct(langganan)}
				class="text-primary-800 hover:bg-primary-100 dark:text-primary-100 dark:hover:bg-primary-100 dark:hover:text-primary-800 rounded p-1"
				title="Edit"
			>
				<Pencil size={16} />
			</button>
			<button
				type="button"
				onclick={() => handleDeleteLanggananProduct(langganan.requester)}
				class="text-error-800 hover:bg-error-100 dark:text-error-100 dark:hover:bg-error-100 dark:hover:text-error-800 rounded p-1"
				disabled={$deleteLanggananProduct.isPending &&
					$deleteLanggananProduct.variables === langganan.requester}
				title="Hapus"
			>
				{#if $deleteLanggananProduct.isPending && $deleteLanggananProduct.variables === langganan.requester}
					<span class="text-xs">...</span>
				{:else}
					<Trash2 size={16} />
				{/if}
			</button>
		{:else}
			<button
				type="button"
				onclick={() => handleRestoreLanggananProduct(langganan.requester)}
				class="text-success-800 hover:bg-success-100 dark:text-success-100 dark:hover:bg-success-100 dark:hover:text-success-800 rounded p-1"
				disabled={$restoreLanggananProduct.isPending &&
					$restoreLanggananProduct.variables === langganan.requester}
				title="Restore"
			>
				{#if $restoreLanggananProduct.isPending && $restoreLanggananProduct.variables === langganan.requester}
					<span class="text-xs">...</span>
				{:else}
					<RotateCcw size={16} />
				{/if}
			</button>
		{/if}
	{/snippet}
</DataTable>

<LanggananProductForm
	{showForm}
	{selectedLanggananProduct}
	onClose={() => (showForm = false)}
	onSuccess={() => RefreshLanggananProducts()}
/>
