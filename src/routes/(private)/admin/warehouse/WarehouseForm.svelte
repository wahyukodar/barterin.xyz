<script lang="ts">
	import { STATUS_ACTIVE, STATUS_INACTIVE } from '$lib/constants/status.constant';
	import { useComboboxCity } from '$lib/hooks/city.hook';
	import { useCreateWarehouse, useUpdateWarehouse } from '$lib/hooks/warehouse.hook';
	import { FormatPhoneNumber } from '$lib/utils/phone.util';
	import { onMount, tick } from 'svelte';

	const {
		showForm,
		selectedWarehouse = null,
		onClose,
		onSuccess
	} = $props<{
		showForm: boolean;
		selectedWarehouse?: any;
		onClose: () => void;
		onSuccess: () => void;
	}>();

	// For debouncing search
	let debouncedCityName = $state('');
	let debounceTimer: ReturnType<typeof setTimeout>;

	// State form
	let name = $state(selectedWarehouse?.name || '');
	let isDefault = $state(selectedWarehouse?.isDefault?.toString() || STATUS_INACTIVE);
	let longitude = $state(selectedWarehouse?.longitude || '');
	let latitude = $state(selectedWarehouse?.latitude || '');
	let address = $state(selectedWarehouse?.address || '');
	let cityType = $state(selectedWarehouse?.cityType || '');
	let cityName = $state(selectedWarehouse?.cityName || '');
	let picName = $state(selectedWarehouse?.picName || '');
	let phone = $state(selectedWarehouse?.phone || '');
	let showSuggestions = $state(false);
	let validCities: string[] = [];
	let cityError = $state('');

	let mapContainer = $state<HTMLDivElement | null>(null);

	const createWarehouse = useCreateWarehouse();
	const updateWarehouse = useUpdateWarehouse();
	const cityQuery = $derived(useComboboxCity({ cityType, cityName: debouncedCityName }));

	function handleSelectCity(name: string) {
		cityName = name;
		debouncedCityName = name;
		showSuggestions = false;
		cityError = '';
	}

	function handleBlur() {
		if (cityName && !validCities.includes(cityName)) {
			cityError = 'Harap pilih kota dari daftar';
		} else {
			cityError = '';
		}
	}

	$effect(() => {
		if ($cityQuery.isSuccess) {
			validCities = $cityQuery.data?.data.map((c: any) => c.cityName) ?? [];
		}
	});

	// Debounce search input
	$effect(() => {
		const currentSearchTerm = cityName;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			debouncedCityName = currentSearchTerm;
		}, 500);

		return () => clearTimeout(debounceTimer);
	});

	// Sync form kalau edit
	$effect(() => {
		if (selectedWarehouse) {
			name = selectedWarehouse.warehouseName || '';
			isDefault = selectedWarehouse.isDefault || STATUS_INACTIVE;
			longitude = selectedWarehouse.longitude || '';
			latitude = selectedWarehouse.latitude || '';
			address = selectedWarehouse.address || '';
			cityType = selectedWarehouse.cityType || '';
			cityName = selectedWarehouse.cityName || '';
			picName = selectedWarehouse.picName || '';
			phone = selectedWarehouse.phone || '';
		} else {
			name = '';
			isDefault = STATUS_INACTIVE;
			longitude = '';
			latitude = '';
			address = '';
			cityType = '';
			cityName = '';
			picName = '';
			phone = '';
		}
	});

	function handlePhoneInput(event: Event, field: 'phone') {
		const target = event.target as HTMLInputElement;
		const formatted = FormatPhoneNumber(target.value);
		if (field === 'phone') phone = formatted;
	}

	onMount(async () => {
		initMap();
	});

	let map: L.Map | null = null;

	async function initMap() {
		// Tunggu hingga siklus render selesai
		await tick();

		if (!mapContainer) return;

		// Import Leaflet dan CSS
		const L = await import('leaflet');
		await import('leaflet/dist/leaflet.css');
		await import('leaflet-geosearch/dist/geosearch.css');

		const map = L.map(mapContainer).setView([0, 0], 2);

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; OpenStreetMap contributors'
		}).addTo(map);

		// Search control
		const { GeoSearchControl, OpenStreetMapProvider } = await import('leaflet-geosearch');
		const provider = new OpenStreetMapProvider();

		const searchControl = new (GeoSearchControl as any)({
			provider,
			style: 'bar',
			position: 'topright', // supaya tidak ketumpuk
			autoComplete: true,
			autoCompleteDelay: 250,
			showMarker: true,
			retainZoomLevel: false,
			searchLabel: 'Cari kota atau alamat...'
		});

		map.addControl(searchControl);

		let marker: any = null;

		// Tangkap hasil pencarian
		map.on('geosearch/showlocation', (result: any) => {
			const { x: lng, y: lat, label } = result.location;
			longitude = lng.toFixed(6);
			latitude = lat.toFixed(6);
			address = label;

			if (marker) map.removeLayer(marker);
			marker = L.marker([lat, lng]).addTo(map);
		});

		// Tangkap klik di peta
		map.on('click', (e: any) => {
			longitude = e.latlng.lng.toFixed(6);
			latitude = e.latlng.lat.toFixed(6);

			if (marker) map.removeLayer(marker);
			marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
		});
	}

	$effect(() => {
		if (showForm && !map) {
			initMap();
		}
	});

	function handleSubmit(event: Event) {
		event.preventDefault();

		if (cityName && !validCities.includes(cityName)) {
			cityError = 'Harap pilih kota dari daftar';
			return;
		}

		// mulai dari payload required
		const payload: Record<string, any> = {
			name,
			isDefault: Number(isDefault) // wajib kirim
		};

		// hanya tambahkan field jika tidak kosong
		if (String(longitude).trim() !== '') payload.longitude = longitude;
		if (String(latitude).trim() !== '') payload.latitude = latitude;
		if (address.trim() !== '') payload.address = address;
		if (cityType.trim() !== '') payload.cityType = cityType;
		if (cityName.trim() !== '') payload.cityName = cityName;
		if (picName.trim() !== '') payload.picName = picName;
		if (phone.trim() !== '') payload.phone = phone;

		const resetForm = () => {
			name = '';
			isDefault = STATUS_INACTIVE;
			longitude = '';
			latitude = '';
			address = '';
			cityType = '';
			cityName = '';
			picName = '';
			phone = '';
		};

		if (selectedWarehouse) {
			$updateWarehouse.mutate(
				{ warehouseSlugName: selectedWarehouse.warehouseSlugName, data: payload },
				{
					onSuccess: () => {
						onSuccess();
						resetForm();
						onClose();
					}
				}
			);
		} else {
			$createWarehouse.mutate(payload, {
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
	<div class="bg-surface-900/90 fixed inset-0 z-50 flex items-center justify-center p-4">
		<div class="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-lg">
			<!-- Header -->
			<div class="flex items-center justify-between border-b px-6 py-4">
				<h2 class="text-lg font-semibold text-gray-900">
					{selectedWarehouse ? `Edit Gudang ${selectedWarehouse.warehouseName}` : 'Tambah Gudang'}
				</h2>
				<button
					onclick={onClose}
					class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">✕</button
				>
			</div>

			<!-- Form -->
			<div
				class="h-full flex-1 overflow-y-auto px-6 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
			>
				<form onsubmit={handleSubmit} class="space-y-4">
					<!-- Name -->
					<div>
						<label for="name" class="mb-1 block text-sm font-medium text-gray-900">
							Nama Warehouse <span class="text-red-500">*</span>
						</label>
						<input
							id="name"
							type="text"
							bind:value={name}
							required
							class="w-full rounded border px-3 py-2 text-gray-900"
						/>
					</div>

					<!-- Is Default -->
					<div>
						<label for="isDefault" class="mb-1 block text-sm font-medium text-gray-900">
							Default <span class="text-red-500">*</span>
						</label>
						<select
							id="isDefault"
							bind:value={isDefault}
							required
							class="w-full rounded border px-3 py-2 text-gray-900"
						>
							<option value={STATUS_INACTIVE}>No</option>
							<option value={STATUS_ACTIVE}>Yes</option>
						</select>
					</div>

					<!-- Map -->
					<div>
						<p class="mb-1 block text-sm font-medium text-gray-900">Lokasi (Klik di Peta)</p>
						<div
							bind:this={mapContainer}
							class="h-64 w-full rounded border"
							aria-label="Peta lokasi"
						></div>
					</div>

					<!-- Longitude -->
					<div>
						<label for="longitude" class="mb-1 block text-sm font-medium text-gray-900"
							>Longitude</label
						>
						<input
							id="longitude"
							type="text"
							value={longitude}
							disabled
							class="w-full rounded border px-3 py-2 text-gray-900"
						/>
					</div>

					<!-- Latitude -->
					<div>
						<label for="latitude" class="mb-1 block text-sm font-medium text-gray-900"
							>Latitude</label
						>
						<input
							id="latitude"
							type="text"
							value={latitude}
							disabled
							class="w-full rounded border px-3 py-2 text-gray-900"
						/>
					</div>

					<!-- Address -->
					<div>
						<label for="address" class="mb-1 block text-sm font-medium text-gray-900">Alamat</label>
						<input
							id="address"
							type="text"
							bind:value={address}
							class="w-full rounded border px-3 py-2 text-gray-900"
						/>
					</div>

					<!-- City Type -->
					<div>
						<label for="cityType" class="mb-1 block text-sm font-medium text-gray-900">
							Kota/Kabupaten
						</label>
						<select
							id="cityType"
							bind:value={cityType}
							class="w-full rounded border px-3 py-2 text-gray-900"
						>
							<option value="">-- Pilih --</option>
							<option value="KABUPATEN">Kabupaten</option>
							<option value="KOTA">Kota</option>
						</select>
					</div>

					{#if cityType}
						<!-- City Name dengan Auto Suggest -->
						<div class="relative">
							<label for="cityName" class="mb-1 block text-sm font-medium text-gray-900">
								Nama Kota/Kabupaten
							</label>
							<input
								id="cityName"
								type="text"
								bind:value={cityName}
								placeholder="Ketik nama kota..."
								onblur={handleBlur}
								class="w-full rounded border px-3 py-2 text-gray-900"
								oninput={() => (showSuggestions = true)}
							/>

							<!-- Suggestion list -->
							{#if cityName && showSuggestions && $cityQuery.isSuccess && $cityQuery.data?.data.length > 0}
								<ul
									class="absolute z-50 mt-1 max-h-40 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg"
								>
									{#each $cityQuery.data?.data as city}
										<li>
											<button
												type="button"
												onclick={() => handleSelectCity(city.cityName)}
												class="w-full cursor-pointer px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
											>
												{city.cityName}
											</button>
										</li>
									{/each}
								</ul>
							{/if}

							<!-- Error message -->
							{#if cityError}
								<p class="mt-1 text-sm text-red-600">{cityError}</p>
							{/if}
						</div>
					{/if}

					<!-- PIC Name -->
					<div>
						<label for="picName" class="mb-1 block text-sm font-medium text-gray-900"
							>Nama PIC</label
						>
						<input
							id="picName"
							type="text"
							bind:value={picName}
							class="w-full rounded border px-3 py-2 text-gray-900"
						/>
					</div>

					<!-- Phone -->
					<div>
						<label for="phone" class="mb-1 block text-sm font-medium text-gray-900"
							>No. Telepon</label
						>
						<input
							id="phone"
							type="text"
							bind:value={phone}
							oninput={(e) => handlePhoneInput(e, 'phone')}
							class="w-full rounded border px-3 py-2 text-gray-900"
						/>
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
							disabled={$createWarehouse.isPending || $updateWarehouse.isPending}
							class="bg-surface-900/90 hover:bg-primary-900 rounded px-4 py-2 text-white disabled:opacity-50"
						>
							{#if $createWarehouse.isPending || $updateWarehouse.isPending}
								<span class="animate-spin">⏳</span>
							{:else}
								{selectedWarehouse ? 'Simpan Perubahan' : 'Tambah Gudang'}
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}

<style lang="postcss">
	@reference "tailwindcss";

	/* Perbaiki container utama */
	:global(.leaflet-control-geosearch) {
		@apply z-[1000];
	}

	/* Hilangkan double border dan padding bawaan */
	:global(.leaflet-control-geosearch .glass) {
		border: none !important;
		background: transparent !important;
		box-shadow: none !important;
	}

	/* Input style modern */
	:global(.leaflet-control-geosearch form input) {
		@apply rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500;
		box-sizing: border-box;
	}

	/* Hasil pencarian */
	:global(.leaflet-control-geosearch .results) {
		@apply mt-1 max-h-40 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg;
	}

	/* Sembunyikan scrollbar tapi tetap scrollable */
	:global(.leaflet-control-geosearch .results::-webkit-scrollbar) {
		display: none; /* Chrome, Safari, Edge */
	}

	:global(.leaflet-control-geosearch .results > *) {
		@apply cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-100;
	}
</style>
