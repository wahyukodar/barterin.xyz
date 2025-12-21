<script lang="ts">
	import { UOMType } from '$lib/constants/uom-type.constant';
	import { HandlePriceInput } from '$lib/helpers/input.helper';
	import { useCreateProduct, useUpdateProduct } from '$lib/hooks/product.hook';
	import { FormatPrice } from '$lib/utils/currency.util';
	import { HandleQtyInput } from '$lib/utils/input.util';

	const {
		showForm,
		selectedProduct = null,
		onClose,
		onSuccess
	} = $props<{
		showForm: boolean;
		selectedProduct?: any;
		onClose: () => void;
		onSuccess: () => void;
	}>();

	let name = $state(selectedProduct?.name || '');
	let basePrice = $state(selectedProduct?.basePrice?.toString() || '');
	let sku = $state('');
	let baseUom = $state(selectedProduct?.baseUom || '');
	let baseQtyPerUOM = $state(selectedProduct?.baseQtyPerUOM?.toString() || '');
	let baseQtyStock = $state(selectedProduct?.baseQtyStock?.toString() || '');
	let uomSearch = $state(selectedProduct?.baseUom || '');
	let isDropdownOpen = $state(false);

	const createProduct = useCreateProduct();
	const updateProduct = useUpdateProduct();

	let filteredUOM = $state<UOMType[]>([]);

	$effect(() => {
		// Update filteredUOM setiap uomSearch berubah
		filteredUOM = uomSearch
			? UOMType.filter((type) => type.toLowerCase().includes(uomSearch.toLowerCase()))
			: [];
	});

	$effect(() => {
		if (selectedProduct) {
			name = selectedProduct.name;
			basePrice = selectedProduct.basePrice?.toString() || '';
			baseUom = selectedProduct.baseUom || '';
			baseQtyPerUOM = selectedProduct.baseQtyPerUom?.toString() || '';
			uomSearch = selectedProduct.baseUom || '';
		} else {
			name = '';
			basePrice = '';
			sku = '';
			baseUom = '';
			baseQtyPerUOM = '';
			baseQtyStock = '';
			uomSearch = '';
		}
	});

	function handleSelectUOM(selected: UOMType) {
		baseUom = selected;
		uomSearch = selected;
		isDropdownOpen = false;
	}

	function handleSubmit(event: Event) {
		event.preventDefault();

		const payload: Record<string, any> = { name, basePrice: Number(basePrice) };

		if (String(sku).trim() !== '') payload.sku = sku;
		if (String(baseQtyPerUOM).trim() !== '') {
			payload.baseQtyPerUOM = Number(baseQtyPerUOM);
		}
		if (String(baseQtyStock).trim() !== '') {
			payload.baseQtyStock = Number(baseQtyStock);
		}
		if (baseUom.trim() !== '') payload.baseUom = baseUom;

		const resetForm = () => {
			name = '';
			basePrice = '';
			sku = '';
			baseUom = '';
			baseQtyPerUOM = '';
			baseQtyStock = '';
			uomSearch = '';
			isDropdownOpen = false;
		};

		if (selectedProduct) {
			$updateProduct.mutate(
				{ productSlugName: selectedProduct.slugName, data: payload },
				{
					onSuccess: () => {
						onSuccess();
						resetForm();
						onClose();
					}
				}
			);
		} else {
			$createProduct.mutate(payload, {
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
	<div
		class="bg-surface-900/90 fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4"
	>
		<div class="flex max-h-[90vh] w-full max-w-md flex-col rounded-lg bg-white shadow-lg">
			<!-- Header -->
			<div class="flex items-center justify-between border-b px-6 py-4">
				<h2 class="text-lg font-semibold text-gray-900">
					{selectedProduct ? `Edit Produk ${selectedProduct.name}` : 'Tambah Produk'}
				</h2>
				<button
					onclick={onClose}
					class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">✕</button
				>
			</div>
			<div
				class="h-full flex-1 overflow-y-auto px-6 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
			>
				<form onsubmit={handleSubmit} class="space-y-4">
					<div>
						<label for="name" class="mb-1 block text-sm font-medium text-gray-900"
							>Nama Produk <span class="text-red-500">*</span></label
						>
						<input
							id="name"
							type="text"
							bind:value={name}
							required
							class="w-full rounded border px-3 py-2 text-gray-900"
						/>
					</div>

					<div>
						<label for="price" class="mb-1 block text-sm font-medium text-gray-900"
							>Harga <span class="text-red-500">*</span></label
						>
						<div class="relative w-full">
							<span class="absolute inset-y-0 left-3 flex items-center text-gray-500">Rp</span>
							<input
								id="price"
								type="text"
								inputmode="numeric"
								class="w-full rounded border py-2 pl-10 pr-3 text-gray-900"
								oninput={HandlePriceInput((val) => (basePrice = val))}
								value={basePrice ? FormatPrice(basePrice) : ''}
								required
							/>
						</div>
					</div>

					{#if !selectedProduct}
						<!-- SKU -->
						<div>
							<label for="sku" class="mb-1 block text-sm font-medium text-gray-900">SKU</label>
							<input
								id="sku"
								type="text"
								bind:value={sku}
								class="w-full rounded border px-3 py-2 text-gray-900"
							/>
						</div>
						<!-- Qty Stock -->
						<div>
							<label for="baseQtyStock" class="mb-1 block text-sm font-medium text-gray-900"
								>Stok</label
							>
							<input
								id="baseQtyStock"
								type="number"
								min="0"
								oninput={HandleQtyInput((val) => (baseQtyStock = val))}
								value={baseQtyStock}
								class="w-full rounded border px-3 py-2 text-gray-900"
							/>
						</div>
					{/if}

					<!-- UOM Auto-suggest -->
					<div class="relative">
						<label for="uomSearch" class="mb-1 block text-sm font-medium text-gray-900">UOM</label>
						<input
							id="uomSearch"
							type="text"
							placeholder="Cari UOM..."
							bind:value={uomSearch}
							class="w-full rounded border px-3 py-2 text-gray-900"
							onfocus={() => {
								if (filteredUOM.length) isDropdownOpen = true;
							}}
							oninput={() => (isDropdownOpen = true)}
						/>

						{#if isDropdownOpen && filteredUOM.length > 0}
							<div
								class="absolute z-10 max-h-40 w-full text-gray-900 overflow-y-auto rounded border bg-white shadow"
							>
								{#each filteredUOM as type}
									<button
										type="button"
										class="w-full px-3 py-2 text-left hover:bg-gray-100"
										onclick={() => handleSelectUOM(type)}>{type}</button
									>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Qty per UOM -->
					<div>
						<label for="baseQtyPerUOM" class="mb-1 block text-sm font-medium text-gray-900"
							>Qty per UOM</label
						>
						<input
							id="baseQtyPerUOM"
							type="number"
							min="0"
							oninput={HandleQtyInput((val) => (baseQtyPerUOM = val))}
							value={baseQtyPerUOM}
							class="w-full rounded border px-3 py-2 text-gray-900"
						/>
					</div>

					<div class="flex justify-end gap-2 pt-4">
						<button
							type="button"
							onclick={onClose}
							class="hover:bg-error-900 hover:text-error-100 text-surface-900 rounded border px-4 py-2"
							>Batal</button
						>
						<button
							type="submit"
							disabled={$createProduct.isPending || $updateProduct.isPending}
							class="bg-surface-900/90 hover:bg-primary-900 rounded px-4 py-2 text-white disabled:opacity-50"
						>
							{#if $createProduct.isPending || $updateProduct.isPending}
								<span class="animate-spin">⏳</span>
							{:else}
								{selectedProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}
