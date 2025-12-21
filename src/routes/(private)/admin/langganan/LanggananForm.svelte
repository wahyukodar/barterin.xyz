<script lang="ts">
	import { useComboboxCity } from '$lib/hooks/city.hook';
	import { useCreateLangganan, useUpdateLangganan } from '$lib/hooks/langganan.hook';
	import { FormatPhoneNumber } from '$lib/utils/phone.util';
	import { onMount, tick } from 'svelte';

	const {
		showForm,
		selectedLangganan = null,
		onClose,
		onSuccess
	} = $props<{
		showForm: boolean;
		selectedLangganan?: any;
		onClose: () => void;
		onSuccess: () => void;
	}>();

	// For debouncing search
	let debouncedCityName = $state('');
	let debounceTimer: ReturnType<typeof setTimeout>;

	// State form
	let name = $state(selectedLangganan?.name || '');
	let longitude = $state(selectedLangganan?.longitude || '');
	let latitude = $state(selectedLangganan?.latitude || '');
	let address = $state(selectedLangganan?.address || '');
	let cityType = $state(selectedLangganan?.cityType || '');
	let cityName = $state(selectedLangganan?.cityName || '');
	let requester = $state(
		selectedLangganan?.langgananIDType?.toUpperCase() === 'PHONE'
			? selectedLangganan?.requester || ''
			: ''
	);
	let showSuggestions = $state(false);
	let validCities: string[] = [];
	let cityError = $state('');

	let mapContainer = $state<HTMLDivElement | null>(null);

	const createlangganan = useCreateLangganan();
	const updatelangganan = useUpdateLangganan();
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
		if (selectedLangganan) {
			name = selectedLangganan.name || '';
			longitude = selectedLangganan.longitude || '';
			latitude = selectedLangganan.latitude || '';
			address = selectedLangganan.address || '';
			cityType = selectedLangganan.cityType || '';
			cityName = selectedLangganan.cityName || '';
			requester =
				selectedLangganan?.langgananIDType?.toUpperCase() === 'PHONE'
					? selectedLangganan?.requester || ''
					: '';
		} else {
			name = '';
			longitude = '';
			latitude = '';
			address = '';
			cityType = '';
			cityName = '';
			requester = '';
		}
	});

	function handlePhoneInput(event: Event, field: 'requester') {
		const target = event.target as HTMLInputElement;
		const formatted = FormatPhoneNumber(target.value);
		if (field === 'requester') requester = formatted;
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

		// mulai dari payload kosong
		const payload: Record<string, any> = {
			name
		};

		// hanya tambahkan field jika tidak kosong
		if (String(longitude).trim() !== '') payload.longitude = longitude;
		if (String(latitude).trim() !== '') payload.latitude = latitude;
		if (address.trim() !== '') payload.address = address;
		if (cityType.trim() !== '') payload.cityType = cityType;
		if (cityName.trim() !== '') payload.cityName = cityName;
		if (requester.trim() !== '') payload.requester = requester;

		const resetForm = () => {
			name = '';
			longitude = '';
			latitude = '';
			address = '';
			cityType = '';
			cityName = '';
			requester = '';
		};

		if (selectedLangganan) {
			$updatelangganan.mutate(
				{ requester: selectedLangganan.requester, data: payload },
				{
					onSuccess: () => {
						onSuccess();
						resetForm();
						onClose();
					}
				}
			);
		} else {
			$createlangganan.mutate(payload, {
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
					{selectedLangganan ? `Edit Pelanggan ${selectedLangganan.name}` : 'Tambah Pelanggan'}
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
							Nama Langganan <span class="text-red-500">*</span>
						</label>
						<input
							id="name"
							type="text"
							bind:value={name}
							required
							class="w-full rounded border px-3 py-2 text-gray-900"
						/>
					</div>

					<!-- Requester -->
					<div>
						<label for="phone" class="mb-1 block text-sm font-medium text-gray-900"
							>No. Telepon</label
						>
						<input
							id="phone"
							type="text"
							bind:value={requester}
							oninput={(e) => handlePhoneInput(e, 'requester')}
							class="w-full rounded border px-3 py-2 text-gray-900"
						/>
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
							disabled={$createlangganan.isPending || $updatelangganan.isPending}
							class="bg-surface-900/90 hover:bg-primary-900 rounded px-4 py-2 text-white disabled:opacity-50"
						>
							{#if $createlangganan.isPending || $updatelangganan.isPending}
								<span class="animate-spin">⏳</span>
							{:else}
								{selectedLangganan ? 'Simpan Perubahan' : 'Tambah Langganan'}
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
