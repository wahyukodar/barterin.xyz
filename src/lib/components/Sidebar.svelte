<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { AuthService } from '$lib/api/auth.service';
	import { EntityType } from '$lib/constants/entity.constant';
	import { MENU } from '$lib/constants/sidebar-menu.constant';
	import { LOGIN_URL } from '$lib/constants/url.constant';
	import { authUser, clearAuth, type AuthUser } from '$lib/stores/auth.store';
	import { sidebarOpen } from '$lib/stores/sidebar.store';
	import { AlertError } from '$lib/utils/alert.util';
	import type { AxiosError } from 'axios';
	import { ChevronDown, LogOut, X } from 'lucide-svelte';
	import { writable } from 'svelte/store';

	const openDropdown = writable<string | null>(null);
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

	function closeSidebar() {
		sidebarOpen.set(false);
	}

	function handleClick(fn: () => void) {
		fn?.(); // jalanin fungsi original (misalnya goto)
		// hanya close sidebar jika ukuran layar < 1024px (mobile & tablet)
		if (typeof window !== 'undefined' && window.innerWidth < 1024) {
			closeSidebar();
		}
	}

	function toggleDropdown(label: string) {
		openDropdown.update((current) => (current === label ? null : label));
	}

	// helper untuk cek active link
	function isActive(path: string) {
		return page.url.pathname === path;
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

<aside
	class="bg-surface-100 dark:bg-surface-900 z-10000 fixed flex min-h-screen w-full flex-col overflow-hidden
	       shadow-lg
	       transition-all duration-300 md:relative md:z-auto"
	class:md:w-64={$sidebarOpen}
	class:md:w-0={!$sidebarOpen}
	class:translate-x-0={$sidebarOpen}
	class:-translate-x-full={!$sidebarOpen}
>
	<!-- Header -->
	<!-- <div
		class="border-surface-200 dark:border-surface-700 flex h-16 items-center justify-between border-b px-4"
	> -->
	<!-- <span class="text-lg font-bold tracking-wide">Logo</span> -->
	<!-- <button onclick={closeSidebar} class="rounded-lg p-2 md:hidden" aria-label="Close Sidebar">
		<X class="h-6 w-6" />
	</button> -->
	<!-- </div> -->

	<!-- User Info -->
	{#if $sidebarOpen}
		<div
			class="border-surface-200 dark:border-surface-700 flex items-center justify-between space-x-3 border-b p-4 md:justify-start"
		>
			<img
				class="h-10 w-10 rounded-full"
				src={avatarUrl}
				alt={user?.entityType == EntityType.CASHIER ? user?.cashier?.name : user?.company.name}
			/>
			<div>
				<p class="text-sm font-semibold">
					{user?.entityType == EntityType.CASHIER ? user?.cashier?.name : user?.company.name}
				</p>
				<p class="text-surface-700 dark:text-surface-200 text-xs">
					{user?.entityType == EntityType.CASHIER ? 'Kasir' : 'Administrator'}
				</p>
			</div>
			<button onclick={closeSidebar} class="rounded-lg p-2 md:hidden" aria-label="Close Sidebar">
				<X class="h-6 w-6" />
			</button>
		</div>
	{/if}

	<!-- Menu -->
	<nav class="flex-1 space-y-1 p-3" class:hidden={!$sidebarOpen}>
		{#each MENU as item (item.label)}
			{#if item.children}
				<div>
					<button
						class="hover:bg-surface-200 dark:hover:bg-surface-600 flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors"
						class:bg-surface-200={$openDropdown === item.label}
						class:dark:bg-surface-700={$openDropdown === item.label}
						type="button"
						onclick={() => toggleDropdown(item.label)}
					>
						<div class="flex items-center">
							{#if item.icon}
								<item.icon class="mr-3 h-5 w-5" />
							{/if}
							{item.label}
						</div>
						<ChevronDown
							class={`h-4 w-4 transition-transform ${$openDropdown === item.label ? 'rotate-180' : ''}`}
						/>
					</button>

					{#if $openDropdown === item.label}
						<div class="mt-1 space-y-1 pl-8">
							{#each item.children as child (child.label)}
								<button
									onclick={() => handleClick(child.onClick)}
									class="hover:bg-surface-200 dark:hover:bg-surface-600 flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors"
									class:bg-surface-200={isActive(child.path)}
									class:dark:bg-surface-700={isActive(child.path)}
									type="button"
								>
									{#if child.icon}
										<child.icon class="mr-2 h-4 w-4" />
									{/if}
									{child.label}
								</button>
							{/each}
						</div>
					{/if}
				</div>
			{:else}
				<button
					onclick={() => handleClick(item.onClick)}
					class="hover:bg-surface-200 dark:hover:bg-surface-600 flex w-full items-center rounded-lg px-3 py-2 transition-colors"
					class:bg-surface-200={isActive(item.path)}
					class:dark:bg-surface-700={isActive(item.path)}
					type="button"
				>
					{#if item.icon}
						<item.icon class="mr-3 h-5 w-5" />
					{/if}
					{item.label}
				</button>
			{/if}
		{/each}
	</nav>

	<!-- Footer -->
	{#if $sidebarOpen}
		<div class="p-4">
			<button
				onclick={() => handleLogout()}
				class="text-surface-700 dark:text-surface-200 flex w-full items-center text-left text-sm hover:text-red-500"
				type="button"
				disabled={isLoading}
			>
				{#if isLoading}
					<svg class="-ml-1 mr-3 h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					Logout...
				{:else}
					<LogOut class="mr-2 h-4 w-4" /> Logout
				{/if}
			</button>
		</div>
	{/if}
</aside>