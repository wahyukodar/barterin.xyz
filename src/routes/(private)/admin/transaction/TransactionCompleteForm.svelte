<script lang="ts">
	import { HandlePriceInput } from '$lib/helpers/input.helper';
	import { useCompleteTransaction } from '$lib/hooks/transaction.hook';
	import { useComboboxWarehouses } from '$lib/hooks/warehouse.hook';
	import { ConfirmAction } from '$lib/utils/alert.util';
	import { FormatPrice } from '$lib/utils/currency.util';

	// Props
	const { completeShowForm, onClose, onSuccess, selectedTransaction } = $props<{
		completeShowForm: boolean;
		onClose: () => void;
		onSuccess: () => void;
		selectedTransaction: any;
	}>();

	// State
	let cashAmount = $state('');
	let warehouseInput = $state('');
	let selectedWarehouse: string | null = null;
	let showWarehouseSuggestions = $state(false);
	let warehouseDebounceTimer: ReturnType<typeof setTimeout>;
	let debouncedWarehouse = $state('');

	const warehouseQuery = $derived(useComboboxWarehouses({ name: debouncedWarehouse }));
	const completeTransaction = useCompleteTransaction();

	// Debounce warehouse input
	$effect(() => {
		const currentInput = warehouseInput;
		clearTimeout(warehouseDebounceTimer);
		warehouseDebounceTimer = setTimeout(() => {
			debouncedWarehouse = currentInput;
		}, 300);

		return () => clearTimeout(warehouseDebounceTimer);
	});

	function handleSelectWarehouse(warehouse: { name: string; slugName: string }) {
		selectedWarehouse = warehouse.slugName;
		warehouseInput = warehouse.name;
		showWarehouseSuggestions = false;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!cashAmount || Number(cashAmount) <= 0) {
			alert('Cash amount harus diisi dan lebih besar dari 0');
			return;
		}

		const confirmed = await ConfirmAction({
			title: 'Selesaikan Transaksi',
			text: `Apakah Anda yakin ingin menyelesaikan transaksi ini?`,
			icon: 'question',
			confirmButtonText: 'Ya, Selesaikan!'
		});

		if (!confirmed) return;

        const payload: Record<string, any> = {
			invoiceCode: selectedTransaction.invoice[0].invoiceCode,
			cashAmount: Number(cashAmount),
		};

        const resetForm = () => {
			cashAmount = '';
		};

        if(selectedWarehouse){
            payload.warehouseSlugName = selectedWarehouse
        }

		$completeTransaction.mutate(
			{ data: payload },
			{
				onSuccess: () => {
					onSuccess();
                    resetForm();
					onClose();
				}
			}
		);
	}
</script>

{#if completeShowForm}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
		<div class="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl">
			<!-- Header -->
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold text-gray-900">Selesaikan Transaksi</h2>
				<button
					aria-label="Close"
					onclick={onClose}
					class="text-xl font-bold text-gray-400 hover:text-gray-600"
				>
					&times;
				</button>
			</div>

			<!-- Form -->
			<form onsubmit={handleSubmit} class="space-y-4">
				<!-- Cash Amount -->
				<div>
					<label for="cashAmount" class="block text-sm font-medium text-gray-700"
						>Jumlah Tunai <span class="text-red-500">*</span></label
					>
					<div class="relative w-full">
						<span class="absolute inset-y-0 left-3 flex items-center text-gray-500">Rp</span>
						<input
							id="price"
							type="text"
							inputmode="numeric"
							class="w-full rounded border py-2 pl-10 pr-3 text-gray-900"
							oninput={HandlePriceInput((val) => (cashAmount = val))}
							value={cashAmount ? FormatPrice(cashAmount) : ''}
							required
						/>
					</div>
				</div>

				<!-- Warehouse (Auto Suggest) -->
				<div class="relative">
					<label for="warehouse" class="block text-sm font-medium text-gray-700"
						>Gudang (Optional)</label
					>
					<input
						type="text"
						bind:value={warehouseInput}
						placeholder="Cari gudang..."
						oninput={() => (showWarehouseSuggestions = true)}
						class="mt-1 block w-full rounded border px-3 py-2 text-sm text-gray-900"
					/>
					{#if warehouseInput && showWarehouseSuggestions && $warehouseQuery.isSuccess}
						<ul
							class="absolute z-50 mt-1 max-h-40 w-full overflow-auto rounded border bg-white shadow-lg"
						>
							{#each $warehouseQuery.data?.data || [] as wh}
								<li>
									<button
										type="button"
										class="w-full px-3 py-2 text-left text-gray-900 hover:bg-gray-100"
										onclick={() => handleSelectWarehouse(wh)}
									>
										{wh.name}
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				</div>

				<!-- Submit Button -->
				<button
					type="submit"
					disabled={$completeTransaction.isPending}
					class="bg-surface-900/90 hover:bg-primary-900 rounded px-4 py-2 text-white disabled:opacity-50"
				>
					{#if $completeTransaction.isPending}
						<span class="animate-spin">⏳</span>
					{:else}
						Selesaikan Pesanan
					{/if}
				</button>
			</form>
		</div>
	</div>
{/if}
