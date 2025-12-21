<!-- <script>
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import { DEFAULT_ADMIN_DASHBOARD_URL } from "$lib/constants/url.constant";
	import { AuthGuard } from "$lib/guards/auth.guard";
	import { onMount } from "svelte";

	onMount(() => {
		if (browser) {
			const checkAuth = async () => {
				const result = await AuthGuard();
				if (result) {
					goto(DEFAULT_ADMIN_DASHBOARD_URL);
				}
			};
			checkAuth();
		}
	});
</script>

<svelte:head>
	<title>Loading...</title>
</svelte:head>


<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"
>
	<div class="space-y-4 text-center">
	
		<div
			class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"
		></div>

	
		<div class="space-y-2">
			<h2 class="text-xl font-semibold text-gray-900">Loading...</h2>
			<p class="text-gray-600">Mengarahkan ke halaman yang tepat</p>
		</div>
	</div>
</div>

<style>
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}
</style> -->

<script>
	import { onMount } from 'svelte';
	import FeatureCard from './FeatureCard.svelte';
	import StepCard from './StepCard.svelte';

	let lang = 'en';

	onMount(() => {
		lang = localStorage.getItem('lang') || 'en';
	});

	const setLang = (l) => {
		lang = l;
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('lang', l);
		}
	};

	const t = (en, id) => (lang === 'en' ? en : id);
</script>

<section class="flex min-h-screen flex-col">
	<!-- NAVBAR -->
	<nav class="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
		<div class="flex items-center gap-3">
			<!-- inline simple logo to avoid extra download -->
			<svg
				width="40"
				height="40"
				viewBox="0 0 48 48"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				class="rounded-xl"
				aria-hidden
			>
				<rect width="48" height="48" rx="10" fill="var(--brand-500)" />
				<path
					d="M14 28C16.5 20 22 16 29 16"
					stroke="white"
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			<div>
				<div class="text-lg font-extrabold">Barterin</div>
				<div class="text-xs text-[var(--muted)]">
					{t('Borderless • Non-custodial', 'Borderless • Non-custodial')}
				</div>
			</div>
		</div>

		<div class="flex items-center gap-4">
			<div class="hidden gap-6 text-[var(--muted)] md:flex">
				<a href="#features" class="transition hover:text-[--brand-500]">{t('Features', 'Fitur')}</a>
				<a href="#how" class="transition hover:text-[--brand-500]"
					>{t('How it Works', 'Cara Kerja')}</a
				>
				<a href="#flow" class="transition hover:text-[--brand-500]">{t('Flow', 'Alur')}</a>
			</div>

			<!-- language -->
			<div class="flex items-center gap-2 rounded-xl border px-3 py-1" role="group">
				<button class="text-sm" on:click={() => setLang('en')} aria-pressed={lang === 'en'}
					>🇬🇧</button
				>
				<div class="h-6 w-px bg-slate-200"></div>
				<button class="text-sm" on:click={() => setLang('id')} aria-pressed={lang === 'id'}
					>🇮🇩</button
				>
			</div>

			<button
				class="pulse-cta ml-3 rounded-lg bg-[var(--brand-500)] px-4 py-2 text-white hover:bg-[var(--brand-400)]"
				on:mouseenter={() => (hoveringCTA = true)}
				on:mouseleave={() => (hoveringCTA = false)}
			>
				{t('Launch App', 'Buka Aplikasi')}
			</button>
		</div>
	</nav>

	<!-- HERO -->
	<div
		class="mx-auto mt-6 flex max-w-7xl flex-col-reverse items-center gap-12 px-6 lg:mt-14 lg:flex-row"
	>
		<div class="flex-1">
			<div in:fly={{ y: 20, duration: 500 }}>
				<span
					class="bg-[var(--brand-400)]/10 inline-block rounded-full px-3 py-1 text-sm font-semibold text-[var(--brand-500)]"
					>{t('NEW • 2025', 'BARU • 2025')}</span
				>

				<h1 class="mt-6 text-4xl font-extrabold leading-tight lg:text-6xl">
					{t('Borderless payments for everyone.', 'Pembayaran tanpa batas untuk semua orang.')}
				</h1>

				<p class="mt-4 max-w-xl text-lg text-[var(--muted)]">
					{t(
						'Send and receive money instantly, anywhere — 100% non-custodial, transparent fees, invoice-ready, and optimized for digital products.',
						'Kirim dan terima uang secara instan, di mana saja — 100% non-custodial, biaya transparan, siap invoice, dan dioptimalkan untuk produk digital.'
					)}
				</p>

				<div class="mt-6 flex flex-wrap items-center gap-4">
					<!-- store badges (inline svg simplified) -->
					<div class="flex items-center gap-3">
						<a
							href="https://play.google.com/store/apps/details?id=com.barterin"
							target="_blank"
							rel="noopener"
							aria-label="Google Play Store"
						>
							<img
								src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
								alt="Google Play Store"
								class="w-36"
							/>
						</a>
						<a
							href="https://apps.apple.com/app/barterin/id123456789"
							target="_blank"
							rel="noopener"
							aria-label="App Store"
						>
							<img
								src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
								alt="App Store"
								class="w-36"
							/>
						</a>
					</div>
				</div>
			</div>
		</div>

		<!-- Animated mock floating card -->
		<div class="flex-1">
			<div class="float-card glass p-6">
				<div class="relative overflow-hidden rounded-2xl">
					<div class="p-6">
						<div class="flex items-center justify-between">
							<div>
								<div class="text-sm text-[var(--muted)]">{t('Balance', 'Saldo')}</div>
								<div class="text-2xl font-bold">1,250.00</div>
							</div>
							<div class="text-xs text-[var(--muted)]">
								{t('Last: 2m ago', 'Terakhir: 2m lalu')}
							</div>
						</div>

						<div class="mt-6 flex gap-3">
							<button class="rounded-lg border bg-white px-4 py-2 text-[var(--brand-500)]"
								>{t('Send', 'Kirim')}</button
							>
							<button class="rounded-lg bg-[var(--brand-500)] px-4 py-2 text-white"
								>{t('Request', 'Minta')}</button
							>
						</div>

						<div class="mt-6">
							<div class="text-sm text-[var(--muted)]">{t('Recent', 'Terbaru')}</div>
							<div class="mt-3 space-y-3">
								<div class="flex items-center justify-between text-sm">
									<div class="flex items-center gap-3">
										<div
											class="bg-[var(--brand-400)]/20 flex h-9 w-9 items-center justify-center rounded-md"
										>
											👤
										</div>
										<div>
											<div class="font-medium">alex_92</div>
											<div class="text-xs text-[var(--muted)]">
												{t('Coffee shop', 'Kedai kopi')}
											</div>
										</div>
									</div>
									<div class="font-semibold">+50</div>
								</div>

								<div class="flex items-center justify-between text-sm">
									<div class="flex items-center gap-3">
										<div
											class="bg-[var(--accent)]/20 flex h-9 w-9 items-center justify-center rounded-md"
										>
											🏷️
										</div>
										<div>
											<div class="font-medium">invoice #239</div>
											<div class="text-xs text-[var(--muted)]">
												{t('Design work', 'Pekerjaan desain')}
											</div>
										</div>
									</div>
									<div class="font-semibold">+300</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- FEATURES GRID -->
	<section id="features" class="mx-auto mt-20 max-w-7xl px-6">
		<h2 class="mb-8 text-3xl font-extrabold">{t('Core Features', 'Fitur Utama')}</h2>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			<!-- cards with svg icons -->
			<FeatureCard
				icon="🌐"
				title={t('Borderless & Global', 'Borderless & Global')}
				desc={t(
					'Send money across countries without bank constraints.',
					'Kirim uang lintas negara tanpa batas bank.'
				)}
			/>
			<FeatureCard
				icon="🔒"
				title={t('100% Non-custodial', '100% Non-custodial')}
				desc={t(
					'You keep the keys — we never hold funds.',
					'Kamu pegang kuncinya — kami tidak menyimpan dana.'
				)}
			/>
			<FeatureCard
				icon="⚡"
				title={t('Near-Instant Settlement', 'Penyelesaian Hampir Instan')}
				desc={t(
					'Fast settlement using intelligent routing.',
					'Penyelesaian cepat dengan routing pintar.'
				)}
			/>
			<FeatureCard
				icon="💸"
				title={t('Transparent Fees', 'Biaya Transparan')}
				desc={t('Fees shown upfront, no surprises.', 'Biaya ditampilkan di depan, tanpa kejutan.')}
			/>
			<FeatureCard
				icon="🧾"
				title={t('Invoice Support', 'Dukungan Invoice')}
				desc={t(
					'Create shareable QR invoices for payers.',
					'Buat invoice QR yang bisa dibagikan ke pengirim.'
				)}
			/>
			<FeatureCard
				icon="🛒"
				title={t('Digital Product Ready', 'Siap Produk Digital')}
				desc={t(
					'Sell digital goods with automated delivery.',
					'Jual produk digital dengan pengiriman otomatis.'
				)}
			/>
		</div>
	</section>

	<!-- FLOW DETAIL with images per step -->
	<section id="flow" class="mx-auto mt-24 max-w-7xl px-6">
		<h2 class="mb-6 text-3xl font-extrabold">{t('Payment Flow', 'Alur Pembayaran')}</h2>

		<div class="grid gap-10 md:grid-cols-2">
			<!-- SEND FLOW -->
			<div>
				<div class="mb-4 text-xl font-bold text-[var(--brand-500)]">
					{t('Sender Flow', 'Alur Pengirim')}
				</div>
				<div class="space-y-6">
					<StepCard
						idx={1}
						img="https://cdn.simpleicons.org/telegram/00c2ff"
						title={t(
							'Enter receiver username or wallet address',
							'Masukkan username atau wallet address penerima'
						)}
					/>
					<StepCard
						idx={2}
						img="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/bitcoin.svg"
						title={t('Type amount to send', 'Masukkan jumlah yang akan dikirim')}
					/>
					<StepCard
						idx={3}
						img="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/usd.svg"
						title={t(
							'Tap Barter — payment completes near-instantly',
							'Klik Barter — pembayaran selesai hampir instan'
						)}
					/>
				</div>
			</div>

			<!-- RECEIVE FLOW -->
			<div>
				<div class="mb-4 text-xl font-bold text-[var(--brand-500)]">
					{t('Receiver Flow', 'Alur Penerima')}
				</div>
				<div class="space-y-6">
					<StepCard
						idx={1}
						img="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/file.svg"
						title={t('Create invoice', 'Buat invoice')}
						desc={t('Add item name, qty and subtotal', 'Masukkan nama item, qty, dan subtotal')}
					/>
					<StepCard
						idx={2}
						img="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/qrcode.svg"
						title={t('Generate shareable QR code', 'Hasilkan QR code yang dapat dibagikan')}
					/>
					<StepCard
						idx={3}
						img="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/link.svg"
						title={t(
							'Optionally attach product link (hidden until paid)',
							'Opsional tambahkan link produk (tersembunyi sampai dibayar)'
						)}
					/>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA BAND -->
	<div class="mt-24 py-12">
		<div
			class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row"
		>
			<div>
				<div class="text-xl font-bold">{t('Ready to go borderless?', 'Siap tanpa batas?')}</div>
				<div class="text-[var(--muted)]">
					{t(
						'Create account and start sending or invoicing in minutes.',
						'Buat akun dan mulai kirim atau buat invoice dalam hitungan menit.'
					)}
				</div>
			</div>

			<!-- <div class="flex gap-3">
        <a href="#" class="px-5 py-3 rounded-lg bg-[var(--brand-500)] text-white">{t('Create account','Buat akun')}</a>
        <a href="#" class="px-5 py-3 rounded-lg border">{t('Contact sales','Hubungi sales')}</a>
      </div> -->
		</div>
	</div>

	<!-- FULL-WIDTH FOOTER -->
	<footer class="from-[var(--brand-500)]/8 mt-20 w-full bg-gradient-to-b to-transparent">
		<div class="footer-wave"></div>
		<div class="mx-auto grid max-w-7xl items-start gap-6 px-6 py-12 md:grid-cols-3">
			<div>
				<div class="text-2xl font-bold">Barterin</div>
				<div class="mt-2 text-sm text-[var(--muted)]">
					{t(
						'Borderless payments — built for people and businesses.',
						'Pembayaran tanpa batas — dibuat untuk individu dan bisnis.'
					)}
				</div>
			</div>

			<div class="flex gap-6">
				<!-- <div>
          <div class="font-semibold mb-2">{t('Product','Produk')}</div>
          <a href="#">{t('Features','Fitur')}</a><br/>
          <a href="#">{t('Pricing','Harga')}</a><br/>
          <a href="#">{t('Docs','Dokumentasi')}</a>
        </div>
        <div>
          <div class="font-semibold mb-2">{t('Company','Perusahaan')}</div>
          <a href="#">{t('About','Tentang')}</a><br/>
          <a href="#">{t('Careers','Karir')}</a><br/>
          <a href="#">{t('Contact','Kontak')}</a>
        </div> -->
			</div>

			<div class="flex flex-col items-end gap-4">
				<div class="flex items-center gap-3">
					<a
						href="https://www.linkedin.com/company/barterin"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Barterin LinkedIn"
					>
						<!-- linkedin icon -->
						<svg
							width="28"
							height="28"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							><rect width="24" height="24" rx="6" fill="white" /><path
								d="M7.5 10.5v6H5V10.5h2.5zM6.25 9.25a1.35 1.35 0 100-2.7 1.35 1.35 0 000 2.7zM13.5 10.5c1.2 0 1.9.8 2.2 1.4v-1.4h2.5v6h-2.6v-3c0-.8 0-2-1.4-2s-1.6 1-1.6 2v3H11v-6h2.5v.6z"
								fill="#0f172a"
							/></svg
						>
					</a>
					<div class="text-sm text-[var(--muted)]">{t('Follow us', 'Ikuti kami')}</div>
				</div>

				<div class="text-sm text-[var(--muted)]">© 2025 Barterin</div>
			</div>
		</div>
	</footer>
</section>

<!-- THEME TOKENS (Tailwind config recommended to sync these tokens) -->
<style>
	:global(:root) {
		--brand-500: #2f5aff; /* primary */
		--brand-400: #4b6bff;
		--accent: #00c2ff; /* secondary */
		--surface: #ffffff;
		--muted: #64748b;
		--bg-gradient:
			radial-gradient(1200px 400px at 10% 10%, rgba(47, 90, 255, 0.08), transparent 12%),
			linear-gradient(180deg, #f8fbff 0%, #eef8ff 100%);
		--glass: rgba(255, 255, 255, 0.6);
		--radius-lg: 20px;
		--shadow-lg: 0 12px 40px rgba(15, 23, 42, 0.08);
	}
	:global(body) {
		background: var(--bg-gradient);
		font-family:
			Inter,
			ui-sans-serif,
			system-ui,
			-apple-system,
			Segoe UI,
			Roboto,
			'Helvetica Neue',
			Arial;
		color: var(--dark, #0f172a);
	}

	/* Floating hero card animation */
	.float-card {
		animation: float 6s ease-in-out infinite;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
	}
	@keyframes float {
		0% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-8px);
		}
		100% {
			transform: translateY(0);
		}
	}

	/* subtle pulse for CTA */
	.pulse-cta {
		position: relative;
	}
	.pulse-cta::after {
		content: '';
		position: absolute;
		inset: -6px;
		border-radius: 14px;
		background: radial-gradient(circle at center, rgba(47, 90, 255, 0.12), transparent 30%);
		opacity: 0;
		transition: opacity 0.25s;
	}
	.pulse-cta:hover::after {
		opacity: 1;
	}

	/* hero illustration glass */
	.glass {
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.45));
		backdrop-filter: blur(6px);
		border: 1px solid rgba(255, 255, 255, 0.5);
	}

	/* responsive tweaks */
	@media (max-width: 768px) {
		.desktop-only {
			display: none;
		}
		.mobile-only {
			display: block;
		}
	}
	@media (min-width: 769px) {
		.mobile-only {
			display: none;
		}
		.desktop-only {
			display: block;
		}
	}

	/* Footer */
	.footer-wave {
		height: 120px;
		background: linear-gradient(180deg, rgba(47, 90, 255, 0.07), transparent);
	}
</style>
