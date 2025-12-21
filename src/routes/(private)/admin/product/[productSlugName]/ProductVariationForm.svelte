<script lang="ts">
	import { UOMType } from '$lib/constants/uom-type.constant';
	import { HandlePriceInput } from '$lib/helpers/input.helper';
	import {
		useCreateProductVariation,
		useUpdateProductVariation
	} from '$lib/hooks/product-variation.hook';
	import { FormatPrice } from '$lib/utils/currency.util';
	import { HandleQtyInput } from '$lib/utils/input.util';

	const {
		productSlugName,
		showForm,
		productVariations = null,
		selectedProductVariation = null,
		onClose,
		onSuccess
	} = $props<{
		productSlugName: string;
		showForm: boolean;
		productVariations?: any;
		selectedProductVariation?: any;
		onClose: () => void;
		onSuccess: () => void;
	}>();

	let name = $state(selectedProductVariation?.name || '');
	let price = $state(selectedProductVariation?.price?.toString() || '');
	let sku = $state(selectedProductVariation?.sku || '');
	let uom = $state(selectedProductVariation?.uom || '');
	let qtyPerUOM = $state(selectedProductVariation?.qtyPerUOM?.toString() || '');
	let uomSearch = $state(selectedProductVariation?.uom || '');
	let isDropdownOpen = $state(false);

	const createProductVariation = useCreateProductVariation();
	const updateProductVariation = useUpdateProductVariation();

	let filteredUOM = $state<UOMType[]>([]);

	$effect(() => {
		// Update filteredUOM setiap uomSearch berubah
		filteredUOM = uomSearch
			? UOMType.filter((type) => type.toLowerCase().includes(uomSearch.toLowerCase()))
			: [];
	});

	$effect(() => {
		// reset form jika selectedProductVariation berubah
		if (selectedProductVariation) {
			name = selectedProductVariation.name;
			price = selectedProductVariation.price?.toString() || price;
			sku = selectedProductVariation.sku || '';
			uom = selectedProductVariation.uom || uom;
			qtyPerUOM = selectedProductVariation.qtyPerUom?.toString() || qtyPerUOM;
			uomSearch = selectedProductVariation.uom || uomSearch;
		} else {
			name = '';
			price = '';
			sku = '';
			uom = '';
			qtyPerUOM = '';
			uomSearch = '';

			price = productVariations.basePrice?.toString() || price;
			uom = productVariations.baseUom?.toString() || uom;
			uomSearch = productVariations.baseUom?.toString() || uomSearch;
			qtyPerUOM = productVariations.baseQtyPerUom?.toString() || qtyPerUOM;
		}
	});

	function handleSelectUOM(selected: UOMType) {
		uom = selected;
		uomSearch = selected;
		isDropdownOpen = false;
	}

	function handleSubmit(event: Event) {
		event.preventDefault();

		const payload: Record<string, any> = { name, price: Number(price) };
		if (String(sku).trim() !== '') payload.sku = sku;
		if (String(qtyPerUOM).trim() !== '') {
			payload.qtyPerUOM = Number(qtyPerUOM);
		}
		if (uom.trim() !== '') payload.uom = uom;

		const resetForm = () => {
			name = '';
			price = '';
			sku = '';
			uom = '';
			qtyPerUOM = '';
			uomSearch = '';
			isDropdownOpen = false;
		};

		if (selectedProductVariation) {
			$updateProductVariation.mutate(
				{
					productSlugName,
					productVariationSlugName: selectedProductVariation.slugName,
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
			$createProductVariation.mutate(
				{ productSlugName, data: payload },
				{
					onSuccess: () => {
						onSuccess();
						resetForm();
						onClose();
					}
				}
			);
		}
	}
</script>

{#if showForm}
	<div
		class="bg-surface-900/90 fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4"
	>
		<div class="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-lg">
			<!-- Header -->
			<div class="flex items-center justify-between border-b px-6 py-4">
				<h2 class="text-lg font-semibold text-gray-900">
					{selectedProductVariation
						? `Edit Variasi Produk ${selectedProductVariation.name}`
						: 'Tambah Variasi Produk'}
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
					<!-- Name -->
					<div>
						<label for="name" class="mb-1 block text-sm font-medium text-gray-900"
							>Nama Variasi Produk <span class="text-red-500">*</span></label
						>
						<input
							id="name"
							type="text"
							bind:value={name}
							required
							class="w-full rounded border px-3 py-2 text-gray-900"
						/>
					</div>

					<!-- Price -->
					<div>
						<label for="price" class="mb-1 block text-sm font-medium text-gray-900">Harga</label>
						<div class="relative w-full">
							<span class="absolute inset-y-0 left-3 flex items-center text-gray-500">Rp</span>
							<input
								id="price"
								type="text"
								inputmode="numeric"
								class="w-full rounded border py-2 pl-10 pr-3 text-gray-900"
								oninput={HandlePriceInput((val) => (price = val))}
								value={price ? FormatPrice(price) : ''}
								required
							/>
						</div>
					</div>

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
								class="absolute z-10 max-h-40 w-full overflow-y-auto rounded border bg-white text-gray-900 shadow"
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
						<label for="qtyPerUOM" class="mb-1 block text-sm font-medium text-gray-900"
							>Qty per UOM</label
						>
						<input
							id="qtyPerUOM"
							type="number"
							min="0"
							oninput={HandleQtyInput((val) => (qtyPerUOM = val))}
							value={qtyPerUOM}
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
							disabled={$createProductVariation.isPending || $updateProductVariation.isPending}
							class="bg-surface-900/90 hover:bg-primary-900 rounded px-4 py-2 text-white disabled:opacity-50"
						>
							{#if $createProductVariation.isPending || $updateProductVariation.isPending}
								<span class="animate-spin">⏳</span>
							{:else}
								{selectedProductVariation ? 'Simpan Perubahan' : 'Tambah Variasi Produk'}
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}
