<script lang="ts">
	import { QueryClientUtil } from '$lib/utils/query-client.util';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import '../app.css';

	let { children } = $props();
</script>

<SvelteToast />
<QueryClientProvider client={QueryClientUtil}>
	{@render children?.()}
</QueryClientProvider>
