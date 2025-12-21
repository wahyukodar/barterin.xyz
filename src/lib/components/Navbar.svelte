<script lang="ts">
	import { goto } from '$app/navigation';
	import { AuthService } from '$lib/api/auth.service';
	import { EntityType } from '$lib/constants/entity.constant';
	import { LOGIN_URL } from '$lib/constants/url.constant';
	import { authUser, clearAuth, type AuthUser } from '$lib/stores/auth.store';
	import { sidebarOpen } from '$lib/stores/sidebar.store';
	import { mode, setTheme, theme, themes, toggleMode } from '$lib/stores/theme.store';
	import { AlertError } from '$lib/utils/alert.util';
	import type { AxiosError } from 'axios';
	import { ChevronDown, LogOut, Menu, Moon, Sun, ToggleLeft, ToggleRight, X } from 'lucide-svelte';
	import { get } from 'svelte/store';

	function toggleSidebar() {
		sidebarOpen.set(!get(sidebarOpen));
	}

	let themeOpen = $state(false);
	let userOpen = $state(false);
	let dropdownRef: HTMLDivElement;
	let userRef: HTMLDivElement;
	let isLoading = $state(false);

	async function handleLogout() {
		isLoading = true;
		try {
			const response = await AuthService.logoutByOTP();
			if (response.status === 200) {
				clearAuth();
				goto(LOGIN_URL, { replaceState: true });
			} else {
				AlertError(response.data?.message || 'Gagal Logout');
			}
		} catch (err: AxiosError | any) {
			console.error(err);
			AlertError(err.response?.data?.message || 'Gagal Logout');
		} finally {
			isLoading = false;
		}
	}

	function toggleThemeDropdown() {
		themeOpen = !themeOpen;
		userOpen = false;
	}

	function toggleUserDropdown() {
		userOpen = !userOpen;
		themeOpen = false;
	}

	function handleClickOutside(event: MouseEvent) {
		if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
			themeOpen = false;
		}
		if (userRef && !userRef.contains(event.target as Node)) {
			userOpen = false;
		}
	}

	let user = $state<AuthUser | null>(null); // Tambahkan type annotation

	// Subscribe ke store
	$effect(() => {
		const unsubscribe = authUser.subscribe((value) => {
			user = value;
		});

		return unsubscribe;
	});

	const avatarUrl = $derived(
		!user ? '' : 
		`https://ui-avatars.com/api/?name=${encodeURIComponent(
			(user.entityType === EntityType.CASHIER ? user.cashier?.name : user.company.name) ?? ''
		)}&background=4F46E5&color=fff`
	);
</script>

<nav
	class="bg-surface-100/70 dark:bg-surface-900/70 flex items-center justify-between px-4 py-3 shadow-sm transition-all duration-300 md:px-6"
>
	<!-- Left: Sidebar Toggle + Logo -->
	<div class="flex items-center gap-4">
		<button onclick={toggleSidebar} class="text-surface-700 dark:text-surface-300 p-2 md:hidden">
			{#if $sidebarOpen}
				<X class="h-6 w-6" />
			{:else}
				<Menu class="h-6 w-6" />
			{/if}
		</button>

		<button onclick={toggleSidebar} class="text-surface-700 dark:text-surface-300 hidden md:block">
			{#if $sidebarOpen}
				<ToggleLeft class="h-6 w-6" />
			{:else}
				<ToggleRight class="h-6 w-6" />
			{/if}
		</button>

		<span class="text-sm font-semibold md:text-lg">Admin Dashboard</span>
	</div>

	<!-- Right: Search + User + Theme -->
	<div class="flex items-center gap-3 md:gap-4">
		<!-- Search -->
		<!-- <div class="hidden md:block">
			<div class="relative">
				<input
					type="text"
					placeholder="Search..."
					class="input border-surface-600 dark:border-surface-400 placeholder-surface-600 dark:placeholder-surface-400 focus:ring-surface-700 dark:focus:ring-surface-300 rounded-full border py-1.5 pl-10 pr-4 text-sm transition focus:border-transparent focus:outline-none focus:ring-2"
				/>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="absolute left-3 top-2.5 h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.35 4.35a7.5 7.5 0 0012.3 12.3z"
					/>
				</svg>
			</div>
		</div> -->

		<!-- Theme Selector Dropdown -->
		<div class="relative" bind:this={dropdownRef}>
			<button
				class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition"
				onclick={toggleThemeDropdown}
			>
				Theme
				<svg
					class="h-4 w-4 transform transition-transform duration-200 {themeOpen
						? ''
						: 'rotate-180'}"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>

			{#if themeOpen}
				<div
					class="bg-surface-100 dark:bg-surface-900 absolute right-0 z-50 mt-2 w-56 rounded-xl shadow-lg focus:outline-none"
				>
					<div class="flex items-center justify-between px-4 py-2">
						<span class="text-sm">Mode</span>
						<button onclick={toggleMode} class="rounded-full p-1 transition">
							{#if $mode === 'dark'}
								<Sun class="h-4 w-4" />
							{:else}
								<Moon class="h-4 w-4" />
							{/if}
						</button>
					</div>

					<div class="py-1">
						{#each themes as t}
							<button
								type="button"
								class="hover:bg-surface-200 dark:hover:bg-surface-800 flex w-full items-center gap-2 px-4 py-2 text-sm transition"
								class:bg-surface-500={$theme === t.name}
								class:text-white={$theme === t.name}
								class:dark:bg-surface-600={$theme === t.name}
								onclick={() => setTheme(t.name)}
							>
								<span>{t.icon}</span>
								<span>{t.name}</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- User Dropdown -->
		<div class="relative" bind:this={userRef}>
			<button
				onclick={toggleUserDropdown}
				class="hover:bg-surface-200 dark:hover:bg-surface-800 flex items-center gap-2 rounded-full px-2 py-1 transition"
			>
				<img
					class="h-8 w-8 rounded-full object-cover"
					src={avatarUrl}
					alt={user?.entityType == EntityType.CASHIER ? user?.cashier?.name : user?.company.name}
				/>
				<span class="hidden text-sm font-medium md:block"
					>{user?.entityType == EntityType.CASHIER ? user?.cashier?.name : user?.company.name}</span
				>
				<ChevronDown class={`h-4 w-4 transition-transform ${userOpen ? '' : 'rotate-180'}`} />
			</button>

			{#if userOpen}
				<div
					class="bg-surface-100 dark:bg-surface-900 absolute right-0 z-50 mt-2 w-48 rounded-xl shadow-lg"
				>
					<div class="px-4 py-2 text-sm">
						<p class="font-semibold">
							{user?.entityType == EntityType.CASHIER ? user?.cashier?.name : user?.company.name}
						</p>
						<p class="text-surface-600 dark:text-surface-400 text-xs">
							{user?.entityType == EntityType.CASHIER ? 'Kasir' : 'Administrator'}
						</p>
					</div>
					<hr class="border-surface-200 dark:border-surface-700" />
					<button
						onclick={handleLogout}
						disabled={isLoading}
						class="hover:bg-surface-200 dark:hover:bg-surface-800 flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition"
					>
						{#if isLoading}
							<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								/>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2
									5.291A7.962 7.962 0 014 12H0c0 3.042 
									1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
							Logout...
						{:else}
							<LogOut class="h-4 w-4" /> Logout
						{/if}
					</button>
				</div>
			{/if}
		</div>
	</div>
</nav>
