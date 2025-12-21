<!-- src/routes/warehouses/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import DataTable from '$lib/components/DataTable.svelte';
	import { STATUS_ACTIVE, STATUS_INACTIVE } from '$lib/constants/status.constant';
	import {
		RefreshWarehouses,
		useDeleteWarehouse,
		useRestoreWarehouse,
		useWarehouses
	} from '$lib/hooks/warehouse.hook';
	import { ConfirmAction } from '$lib/utils/alert.util';
	import { DefaultFormatters } from '$lib/utils/default-formatter.util';
	import { Tooltip } from '@skeletonlabs/skeleton-svelte';
	import { Pencil, RotateCcw, Search, Trash2 } from 'lucide-svelte';
	import WarehouseForm from './WarehouseForm.svelte';

	let page = $state(1);
	let limit = $state(10);
	let isActive = $state(STATUS_ACTIVE);
	let searchTerm = $state('');
	let orderBy = $state('createdAt:desc');
	let showForm = $state(false);
	let selectedWarehouse = $state(null);

	// For debouncing search
	let debouncedSearchTerm = $state('');
	let debounceTimer: ReturnType<typeof setTimeout>;

	// Query store
	const warehousesQuery = $derived(
		useWarehouses({
			page,
			limit,
			isActive,
			search: debouncedSearchTerm,
			orderBy
		})
	);

	// Derived values
	const warehouses = $derived($warehousesQuery.data?.data?.data ?? []);
	const totalWarehouses = $derived($warehousesQuery.data?.data?.total ?? 0);
	const totalPages = $derived(Math.ceil(totalWarehouses / limit));
	const loading = $derived($warehousesQuery.isLoading);
	const error = $derived($warehousesQuery.error);

	function handleAddWarehouse() {
		selectedWarehouse = null;
		showForm = true;
	}

	function handleEditWarehouse(warehouse: any) {
		selectedWarehouse = warehouse;
		showForm = true;
	}

	const deleteWarehouse = useDeleteWarehouse();
	const restoreWarehouse = useRestoreWarehouse();

	async function handleDeleteWarehouse(warehouseSlugName: string) {
		const confirmed = await ConfirmAction({
			title: 'Hapus Gudang',
			text: `Apakah Anda yakin ingin menghapus gudang "${warehouseSlugName}"?`,
			icon: 'warning',
			confirmButtonText: 'Ya, hapus!'
		});
		if (confirmed) {
			$deleteWarehouse.mutate(warehouseSlugName);
		}
	}

	async function handleRestoreWarehouse(warehouseSlugName: string) {
		const confirmed = await ConfirmAction({
			title: 'Aktifkan Gudang',
			text: `Apakah Anda yakin ingin mengaktifkan gudang "${warehouseSlugName}"?`,
			icon: 'question',
			confirmButtonText: 'Ya, aktifkan!'
		});
		if (confirmed) {
			$restoreWarehouse.mutate(warehouseSlugName);
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
			field: 'warehouseName',
			fieldSort: 'name',
			fieldIsDefault: (row: any) =>
				row.isDefault,
			label: 'Gudang',
			sortable: true,
			align: 'left',
		},
		{
			field: 'address',
			label: 'Alamat',
		},
		{
			field: 'picName',
			label: 'PIC'
		},
		{
			field: 'phone',
			label: 'Telepon'
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
	<title>Manage Gudang</title>
</svelte:head>

<DataTable
	title="Daftar Gudang"
	data={warehouses}
	rowId={"warehouseSlugName"}
	total={totalWarehouses}
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
			class="text-md bg-surface-600 hover:bg-surface-300 dark:hover:bg-surface-700 flex rounded-lg px-4 py-2 text-white shadow-md"
			onclick={handleAddWarehouse}>+ Tambah Gudang</button
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
				placeholder="Cari gudang..."
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
	{#snippet actions({ row: warehouse })}
		{#if warehouse.isActive == STATUS_ACTIVE}
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
						onclick={() => goto(`/admin/warehouse/detail/${warehouse.warehouseSlugName}`)}
						class="text-secondary-800 hover:bg-secondary-100 dark:text-secondary-100 dark:hover:bg-secondary-100 dark:hover:text-secondary-800 rounded p-1"
						title="Detail Variasi Gudang"
					>
						<Search size={16} />
					</button>{/snippet}
				{#snippet content()}Lihat Detail Variasi Gudang{/snippet}
			</Tooltip>
			<button
				type="button"
				onclick={() => handleEditWarehouse(warehouse)}
				class="text-primary-800 hover:bg-primary-100 dark:text-primary-100 dark:hover:bg-primary-100 dark:hover:text-primary-800 rounded p-1"
				title="Edit"
			>
				<Pencil size={16} />
			</button>
			<button
				type="button"
				onclick={() => handleDeleteWarehouse(warehouse.warehouseSlugName)}
				class="text-error-800 hover:bg-error-100 dark:text-error-100 dark:hover:bg-error-100 dark:hover:text-error-800 rounded p-1"
				disabled={$deleteWarehouse.isPending &&
					$deleteWarehouse.variables === warehouse.warehouseSlugName}
				title="Hapus"
			>
				{#if $deleteWarehouse.isPending && $deleteWarehouse.variables === warehouse.warehouseSlugName}
					<span class="text-xs">...</span>
				{:else}
					<Trash2 size={16} />
				{/if}
			</button>
		{:else}
			<button
				type="button"
				onclick={() => handleRestoreWarehouse(warehouse.warehouseSlugName)}
				class="text-success-800 hover:bg-success-100 dark:text-success-100 dark:hover:bg-success-100 dark:hover:text-success-800 rounded p-1"
				disabled={$restoreWarehouse.isPending &&
					$restoreWarehouse.variables === warehouse.warehouseSlugName}
				title="Restore"
			>
				{#if $restoreWarehouse.isPending && $restoreWarehouse.variables === warehouse.warehouseSlugName}
					<span class="text-xs">...</span>
				{:else}
					<RotateCcw size={16} />
				{/if}
			</button>
		{/if}
	{/snippet}
</DataTable>
<WarehouseForm
	{showForm}
	{selectedWarehouse}
	onClose={() => (showForm = false)}
	onSuccess={() => RefreshWarehouses()}
/>
