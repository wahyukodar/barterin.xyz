<script lang="ts">
	import { useUpsertProductVariationStock } from '$lib/hooks/product-variation-stock.hook';
	import { useComboboxWarehouses } from '$lib/hooks/warehouse.hook';
	import { HandleQtyInput } from '$lib/utils/input.util';

	const { productSlugName, productVariationSlugName, showForm, onClose, onSuccess } = $props<{
		onClose: () => void;
		onSuccess: () => void;
		showForm: boolean;
		productSlugName: string;
        productVariationSlugName: string;
	}>();

	// State form
	let warehouseName = $state('');
	let quantity = $state('');
	let operation = $state<'add' | 'subtract'>('add');
	let note = $state('');

	// Queries (langsung load semua, nggak pakai debounce)
	const warehouseQuery = $derived(useComboboxWarehouses({}));

	// Mutasi upsert stock
	const upsertStock = useUpsertProductVariationStock();

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!warehouseName || !quantity) return;

		const data: any = {
			qtyStock: Number(quantity),
			operation
		};
		if (note.trim() !== '') {
			data.note = note.trim();
		}

		$upsertStock.mutate(
			{
				productSlugName,
				productVariationSlugName: productVariationSlugName,
				warehouseSlugName: warehouseName,
				data
			},
			{
				onSuccess: () => {
					onSuccess();
					resetForm();
					onClose();
				}
			}
		);
	}

	function resetForm() {
		warehouseName = '';
		quantity = '';
		operation = 'add';
		note = '';
	}
</script>

{#if showForm}
	<div class="bg-surface-900/90 fixed inset-0 z-50 flex items-center justify-center p-4">
		<div class="flex max-h-[90vh] w-full max-w-lg flex-col rounded-lg bg-white shadow-lg">
			<!-- Header -->
			<div class="flex items-center justify-between border-b px-6 py-4">
				<h2 class="text-lg font-semibold text-gray-900">Update Stok Variasi Produk</h2>
				<button
					onclick={onClose}
					class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">✕</button
				>
			</div>

			<!-- Form -->
			<div class="flex-1 overflow-y-auto px-6 py-4">
				<form onsubmit={handleSubmit} class="space-y-4">
					<!-- Warehouse Dropdown -->
					<div>
						<label for="warehouse" class="mb-1 block text-sm font-medium text-gray-900">Gudang</label>
						<select
							id="warehouse"
							bind:value={warehouseName}
							class="w-full rounded border px-3 py-2 text-gray-900"
							required
						>
							<option value="" disabled selected>Pilih Gudang</option>
							{#if $warehouseQuery.isSuccess}
								{#each $warehouseQuery.data.data as w}
									<option value={w.slugName}>{w.name}</option>
								{/each}
							{:else if $warehouseQuery.isPending}
								<option disabled>Loading...</option>
							{:else}
								<option disabled>Tidak ada gudang</option>
							{/if}
						</select>
					</div>

					<!-- Quantity -->
					<div>
						<label for="quantity" class="mb-1 block text-sm font-medium text-gray-900">Quantity</label>
						<input
							id="quantity"
							type="number"
							min="1"
							oninput={HandleQtyInput((val) => (quantity = val))}
							value={quantity}
							class="w-full rounded border px-3 py-2 text-gray-900"
							required
						/>
					</div>

					<!-- Operation -->
					<div>
						<label for="operation" class="mb-1 block text-sm font-medium text-gray-900">Operasi</label>
						<select id="operation" bind:value={operation} class="w-full rounded border px-3 py-2 text-gray-900">
							<option value="add">Penambahan Stok (+)</option>
							<option value="subtract">Pengurangan Stok (-)</option>
						</select>
					</div>

					<!-- Note -->
					<div>
						<label for="note" class="mb-1 block text-sm font-medium text-gray-900"
							>Catatan (opsional)</label
						>
						<textarea
							id="note"
							bind:value={note}
							class="w-full rounded border px-3 py-2 text-gray-900"
						></textarea>
					</div>

					<!-- Actions -->
					<div class="flex justify-end gap-2 pt-4">
						<button
							type="button"
							onclick={onClose}
							class="rounded border px-4 py-2 text-gray-700 hover:bg-gray-100"
						>
							Batal
						</button>
						<button
							type="submit"
							disabled={$upsertStock.isPending}
							class="bg-surface-900/90 hover:bg-primary-900 rounded px-4 py-2 text-white disabled:opacity-50"
						>
							{#if $upsertStock.isPending}
								<span class="animate-spin">⏳</span>
							{:else}
								Simpan
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}
