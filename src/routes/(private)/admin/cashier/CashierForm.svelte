<script lang="ts">
	import { useCreateCashier, useUpdateCashier } from '$lib/hooks/cashier.hook';
	import { FormatPhoneNumber } from '$lib/utils/phone.util';

	const {
		showForm,
		selectedCashier = null,
		onClose,
		onSuccess
	} = $props<{
		showForm: boolean;
		selectedCashier?: any;
		onClose: () => void;
		onSuccess: () => void;
	}>();

	let name = $state(selectedCashier?.name || '');
	let phone = $state(selectedCashier?.phone || '');

	const createCashier = useCreateCashier();
	const updateCashier = useUpdateCashier();

	$effect(() => {
		if (selectedCashier) {
			name = selectedCashier.name;
			phone = selectedCashier.phone;
		} else {
			name = '';
			phone = '';
		}
	});

	function handlePhoneInput(event: Event, field: 'phone') {
		const target = event.target as HTMLInputElement;
		const formatted = FormatPhoneNumber(target.value);
		if (field === 'phone') phone = formatted;
	}

	function handleSubmit(event: Event) {
		event.preventDefault();

		const payload: Record<string, any> = { name, phone };

		const resetForm = () => {
			name = '';
			phone = ''
		};

		if (selectedCashier) {
			$updateCashier.mutate(
				{ phone: selectedCashier.phone, data: payload },
				{
					onSuccess: () => {
						onSuccess();
						resetForm();
						onClose();
					}
				}
			);
		} else {
			$createCashier.mutate(payload, {
				onSuccess: () => {
					onSuccess();
					resetForm();
					onClose();
				}
			});
		}
	}
</script>

{#if showForm}
	<div
		class="bg-surface-900/90 fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4"
	>
		<div class="flex max-h-[90vh] w-full max-w-md flex-col rounded-lg bg-white shadow-lg">
			<!-- Header -->
			<div class="flex items-center justify-between border-b px-6 py-4">
				<h2 class="text-lg font-semibold text-gray-900">
					{selectedCashier ? `Edit Kasir ${selectedCashier.name}` : 'Tambah Kasir'}
				</h2>
				<button
					onclick={onClose}
					class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">✕</button
				>
			</div>
			<div
				class="h-full flex-1 overflow-y-auto px-6 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
			>
				<form onsubmit={handleSubmit} class="space-y-4">
					<div>
						<label for="name" class="mb-1 block text-sm font-medium text-gray-900"
							>Nama Kasir <span class="text-red-500">*</span></label
						>
						<input
							id="name"
							type="text"
							bind:value={name}
							required
							class="w-full rounded border px-3 py-2 text-gray-900"
						/>
					</div>

					<!-- Phone -->
					<div>
						<label for="phone" class="mb-1 block text-sm font-medium text-gray-900"
							>No. Telepon</label
						>
						<input
							id="phone"
							type="text"
							bind:value={phone}
							oninput={(e) => handlePhoneInput(e, 'phone')}
							class="w-full rounded border px-3 py-2 text-gray-900"
						/>
					</div>

					<div class="flex justify-end gap-2 pt-4">
						<button
							type="button"
							onclick={onClose}
							class="hover:bg-error-900 hover:text-error-100 text-surface-900 rounded border px-4 py-2"
							>Batal</button
						>
						<button
							type="submit"
							disabled={$createCashier.isPending || $updateCashier.isPending}
							class="bg-surface-900/90 hover:bg-primary-900 rounded px-4 py-2 text-white disabled:opacity-50"
						>
							{#if $createCashier.isPending || $updateCashier.isPending}
								<span class="animate-spin">⏳</span>
							{:else}
								{selectedCashier ? 'Simpan Perubahan' : 'Tambah Kasir'}
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}
