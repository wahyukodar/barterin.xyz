<script lang="ts">
	import { goto } from '$app/navigation';
	import DataTable from '$lib/components/DataTable.svelte';
	import { STATUS_ACTIVE, STATUS_INACTIVE } from '$lib/constants/status.constant';
	import {
		RefreshProducts,
		useDeleteProduct,
		useProducts,
		useRestoreProduct
	} from '$lib/hooks/product.hook';
	import { ConfirmAction } from '$lib/utils/alert.util';
	import { DefaultFormatters } from '$lib/utils/default-formatter.util';
	import { Tooltip } from '@skeletonlabs/skeleton-svelte';
	import { Pencil, RotateCcw, Search, Trash2 } from 'lucide-svelte';
	import ProductForm from './ProductForm.svelte';

	let page = $state(1);
	let limit = $state(10);
	let isActive = $state(STATUS_ACTIVE);
	let searchTerm = $state('');
	let orderBy = $state('createdAt:desc');
	let showForm = $state(false);
	let selectedProduct = $state(null);

	// For debouncing search
	let debouncedSearchTerm = $state('');
	let debounceTimer: ReturnType<typeof setTimeout>;

	// Query store
	const productsQuery = $derived(
		useProducts({
			page,
			limit,
			isActive,
			search: debouncedSearchTerm,
			orderBy
		})
	);

	// Derived values
	const products = $derived($productsQuery.data?.data?.data ?? []);
	const totalProducts = $derived($productsQuery.data?.data?.total ?? 0);
	const totalPages = $derived(Math.ceil(totalProducts / limit));
	const loading = $derived($productsQuery.isLoading);
	const error = $derived($productsQuery.error);

	function handleAddProduct() {
		selectedProduct = null;
		showForm = true;
	}

	function handleEditProduct(product: any) {
		selectedProduct = product;
		showForm = true;
	}

	const deleteProduct = useDeleteProduct();
	const restoreProduct = useRestoreProduct();

	async function handleDeleteProduct(productSlugName: string) {
		const confirmed = await ConfirmAction({
			title: 'Hapus Produk',
			text: `Apakah Anda yakin ingin menghapus produk "${productSlugName}"?`,
			icon: 'warning',
			confirmButtonText: 'Ya, hapus!'
		});
		if (confirmed) {
			$deleteProduct.mutate(productSlugName);
		}
	}

	async function handleRestoreProduct(productSlugName: string) {
		const confirmed = await ConfirmAction({
			title: 'Aktifkan Produk',
			text: `Apakah Anda yakin ingin mengaktifkan produk "${productSlugName}"?`,
			icon: 'question',
			confirmButtonText: 'Ya, aktifkan!'
		});
		if (confirmed) {
			$restoreProduct.mutate(productSlugName);
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
		{ field: 'name', label: 'Nama Produk', sortable: true, align: 'left' },
		{
			field: 'basePrice',
			label: 'Harga Dasar',
			sortable: true,
			format: DefaultFormatters.currency
		},
		{
			field: 'baseUom',
			label: 'UOM Dasar',
		},
		{
			field: 'baseQtyPerUom',
			label: 'Qty Per UOM Default',
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
	<title>Manage Products</title>
</svelte:head>

<DataTable
	title="Daftar Produk"
	data={products}
	rowId={"slugName"}
	total={totalProducts}
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
			onclick={handleAddProduct}>+ Tambah Produk</button
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
				placeholder="Cari produk..."
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
	{#snippet actions({ row: product })}
		{#if product.isActive == STATUS_ACTIVE}
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
						onclick={() => goto(`/admin/product/${product.slugName}`)}
						class="text-secondary-800 hover:bg-secondary-100 dark:text-secondary-100 dark:hover:bg-secondary-100 dark:hover:text-secondary-800 rounded p-1"
						title="Detail Variasi Produk"
					>
						<Search size={16} />
					</button>{/snippet}
				{#snippet content()}Lihat Detail Variasi Produk{/snippet}
			</Tooltip>
			<button
				type="button"
				onclick={() => handleEditProduct(product)}
				class="text-primary-800 hover:bg-primary-100 dark:text-primary-100 dark:hover:bg-primary-100 dark:hover:text-primary-800 rounded p-1"
				title="Edit"
			>
				<Pencil size={16} />
			</button>
			<button
				type="button"
				onclick={() => handleDeleteProduct(product.slugName)}
				class="text-error-800 hover:bg-error-100 dark:text-error-100 dark:hover:bg-error-100 dark:hover:text-error-800 rounded p-1"
				disabled={$deleteProduct.isPending && $deleteProduct.variables === product.slugName}
				title="Hapus"
			>
				{#if $deleteProduct.isPending && $deleteProduct.variables === product.slugName}
					<span class="text-xs">...</span>
				{:else}
					<Trash2 size={16} />
				{/if}
			</button>
		{:else}
			<button
				type="button"
				onclick={() => handleRestoreProduct(product.slugName)}
				class="text-success-800 hover:bg-success-100 dark:text-success-100 dark:hover:bg-success-100 dark:hover:text-success-800 rounded p-1"
				disabled={$restoreProduct.isPending && $restoreProduct.variables === product.slugName}
				title="Restore"
			>
				{#if $restoreProduct.isPending && $restoreProduct.variables === product.slugName}
					<span class="text-xs">...</span>
				{:else}
					<RotateCcw size={16} />
				{/if}
			</button>
		{/if}
	{/snippet}
</DataTable>
<ProductForm
	{showForm}
	{selectedProduct}
	onClose={() => (showForm = false)}
	onSuccess={() => RefreshProducts()}
/>
