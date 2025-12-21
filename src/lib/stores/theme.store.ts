import { browser } from '$app/environment';
import { persisted } from 'svelte-persisted-store';
import { get } from 'svelte/store';

// ----------------------------
// Mode (light/dark)
// ----------------------------
export type Mode = 'light' | 'dark';
export const mode = persisted<Mode>('mode', 'light');

export function toggleMode() {
	mode.update((current) => {
		const newMode: Mode = current === 'light' ? 'dark' : 'light';
		if (browser) applyMode(newMode);
		return newMode;
	});
}

export function getMode(): Mode {
	return get(mode);
}

export function setMode(newMode: Mode) {
	mode.set(newMode);
	if (browser) applyMode(newMode);
}

function applyMode(mode: Mode) {
	document.documentElement.setAttribute('data-mode', mode);
}

export function initializeMode() {
	if (browser) {
		const unsubscribe = mode.subscribe((current) => {
			applyMode(current);
		});
		return unsubscribe;
	}
}

// ----------------------------
// Theme (Skeleton theme names)
// ----------------------------
export type ThemeName = 'cerberus' | 'mint' | 'legacy' | 'mona' | 'sahara' | 'wintry';
export const theme = persisted<ThemeName>('theme', 'wintry');
export const themes: { name: ThemeName; icon: string }[] = [
	{ name: 'cerberus', icon: '💀' },
	{ name: 'mint', icon: '🤖' },
	{ name: 'legacy', icon: '🚀' },
	{ name: 'mona', icon: '🧜‍♀️' },
	{ name: 'sahara', icon: '🖼️' },
	{ name: 'wintry', icon: '🧥' }
];

export function setTheme(newTheme: ThemeName) {
	theme.set(newTheme);
	if (browser) applyTheme(newTheme);
}

function applyTheme(theme: ThemeName) {
	document.documentElement.setAttribute('data-theme', theme);
}

export function initializeTheme() {
	if (browser) {
		const unsubscribe = theme.subscribe((current) => {
			applyTheme(current);
		});
		return unsubscribe;
	}
}

export function getTheme(): ThemeName {
	return get(theme);
}
