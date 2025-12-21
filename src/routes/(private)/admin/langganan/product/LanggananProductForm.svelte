<script lang="ts">
	import {
		useCreateLanggananProduct,
		useUpdateLanggananProduct
	} from '$lib/hooks/langganan-product.hook';
	import { useComboboxLangganans } from '$lib/hooks/langganan.hook';
	import { useComboboxProducts } from '$lib/hooks/product.hook';

	const {
		showForm,
		selectedLanggananProduct = null,
		onClose,
		onSuccess
	} = $props<{
		showForm: boolean;
		selectedLanggananProduct?: any;
		onClose: () => void;
		onSuccess: () => void;
	}>();

	// For debouncing search
	let debouncedLanggananSearch = $state('');
	let showSuggestionsLangganan = $state(false);
	let debouncedProductSearch = $state('');
	let showSuggestionsProduct = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout>;

	let requester = $state(selectedLanggananProduct?.requester || '');
	let productSlugName = $state(selectedLanggananProduct?.productSlugName || '');
	let price = $state(selectedLanggananProduct?.price);
	let minQty = $state(selectedLanggananProduct?.minQty);

	let searchLangganan = $state(selectedLanggananProduct?.requester || '');
	let searchProduct = $state(selectedLanggananProduct?.productSlugName || '');

	// Hooks
	const createLanggananProduct = useCreateLanggananProduct();
	const updateLanggananProduct = useUpdateLanggananProduct();

	const langganansQuery = $derived(useComboboxLangganans({ requester: debouncedLanggananSearch }));
	const productsQuery = $derived(useComboboxProducts({ name: debouncedProductSearch }));

	// Debounce search input
	$effect(() => {
		if (!selectedLanggananProduct) {
			// hanya buka suggestion kalau bukan mode update
			showSuggestionsLangganan = true;
			showSuggestionsProduct = true;
			clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => {
				debouncedLanggananSearch = searchLangganan;
				showSuggestionsLangganan = true;
				debouncedProductSearch = searchProduct;
				showSuggestionsProduct = true;
			}, 500);
		} else {
			debouncedLanggananSearch = '';
			showSuggestionsLangganan = false;
			debouncedProductSearch = '';
			showSuggestionsProduct = false;
		}

		return () => clearTimeout(debounceTimer);
	});

	$effect(() => {
		if (selectedLanggananProduct) {
			requester = selectedLanggananProduct.requester;
			productSlugName = selectedLanggananProduct.productSlugName;
			price = selectedLanggananProduct.price;
			minQty = selectedLanggananProduct.minQty;
		} else {
			requester = '';
			productSlugName = '';
			price = null;
			minQty = null;
		}
	});

	function handleSubmit(event: Event) {
		event.preventDefault();

		const payload: Record<string, any> = { price };

		const resetForm = () => {
			requester = '';
			productSlugName = '';
			price = 0;
			minQty = 0;
		};

		if (selectedLanggananProduct) {
			$updateLanggananProduct.mutate(
				{
					requester: selectedLanggananProduct.requester,
					productSlugName: selectedLanggananProduct.productSlugName,
					minQty: selectedLanggananProduct.minQty,
					data: payload
				},
				{
					onSuccess: () => {
						onSuccess();
						resetForm();
						onClose();
					}
				}
			);
		} else {
			$createLanggananProduct.mutate(payload, {
				onSuccess: () => {
					onSuccess();
					resetForm();
					onClose();
				}
			});
		}
	}
</script>

{#if showForm}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<div class="dark:bg-surface-800 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
			<h2 class="mb-4 text-lg font-bold">
				{selectedLanggananProduct ? 'Edit Langganan Produk' : 'Tambah Langganan Produk'}
			</h2>

			<form onsubmit={handleSubmit} class="space-y-4">
				<!-- Combobox Langganan -->
				<div>
					<label for="pelanggan" class="block text-sm font-medium">Pelanggan</label>
					<input
						type="text"
						placeholder="Cari pelanggan..."
						class="w-full rounded border p-2"
						bind:value={searchLangganan}
					/>
					{#if $langganansQuery.data}
						<select bind:value={requester} class="mt-1 w-full rounded border p-2">
							<option value="">Pilih pelanggan...</option>
							{#each $langganansQuery.data as l}
								<option value={l.requester}>{l.name}</option>
							{/each}
						</select>
					{/if}
				</div>

				<!-- Combobox Produk -->
				<div>
					<label for="product" class="block text-sm font-medium">Produk</label>
					<input
						type="text"
						placeholder="Cari produk..."
						class="w-full rounded border p-2"
						bind:value={searchProduct}
					/>
					{#if $productsQuery.data}
						<select bind:value={productSlugName} class="mt-1 w-full rounded border p-2">
							<option value="">Pilih produk...</option>
							{#each $productsQuery.data as p}
								<option value={p.slugName}>{p.name}</option>
							{/each}
						</select>
					{/if}
				</div>

				<div>
					<label for="price" class="block text-sm font-medium">Harga</label>
					<input type="number" bind:value={price} class="w-full rounded border p-2" required />
				</div>

				<div>
					<label for="minQty" class="block text-sm font-medium">Min Qty</label>
					<input type="number" bind:value={minQty} class="w-full rounded border p-2" required />
				</div>

				<!-- Actions -->
				<div class="flex justify-end gap-2 pt-4">
					<button
						type="button"
						onclick={onClose}
						class="hover:bg-error-900 hover:text-error-100 text-surface-900 rounded border px-4 py-2"
						>Batal</button
					>
					<button
						type="submit"
						disabled={$createLanggananProduct.isPending || $updateLanggananProduct.isPending}
						class="bg-surface-900/90 hover:bg-primary-900 rounded px-4 py-2 text-white disabled:opacity-50"
					>
						{#if $createLanggananProduct.isPending || $updateLanggananProduct.isPending}
							<span class="animate-spin">⏳</span>
						{:else}
							{selectedLanggananProduct ? 'Simpan Perubahan' : 'Tambah Langganan Product'}
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
