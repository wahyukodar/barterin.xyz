import { toast } from '@zerodevx/svelte-toast';

// Toast configuration constants
const TOAST_DURATION = 4000; // 4 seconds

const TOAST_THEMES = {
    success: {
        '--toastBackground': '#10B981',
        '--toastColor': 'white',
        '--toastBarBackground': '#059669'
    },
    error: {
        '--toastBackground': '#EF4444',
        '--toastColor': 'white',
        '--toastBarBackground': '#DC2626'
    },
    warning: {
        '--toastBackground': '#F59E0B',
        '--toastColor': 'white',
        '--toastBarBackground': '#D97706'
    },
    info: {
        '--toastBackground': '#3B82F6',
        '--toastColor': 'white',
        '--toastBarBackground': '#2563EB'
    }
} as const;

export function ToastSuccess(message: string, duration = TOAST_DURATION) {
    toast.push(message, {
        theme: TOAST_THEMES.success,
        duration,
        pausable: true,
        dismissable: true
    });
}

export function ToastError(message: string, duration = TOAST_DURATION) {
    toast.push(message, {
        theme: TOAST_THEMES.error,
        duration,
        pausable: true,
        dismissable: true
    });
}

export function ToastWarning(message: string, duration = TOAST_DURATION) {
    toast.push(message, {
        theme: TOAST_THEMES.warning,
        duration,
        pausable: true,
        dismissable: true
    });
}

export function ToastInfo(message: string, duration = TOAST_DURATION) {
    toast.push(message, {
        theme: TOAST_THEMES.info,
        duration,
        pausable: true,
        dismissable: true
    });
}
