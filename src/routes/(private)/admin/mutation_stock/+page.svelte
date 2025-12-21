<script lang="ts">
	import DataTable from '$lib/components/DataTable.svelte';
	import { STATUS_ACTIVE } from '$lib/constants/status.constant';
	import { useProductVariationStockMutations } from '$lib/hooks/product-variation-stock-mutation.hook';
	import { DefaultFormatters } from '$lib/utils/default-formatter.util';
	import { Search } from 'lucide-svelte';

	let page = $state(1);
	let limit = $state(10);
	let searchTerm = $state('');
	let orderBy = $state('createdAt:desc');

	// For debouncing search
	let debouncedSearchTerm = $state('');
	let debounceTimer: ReturnType<typeof setTimeout>;

	// Query store
	const productVariationStockMutationsQuery = $derived(
		useProductVariationStockMutations({
			page,
			limit,
			isActive: STATUS_ACTIVE,
			search: debouncedSearchTerm,
			orderBy
		})
	);

	// Derived values
	const productVariationStockMutations = $derived(
		$productVariationStockMutationsQuery.data?.data?.data ?? []
	);
	const totalProductVariationStockMutations = $derived(
		$productVariationStockMutationsQuery.data?.data?.total ?? 0
	);
	const totalPages = $derived(Math.ceil(totalProductVariationStockMutations / limit));
	const loading = $derived($productVariationStockMutationsQuery.isLoading);
	const error = $derived($productVariationStockMutationsQuery.error);

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
			field: 'name',
			label: 'Nama Produk',
			custom: (row: any) => `${row.product.name}`,
			align: 'left'
		},
		{
			field: 'name',
			label: 'Variasi Produk',
			custom: (row: any) => `${row.productVariation.name}`
		},
		{
			field: 'warehouse',
			label: 'Gudang',
			custom: (row: any) => `${row.warehouse.name}`
		},
		{
			field: 'quantity',
			label: 'Qty'
		},
		{
			field: 'baseQtyPerUom',
			label: 'Aktivitas',
			custom: (row: any) => {
				const activityMap: Record<string, string> = {
					ADD: 'Penambahan Stok',
					SUBTRACT: 'Pengurangan Stok',
					DELETE: 'Penghapusan Stok',
					TRANSFER_IN: 'Transfer Masuk',
					TRANSFER_OUT: 'Transfer Keluar'
				};
				return activityMap[row.changeType] ?? row.changeType;
			},
			className: (row: any) => {
				const colorMap: Record<string, string> = {
					ADD: 'bg-green-300 text-gray-800 font-bold',
					SUBTRACT: 'bg-red-300 text-gray-800 font-bold',
					DELETE: 'bg-red-300 text-gray-800 font-bold',
					TRANSFER_IN: 'bg-blue-300 text-gray-800 font-bold',
					TRANSFER_OUT: 'bg-yellow-300 text-gray-800 font-bold'
				};
				return colorMap[row.changeType] ?? 'bg-gray-200 text-gray-800';
			}
		},
		{
			field: 'note',
			label: 'Keterangan'
		},
		{
			field: 'createdAt',
			label: 'Created At',
			sortable: true,
			format: DefaultFormatters.date
		}
	];
</script>

<svelte:head>
	<title>Riwayat Mutasi Stok</title>
</svelte:head>

<DataTable
	title="Riwayat Mutasi Stok"
	data={productVariationStockMutations}
	showAction={false}
	rowId={'cid'}
	total={totalProductVariationStockMutations}
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
	<!-- Search -->
	{#snippet searchAction()}
		<div class="relative w-full sm:max-w-xs">
			<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				<Search class="text-primary-600 text:border-primary-400 size-4" />
			</div>
			<input
				type="text"
				class="border-surface-600 dark:border-surface-400 placeholder-surface-600 dark:placeholder-surface-400 focus:ring-surface-700 dark:focus:ring-surface-300 focus:border-surface-500 block w-full rounded-lg border p-2 pl-10 text-sm text-gray-900"
				placeholder="Cari mutasi stok..."
				bind:value={searchTerm}
			/>
		</div>
	{/snippet}
</DataTable>
