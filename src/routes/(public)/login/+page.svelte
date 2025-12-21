<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { AuthService } from '$lib/api/auth.service';
	import {
		DEFAULT_ADMIN_DASHBOARD_URL,
		LOGIN_URL,
		REQUEST_OTP_URL
	} from '$lib/constants/url.constant';
	import { AuthGuard } from '$lib/guards/auth.guard';
	import { setAuthToken } from '$lib/stores/auth.store';
	import { clearLoginData, getLoginData } from '$lib/stores/login.store';
	import { createCountdown, startCountdown, zeroCountdown } from '$lib/stores/otp.store';
	import { AlertError, AlertSuccess } from '$lib/utils/alert.util';
	import { onMount } from 'svelte';

	let otp = '';
	let companyPhone = '';
	let cashierPhone = '';
	let isCashier = false;
	let remember = false;
	let isLoading = false;
	let error = '';
	let otpInputs = ['', '', '', '', '', ''];
	let inputRefs: HTMLInputElement[] = [];

	// Store countdown untuk tombol "Kirim ulang" (default 0 sebelum key diketahui)
	let resendCountdown = zeroCountdown;

	// Load data from previous page
	onMount(() => {
		if (!browser) return;

		const checkAuth = async () => {
			await AuthGuard(LOGIN_URL);
		};
		checkAuth();

		const loginData = getLoginData();
		if (loginData) {
			companyPhone = (loginData.companyPhone || '').trim();
			cashierPhone = (loginData.cashierPhone || '').trim();
			isCashier = !!loginData.isCashier;
			remember = !!loginData.remember;

			const key = isCashier ? cashierPhone : companyPhone;
			if (key) {
				resendCountdown = createCountdown(key);
			}
		} else {
			goto(REQUEST_OTP_URL);
		}
	});

	// OTP Input Handlers
	function handleOTPInput(event: Event, index: number) {
		const target = event.target as HTMLInputElement;
		const value = target.value.replace(/\D/g, '');
		if (value.length <= 1) {
			otpInputs[index] = value;
			if (value && index < 5) inputRefs[index + 1]?.focus();
			otp = otpInputs.join('');
		}
	}

	function handleKeyDown(event: KeyboardEvent, index: number) {
		if (event.key === 'Backspace' && !otpInputs[index] && index > 0) {
			inputRefs[index - 1]?.focus();
		}
	}

	function handlePaste(event: ClipboardEvent) {
		event.preventDefault();
		const pasted = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) || '';
		for (let i = 0; i < 6; i++) otpInputs[i] = pasted[i] || '';
		otp = otpInputs.join('');
		const lastIndex = Math.min(pasted.length - 1, 5);
		inputRefs[lastIndex]?.focus();
	}

	// Login Function
	async function handleLogin() {
		if (otp.length !== 6) {
			error = 'OTP harus 6 digit';
			AlertError(error);
			return;
		}

		isLoading = true;
		error = '';

		try {
			const payload: Record<string, any> = { phone: companyPhone.trim(), otpCode: otp, remember };
			if (isCashier) {
				payload.cashierPhone = cashierPhone.trim();
			}

			const response = await AuthService.loginByOtp(payload);

			if (response.status === 200) {
				clearLoginData();

				if (response.data) {
					setAuthToken(response.data?.data?.accessToken);
					AlertSuccess('Login berhasil!');
					goto(DEFAULT_ADMIN_DASHBOARD_URL);
				}
			} else {
				AlertError(response.data?.message || 'Login gagal. Silakan coba lagi.');
			}
		} catch (err: any) {
			AlertError(err.response?.data?.message || 'Login gagal. Silakan coba lagi.');
			otpInputs = ['', '', '', '', '', ''];
			otp = '';
			inputRefs[0]?.focus();
		} finally {
			isLoading = false;
		}
	}

	// Request new OTP
	async function requestNewOTP() {
		isLoading = true;
		error = '';

		try {
			const loginData = getLoginData();
			if (!loginData) return goto(REQUEST_OTP_URL);

			const payload: Record<string, any> = { phone: companyPhone.trim() };
			if (isCashier) {
				payload.cashierPhone = cashierPhone.trim();
			}
			const response = await AuthService.requestOtp(payload);

			if (response.status === 200) {
				const expiresAt = response.data?.data?.expiresAt;
				if (expiresAt)
					startCountdown(
						loginData.isCashier ? loginData.cashierPhone.trim() : loginData.companyPhone.trim(),
						expiresAt
					);
				otpInputs = ['', '', '', '', '', ''];
				otp = '';
				inputRefs[0]?.focus();
				AlertSuccess('OTP baru berhasil dikirim');
			} else {
				AlertError(response.data?.message || 'Gagal mengirim ulang OTP.');
			}
		} catch (err: any) {
			AlertError(err.response?.data?.message || 'Gagal mengirim ulang OTP.');
		} finally {
			isLoading = false;
		}
	}

	function formatPhoneDisplay(phone: string) {
		if (!phone) return '';
		return phone.replace(/(\d{2})(\d{4})(\d{4})(\d+)/, '$1 $2-$3-$4');
	}
</script>

<svelte:head>
	<title>Login - Masukkan OTP</title>
</svelte:head>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
>
	<div class="w-full max-w-md">
		<div class="space-y-6 rounded-2xl bg-white p-8 shadow-xl">
			<!-- Header -->
			<div class="space-y-2 text-center">
				<div
					class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-teal-600"
				>
					<svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<h1 class="text-2xl font-bold text-gray-900">Masukkan OTP</h1>
				<p class="text-gray-600">
					Kode OTP telah dikirim ke<br />
					<span class="font-semibold text-gray-900">{formatPhoneDisplay(companyPhone)}</span>
				</p>
			</div>

			<!-- Login Info -->
			<div class="space-y-2 rounded-lg bg-gray-50 p-4">
				<div class="flex justify-between text-sm">
					<span class="text-gray-600">Nomor HP Bisnis:</span>
					<span class="font-medium text-gray-900">{formatPhoneDisplay(companyPhone)}</span>
				</div>
				{#if isCashier && cashierPhone}
					<div class="flex justify-between text-sm">
						<span class="text-gray-600">Nomor Kasir:</span>
						<span class="font-medium text-gray-900">{cashierPhone}</span>
					</div>
					<div class="flex justify-center">
						<span
							class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
						>
							<svg class="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								/>
							</svg>
							Login sebagai Kasir
						</span>
					</div>
				{/if}
			</div>

			<!-- Error Alert -->
			{#if error}
				<div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					{error}
				</div>
			{/if}

			<!-- OTP Form -->
			<form on:submit|preventDefault={handleLogin} class="space-y-6">
				<div class="space-y-4">
					<label for="otp" class="block text-center text-sm font-medium text-gray-700">
						Kode OTP (6 digit)
					</label>

					<div class="flex justify-center space-x-3">
						{#each otpInputs as value, index}
							<input
								bind:this={inputRefs[index]}
								type="text"
								inputmode="numeric"
								maxlength="1"
								bind:value={otpInputs[index]}
								on:input={(e) => handleOTPInput(e, index)}
								on:keydown={(e) => handleKeyDown(e, index)}
								on:paste={handlePaste}
								class="text-surface-900 h-12 w-12 rounded-lg border-2 border-gray-300 text-center text-lg font-bold transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
								disabled={isLoading}
							/>
						{/each}
					</div>
				</div>

				<button
					type="submit"
					disabled={isLoading || otp.length !== 6}
					class="flex w-full items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 px-4 py-3 text-base font-semibold text-white transition duration-200 hover:from-green-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500"
				>
					{#if isLoading}
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
						Memverifikasi...
					{:else}
						Login
					{/if}
				</button>
			</form>

			<div class="space-y-3 text-center">
				<p class="text-sm text-gray-600">Tidak menerima kode OTP?</p>
				<button
					type="button"
					on:click={requestNewOTP}
					disabled={isLoading || $resendCountdown > 0}
					class="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-400"
				>
					{#if $resendCountdown > 0}
						Kirim ulang OTP dalam {$resendCountdown}s
					{:else}
						Kirim ulang OTP
					{/if}
				</button>
			</div>

			<div class="pt-2 text-center">
				<button
					type="button"
					on:click={() => goto(REQUEST_OTP_URL)}
					class="flex items-center justify-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 19l-7-7m0 0l7-7m-7 7h18"
						/>
					</svg>
					<span>Kembali ke Request OTP</span>
				</button>
			</div>
		</div>
	</div>
</div>
