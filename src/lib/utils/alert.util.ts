import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Dialog konfirmasi
export async function ConfirmAction(options: {
	title?: string;
	text?: string;
	confirmButtonText?: string;
	cancelButtonText?: string;
	icon?: 'warning' | 'error' | 'success' | 'info' | 'question';
}) {
	const result = await Swal.fire({
		title: options.title ?? 'Apakah Anda yakin?',
		text: options.text ?? 'Tindakan ini tidak dapat dibatalkan.',
		icon: options.icon ?? 'warning',
		showCancelButton: true,
		confirmButtonColor: '#d33',
		cancelButtonColor: '#3085d6',
		confirmButtonText: options.confirmButtonText ?? 'Ya, lanjutkan!',
		cancelButtonText: options.cancelButtonText ?? 'Batal'
	});
	return result.isConfirmed;
}

// Alert sukses
export function AlertSuccess(message: string) {
	Swal.fire({
		icon: 'success',
		title: message,
		showConfirmButton: false,
		timer: 1500
	});
}

// Alert error
export function AlertError(message: string) {
	Swal.fire({
		icon: 'error',
		title: 'Error',
		text: message
	});
}
