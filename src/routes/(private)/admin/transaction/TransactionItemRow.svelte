<script lang="ts">
	import { useComboboxProductVariations } from '$lib/hooks/product-variation.hook';
	import { useComboboxProducts } from '$lib/hooks/product.hook';
	import { useStrataProduct, useStrataProductVariation } from '$lib/hooks/transaction.hook';
	import { AlertError } from '$lib/utils/alert.util';
	import { FormatCurrency } from '$lib/utils/currency.util';
	import { HandleQtyInput } from '$lib/utils/input.util';
	import { Trash2 } from 'lucide-svelte';

	const {
		item = $bindable(),
		items,
		onRemove,
		customer
	} = $props<{
		customer: string;
		items: any[];
		onRemove: () => void;
		item: {
			productName: string;
			productSlugName: string;
			variationName: string;
			variationSlugName: string;
			qty: number;
			variationPrice: number; // price product variation
			price: number; // price berubah ubah bisa dari product variation, strata product atau strata product variation
			subtotal: number;
		};
	}>();

	let showProductSuggestions = $state(false);
	let showProductVariationSuggestions = $state(false);

	let debouncedProductSearch = $state('');
	let productSeacrhDebounceTimer: ReturnType<typeof setTimeout>;

	let debouncedProductVariationSearch = $state('');
	let productVariationSeacrhDebounceTimer: ReturnType<typeof setTimeout>;

	let debouncedQty = $state(0);
	let qtyDebounceTimer: ReturnType<typeof setTimeout>;

	// State untuk tracking apakah variation yang dipilih valid
	let isValidVariation = $state(false);

	// Debounce qty input
	$effect(() => {
		const currentQty = item.qty;
		clearTimeout(qtyDebounceTimer);
		qtyDebounceTimer = setTimeout(() => {
			debouncedQty = currentQty;
		}, 500);

		return () => clearTimeout(qtyDebounceTimer);
	});

	// Debounce product search input
	$effect(() => {
		const currentProductSearch = item.productName;
		clearTimeout(productSeacrhDebounceTimer);
		productSeacrhDebounceTimer = setTimeout(() => {
			debouncedProductSearch = currentProductSearch;
		}, 500);

		return () => clearTimeout(productSeacrhDebounceTimer);
	});

	// Debounce product variation search input
	$effect(() => {
		const currentProductVariationSearch = item.variationName;
		clearTimeout(productVariationSeacrhDebounceTimer);
		productVariationSeacrhDebounceTimer = setTimeout(() => {
			debouncedProductVariationSearch = currentProductVariationSearch;
		}, 500);

		return () => clearTimeout(productVariationSeacrhDebounceTimer);
	});

	const productQuery = $derived(useComboboxProducts({ name: debouncedProductSearch }));
	const variationQuery = $derived(
		useComboboxProductVariations({
			productSlugName: item.productSlugName,
			name: debouncedProductVariationSearch
		})
	);

	const strataProductQuery = $derived(
		useStrataProduct({
			customer: customer,
			productSlugName: item.productSlugName,
			qty: debouncedQty
		})
	);

	const strataProductVariationQuery = $derived(
		useStrataProductVariation({
			customer: customer,
			productSlugName: item.productSlugName,
			productVariationSlugName: item.variationSlugName,
			qty: debouncedQty
		})
	);

	// Effect untuk validasi variation ketika variation query berubah
	$effect(() => {
		if ($variationQuery?.isSuccess && $variationQuery.data?.data) {
			// Cek apakah variation name yang diinput user ada di dalam hasil suggestion
			const validVariation = $variationQuery.data.data.find(
				(v: any) => v.name.toLowerCase() === item.variationName.toLowerCase()
			);
			
			isValidVariation = !!validVariation && item.variationSlugName !== '';
		} else {
			isValidVariation = item.variationSlugName !== '';
		}
	});

	$effect(() => {
		// kalau strata product ditaruh di atas
		// kemudian hasil strata produk ada data dan strata product variation ada data juga
		// maka nanti akan error
		// maka dari itu yang ditaruh paling atas adalah strata product variation
		// agar tidak kena error

		// hitung default subtotal dulu
		item.subtotal = item.price * item.qty;

		// Prioritas: Variation → Product
		if ($strataProductVariationQuery.isSuccess && $strataProductVariationQuery.data) {
			item.price = $strataProductVariationQuery.data.data;
		} else if ($strataProductQuery.isSuccess && $strataProductQuery.data) {
			item.price = $strataProductQuery.data.data;
		} else {
			item.price = item.variationPrice;
		}

		// update subtotal lagi setelah price diubah
		item.subtotal = item.price * item.qty;
	});

	function handleProductSearch() {
		showProductSuggestions = true;
		// reset productSlugName, variationSlugName, variationName, qty, total, subtotal, and grand total
		item.productSlugName = '';
		item.variationSlugName = '';
		item.variationName = '';
		item.qty = 0;
		item.price = 0;
		item.subtotal = 0;
		isValidVariation = false;
	}

	function handleVariationSearch() {
		showProductVariationSuggestions = true;
		// reset qty, total, subtotal, and grand total
		item.qty = 0;
		item.price = 0;
		item.subtotal = 0;
		// Reset validation ketika user mulai mengetik variation baru
		if (item.variationSlugName !== '') {
			isValidVariation = false;
			item.variationSlugName = '';
		}
	}

	function handleSelectProduct(param: { name: string; productSlugName: string }) {
		item.productName = param.name;
		item.productSlugName = param.productSlugName;
		showProductSuggestions = false;
		// Reset validation ketika product berubah
		isValidVariation = false;
	}

	function handleSelectProductVariation(param: {
		name: string;
		productVariationSlugName: string;
		price: number;
	}) {
		const existing = items.find(
			(i: any) =>
				i.productSlugName === item.productSlugName &&
				i.variationSlugName === param.productVariationSlugName
		);

		if (existing) {
			// Merge: tambahkan qty dan update subtotal
			// existing.qty = Number(existing.qty) + 1 || 1;
			// existing.subtotal = existing.qty * existing.price;
			// showProductVariationSuggestions = false;
			AlertError('Variasi produk sudah ada');
			return;
		}

		item.variationName = param.name;
		item.variationSlugName = param.productVariationSlugName;
		item.price = param.price;
		item.variationPrice = param.price;
		showProductVariationSuggestions = false;
		// Set sebagai valid variation
		isValidVariation = true;
	}

	// Function untuk handle blur pada input variation
	function handleVariationBlur() {
		setTimeout(() => {
			showProductVariationSuggestions = false;
		}, 200);
	}
</script>

<div class="mb-2">
	<!-- Mobile: Stack vertically, Desktop: All in one row -->
	<div class="flex flex-col gap-2 lg:flex-row">
		<!-- Produk -->
		<div class="relative min-w-0 flex-1">
			<label for="product" class="mb-1 block text-sm font-medium text-gray-900">Produk</label>
			<input
				class="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
				bind:value={item.productName}
				oninput={() => handleProductSearch()}
				onblur={() => {}}
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
					}
				}}
				required
				placeholder="Cari produk..."
			/>

			{#if item.productName && showProductSuggestions && $productQuery.isSuccess && $productQuery.data?.data.length > 0}
				<ul
					class="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
				>
					{#each $productQuery.data?.data || [] as prod}
						<li>
							<button
								type="button"
								class="w-full p-3 text-left text-sm text-gray-800 first:rounded-t-md last:rounded-b-md hover:bg-gray-100"
								onclick={() =>
									handleSelectProduct({
										name: prod.name,
										productSlugName: prod.slugName
									})}
							>
								{prod.name}
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<!-- Variasi -->
		{#if item.productSlugName}
			<div class="relative min-w-0 flex-1">
				<label for="variation" class="mb-1 block text-sm font-medium text-gray-900">Varian</label>
				<input
					class="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 {!isValidVariation && item.variationName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}"
					bind:value={item.variationName}
					oninput={() => handleVariationSearch()}
					onblur={() => handleVariationBlur()}
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
						}
					}}
					required
					placeholder="Pilih varian..."
				/>

				{#if item.variationName && showProductVariationSuggestions && $variationQuery?.isSuccess && $variationQuery.data?.data.length > 0}
					<ul
						class="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
					>
						{#each $variationQuery.data?.data || [] as v}
							<li>
								<button
									type="button"
									class="w-full p-3 text-left text-sm text-gray-800 first:rounded-t-md last:rounded-b-md hover:bg-gray-100"
									onclick={() =>
										handleSelectProductVariation({
											name: v.name,
											productVariationSlugName: v.slugName,
											price: v.price
										})}
								>
									{v.name}
								</button>
							</li>
						{/each}
					</ul>
				{/if}

				<!-- Error message untuk invalid variation -->
				{#if !isValidVariation && item.variationName && !showProductVariationSuggestions}
					<p class="mt-1 text-xs text-red-600">
						Varian tidak valid. Silakan pilih dari daftar yang tersedia.
					</p>
				{/if}
			</div>

			<!-- Qty - Hanya muncul jika variation valid -->
			{#if isValidVariation}
				<div class="w-full lg:w-24">
					<label for="qty" class="mb-1 block text-sm font-medium text-gray-900">Qty</label>
					<input
						type="number"
						min="0"
						class="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
						oninput={HandleQtyInput((val) => (item.qty = val))}
						value={item.qty}
						placeholder="0"
					/>
				</div>

				{#if item.qty && item.qty > 0}
					<!-- @ Price -->
					<div class="w-full lg:w-32">
						<label for="price" class="mb-1 block text-sm font-medium text-gray-900">@ Price</label>
						<div class="w-full rounded border bg-gray-100 px-3 py-2 text-sm text-gray-700">
							{FormatCurrency(item.price)}
						</div>
					</div>

					<!-- Subtotal -->
					<div class="w-full lg:w-32">
						<label for="subtotal" class="mb-1 block text-sm font-medium text-gray-900">Subtotal</label
						>
						<div
							class="bg-secondary-600 w-full rounded border px-3 py-2 text-sm font-medium text-white"
						>
							{FormatCurrency(item.subtotal)}
						</div>
					</div>
				{/if}
			{/if}

			<!-- Remove button -->
			<div class="flex w-full lg:w-auto lg:items-end">
				<button
					type="button"
					onclick={() => onRemove()}
					disabled={items.length === 1}
					class="flex w-full items-center justify-center gap-2 rounded border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent lg:mb-0 lg:h-[42px] lg:w-auto"
					title="Hapus"
				>
					<Trash2 size={16} />
					<span class="lg:hidden">Hapus Item</span>
				</button>
			</div>
		{/if}
	</div>
</div>