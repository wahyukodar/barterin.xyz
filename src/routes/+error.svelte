<script lang="ts">
	import { page } from '$app/state';
	import { getMode, getTheme, setMode, setTheme } from '$lib/stores/theme.store';
	import Error400 from './(error)/Error400.svelte';
	import Error500 from './(error)/Error500.svelte';
	const theme = getTheme();
	const mode = getMode();
	setTheme(theme);
	setMode(mode);
</script>

<div>
	{#if page.status === 404}
		<Error400 />
	{:else}
		<Error500 />
	{/if}
</div>