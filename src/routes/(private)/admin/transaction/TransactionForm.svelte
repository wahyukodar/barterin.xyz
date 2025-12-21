<script lang="ts">
	import { useComboboxLangganans } from '$lib/hooks/langganan.hook';
	import { useCreateTransaction } from '$lib/hooks/transaction.hook';
	import { ConfirmAction } from '$lib/utils/alert.util';
	import { FormatCurrency } from '$lib/utils/currency.util';
	import TransactionItemRow from './TransactionItemRow.svelte';

	const { showForm, onClose, onSuccess } = $props<{
		showForm: boolean;
		onClose: () => void;
		onSuccess: () => void;
	}>();

	// state customer
	let customer = $state('');
	let customerDisplay = $state('');
	let showCustomerSuggestions = $state(false);
	let totalListCustomer = $state(0);

	let debouncedCustomer = $state('');
	let customerDebounceTimer: ReturnType<typeof setTimeout>;
	const customerQuery = $derived(useComboboxLangganans({ requester: debouncedCustomer }));

	// Debounce search input
	$effect(() => {
		const currentCustomerSearch = customer;
		clearTimeout(customerDebounceTimer);
		customerDebounceTimer = setTimeout(() => {
			debouncedCustomer = currentCustomerSearch;
		}, 500);

		return () => clearTimeout(customerDebounceTimer);
	});

	function handleUnSelectCustomer() {
		customer = '';
		customerDisplay = '';
		items.splice(0, items.length);
	}

	function handleSelectCustomer(param: {
		name: string;
		requester: string;
		langgananIDType: string;
	}) {
		customer = param.requester;
		customerDisplay = param.name;
		if (param.langgananIDType == 'PHONE') {
			customerDisplay += ` (${param.requester})`;
		}
		showCustomerSuggestions = false;
		addRow();
	}

	$effect(() => {
		if ($customerQuery.isSuccess && $customerQuery.data) {
			totalListCustomer = $customerQuery.data?.data.length;
		}
	});

	async function handleGuestCustomer() {
		if (totalListCustomer == 0) {
			const confirmed = await ConfirmAction({
				title: 'Customer Baru',
				text: `Apakah "${customer}" adalah customer baru?`,
				icon: 'question',
				confirmButtonText: 'Benar, bukan langganan!'
			});
			if (confirmed) {
				customerDisplay = customer;
				addRow();
			}
		}
	}

	// transaksi
	let items = $state<any[]>([]);

	$effect(() => {
		if (items.length > 0) {
			const last = items[items.length - 1];
			if (last.productSlugName && last.variationSlugName && last.qty > 0) {
				const alreadyHasEmpty = items.some(
					(i, idx) => idx === items.length - 1 && !i.productSlugName && !i.variationSlugName
				);
				if (!alreadyHasEmpty) addRow();
			}
		}
	});

	function addRow() {
		items.push({
			productName: '',
			productSlugName: '',
			variationName: '',
			variationSlugName: '',
			qty: 0,
			price: 0,
			subtotal: 0
		});
	}

	function removeRow(idx: number) {
		items.splice(idx, 1);
	}

	const createTransaction = useCreateTransaction();

	function handleSubmit(e: Event) {
		e.preventDefault();

		// filter hanya row yang valid
		const validItems = items.filter((i) => i.productSlugName && i.variationSlugName && i.qty > 0);

		const payload = {
			customer: customer,
			transactions: validItems.map((i) => ({
				productSlugName: i.productSlugName,
				productVariationSlugName: i.variationSlugName,
				qty: i.qty
			}))
		};

		$createTransaction.mutate(payload, {
			onSuccess: () => {
				onSuccess();
				onClose();
			}
		});
	}

	// grandTotal derived
	const grandTotal = $derived(items.reduce((acc, cur) => acc + (cur.subtotal || 0), 0));
</script>

{#if showForm}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
		<div
			class="flex max-h-[95vh] w-full max-w-xs flex-col rounded-lg bg-white shadow-xl sm:max-h-[90vh] sm:max-w-lg md:max-w-2xl lg:max-w-4xl"
		>
			<!-- Header -->
			<div class="flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4">
				<h2 class="text-base font-semibold text-gray-900 sm:text-lg">Buat Transaksi</h2>
				<button
					aria-label="Close"
					onclick={onClose}
					class="touch-manipulation rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<!-- Scrollable Form Content -->
			<div
				class="min-h-[300px] flex-1 overflow-y-auto px-4 py-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:min-h-[400px] sm:px-6 [&::-webkit-scrollbar]:hidden"
			>
				<form class="space-y-4">
					<!-- Customer -->
					<div class="relative mb-4">
						<label for="customer" class="mb-1 block text-sm font-medium text-gray-900"
							>Customer</label
						>

						{#if customerDisplay}
							<button
								type="button"
								onclick={() => handleUnSelectCustomer()}
								class="w-full touch-manipulation rounded border bg-gray-800 px-3 py-2 text-left text-sm text-white transition-colors hover:bg-gray-700"
							>
								<span class="block truncate">{customerDisplay}</span>
							</button>
						{/if}

						{#if customerDisplay == ''}
							<input
								bind:value={customer}
								class="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
								placeholder="Cari customer..."
								oninput={() => (showCustomerSuggestions = true)}
								onblur={() => handleGuestCustomer()}
								onkeydown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										handleGuestCustomer();
									}
								}}
							/>
						{/if}

						{#if customer && showCustomerSuggestions && $customerQuery.isSuccess}
							<ul
								class="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
							>
								{#each $customerQuery.data?.data || [] as cust}
									<li>
										<button
											type="button"
											class="w-full touch-manipulation p-3 text-left text-sm text-gray-800 first:rounded-t-md last:rounded-b-md hover:bg-gray-100"
											onclick={() =>
												handleSelectCustomer({
													name: cust.name,
													requester: cust.requester,
													langgananIDType: cust.langgananIDType
												})}
										>
											<div class="truncate">
												{cust.name}
												{cust.langgananIDType == 'PHONE' ? `(${cust.requester})` : ''}
											</div>
										</button>
									</li>
								{/each}
							</ul>
						{/if}
					</div>

					<!-- Produk Rows -->
					<div class="space-y-3">
						{#each items as _, idx}
							<div class="rounded-lg border p-3 sm:border-0 sm:p-0">
								<TransactionItemRow
									{customer}
									bind:item={items[idx]}
									{items}
									onRemove={() => removeRow(idx)}
								/>
							</div>
						{/each}
					</div>
				</form>
			</div>

			<!-- Footer: Grand Total + Button -->
			<div class="shrink-0 border-t bg-gray-50 px-4 py-4 sm:px-6">
				<!-- Grand Total -->
				{#if grandTotal > 0}
					<div class="mb-4">
						<div class="flex items-center justify-between sm:justify-end">
							<span class="font-semibold text-gray-700 sm:hidden">Grand Total:</span>
							<div class="text-right">
								<p class="mb-1 hidden font-semibold text-gray-700 sm:block">Grand Total</p>
								<div
									class="bg-primary-900 min-w-[120px] rounded px-3 py-2 text-center text-sm font-semibold text-white sm:text-base"
								>
									{FormatCurrency(grandTotal)}
								</div>
							</div>
						</div>
					</div>
				{/if}

				<!-- Button Full Width -->
				<button
					type="submit"
					class="bg-surface-900/90 hover:bg-primary-900 w-full touch-manipulation rounded-lg px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
					onclick={handleSubmit}
				>
					Buat Invoice
				</button>
			</div>
		</div>
	</div>
{/if}
