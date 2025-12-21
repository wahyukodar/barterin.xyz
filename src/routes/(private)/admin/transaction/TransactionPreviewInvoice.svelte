<script lang="ts">
	import { useTransactionDetails } from '$lib/hooks/transaction.hook';
	import { printerStore, setPrinter } from '$lib/stores/printer.store';
	import { Tooltip } from '@skeletonlabs/skeleton-svelte';
	import { CircleAlertIcon, FileText, FlaskConical, Settings2 } from 'lucide-svelte';
	import qz from 'qz-tray';

	const selectedPrinter = printerStore;

	// Props dari parent component
	const { selectedTransaction, showPreviewInvoice, onClose, onSuccess } = $props<{
		selectedTransaction: any;
		showPreviewInvoice: boolean;
		onClose: () => void;
		onSuccess: () => void;
	}>();

	// Query store
	const transactionDetailsQuery = $derived(
		useTransactionDetails(selectedTransaction?.invoice?.[0]?.invoiceCode || '')
	);

	// Derived values
	const transactionDetails = $derived(
		$transactionDetailsQuery.data?.data?.transaction?.transactionDetail ?? []
	);
	const detailsTransaction = $derived($transactionDetailsQuery.data?.data?.transaction ?? null);
	const detailsInvoice = $derived($transactionDetailsQuery.data?.data?.invoice ?? null);

	// Helper functions
	function getCustomerName() {
		if (!selectedTransaction) return '';
		// Try to get from details first, then fallback to selectedTransaction
		const transaction = detailsTransaction || selectedTransaction;
		if (transaction.langgananCid && selectedTransaction.langganan) {
			if (selectedTransaction.langganan.langgananIDType === 'PHONE') {
				return `${selectedTransaction.langganan.name} (${selectedTransaction.langganan.requester})`;
			}
			return selectedTransaction.langganan.name;
		}
		return transaction.guestCustomer || 'Guest';
	}

	function getInvoiceData() {
		// Use details invoice if available, otherwise fallback to selectedTransaction
		return detailsInvoice || selectedTransaction?.invoice?.[0] || null;
	}

	function getPaymentData() {
		const invoice = getInvoiceData();
		// Payment data is still in selectedTransaction structure
		return selectedTransaction?.invoice?.[0]?.invoicePayment?.[0] || null;
	}

	function formatDateTime(dateString: string) {
		const date = new Date(dateString);
		const dateStr = date.toLocaleDateString('id-ID', {
			day: '2-digit',
			month: '2-digit',
			year: '2-digit'
		});
		const timeStr = date.toLocaleTimeString('id-ID', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false
		});
		return { date: dateStr, time: timeStr };
	}

	function formatCurrency(amount: any) {
		const num = typeof amount === 'string' ? parseInt(amount) : amount;
		return num ? num.toLocaleString('id-ID') + ',00' : '0,00';
	}

	// ESC/POS Commands constants
	const ESC = '\x1B';
	const GS = '\x1D';
	const INIT = ESC + '@';
	const BOLD_ON = ESC + 'E' + '\x01';
	const BOLD_OFF = ESC + 'E' + '\x00';
	const ALIGN_LEFT = ESC + 'a' + '\x00';
	const ALIGN_CENTER = ESC + 'a' + '\x01';
	const ALIGN_RIGHT = ESC + 'a' + '\x02';
	const CUT = GS + 'V' + '\x41' + '\x00';
	const FEED = (n: number) => ESC + 'd' + String.fromCharCode(n);

	// Print HTML document biasa
	function handlePrintHTML() {
		const printWindow = window.open('', '_blank');
		if (!printWindow) return;

		const invoice = getInvoiceData();
		const payment = getPaymentData();
		const customerName = getCustomerName();
		const dateTime = formatDateTime(selectedTransaction.createdAt);

		printWindow.document.write(`
			<!DOCTYPE html>
			<html>
			<head>
				<title>Invoice - ${invoice?.invoiceCode}</title>
				<style>
					body { 
						font-family: 'Courier New', monospace; 
						font-size: 12px; 
						line-height: 1.3;
						margin: 20px;
						width: 300px;
					}
					.center { text-align: center; }
					.bold { font-weight: bold; }
					.receipt-header { margin-bottom: 10px; }
					.separator { border-top: 1px dashed #000; margin: 5px 0; }
					.item-line { display: flex; justify-content: space-between; }
					.total-section { margin-top: 10px; }
					.footer { margin-top: 15px; font-size: 10px; }
					@media print {
						body { margin: 0; }
						@page { margin: 0.5in; }
					}
				</style>
			</head>
			<body>
				<div class="center receipt-header">
					<div style="display: flex; align-items: center; justify-content: center; gap: 5px; margin-bottom: 10px;">
						<span style="font-size: 8px;">●●●</span>
						<span class="bold" style="font-size: 16px;">Langgananku</span>
					</div>
					<div class="bold" style="font-size: 14px; margin: 10px 0;">SERBA SNACK</div>
					<div style="font-size: 10px;">
						JL. KAMPUNG SAWAH, JATIMULYA<br>
						CILODONG<br>
						DEPOK<br>
						Telp: &nbsp;&nbsp;&nbsp;&nbsp; Fax: &nbsp;&nbsp;&nbsp; Email:
					</div>
				</div>

				<div style="font-size: 10px; margin: 10px 0;">
					<div style="display: flex; justify-content: space-between;">
						<span>No.: ${invoice?.invoiceCode || ''}</span>
						<span>${dateTime.date}</span>
					</div>
					<div style="display: flex; justify-content: space-between;">
						<span>Kasir: ADMIN</span>
						<span>${dateTime.time}</span>
					</div>
					<div>Pel: ${customerName}</div>
				</div>

				<div class="separator"></div>

				<div style="font-size: 10px;">
					${transactionDetails
						.map((detail: any) => {
							const itemName = detail.productVariationName || 'Unknown Item';
							const qty = detail.qty || 0;
							const price = parseInt(detail.price) || 0;
							const subtotal = parseInt(detail.subTotal) || qty * price;

							return `
							<div style="margin: 3px 0;">
								<div style="display: flex; justify-content: space-between;">
									<span>${itemName}</span>
									<span>${detail.uom || 'DUS'}</span>
								</div>
								<div style="display: flex; justify-content: space-between; padding-left: 10px;">
									<span>${price.toLocaleString('id-ID')} x ${qty} =</span>
									<span>${subtotal.toLocaleString('id-ID')},00</span>
								</div>
							</div>
						`;
						})
						.join('')}
				</div>

				<div class="separator"></div>

				<div class="total-section" style="font-size: 10px;">
					<div style="display: flex; justify-content: space-between;">
						<span>BRS-B &nbsp; QTY=${transactionDetails.length}</span>
						<span>${formatCurrency(detailsTransaction?.grandTotal || selectedTransaction.grandTotal)}</span>
					</div>
					<div style="display: flex; justify-content: space-between;" class="bold">
						<span>Total</span>
						<span>${formatCurrency(detailsTransaction?.grandTotal || selectedTransaction.grandTotal)}</span>
					</div>
					
					${
						payment
							? `
						<div style="margin-top: 10px;">
							<div style="display: flex; justify-content: space-between;">
								<span>Bayar</span>
								<span>${formatCurrency(payment.paymentAmount)}</span>
							</div>
							<div style="display: flex; justify-content: space-between;">
								<span>Kembali</span>
								<span>${formatCurrency(payment.changeAmount)}</span>
							</div>
						</div>
					`
							: ''
					}
				</div>

				<div class="footer center">
					Barang yang telah dibeli tidak<br>
					dapat dikembalikan kecuali ada<br>
					perjanjian
				</div>
			</body>
			</html>
		`);

		printWindow.document.close();
		printWindow.focus();

		// Auto print after content loads
		setTimeout(() => {
			printWindow.print();
			printWindow.close();
		}, 250);
	}

	// Fungsi untuk memilih printer
	async function selectPrinter(): Promise<string | null> {
		try {
			if (!qz.websocket.isActive()) {
				await qz.websocket.connect();
			}

			const printers = await qz.printers.find();
			const printerList = Array.isArray(printers) ? printers : [printers];

			if (printerList.length === 0) {
				alert('Tidak ada printer ditemukan!');
				return null;
			}

			// Overlay
			const overlay = document.createElement('div');
			overlay.className =
				'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';

			// Dialog
			const dialog = document.createElement('div');
			dialog.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-80';

			dialog.innerHTML = `
			<h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Pilih Printer</h3>
			<select id="printer-select" class="w-full mb-4 p-2 border rounded-md text-gray-800 dark:text-gray-100 dark:bg-gray-700">
				${printerList
					.map((p) => `<option value="${p}" ${p === $printerStore ? 'selected' : ''}>${p}</option>`)
					.join('')}
			</select>
			<div class="flex justify-end gap-2">
				<button id="cancel-select" class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-100">Batal</button>
				<button id="confirm-select" class="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white">Pilih</button>
			</div>
		`;

			overlay.appendChild(dialog);
			document.body.appendChild(overlay);

			return new Promise((resolve) => {
				const selectEl = overlay.querySelector('#printer-select') as HTMLSelectElement;
				const confirmBtn = overlay.querySelector('#confirm-select') as HTMLButtonElement;
				const cancelBtn = overlay.querySelector('#cancel-select') as HTMLButtonElement;

				const cleanup = () => {
					document.body.removeChild(overlay);
				};

				confirmBtn.onclick = () => {
					const selected = selectEl.value;
					setPrinter(selected);
					cleanup();
					resolve(selected);
				};

				cancelBtn.onclick = () => {
					cleanup();
					resolve(null);
				};
			});
		} catch (error) {
			console.error('Error selecting printer:', error);
			alert('Gagal mengambil daftar printer: ' + error);
			return null;
		}
	}

	// Print ke QZ Tray dengan format ESC/POS
	async function handlePrintQZ() {
		try {
			if (!selectedTransaction) return;

			// Pastikan koneksi QZ Tray
			if (!qz.websocket.isActive()) {
				await qz.websocket.connect();
			}

			// Dapatkan printer yang dipilih
			let printerName = $selectedPrinter;
			if (!printerName) {
				printerName = await selectPrinter();
				if (!printerName) return; // User membatalkan
			}

			const config = qz.configs.create(printerName, {
				// Konfigurasi untuk printer thermal
				encoding: 'GBK' // Encoding yang cocok untuk karakter Indonesia
				// End of line character
				// endOfLine: '\n'
			});

			const invoice = getInvoiceData();
			const payment = getPaymentData();
			const customerName = getCustomerName();
			const { date, time } = formatDateTime(selectedTransaction.createdAt);

			// Siapkan data ESC/POS
			const data = [
				// Inisialisasi printer
				INIT,

				// Header struk
				ALIGN_CENTER,
				BOLD_ON,
				'      Langgananku\n\n',
				'        SERBA SNACK\n\n',
				BOLD_OFF,
				'JL. KAMPUNG SAWAH, JATIMULYA\n',
				'CILODONG\n',
				'DEPOK\n',
				'Telp:    Fax:   Email:\n\n',

				// Informasi transaksi
				ALIGN_LEFT,
				`No.: ${invoice?.invoiceCode || ''}    ${date}\n`,
				`Kasir: ADMIN              ${time}\n`,
				`Pel: ${customerName}\n`,
				'================================\n'
			];

			// Tambahkan item transaksi
			transactionDetails.forEach((detail: any) => {
				const itemName = detail.productVariationName || 'Unknown Item';
				const qty = detail.qty || 0;
				const price = parseInt(detail.price) || 0;
				const subtotal = parseInt(detail.subTotal) || qty * price;

				// Pastikan nama item tidak terlalu panjang
				const truncatedName = itemName.length > 20 ? itemName.substring(0, 17) + '...' : itemName;

				data.push(
					`${truncatedName}${' '.repeat(22 - truncatedName.length)}${detail.uom || 'DUS'}\n`,
					`${price.toLocaleString('id-ID')}    x ${qty}    =    ${subtotal.toLocaleString('id-ID')},00\n`
				);
			});

			// Tambahkan footer dan total
			data.push(
				'--------------------------------\n',
				`BRS-B   QTY=${transactionDetails.length}    ${formatCurrency(detailsTransaction?.grandTotal || selectedTransaction.grandTotal)}\n`,
				`Total              ${formatCurrency(detailsTransaction?.grandTotal || selectedTransaction.grandTotal)}\n\n`
			);

			// Tambahkan informasi pembayaran jika ada
			if (payment) {
				data.push(
					`Bayar              ${formatCurrency(payment.paymentAmount)}\n`,
					`Kembali            ${formatCurrency(payment.changeAmount)}\n\n`
				);
			}

			// Tambahkan footer dan potong kertas
			data.push(
				'Barang yang telah dibeli tidak\n',
				'dapat dikembalikan kecuali ada\n',
				'perjanjian\n\n\n',
				FEED(3), // Feed 3 lines
				CUT // Potong kertas
			);

			// Kirim perintah ke printer
			await qz.print(config, data);
			alert('Print sukses ✅');
		} catch (err) {
			console.error('Print error:', err);
			alert('Print gagal ❌ ' + err);
		}
	}

	// Test print dengan ESC/POS
	async function handleTestPrintQZ() {
		try {
			if (!qz.websocket.isActive()) {
				await qz.websocket.connect();
			}

			// Dapatkan printer yang dipilih
			let printerName = $selectedPrinter;
			if (!printerName) {
				printerName = await selectPrinter();
				if (!printerName) return; // User membatalkan
			}

			const config = qz.configs.create(printerName, {
				encoding: 'GBK'
				// endOfLine: '\n'
			});

			// Data test dengan format ESC/POS
			const testData = [
				INIT,
				ALIGN_CENTER,
				BOLD_ON,
				'TEST PRINT\n\n',
				BOLD_OFF,
				ALIGN_LEFT,
				'================================\n',
				`Tanggal: ${new Date().toLocaleDateString('id-ID')}\n`,
				`Jam: ${new Date().toLocaleTimeString('id-ID')}\n`,
				'Printer: ' + printerName + '\n',
				'================================\n\n',
				'Status: OK\n\n\n',
				FEED(2),
				CUT
			];

			await qz.print(config, testData);
			alert(`Test Print sukses ✅\nPrinter: ${printerName}`);
		} catch (err) {
			console.error('Test print error:', err);
			alert('Test Print gagal ❌ ' + err);
		}
	}

	// Fungsi untuk mengubah printer yang dipilih
	async function changePrinter() {
		const newPrinter = await selectPrinter();
		if (newPrinter) {
			alert(`Printer berhasil diubah ke: ${newPrinter}`);
		}
	}
</script>

<!-- Modal UI (tetap sama seperti sebelumnya) -->
{#if showPreviewInvoice && selectedTransaction}
	<!-- Modal Overlay -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<div
			class="dark:bg-surface-800 mx-4 max-h-[90vh] w-full max-w-md rounded-lg bg-white shadow-xl"
		>
			<!-- HEADER -->
			<div class="border-surface-300 dark:border-surface-700 border-b p-3">
				<div class="flex items-center justify-between gap-3">
					<div class="flex items-center gap-2">
						<!-- <h2 class="text-lg font-semibold">Preview Invoice</h2> -->
						{#if $selectedPrinter}
							<span
								class="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700/60 dark:text-gray-100"
							>
								🖨️ {$selectedPrinter}
							</span>
						{:else}
							<span
								class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800"
							>
								Belum pilih printer
							</span>
						{/if}
					</div>

					<!-- ACTIONS TOP -->
					<div class="flex items-center gap-2">
						<button
							onclick={handlePrintHTML}
							class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50"
							title="Print HTML (Browser)"
						>
							<FileText class="h-4 w-4" />
						</button>

						<!-- <button
							onclick={handlePrintQZ}
							class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
							title="Print QZ Tray (Thermal)"
						>
							<Printer class="h-4 w-4" /> <span class="hidden sm:inline">QZ</span>
						</button> -->

						<button
							onclick={handleTestPrintQZ}
							class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50"
							title="Test Print"
						>
							<FlaskConical class="h-4 w-4" />
						</button>

						<button
							onclick={changePrinter}
							class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50"
							title="Ganti / Select Printer"
						>
							<Settings2 class="h-4 w-4" />
						</button>

						<Tooltip
							positioning={{ placement: 'top' }}
							triggerBase="underline"
							contentBase="card preset-filled p-4 max-w-xs text-sm leading-relaxed"
							openDelay={200}
							zIndex={'1000'}
							arrow
						>
							{#snippet trigger()}
								<a
									href="https://qz.io/download/"
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50"
								>
									<CircleAlertIcon size={20} class="h-4 w-4" />
								</a>
							{/snippet}

							{#snippet content()}
								<div>
									<p class="mb-1 font-semibold">Cara Install QZ Tray:</p>
									<ol class="list-inside list-decimal space-y-1">
										<li>
											Download QZ Tray dari <a
												href="https://qz.io/download/"
												target="_blank"
												class="text-blue-500 underline">qz.io</a
											>
										</li>
										<li>Install sesuai OS (Windows, macOS, Linux)</li>
										<li>Jalankan aplikasi QZ Tray</li>
										<li>Izinkan akses browser saat diminta</li>
									</ol>
									<p class="mt-2 text-xs text-gray-400">⚠️ Wajib dijalankan sebelum bisa print</p>
								</div>
							{/snippet}
						</Tooltip>

						<!-- <button
							aria-label="Close"
							onclick={onClose}
							class="text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 ml-1 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700/60"
							title="Tutup"
						>
							<X class="h-5 w-5" />
						</button> -->
					</div>
				</div>
			</div>

			<!-- Header -->
			<div
				class="border-surface-300 dark:border-surface-700 flex items-center justify-between border-b p-4"
			>
				<h2 class="text-lg font-semibold">Preview Invoice</h2>
				<button
					aria-label="Close"
					onclick={onClose}
					class="text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						></path>
					</svg>
				</button>
			</div>

			<!-- Content -->
			<div class="flex h-[calc(90vh-8rem)] flex-col">
				<!-- Invoice Preview - scrollable -->
				<div class="flex-1 overflow-y-auto p-4">
					<!-- Receipt-style layout matching the image -->
					<div class="font-mono text-sm leading-tight">
						<!-- Header -->
						<div class="mb-4 text-center">
							<div class="mb-2 flex items-center justify-center gap-2">
								<div class="flex gap-1">
									<div class="h-2 w-2 rounded-full bg-black"></div>
									<div class="h-2 w-2 rounded-full bg-black"></div>
									<div class="h-2 w-1 rounded-full bg-black"></div>
								</div>
								<span class="text-lg font-bold">Langgananku</span>
							</div>

							<div class="mb-4 mt-4">
								<div class="text-base font-bold">SERBA SNACK</div>
							</div>

							<div class="text-xs leading-tight">
								<div>JL. KAMPUNG SAWAH, JATIMULYA</div>
								<div>CILODONG</div>
								<div>DEPOK</div>
								<div>Telp: &nbsp;&nbsp;&nbsp;&nbsp; Fax: &nbsp;&nbsp;&nbsp; Email:</div>
							</div>
						</div>

						<!-- Transaction Info -->
						<div class="mb-2 text-xs">
							<div class="flex justify-between">
								<span>No.: {getInvoiceData()?.invoiceCode || ''}</span>
								<span>{formatDateTime(selectedTransaction.createdAt).date}</span>
							</div>
							<div class="flex justify-between">
								<span>Kasir: ADMIN</span>
								<span>{formatDateTime(selectedTransaction.createdAt).time}</span>
							</div>
							<div>Pel: {getCustomerName()}</div>
						</div>

						<!-- Separator -->
						<div class="my-2 border-t border-dashed border-gray-400"></div>

						<!-- Items -->
						<div class="space-y-1 text-xs">
							{#each transactionDetails as detail}
								{@const itemName = detail.productVariationName || 'Unknown Item'}
								{@const qty = detail.qty || 0}
								{@const price = parseInt(detail.price) || 0}
								{@const subtotal = parseInt(detail.subTotal) || qty * price}

								<div class="space-y-0">
									<div class="flex justify-between">
										<span>{itemName}</span>
										<span>{detail.uom || 'DUS'}</span>
									</div>
									<div class="flex justify-between pl-2">
										<span>{price.toLocaleString('id-ID')} &nbsp; x {qty} &nbsp; =</span>
										<span>{subtotal.toLocaleString('id-ID')},00</span>
									</div>
								</div>
							{/each}
						</div>

						<!-- Separator -->
						<div class="my-2 border-t border-dashed border-gray-400"></div>

						<!-- Summary -->
						<div class="space-y-1 text-xs">
							<div class="flex justify-between">
								<span>BRS-B &nbsp; QTY={transactionDetails.length}</span>
								<span>{formatCurrency(selectedTransaction.grandTotal)}</span>
							</div>
							<div class="flex justify-between font-bold">
								<span>Total</span>
								<span>{formatCurrency(selectedTransaction.grandTotal)}</span>
							</div>

							{#if getPaymentData()}
								{@const payment = getPaymentData()}
								<div class="mt-2 space-y-1">
									<div class="flex justify-between">
										<span>Bayar</span>
										<span>{formatCurrency(payment.paymentAmount)}</span>
									</div>
									<div class="flex justify-between">
										<span>Kembali</span>
										<span>{formatCurrency(payment.changeAmount)}</span>
									</div>
								</div>
							{/if}
						</div>

						<!-- Footer -->
						<div class="mt-4 text-center text-xs leading-tight">
							<div>Barang yang telah dibeli tidak</div>
							<div>dapat dikembalikan kecuali ada</div>
							<div>perjanjian</div>
						</div>
					</div>
				</div>

				<!-- Fixed Print Buttons at bottom -->
				<div class="border-surface-300 dark:border-surface-700 space-y-2 border-t p-4">
					<button
						onclick={handlePrintQZ}
						class="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white shadow-md transition-colors hover:bg-blue-700"
					>
						Cetak ke Thermal
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
