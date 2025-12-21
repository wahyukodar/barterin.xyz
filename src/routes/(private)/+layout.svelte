<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { AuthGuard } from '$lib/guards/auth.guard';
	import { initializeMode, initializeTheme } from '$lib/stores/theme.store';
	import { onMount } from 'svelte';

	onMount(() => {
		const unsubscribeTheme = initializeTheme();
		const unsubscribeMode = initializeMode();

		const checkAuth = async () => {
			await AuthGuard();
		};
		checkAuth();

		return () => {
			unsubscribeTheme?.();
			unsubscribeMode?.();
		};
	});
</script>

<div class="flex min-h-screen">
	<Sidebar />
	<div class="flex flex-1 flex-col transition-all duration-300">
		<Navbar />
		<main class="flex-1 p-4">
			<slot />
		</main>
		<Footer />
	</div>
</div>
