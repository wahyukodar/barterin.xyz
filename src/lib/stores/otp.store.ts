// src/lib/stores/otp.store.ts
import { persisted } from 'svelte-persisted-store';
import { derived, readable, writable, type Readable } from 'svelte/store';

/**
 * Menyimpan expiry timestamp per key (ms epoch).
 * Contoh key: nomor HP "628123..." atau "otp:628123..."
 */
type CountdownMap = Record<string, number>;
export const otpExpiries = persisted<CountdownMap>('otpExpiries', {});

// Ticker global: memicu re-render setiap detik
const now = writable<number>(Date.now());
let ticker: number | null = null;

function ensureTicker() {
	if (ticker !== null) return;
	if (typeof window === 'undefined') return; // SSR guard
	ticker = window.setInterval(() => now.set(Date.now()), 1000);
}

function clearTickerIfIdle() {
	if (typeof window === 'undefined') return;
	let hasAny = false;
	const unsub = otpExpiries.subscribe((m) => {
		hasAny = Object.keys(m).length > 0;
	});
	unsub();
	if (!hasAny && ticker !== null) {
		clearInterval(ticker);
		ticker = null;
	}
}

/**
 * Memulai/menyetel countdown untuk key tertentu.
 * @param key - identifier unik, mis: nomor HP
 * @param expiresAt - ISO string / Date / epoch ms
 */
export function startCountdown(key: string, expiresAt: string | number | Date) {
	const expiryMs =
		typeof expiresAt === 'string'
			? new Date(expiresAt).getTime()
			: expiresAt instanceof Date
				? expiresAt.getTime()
				: Number(expiresAt);

	otpExpiries.update((m) => ({ ...m, [key]: expiryMs }));
	ensureTicker();
}

/**
 * Hentikan countdown (hapus key).
 */
export function stopCountdown(key: string) {
	otpExpiries.update((m) => {
		const { [key]: _, ...rest } = m;
		return rest;
	});
	clearTickerIfIdle();
}

/**
 * Bersihkan semua countdown.
 */
export function clearAllCountdowns() {
	otpExpiries.set({});
	clearTickerIfIdle();
}

/**
 * Buat store "remaining seconds" untuk key tertentu.
 * Nilai 0 artinya tidak aktif / sudah habis.
 */
export function createCountdown(key: string): Readable<number> {
	ensureTicker();
	return derived([otpExpiries, now], ([$exp, $now]) => {
		const expiry = $exp[key];
		if (!expiry) return 0;

		const remaining = Math.max(0, Math.floor((expiry - $now) / 1000));
		// Auto-clean saat habis
		if (remaining <= 0) {
			// hapus key agar tombol otomatis enable
			otpExpiries.update((m) => {
				const { [key]: _, ...rest } = m;
				return rest;
			});
			clearTickerIfIdle();
			return 0;
		}
		return remaining;
	});
}

/**
 * Helper: readable 0 (fallback awal sebelum key diketahui).
 */
export const zeroCountdown: Readable<number> = readable(0, () => {});

/**
 * Cek apakah aktif: derived boolean dari countdown.
 */
export function createIsActive(key: string): Readable<boolean> {
	const c = createCountdown(key);
	return derived(c, (s) => s > 0);
}
