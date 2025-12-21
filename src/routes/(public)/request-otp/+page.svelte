<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { AuthService } from '$lib/api/auth.service';
	import { DEFAULT_ADMIN_DASHBOARD_URL, LOGIN_URL } from '$lib/constants/url.constant';
	import { AuthGuard } from '$lib/guards/auth.guard';
	import { setLoginData } from '$lib/stores/login.store';
	import { startCountdown } from '$lib/stores/otp.store';
	import { AlertError } from '$lib/utils/alert.util';
	import { FormatPhoneNumber } from '$lib/utils/phone.util';
	import { Tooltip } from '@skeletonlabs/skeleton-svelte';
	import type { AxiosError } from 'axios';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

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

	let companyPhone = '';
	let cashierPhone = '';
	let isCashier = false;
	let remember = false;

	const isLoading = writable(false);
	const error = writable('');

	function handleKasirToggle() {
		if (!isCashier) cashierPhone = '';
	}

	function handlePhoneInput(event: Event, field: 'company' | 'cashier') {
		const target = event.target as HTMLInputElement;
		const formatted = FormatPhoneNumber(target.value);
		if (field === 'company') companyPhone = formatted;
		if (field === 'cashier') cashierPhone = formatted;
	}

	async function handleRequestOTP() {
		error.set('');

		if (!companyPhone.trim()) {
			error.set('Nomor HP Bisnis harus diisi');
			return;
		}

		if (isCashier && !cashierPhone.trim()) {
			error.set('Nomor Kasir harus diisi');
			return;
		}

		isLoading.set(true);

		try {
			const phone = companyPhone.trim();

			const payload: Record<string, any> = { phone };
			if (isCashier) {
				payload.cashierPhone = cashierPhone.trim();
			}
			const response = await AuthService.requestOtp(payload);

			if (response.status === 200) {
				// Simpan ke store persisted
				setLoginData({
					companyPhone,
					cashierPhone: isCashier ? cashierPhone : '',
					isCashier,
					remember
				});
				const expiresAt = response.data?.data?.expiresAt;
				if (expiresAt)
					startCountdown(isCashier ? cashierPhone.trim() : companyPhone.trim(), expiresAt);
				goto(LOGIN_URL);
			} else {
				AlertError(response.data?.message || 'Terjadi kesalahan saat meminta OTP');
				error.set(response.data?.message || 'Terjadi kesalahan saat meminta OTP');
			}
		} catch (err: AxiosError | any) {
			AlertError(err.response?.data?.message || 'Terjadi kesalahan saat meminta OTP');
		} finally {
			isLoading.set(false);
		}
	}
</script>

<svelte:head>
	<title>Request OTP</title>
</svelte:head>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
>
	<div class="w-full max-w-md">
		<div class="space-y-6 rounded-2xl bg-white p-8 shadow-xl">
			<div class="space-y-2 text-center">
				<div
					class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
				>
					<svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
						/>
					</svg>
				</div>
				<h1 class="text-2xl font-bold text-gray-900">Request OTP</h1>
				<p class="text-gray-600">Masukkan nomor HP untuk mendapatkan kode OTP</p>
			</div>

			{#if $error}
				<div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					{$error}
				</div>
			{/if}

			<form on:submit|preventDefault={handleRequestOTP} class="space-y-5">
				<div class="space-y-2">
					<label for="companyPhone" class="block text-sm font-medium text-gray-700">
						Nomor HP Bisnis <span class="text-red-500">*</span>
					</label>
					<input
						id="companyPhone"
						type="tel"
						bind:value={companyPhone}
						on:input={(e) => handlePhoneInput(e, 'company')}
						placeholder="628123456789"
						class="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900 transition duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
						disabled={$isLoading}
					/>
					<p class="text-xs text-gray-500">Format: 628xxxxxxxxx</p>
				</div>

				<div class="flex items-center space-x-3">
					<input
						id="isCashier"
						type="checkbox"
						bind:checked={isCashier}
						on:change={handleKasirToggle}
						class="text-surface-600 focus:ring-surface-500 h-4 w-4 rounded border-gray-300 focus:ring-2"
						disabled={$isLoading}
					/>
					<label for="isCashier" class="text-sm font-medium text-gray-700">
						Login sebagai Kasir
					</label>
				</div>

				{#if isCashier}
					<div class="animate-in slide-in-from-top-2 space-y-2 duration-200">
						<label for="cashierPhone" class="block text-sm font-medium text-gray-700">
							Nomor Kasir <span class="text-red-500">*</span>
						</label>
						<input
							id="cashierPhone"
							type="text"
							bind:value={cashierPhone}
							on:input={(e) => handlePhoneInput(e, 'cashier')}
							placeholder="Masukkan nomor kasir"
							class="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900 transition duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
							disabled={$isLoading}
						/>
					</div>
				{/if}

				<div class="flex items-center space-x-3">
					<Tooltip
						positioning={{ placement: 'top' }}
						triggerBase="flex items-center space-x-3"
						contentBase="card preset-filled p-4 "
						openDelay={100}
						zIndex={'1000'}
						arrow
					>
						{#snippet trigger()}
							<input
								id="remember"
								type="checkbox"
								bind:checked={remember}
								class="text-surface-600 focus:ring-surface-500 h-4 w-4 rounded border-gray-300 focus:ring-2"
								disabled={$isLoading}
							/>
							<label for="remember" class="text-sm font-medium text-gray-700"> Remember </label>
						{/snippet}
						{#snippet content()}Biarkan saya tetap masuk lebih lama{/snippet}
					</Tooltip>
				</div>

				<button
					type="submit"
					disabled={$isLoading}
					class="flex w-full items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 text-base font-semibold text-white transition duration-200 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500"
				>
					{#if $isLoading}
						<svg class="-ml-1 mr-3 h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Mengirim OTP...
					{:else}
						Request OTP
					{/if}
				</button>
			</form>

			<div class="text-center">
				<p class="text-xs text-gray-500">
					Dengan melanjutkan, Anda menyetujui syarat dan ketentuan yang berlaku.
				</p>
			</div>
		</div>

		<div class="mt-6 text-center">
			<p class="text-sm text-gray-600">
				Sudah punya OTP?
				<button
					type="button"
					on:click={() => goto(LOGIN_URL)}
					class="font-medium text-blue-600 hover:text-blue-800"
				>
					Login di sini
				</button>
			</p>
		</div>
	</div>
</div>

<style>
	@keyframes slide-in-from-top-2 {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-in {
		animation-fill-mode: both;
	}
	.slide-in-from-top-2 {
		animation-name: slide-in-from-top-2;
	}
	.duration-200 {
		animation-duration: 200ms;
	}
</style>
