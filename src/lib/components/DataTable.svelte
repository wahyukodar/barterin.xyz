<script lang="ts">
	import { goto } from '$app/navigation';
	import { STATUS_ACTIVE } from '$lib/constants/status.constant';
	import { GetGoogleMapsLink } from '$lib/utils/map.util';
	import { Pagination } from '@skeletonlabs/skeleton-svelte';
	import {
		ArrowLeftToLine,
		ArrowLeft as IconArrowLeft,
		ArrowRight as IconArrowRight,
		Ellipsis as IconEllipsis,
		ChevronLeft as IconFirst,
		ChevronRight as IconLast,
		ArrowUpDown as IconSort
	} from 'lucide-svelte';

	export let rowId: string;
	export let title: string;
	export let showAction: boolean = true;
	export let detailTitle: string | null = null;
	export let backLink: string | null = null;
	export let data: any[] = [];
	export let total: number = 0;
	export let usePagination: boolean = true;
	export let page: number = 1;
	export let pageSize: number = 10;
	export let totalPages: number = 1;
	export let loading: boolean = false;
	export let error: Error | string | null = null;
	export let searchTerm: string = '';
	export let columns: {
		field: string;
		fieldIsDefault?: (row: any) => any;
		fieldSort?: string;
		label: string;
		sortable?: boolean;
		format?: (val: any, row: any) => any;
		custom?: (row: any) => any;
		className?: (row: any) => string;
		badges?: (row: any) => any;
		align?: string;
	}[] = [];

	// Function props optional
	export let getSortDirection: (field: string) => string | null = () => null;
	export let toggleSort: (field: string) => void = () => {};
	export let onPageChange: (e: { page: number }) => void = () => {};
	export let onPageSizeChange: (e: { pageSize: number }) => void = () => {};
	export let headerAction: () => any = () => null;
	export let searchAction: () => any = () => null;
	export let isActiveAction: () => any = () => null;
	export let actions: (row: any) => any = () => null;
</script>

<div class="overflow-hidden rounded-xl border shadow-xl">
	<!-- Header -->
	<div class="bg-surface-100/90 dark:bg-surface-900/90 flex items-center gap-5 px-6 py-4">
		{#if backLink}
			<button
				class="bg-surface-200 dark:bg-surface-400 text-surface-900 dark:text-surface-900 rounded-lg p-2"
				onclick={() => goto(backLink)}
				title="Back"
			>
				<ArrowLeftToLine size={20} />
			</button>
		{/if}
		<h1 class="text-lg font-semibold md:text-xl">
			{title}&nbsp;{#if detailTitle}{detailTitle}{/if}
		</h1>
	</div>

	<div
		class="bg-surface-100/90 dark:bg-surface-900/90 flex items-center justify-end gap-5 px-6 py-4"
	>
		{@render headerAction?.()}
	</div>

	<!-- Search + Info -->
	<div
		class="bg-surface-100/90 dark:bg-surface-900/90 flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
	>
		{@render searchAction?.()}
		{@render isActiveAction?.()}
	</div>

	<!-- Body -->
	<div class="overflow-x-auto p-6">
		{#if loading}
			<div class="flex justify-center py-8">
				<div
					class="border-surface-600 h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"
				></div>
			</div>
		{:else if error}
			<div class="bg-error-100 text-error-800 rounded p-4">
				<pre class="mt-2 text-xl">{typeof error === 'string' ? error : error.message}</pre>
			</div>
		{:else}
			<div class="table-wrap">
				<table class="table w-full caption-bottom border-collapse">
					<thead class="hidden md:table-header-group">
						<tr>
							{#each columns as col}
								<th
									class="text-surface-900 dark:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-900 !py-4"
									class:text-right={col.align === 'right'}
									class:text-left={col.align === 'left'}
									class:text-center={col.align !== 'left' && col.align !== 'right'}
								>
									{#if col.sortable}
										<button
											type="button"
											class={`hover:bg-surface-100 dark:hover:bg-surface-900 flex w-full items-center gap-1 rounded ${
												col.align === 'right'
													? 'justify-end'
													: col.align === 'left'
														? 'justify-start'
														: 'justify-center'
											}`}
											onclick={() => toggleSort?.(col.fieldSort ?? col.field)}
										>
											{col.label}
											<IconSort class="size-3" />
											{#if getSortDirection?.(col.fieldSort ?? col.field) === 'asc'}
												<span class="text-primary-500 text-xs">↑</span>
											{:else if getSortDirection?.(col.fieldSort ?? col.field) === 'desc'}
												<span class="text-primary-500 text-xs">↓</span>
											{/if}
										</button>
									{:else}
										<span
											class={`block w-full ${
												col.align === 'right'
													? 'text-right'
													: col.align === 'left'
														? 'text-left'
														: 'text-center'
											}`}
										>
											{col.label}
										</span>
									{/if}
								</th>
							{/each}
							{#if showAction}
								<th
									class="text-surface-900 dark:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-900 !px-2 !text-right"
									>Aksi</th
								>
							{/if}
						</tr>
					</thead>
					<tbody class="[&>tr]:hover:preset-tonal-primary divide-y">
						{#if data.length > 0}
							{#each data as row (row[rowId])}
								<tr
									class="bg-surface-100 dark:bg-surface-900 mb-4 block rounded-lg border p-4 shadow-md md:mb-0 md:table-row md:border-0 md:bg-transparent md:p-0 md:shadow-none md:dark:bg-transparent"
								>
									{#each columns as col}
										<td
											data-label={col.label}
											class={`flex flex-col gap-1 px-4 py-3 before:mb-1 before:font-semibold before:content-[attr(data-label)] 
													sm:flex-row sm:items-start sm:justify-between
													md:table-cell md:before:hidden
													${
														col.align === 'right'
															? 'md:text-right'
															: col.align === 'left'
																? 'md:text-left'
																: 'md:text-center'
													}
													${col.className ? col.className(row) : ''}
												`}
										>
											{#if col.format}
												{col.format(row[col.field], row)}
											{:else if col.custom}
												{col.custom(row)}
											{:else}
												{row[col.field]}
											{/if}
											{#if col.badges}
												{#each col.badges(row) as badge}
													<span
														class={`ml-2 rounded px-2 py-1 text-xs font-semibold ${badge.className}`}
													>
														{badge.text}
													</span>
												{/each}
											{/if}

											{#if col.fieldIsDefault && col.fieldIsDefault(row) === STATUS_ACTIVE}
												<span
													class="bg-surface-500 ml-2 rounded px-2 py-1 text-xs font-semibold text-white"
												>
													Default
												</span>
											{/if}
											{#if col.field === 'address' && row['latitude'] && row['longitude']}
												{#if row['cityType']}
													{row['cityType']}
												{/if}
												{#if row['cityName']}
													{row['cityName']}
												{/if}
												<a
													href={GetGoogleMapsLink({
														latitude: row['latitude'],
														longitude: row['longitude']
													})}
													target="_blank"
													rel="noopener noreferrer"
													class="text-secondary-900 dark:text-secondary-100 ml-2 hover:underline"
												>
													📍 Map
												</a>
											{/if}
										</td>
									{/each}
									<td
										data-label="Aksi"
										class="flex justify-between px-4 py-4 before:font-semibold before:content-[attr(data-label)] md:table-cell md:flex-none md:justify-end md:text-right before:md:hidden"
									>
										{#if actions}
											{@render actions({ row })}
										{/if}
									</td>
								</tr>
							{/each}
						{:else}
							<tr>
								<td
									colspan={columns.length + 1}
									class="text-error-800 dark:text-error-200 py-8 text-center text-2xl"
								>
									{#if searchTerm}
										Tidak ada data untuk "{searchTerm}"
									{:else}
										Tidak ada data
									{/if}
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		{/if}

		{#if usePagination}
			<!-- Footer -->
			<footer
				class="mt-6 flex flex-col gap-4 border-t border-gray-200 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between"
			>
				<div class="flex items-center justify-center gap-2">
					<span>Tampilkan</span>
					<select
						class="inline-block min-w-[60px] rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
						bind:value={pageSize}
						onchange={() => onPageSizeChange?.({ pageSize })}
					>
						{#each [5, 10, 25] as v}
							<option value={v}>{v}</option>
						{/each}
					</select>
					<span>per halaman</span>
				</div>

				<div class="flex justify-center gap-4 font-medium sm:justify-end">
					<span>Total: {total}</span>
					<span>Halaman: {page} dari {totalPages}</span>
				</div>

				{#if totalPages > 1}
					<div class="flex justify-center">
						<Pagination
							{data}
							{page}
							{onPageChange}
							{pageSize}
							{onPageSizeChange}
							siblingCount={1}
							count={total}
						>
							{#snippet labelEllipsis()}<IconEllipsis class="size-4" />{/snippet}
							{#snippet labelNext()}<IconArrowRight class="size-4" />{/snippet}
							{#snippet labelPrevious()}<IconArrowLeft class="size-4" />{/snippet}
							{#snippet labelFirst()}<IconFirst class="size-4" />{/snippet}
							{#snippet labelLast()}<IconLast class="size-4" />{/snippet}
						</Pagination>
					</div>
				{/if}
			</footer>
		{/if}
	</div>
</div>
