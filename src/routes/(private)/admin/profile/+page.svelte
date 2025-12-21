<script lang="ts">
	import { useComboboxCity } from '$lib/hooks/city.hook';
	import { useCompanyProfile, useUpdateCompany } from '$lib/hooks/company.hook';
	import { onMount, tick } from 'svelte';

	// Hooks
	const companyQuery = useCompanyProfile();
	const updateCompany = useUpdateCompany();

	// Local states (editable)
	let name = $state('');
	let description = $state('');
	let address = $state('');
	let cityType: '' | 'KABUPATEN' | 'KOTA' = $state('');
	let cityName = $state('');
	let longitude = $state('');
	let latitude = $state('');

	// City suggest states
	let debouncedCityName = $state('');
	let showSuggestions = $state(false);
	let cityError = $state('');
	let validCities: string[] = $state([]);
	let debounceTimer: ReturnType<typeof setTimeout>;

	// Map states
	let mapContainer = $state<HTMLDivElement | null>(null);
	let map: L.Map | null = null;

	// Hook untuk autosuggest kota
	const cityQuery = $derived(useComboboxCity({ cityType, cityName: debouncedCityName }));

	// Sync data dari API ke form saat berhasil dimuat
	$effect(() => {
		if ($companyQuery.isSuccess && $companyQuery.data?.data?.company) {
			const companyData = $companyQuery.data.data.company;
			name = companyData.name || '';
			description = companyData.description || '';
			address = companyData.address || '';
			cityType = companyData.cityType || '';
			cityName = companyData.cityName || '';
			longitude = companyData.longitude || '';
			latitude = companyData.latitude || '';
			// Set debouncedCityName juga untuk trigger city query jika ada cityType
			if (companyData.cityName && companyData.cityType) {
				debouncedCityName = companyData.cityName;
			}
		}
	});

	// Save ke backend dengan debounce
	function saveFieldWithDebounce<K extends string>(key: K, value: unknown) {
		// console.log(`Saving field ${key}:`, value);
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			const payload = { [key]: value };
			// console.log('Sending payload:', payload);
			$updateCompany.mutate({ data: payload });
		}, 500);
	}

	// Save multiple fields at once (untuk coordinates)
	function saveMultipleFields(fields: Record<string, unknown>) {
		// console.log('Saving multiple fields:', fields);
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			// console.log('Sending multiple fields payload:', fields);
			$updateCompany.mutate({ data: fields });
		}, 500);
	}

	// Select city dari suggest
	function handleSelectCity(selectedCityName: string) {
		cityName = selectedCityName;
		debouncedCityName = selectedCityName;
		showSuggestions = false;
		cityError = '';
		// pilih cityName bukan hal yang butuh debouce jadi langsung panggil hook updateCompany
		// kalau pakai saveFieldWithDebounce atau saveMultipleFields maka tidak akan pernah jalan updateCompany nya
		$updateCompany.mutate({
			data: {
				cityType,
				cityName: selectedCityName
			}
		});
	}

	// Validasi city setelah blur
	function handleBlur() {
		// Delay untuk memberi waktu handleSelectCity jalan dulu
		setTimeout(() => {
			showSuggestions = false;
			if (cityName && !validCities.includes(cityName)) {
				cityError = 'Harap pilih kota dari daftar';
			} else {
				cityError = '';
			}
		}, 150);
	}

	// Debounce untuk city input (hanya aktif ketika fokus)
	$effect(() => {
		const currentSearchTerm = cityName;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			debouncedCityName = currentSearchTerm;
		}, 500);

		return () => clearTimeout(debounceTimer);
	});

	// Ambil validCities tiap kali query sukses
	$effect(() => {
		if ($cityQuery.isSuccess) {
			validCities = $cityQuery.data?.data.map((c: any) => c.cityName) ?? [];
		}
	});

	onMount(async () => {
		initMap();
	});

	$effect(() => {
		if (cityQuery && !map) {
			initMap();
		}
	});

	async function initMap() {
		// Tunggu hingga siklus render selesai
		await tick();

		if (!mapContainer) return;

		// Import Leaflet dan CSS
		const L = await import('leaflet');
		await import('leaflet/dist/leaflet.css');
		await import('leaflet-geosearch/dist/geosearch.css');

		// Set initial view - use existing coordinates or default to Indonesia center
		const initialLat = latitude ? parseFloat(latitude) : -2.5489;
		const initialLng = longitude ? parseFloat(longitude) : 118.0149;
		const initialZoom = latitude && longitude ? 15 : 5;

		map = L.map(mapContainer).setView([initialLat, initialLng], initialZoom);

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; OpenStreetMap contributors'
		}).addTo(map);

		// Search control
		const { GeoSearchControl, OpenStreetMapProvider } = await import('leaflet-geosearch');
		const provider = new OpenStreetMapProvider();

		const searchControl = new (GeoSearchControl as any)({
			provider,
			style: 'bar',
			position: 'topright',
			autoComplete: true,
			autoCompleteDelay: 250,
			showMarker: true,
			retainZoomLevel: false,
			searchLabel: 'Cari kota atau alamat...'
		});

		map.addControl(searchControl);

		let marker: any = null;

		// Add existing marker if coordinates exist
		if (latitude && longitude) {
			marker = L.marker([parseFloat(latitude), parseFloat(longitude)]).addTo(map);
		}

		// Tangkap hasil pencarian
		map.on('geosearch/showlocation', (result: any) => {
			const { x: lng, y: lat, label } = result.location;
			const newLng = lng.toFixed(6);
			const newLat = lat.toFixed(6);

			console.log('Search result coordinates:', { lng: newLng, lat: newLat, label });

			// Update reactive variables
			longitude = newLng;
			latitude = newLat;
			address = label;

			// Save coordinates and address to backend as a batch
			saveMultipleFields({
				longitude: newLng,
				latitude: newLat,
				address: label
			});

			// Update marker
			if (marker && map) map.removeLayer(marker);
			if (map) marker = L.marker([lat, lng]).addTo(map);
		});

		// Tangkap klik di peta
		map.on('click', (e: any) => {
			const newLng = e.latlng.lng.toFixed(6);
			const newLat = e.latlng.lat.toFixed(6);

			console.log('Map click coordinates:', { lng: newLng, lat: newLat });

			// Update reactive variables
			longitude = newLng;
			latitude = newLat;

			// Save coordinates to backend as a batch
			saveMultipleFields({
				longitude: newLng,
				latitude: newLat
			});

			// Update marker
			if (marker && map) map.removeLayer(marker);
			if (map) marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
		});
	}
</script>

<div class="min-h-screen w-full p-3 sm:p-4 md:p-6 lg:p-8">
	<div class="mx-auto max-w-4xl space-y-4 sm:space-y-6">
		<h1
			class="text-surface-900 dark:text-surface-100 text-center text-lg font-semibold sm:text-xl md:text-2xl lg:text-3xl"
		>
			Profile
		</h1>

		{#if $companyQuery.isLoading}
			<div class="flex min-h-[200px] items-center justify-center">
				<p class="text-surface-500 dark:text-surface-400 text-sm sm:text-base">Memuat profile...</p>
			</div>
		{:else if $companyQuery.isError}
			<div class="flex min-h-[200px] items-center justify-center">
				<p class="text-error-600 dark:text-error-400 text-sm sm:text-base">Gagal memuat profile.</p>
			</div>
		{:else}
			<form class="space-y-4 sm:space-y-5 md:space-y-6">
				<!-- Editable: Name -->
				<div class="form-control">
					<label for="name" class="label mb-1 sm:mb-2">
						<span
							class="label-text text-surface-900 dark:text-surface-100 text-xs font-medium sm:text-sm md:text-base"
							>Nama Usaha/Bisnis</span
						>
					</label>
					<input
						id="name"
						type="text"
						class="input input-bordered bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100 border-surface-300 dark:border-surface-600 w-full px-3 py-2.5 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 sm:py-3 sm:text-base md:px-4"
						placeholder="Masukkan nama"
						bind:value={name}
						oninput={(e) => saveFieldWithDebounce('name', e.currentTarget.value)}
					/>
				</div>

				<!-- Editable: Description -->
				<div class="form-control">
					<label for="description" class="label mb-1 sm:mb-2">
						<span
							class="label-text text-surface-900 dark:text-surface-100 text-xs font-medium sm:text-sm md:text-base"
							>Deskripsi</span
						>
					</label>
					<textarea
						id="description"
						class="textarea textarea-bordered bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100 border-surface-300 dark:border-surface-600 min-h-[80px] w-full resize-y px-3 py-2.5 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 sm:min-h-[100px] sm:py-3 sm:text-base md:px-4"
						placeholder="Tuliskan deskripsi"
						rows="3"
						bind:value={description}
						oninput={(e) => saveFieldWithDebounce('description', e.currentTarget.value)}
					></textarea>
				</div>

				<!-- Editable: Address -->
				<div class="form-control">
					<label for="address" class="label mb-1 sm:mb-2">
						<span
							class="label-text text-surface-900 dark:text-surface-100 text-xs font-medium sm:text-sm md:text-base"
							>Alamat</span
						>
					</label>
					<input
						id="address"
						type="text"
						class="input input-bordered bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100 border-surface-300 dark:border-surface-600 w-full px-3 py-2.5 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 sm:py-3 sm:text-base md:px-4"
						placeholder="Alamat lengkap"
						bind:value={address}
						oninput={(e) => saveFieldWithDebounce('address', e.currentTarget.value)}
					/>
				</div>

				<!-- Map Section -->
				<div class="form-control">
					<label for="map" class="label mb-1 sm:mb-2">
						<span
							class="label-text text-surface-900 dark:text-surface-100 text-xs font-medium sm:text-sm md:text-base"
							>Lokasi (Klik di Peta atau Gunakan Pencarian)</span
						>
					</label>
					<div
						bind:this={mapContainer}
						class="border-surface-300 dark:border-surface-600 h-48 w-full rounded-lg border transition-all duration-200 hover:border-blue-400 sm:h-56 md:h-64 lg:h-80"
						aria-label="Peta lokasi"
					></div>
					{#if longitude && latitude}
						<p class="text-surface-600 dark:text-surface-400 mt-2 text-xs sm:text-sm">
							Koordinat terpilih: <span class="font-mono">{latitude}, {longitude}</span>
						</p>
					{/if}
				</div>

				<!-- Coordinates Display -->
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-6">
					<div>
						<label for="longitude" class="label mb-1 sm:mb-2">
							<span
								class="label-text text-surface-900 dark:text-surface-100 text-xs font-medium sm:text-sm md:text-base"
								>Longitude</span
							>
						</label>
						<input
							id="longitude"
							type="text"
							value={longitude}
							disabled
							class="input input-bordered bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 border-surface-300 dark:border-surface-600 w-full cursor-not-allowed px-3 py-2.5 text-sm opacity-75 sm:py-3 sm:text-base md:px-4"
						/>
					</div>

					<div>
						<label for="latitude" class="label mb-1 sm:mb-2">
							<span
								class="label-text text-surface-900 dark:text-surface-100 text-xs font-medium sm:text-sm md:text-base"
								>Latitude</span
							>
						</label>
						<input
							id="latitude"
							type="text"
							value={latitude}
							disabled
							class="input input-bordered bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 border-surface-300 dark:border-surface-600 w-full cursor-not-allowed px-3 py-2.5 text-sm opacity-75 sm:py-3 sm:text-base md:px-4"
						/>
					</div>
				</div>

				<!-- City Type & City Name -->
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-6">
					<div>
						<label
							for="cityType"
							class="text-surface-900 dark:text-surface-100 mb-1 block text-xs font-medium sm:mb-2 sm:text-sm md:text-base"
						>
							Kota/Kabupaten
						</label>
						<select
							id="cityType"
							bind:value={cityType}
							class="bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100 border-surface-300 dark:border-surface-600 w-full rounded-lg border px-3 py-2.5 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 sm:py-3 sm:text-base md:px-4"
							onchange={(e) => {
								const val = (e.currentTarget.value || '').toUpperCase();
								cityType = val === 'KABUPATEN' ? 'KABUPATEN' : val === 'KOTA' ? 'KOTA' : '';
								// Reset cityName ketika cityType berubah
								cityName = '';
								debouncedCityName = '';
								showSuggestions = false;
								cityError = '';
								saveFieldWithDebounce('cityType', cityType);
								if (!cityType) {
									saveFieldWithDebounce('cityName', '');
								}
							}}
						>
							<option value="">-- Pilih --</option>
							<option value="KABUPATEN">Kabupaten</option>
							<option value="KOTA">Kota</option>
						</select>
					</div>

					{#if cityType}
						<div class="relative">
							<label
								for="cityName"
								class="text-surface-900 dark:text-surface-100 mb-1 block text-xs font-medium sm:mb-2 sm:text-sm md:text-base"
							>
								Nama Kota/Kabupaten
							</label>
							<input
								id="cityName"
								type="text"
								bind:value={cityName}
								placeholder="Ketik nama kota..."
								oninput={() => (showSuggestions = true)}
								onblur={handleBlur}
								class="bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100 border-surface-300 dark:border-surface-600 w-full rounded-lg border px-3 py-2.5 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 sm:py-3 sm:text-base md:px-4"
							/>

							<!-- Suggestion list -->
							{#if showSuggestions && cityName && $cityQuery.isSuccess && $cityQuery.data?.data.length > 0}
								<ul
									class="border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 absolute z-50 mt-1 max-h-32 w-full overflow-y-auto rounded-lg border shadow-lg sm:max-h-40 md:max-h-48"
								>
									{#each $cityQuery.data?.data as city}
										<li>
											<button
												type="button"
												onclick={() => handleSelectCity(city.cityName)}
												class="text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 active:bg-surface-200 dark:active:bg-surface-600 w-full cursor-pointer px-3 py-2.5 text-left text-xs transition-colors duration-150 sm:py-3 sm:text-sm md:text-base"
											>
												{city.cityName}
											</button>
										</li>
									{/each}
								</ul>
							{/if}

							<!-- Error message -->
							{#if cityError}
								<p class="text-error-600 dark:text-error-400 mt-1 text-xs sm:text-sm">{cityError}</p>
							{/if}
						</div>
					{/if}
				</div>

				<!-- Readonly fields -->
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-6">
					<div>
						<label
							for="phone"
							class="text-surface-900 dark:text-surface-100 mb-1 block text-xs font-medium sm:mb-2 sm:text-sm md:text-base"
							>Phone</label
						>
						<div
							class="bg-surface-50 dark:bg-surface-800 border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 min-h-[42px] rounded-lg border px-3 py-2.5 text-sm sm:min-h-[48px] sm:py-3 sm:text-base md:px-4"
						>
							{$companyQuery.data?.data?.company?.phone || '-'}
						</div>
					</div>
					<div>
						<label
							for="prefixInvoiceCode"
							class="text-surface-900 dark:text-surface-100 mb-1 block text-xs font-medium sm:mb-2 sm:text-sm md:text-base"
							>Prefix Invoice Code</label
						>
						<div
							class="bg-surface-50 dark:bg-surface-800 border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 min-h-[42px] rounded-lg border px-3 py-2.5 text-sm sm:min-h-[48px] sm:py-3 sm:text-base md:px-4"
						>
							{$companyQuery.data?.data?.company?.prefixInvoiceCode || '-'}
						</div>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-6">
					<div>
						<label
							for="status"
							class="text-surface-900 dark:text-surface-100 mb-1 block text-xs font-medium sm:mb-2 sm:text-sm md:text-base"
							>Status</label
						>
						<div class="flex items-center">
							<span
								class="bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200 inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium sm:px-4 sm:py-2 sm:text-sm"
							>
								{$companyQuery.data?.data?.company?.isActive === 1 ? 'Active' : 'Inactive'}
							</span>
						</div>
					</div>
					<div>
						<label
							for="companyType"
							class="text-surface-900 dark:text-surface-100 mb-1 block text-xs font-medium sm:mb-2 sm:text-sm md:text-base"
							>Tipe Usaha/Bisnis</label
						>
						<div
							class="bg-surface-50 dark:bg-surface-800 border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 min-h-[42px] rounded-lg border px-3 py-2.5 text-sm sm:min-h-[48px] sm:py-3 sm:text-base md:px-4"
						>
							{$companyQuery.data?.data?.company?.companyType || '-'}
						</div>
					</div>
				</div>

				<!-- Status Messages with better mobile handling -->
				{#if $updateCompany.isPending}
					<div class="rounded-lg bg-blue-50 p-3 text-center dark:bg-blue-900/20 sm:p-4">
						<div class="flex items-center justify-center space-x-2">
							<div class="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
							<span class="text-blue-600 dark:text-blue-400 text-xs font-medium sm:text-sm"
								>Menyimpan perubahan...</span
							>
						</div>
					</div>
				{:else if $updateCompany.isError}
					<div class="rounded-lg bg-red-50 p-3 text-center dark:bg-red-900/20 sm:p-4">
						<span class="text-error-600 dark:text-error-400 text-xs font-medium sm:text-sm">Gagal menyimpan perubahan</span>
					</div>
				{:else if $updateCompany.isSuccess}
					<div class="rounded-lg bg-green-50 p-3 text-center dark:bg-green-900/20 sm:p-4">
						<span class="text-success-600 dark:text-success-400 text-xs font-medium sm:text-sm"
							>Perubahan berhasil disimpan</span
						>
					</div>
				{/if}
			</form>
		{/if}
	</div>
</div>

<style lang="postcss">
	@reference "tailwindcss";

	/* Touch-friendly controls */
	@media (max-width: 640px) {
		:global(input, textarea, select, button) {
			min-height: 44px; /* Apple's recommended touch target size */
			font-size: 16px; /* Prevents zoom on iOS */
		}
	}

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

	/* Input style modern dengan responsive sizing */
	:global(.leaflet-control-geosearch form input) {
		@apply rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500;
		box-sizing: border-box;
		min-height: 44px; /* Touch-friendly */
		font-size: 16px; /* Prevent zoom on iOS */
	}

	/* Responsive search input */
	@media (min-width: 640px) {
		:global(.leaflet-control-geosearch form input) {
			@apply px-4 py-3 text-base;
		}
	}

	/* Hasil pencarian dengan responsive height */
	:global(.leaflet-control-geosearch .results) {
		@apply mt-1 max-h-32 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg sm:max-h-40 md:max-h-48;
	}

	/* Sembunyikan scrollbar tapi tetap scrollable */
	:global(.leaflet-control-geosearch .results::-webkit-scrollbar) {
		width: 4px;
	}

	:global(.leaflet-control-geosearch .results::-webkit-scrollbar-track) {
		@apply bg-gray-100;
	}

	:global(.leaflet-control-geosearch .results::-webkit-scrollbar-thumb) {
		@apply rounded-full bg-gray-300;
	}

	/* Mobile-friendly result items */
	:global(.leaflet-control-geosearch .results > *) {
		@apply cursor-pointer px-3 py-2.5 text-xs text-gray-700 transition-colors duration-150 hover:bg-gray-100 active:bg-gray-200 sm:py-3 sm:text-sm md:text-base;
		min-height: 44px; /* Touch-friendly */
		display: flex;
		align-items: center;
	}

	/* Improve map controls on mobile */
	:global(.leaflet-control-zoom) {
		@apply scale-110;
	}

	/* Better map attribution on mobile */
	:global(.leaflet-control-attribution) {
		@apply text-xs opacity-80 sm:text-sm;
	}

	/* Smooth transitions for all interactive elements */
	input, textarea, select, button {
		@apply transition-all duration-200 ease-in-out;
	}

	/* Focus states yang lebih baik untuk keyboard navigation */
	input:focus-visible,
	textarea:focus-visible,
	select:focus-visible,
	button:focus-visible {
		@apply outline-2 outline-offset-2 outline-blue-500;
	}

	/* Dark mode improvements */
	@media (prefers-color-scheme: dark) {
		:global(.leaflet-control-geosearch form input) {
			@apply border-gray-600 bg-gray-800 text-gray-200 placeholder-gray-400;
		}

		:global(.leaflet-control-geosearch .results) {
			@apply border-gray-600 bg-gray-800;
		}

		:global(.leaflet-control-geosearch .results > *) {
			@apply text-gray-300 hover:bg-gray-700 active:bg-gray-600;
		}
	}
</style>
