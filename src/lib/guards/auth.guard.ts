import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { AuthService } from '$lib/api/auth.service';
import { REQUEST_OTP_URL } from '$lib/constants/url.constant';
import { clearAuth, getAuthToken, setAuthUser } from '$lib/stores/auth.store';

export async function AuthGuard(redirectTo = REQUEST_OTP_URL) {
	if (!browser) return false;

	const token = getAuthToken();

	if (!token) {
		// Tidak ada token, pastikan dibersihkan
		clearAuth();
		goto(redirectTo, { replaceState: true });
		return false;
	}

	try {
		const res = await AuthService.checkToken();
		if (res.status === 200 && res.data.statusCode === 200) {
			// simpan user info ke store
			const data = res.data.data;
			setAuthUser({
				company: {
					name: data.company.name,
					phone: data.company.phone,
				},
				cashier: {
					name: data.cashier?.name,
					phone: data.cashier?.phone,
				},
				entityType: data.entityType,
			});
			return true;
		} else {
			// Token invalid, hapus token
			clearAuth();
			goto(redirectTo, { replaceState: true });
			return false;
		}
	} catch (err) {
		console.error('AuthGuard error:', err);
		clearAuth();
		goto(redirectTo, { replaceState: true });
		return false;
	}
}
