import { writable } from 'svelte/store';

const createResponsiveSidebar = () => {
  const store = writable(true);
  const { subscribe, set, update } = store;

  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    
    // Set state awal
    set(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent): void => {
      set(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
  }

  // Return semua method dari writable store
  return {
    subscribe,
    set,
    update
  };
};

export const sidebarOpen = createResponsiveSidebar();