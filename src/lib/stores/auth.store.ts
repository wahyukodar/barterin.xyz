import type { EntityType } from '$lib/constants/entity.constant';
import { persisted } from 'svelte-persisted-store';

export interface AuthUser {
	company: {
		name: string;
		phone: string;
	};
	cashier?: {
		name: string;
		phone: string;
	};
	entityType: EntityType;
}

export const authToken = persisted<string | null>('authToken', null);
export const authUser = persisted<AuthUser | null>('authUser', null);

export function setAuthToken(token: string): void {
	authToken.set(token);
}
export function getAuthToken(): string | null {
	let value: string | null = null;
	authToken.subscribe((v) => (value = v))();
	return value;
}

export function setAuthUser(user: AuthUser) {
	authUser.set(user);
}

export function clearAuth() {
	authToken.set(null);
	authUser.set(null);
}
