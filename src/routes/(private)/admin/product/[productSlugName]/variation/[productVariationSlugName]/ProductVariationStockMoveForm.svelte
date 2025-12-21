<script lang="ts">
	import { useMoveProductVariationStock } from '$lib/hooks/product-variation-stock.hook';
	import { useComboboxWarehouses } from '$lib/hooks/warehouse.hook';
	import { HandleQtyInput } from '$lib/utils/input.util';

	const {
		productSlugName,
		productVariationSlugName,
		fromWarehouseSlugName,
		fromWarehouseName,
		fromWarehouseQty,
		showMoveForm,
		onClose,
		onSuccess
	} = $props<{
		onClose: () => void;
		onSuccess: () => void;
		showMoveForm: boolean;
		productSlugName: string;
		productVariationSlugName: string;
		fromWarehouseName: string;
		fromWarehouseSlugName: string;
		fromWarehouseQty: number;
	}>();

	// State form
	let toWarehouseSlugName = $state('');
	let quantity = $state('');
	let note = $state('');

	// Query gudang
	const warehouseQuery = $derived(useComboboxWarehouses({}));

	// Mutasi move stock
	const moveStock = useMoveProductVariationStock();

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!toWarehouseSlugName || !quantity || !fromWarehouseSlugName) return;

		const data: any = {
			qtyStock: Number(quantity)
		};
		if (note.trim() !== '') {
			data.note = note.trim();
		}

		$moveStock.mutate(
			{
				productSlugName,
				productVariationSlugName,
				fromWarehouseSlugName,
				toWarehouseSlugName,
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
		toWarehouseSlugName = '';
		quantity = '';
		note = '';
	}
</script>

{#if showMoveForm}
	<div class="bg-surface-900/90 fixed inset-0 z-50 flex items-center justify-center p-4">
		<div class="flex max-h-[90vh] w-full max-w-lg flex-col rounded-lg bg-white shadow-lg">
			<!-- Header -->
			<div class="flex items-center justify-between border-b px-6 py-4">
				<h2 class="text-lg font-semibold text-gray-900">Pindahkan Stok Variasi Produk</h2>
				<button
					onclick={onClose}
					class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">✕</button
				>
			</div>

			<!-- Form -->
			<div class="flex-1 overflow-y-auto px-6 py-4">
				<form onsubmit={handleSubmit} class="space-y-4">
					<!-- From Warehouse -->
					<div>
						<label for="fromWarehouse" class="mb-1 block text-sm font-medium text-gray-900"
							>Dari Gudang</label
						>
						<div id="fromWarehouse" class="bg-surface-800 text-surface-100 w-full px-3 py-2">
							{fromWarehouseName} (stok: {fromWarehouseQty})
						</div>
					</div>

					<!-- To Warehouse -->
					<div>
						<label for="toWarehouse" class="mb-1 block text-sm font-medium text-gray-900"
							>Ke Gudang</label
						>
						<select
							id="toWarehouse"
							bind:value={toWarehouseSlugName}
							class="w-full rounded border px-3 py-2 text-gray-900"
							required
						>
							<option value="" disabled selected>Pilih Gudang Tujuan</option>
							{#if $warehouseQuery.isSuccess}
								{#each $warehouseQuery.data.data as w}
									{#if w.slugName !== fromWarehouseSlugName}
										<option value={w.slugName}>{w.name}</option>
									{/if}
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
						<label for="quantity" class="mb-1 block text-sm font-medium text-gray-900"
							>Quantity</label
						>
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
							disabled={$moveStock.isPending}
							class="bg-surface-900/90 hover:bg-primary-900 rounded px-4 py-2 text-white disabled:opacity-50"
						>
							{#if $moveStock.isPending}
								<span class="animate-spin">⏳</span>
							{:else}
								Pindahkan
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}
