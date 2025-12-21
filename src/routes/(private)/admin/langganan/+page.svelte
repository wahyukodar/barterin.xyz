<!-- src/routes/langganans/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import DataTable from '$lib/components/DataTable.svelte';
	import { STATUS_ACTIVE, STATUS_INACTIVE } from '$lib/constants/status.constant';
	import {
		RefreshLangganans,
		useDeleteLangganan,
		useLangganans,
		useRestoreLangganan
	} from '$lib/hooks/langganan.hook';
	import { ConfirmAction } from '$lib/utils/alert.util';
	import { DefaultFormatters } from '$lib/utils/default-formatter.util';
	import { Tooltip } from '@skeletonlabs/skeleton-svelte';
	import { Pencil, RotateCcw, Search, Trash2 } from 'lucide-svelte';
	import LanggananForm from './LanggananForm.svelte';

	let page = $state(1);
	let limit = $state(10);
	let isActive = $state(STATUS_ACTIVE);
	let searchTerm = $state('');
	let orderBy = $state('createdAt:desc');
	let showForm = $state(false);
	let selectedLangganan = $state(null);

	// For debouncing search
	let debouncedSearchTerm = $state('');
	let debounceTimer: ReturnType<typeof setTimeout>;

	// Query store
	const langganansQuery = $derived(
		useLangganans({
			page,
			limit,
			isActive,
			search: debouncedSearchTerm,
			orderBy
		})
	);

	// Derived values
	const langganans = $derived($langganansQuery.data?.data?.data ?? []);
	const totalLangganans = $derived($langganansQuery.data?.data?.total ?? 0);
	const totalPages = $derived(Math.ceil(totalLangganans / limit));
	const loading = $derived($langganansQuery.isLoading);
	const error = $derived($langganansQuery.error);

	function handleAddLangganan() {
		selectedLangganan = null;
		showForm = true;
	}

	function handleEditLangganan(langganan: any) {
		selectedLangganan = langganan;
		showForm = true;
	}

	const deleteLangganan = useDeleteLangganan();
	const restoreLangganan = useRestoreLangganan();

	async function handleDeleteLangganan(requester: string) {
		const confirmed = await ConfirmAction({
			title: 'Hapus Langganan',
			text: `Apakah Anda yakin ingin menghapus pelangganan "${requester}"?`,
			icon: 'warning',
			confirmButtonText: 'Ya, hapus!'
		});
		if (confirmed) {
			$deleteLangganan.mutate(requester);
		}
	}

	async function handleRestoreLangganan(requester: string) {
		const confirmed = await ConfirmAction({
			title: 'Aktifkan Langganan',
			text: `Apakah Anda yakin ingin mengaktifkan pelangganan "${requester}"?`,
			icon: 'question',
			confirmButtonText: 'Ya, aktifkan!'
		});
		if (confirmed) {
			$restoreLangganan.mutate(requester);
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
			field: 'requester',
			label: 'Langganan',
			sortable: true,
			align: 'left',
			custom: (row: any) =>
				`${row.name ?? ''}${row.langgananIDType === 'PHONE' ? ` (${row.requester})` : ''}`
		},
		{
			field: 'address',
			label: 'Alamat'
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
	<title>Manage Langganan</title>
</svelte:head>

<DataTable
	title="Daftar Langganan"
	data={langganans}
	rowId={'requester'}
	total={totalLangganans}
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
			onclick={handleAddLangganan}>+ Tambah Pelanggan</button
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
				placeholder="Cari pelanggan..."
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
				onclick={() => handleEditLangganan(langganan)}
				class="text-primary-800 hover:bg-primary-100 dark:text-primary-100 dark:hover:bg-primary-100 dark:hover:text-primary-800 rounded p-1"
				title="Edit"
			>
				<Pencil size={16} />
			</button>
			<button
				type="button"
				onclick={() => handleDeleteLangganan(langganan.requester)}
				class="text-error-800 hover:bg-error-100 dark:text-error-100 dark:hover:bg-error-100 dark:hover:text-error-800 rounded p-1"
				disabled={$deleteLangganan.isPending && $deleteLangganan.variables === langganan.requester}
				title="Hapus"
			>
				{#if $deleteLangganan.isPending && $deleteLangganan.variables === langganan.requester}
					<span class="text-xs">...</span>
				{:else}
					<Trash2 size={16} />
				{/if}
			</button>
		{:else}
			<button
				type="button"
				onclick={() => handleRestoreLangganan(langganan.requester)}
				class="text-success-800 hover:bg-success-100 dark:text-success-100 dark:hover:bg-success-100 dark:hover:text-success-800 rounded p-1"
				disabled={$restoreLangganan.isPending && $restoreLangganan.variables === langganan.requester}
				title="Restore"
			>
				{#if $restoreLangganan.isPending && $restoreLangganan.variables === langganan.requester}
					<span class="text-xs">...</span>
				{:else}
					<RotateCcw size={16} />
				{/if}
			</button>
		{/if}
	{/snippet}
</DataTable>
<LanggananForm
	{showForm}
	{selectedLangganan}
	onClose={() => (showForm = false)}
	onSuccess={() => RefreshLangganans()}
/>
