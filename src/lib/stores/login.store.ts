import { persisted } from 'svelte-persisted-store';

interface LoginData {
	companyPhone: string;
	cashierPhone: string;
	isCashier: boolean;
	remember: boolean
}

export const loginStore = persisted<LoginData | null>('loginData', null);

export function setLoginData(loginData: LoginData) {
	loginStore.set(loginData);
}

export function clearLoginData() {
	loginStore.set(null);
	// Optional: hapus dari localStorage langsung
	if (typeof localStorage !== 'undefined') {
		localStorage.removeItem('loginData');
	}
}

export function getLoginData(): LoginData | null {
	let data: LoginData | null = null;
	loginStore.subscribe((v) => (data = v))();
	return data;
}
