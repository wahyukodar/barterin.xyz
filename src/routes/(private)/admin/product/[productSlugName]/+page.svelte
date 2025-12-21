<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import DataTable from '$lib/components/DataTable.svelte';
	import { STATUS_ACTIVE, STATUS_INACTIVE } from '$lib/constants/status.constant';
	import { PRODUCT_URL } from '$lib/constants/url.constant';
	import {
		RefreshProductVariations,
		useDeleteProductVariation,
		useRestoreProductVariation
	} from '$lib/hooks/product-variation.hook';
	import { useProductDetails } from '$lib/hooks/product.hook';
	import { ConfirmAction } from '$lib/utils/alert.util';
	import { DefaultFormatters } from '$lib/utils/default-formatter.util';
	import { Tooltip } from '@skeletonlabs/skeleton-svelte';
	import { Pencil, RotateCcw, Search, Trash2 } from 'lucide-svelte';
	import ProductVariationForm from './ProductVariationForm.svelte';

	let isActive = $state(STATUS_ACTIVE);

	let showForm = $state(false);
	let selectedProductVariation = $state(null);

	let productSlugName = page.data.productSlugName;

	// Query store
	const productDetailQuery = $derived(useProductDetails(productSlugName, isActive));

	// Derived values
	const productVariations = $derived($productDetailQuery.data?.data ?? []);
	const loading = $derived($productDetailQuery.isLoading);
	const error = $derived($productDetailQuery.error);

	function handleAddProductVariation() {
		selectedProductVariation = null;
		showForm = true;
	}

	function handleEditProductVariation(productVariation: any) {
		selectedProductVariation = productVariation;
		showForm = true;
	}

	const deleteProductVariation = useDeleteProductVariation();
	const restoreProductVariation = useRestoreProductVariation();

	async function handleDeleteProductVariation(productVariationSlugName: string) {
		const confirmed = await ConfirmAction({
			title: 'Hapus Variasi Produk',
			text: `Apakah Anda yakin ingin menghapus variasi produk "${productVariationSlugName}"?`,
			icon: 'warning',
			confirmButtonText: 'Ya, hapus!'
		});
		if (confirmed) {
			$deleteProductVariation.mutate({ productSlugName, productVariationSlugName });
		}
	}

	async function handleRestoreProductVariation(productVariationSlugName: string) {
		const confirmed = await ConfirmAction({
			title: 'Aktifkan Variasi Produk',
			text: `Apakah Anda yakin ingin mengaktifkan variasi produk "${productVariationSlugName}"?`,
			icon: 'question',
			confirmButtonText: 'Ya, aktifkan!'
		});
		if (confirmed) {
			$restoreProductVariation.mutate({ productSlugName, productVariationSlugName });
		}
	}

	const columns = [
		{ field: 'name', label: 'Nama Variasi', align: 'left' },
		{
			field: 'price',
			label: 'Harga',
			format: DefaultFormatters.currency
		},
		{
			field: 'uom',
			label: 'UOM'
		},
		{
			field: 'qtyPerUom',
			label: 'Qty/UOM'
		},
		{
			field: 'sku',
			label: 'SKU'
		},
		{
			field: 'stock',
			label: 'Total Stock',
			custom: (row: any) =>
				`${row.totalStock}${row.uom ? ` ${row.uom}` : ''} dari ${row.totalWarehouse} gudang`,
			className: (row: any) =>
				row.totalStock <= 0
					? 'bg-warning-100 text-gray-800 font-bold'
					: ''
		},
		{
			field: 'createdAt',
			label: 'Created At',
			format: DefaultFormatters.date
		},
		{
			field: 'updatedAt',
			label: 'Updated At',
			format: DefaultFormatters.date
		}
	];
</script>

<svelte:head>
	<title>Manage Product Variation</title>
</svelte:head>

<DataTable
	title="Daftar Variasi Produk"
	detailTitle={productVariations.name}
	data={productVariations.productVariation}
	rowId={'slugName'}
	usePagination={false}
	backLink={PRODUCT_URL}
	{loading}
	{error}
	{columns}
>
	<!-- Header action -->
	{#snippet headerAction()}
		<button
			class="text-md bg-surface-600 hover:bg-surface-300 dark:hover:bg-surface-700 flex rounded-lg px-4 py-2 text-white shadow-md"
			onclick={handleAddProductVariation}>+ Tambah Variasi Produk</button
		>
	{/snippet}

	<!-- Tabs Aktif / Tidak Aktif -->
	{#snippet isActiveAction()}
		<div class="bg-surface-200/90 dark:bg-surface-800/90 flex">
			<button
				class={`px-4 py-2 ${isActive === STATUS_ACTIVE ? 'border-primary-500 dark:border-primary-400 border-b-2' : 'hover:bg-surface-300 dark:hover:bg-surface-700'}`}
				onclick={() => {
					isActive = STATUS_ACTIVE;
				}}
			>
				Aktif
			</button>
			<button
				class={`px-4 py-2 ${isActive === STATUS_INACTIVE ? 'border-primary-500 dark:border-primary-400 border-b-2' : 'hover:bg-surface-300 dark:hover:bg-surface-700'}`}
				onclick={() => {
					isActive = STATUS_INACTIVE;
				}}
			>
				Tidak Aktif
			</button>
		</div>
	{/snippet}

	<!-- Actions per row -->
	{#snippet actions({ row: productVariation })}
		{#if productVariation.isActive == STATUS_ACTIVE}
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
						onclick={() =>
							goto(`/admin/product/${productSlugName}/variation/${productVariation.slugName}`)}
						class="text-secondary-800 hover:bg-secondary-100 dark:text-secondary-100 dark:hover:bg-secondary-100 dark:hover:text-secondary-800 rounded p-1"
						title="Detail Variasi Produk"
					>
						<Search size={16} />
					</button>{/snippet}
				{#snippet content()}Lihat Detail Variasi Produk{/snippet}
			</Tooltip>
			<button
				type="button"
				onclick={() => handleEditProductVariation(productVariation)}
				class="text-primary-800 hover:bg-primary-100 dark:text-primary-100 dark:hover:bg-primary-100 dark:hover:text-primary-800 rounded p-1"
				title="Edit"
			>
				<Pencil size={16} />
			</button>
			<button
				type="button"
				onclick={() => handleDeleteProductVariation(productVariation.slugName)}
				class="text-error-800 hover:bg-error-100 dark:text-error-100 dark:hover:bg-error-100 dark:hover:text-error-800 rounded p-1"
				disabled={$deleteProductVariation.isPending &&
					$deleteProductVariation.variables === productVariation.slugName}
				title="Hapus"
			>
				{#if $deleteProductVariation.isPending && $deleteProductVariation.variables === productVariation.slugName}
					<span class="text-xs">...</span>
				{:else}
					<Trash2 size={16} />
				{/if}
			</button>
		{:else}
			<button
				type="button"
				onclick={() => handleRestoreProductVariation(productVariation.slugName)}
				class="text-success-800 hover:bg-success-100 dark:text-success-100 dark:hover:bg-success-100 dark:hover:text-success-800 rounded p-1"
				disabled={$restoreProductVariation.isPending &&
					$restoreProductVariation.variables === productVariation.slugName}
				title="Restore"
			>
				{#if $restoreProductVariation.isPending && $restoreProductVariation.variables === productVariation.slugName}
					<span class="text-xs">...</span>
				{:else}
					<RotateCcw size={16} />
				{/if}
			</button>
		{/if}
	{/snippet}
</DataTable>
<ProductVariationForm
	{productSlugName}
	{showForm}
	{productVariations}
	{selectedProductVariation}
	onClose={() => (showForm = false)}
	onSuccess={() => RefreshProductVariations()}
/>
