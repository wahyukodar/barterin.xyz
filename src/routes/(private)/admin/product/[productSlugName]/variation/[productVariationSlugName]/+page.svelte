<script lang="ts">
	import { page } from '$app/state';
	import DataTable from '$lib/components/DataTable.svelte';
	import { PRODUCT_URL } from '$lib/constants/url.constant';
	import {
		RefreshProductVariationStock,
		useDeleteProductVariationStock
	} from '$lib/hooks/product-variation-stock.hook';
	import { useProductVariationDetails } from '$lib/hooks/product-variation.hook';
	import { ConfirmAction } from '$lib/utils/alert.util';
	import { DefaultFormatters } from '$lib/utils/default-formatter.util';
	import { ArrowRightLeft, Trash2 } from 'lucide-svelte';
	import ProductVariationStockForm from './ProductVariationStockForm.svelte';
	import ProductVariationStockMoveForm from './ProductVariationStockMoveForm.svelte';

	let showForm = $state(false);
	let showMoveForm = $state(false);
	let productSlugName = page.data.productSlugName;
	let productVariationSlugName = page.data.productVariationSlugName;

	// Query store
	const productVariationDetailQuery = $derived(
		useProductVariationDetails(productSlugName, productVariationSlugName)
	);

	// Derived values
	const productVariation = $derived($productVariationDetailQuery.data?.data ?? []);
	const loading = $derived($productVariationDetailQuery.isLoading);
	const error = $derived($productVariationDetailQuery.error);

	let selectedFromWarehouseSlugName = $state('');
	let selectedFromWarehouseName = $state('');
	let selectedFromWarehouseQty = $state(0);

	function handleOpenMoveForm(param: { fromWarehouseSlugName: string; fromWarehouseName: string; fromWarehouseQty: number }) {
		selectedFromWarehouseSlugName = param.fromWarehouseSlugName;
		selectedFromWarehouseName = param.fromWarehouseName;
		selectedFromWarehouseQty = param.fromWarehouseQty;
		showMoveForm = true;
	}

	function handleUpsertProductVariationStock() {
		showForm = true;
	}

	const deleteProductVariationStock = useDeleteProductVariationStock();

	async function handleDeleteProductVariationStock(warehouseSlugName: string) {
		const confirmed = await ConfirmAction({
			title: 'Hapus Stok Variasi Produk',
			text: `Apakah Anda yakin ingin menghapus stok variasi produk "${productVariationSlugName}"?`,
			icon: 'warning',
			confirmButtonText: 'Ya, hapus!'
		});
		if (confirmed) {
			$deleteProductVariationStock.mutate({
				productSlugName,
				productVariationSlugName,
				warehouseSlugName
			});
		}
	}

	const columns = [
		{
			field: 'warehouse.name',
			fieldIsDefault: (row: any) => row.warehouse.isDefault,
			custom: (row: any) => row.warehouse.name,
			label: 'Gudang',
			align: 'left'
		},
		{
			field: 'quantity',
			label: 'Qty'
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
	<title>Manage Stock Product Variation</title>
</svelte:head>

<DataTable
	title="Daftar Stok Variasi Produk"
	detailTitle={productVariation.name}
	data={productVariation.productVariationStock}
	rowId={'cid'}
	usePagination={false}
	backLink={PRODUCT_URL + `/${productSlugName}`}
	{loading}
	{error}
	{columns}
>
	<!-- Header action -->
	{#snippet headerAction()}
		<button
			class="text-md bg-surface-600 hover:bg-surface-300 dark:hover:bg-surface-700 flex rounded-lg px-4 py-2 text-white shadow-md"
			onclick={handleUpsertProductVariationStock}>Perbaharui Stok Variasi Produk</button
		>
	{/snippet}

	<!-- Actions per row -->
	{#snippet actions({ row: productVariationStock })}
		<!-- Tombol Move -->
		<button
			type="button"
			onclick={() =>
				handleOpenMoveForm({
					fromWarehouseSlugName: productVariationStock.warehouse.slugName,
					fromWarehouseName: productVariationStock.warehouse.name,
					fromWarehouseQty: productVariationStock.quantity
				})}
			class="text-primary-800 hover:bg-primary-100 dark:text-primary-100 dark:hover:bg-primary-100 dark:hover:text-primary-800 rounded p-1"
			title="Pindahkan Stok"
		>
			<ArrowRightLeft size={16} />
		</button>
		<button
			type="button"
			onclick={() => handleDeleteProductVariationStock(productVariationStock.warehouse.slugName)}
			class="text-error-800 hover:bg-error-100 dark:text-error-100 dark:hover:bg-error-100 dark:hover:text-error-800 rounded p-1"
			disabled={$deleteProductVariationStock.isPending &&
				$deleteProductVariationStock.variables === productVariation.slugName}
			title="Hapus"
		>
			{#if $deleteProductVariationStock.isPending && $deleteProductVariationStock.variables === productVariation.slugName}
				<span class="text-xs">...</span>
			{:else}
				<Trash2 size={16} />
			{/if}
		</button>
	{/snippet}
</DataTable>
<ProductVariationStockForm
	{productSlugName}
	{productVariationSlugName}
	{showForm}
	onClose={() => (showForm = false)}
	onSuccess={() => RefreshProductVariationStock()}
/>
<ProductVariationStockMoveForm
	{productSlugName}
	{productVariationSlugName}
	fromWarehouseSlugName={selectedFromWarehouseSlugName}
	fromWarehouseName={selectedFromWarehouseName}
	fromWarehouseQty={selectedFromWarehouseQty}
	{showMoveForm}
	onClose={() => (showMoveForm = false)}
	onSuccess={() => RefreshProductVariationStock()}
/>
