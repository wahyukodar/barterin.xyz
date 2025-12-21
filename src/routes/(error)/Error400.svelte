<script lang="ts">
	import { goto } from '$app/navigation';
	import { DEFAULT_ADMIN_DASHBOARD_URL } from '$lib/constants/url.constant';
	import { getMode, getTheme, setMode, setTheme } from '$lib/stores/theme.store';
    const theme = getTheme();
    const mode = getMode();
    setTheme(theme);
    setMode(mode);
	
</script>

<div
	class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4"
>
	<div class="relative z-10 text-center">
		<p class="mb-6">
			Oops! URL not found!!
		</p>

		<button
			onclick={() => goto(DEFAULT_ADMIN_DASHBOARD_URL)}
			class="bg-surface-100 text-surface-900 hover:bg-surface-500 hover:text-surface-50 inline-block transform rounded-lg px-6 py-3 font-semibold shadow-lg transition-transform hover:scale-105"
		>
			Go Back Home
		</button>
	</div>
</div>
