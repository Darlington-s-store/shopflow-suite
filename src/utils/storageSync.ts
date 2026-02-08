/**
 * Utility to sync localStorage data to backend and clear local storage
 */

const STORAGE_KEYS = {
  PRODUCTS: 'shopflow_products',
  CATEGORIES: 'shopflow_categories',
  BRANDS: 'shopflow_brands'
};

export async function syncLocalStorageToBackend(token: string) {
  // Local storage syncing disabled — server is the source of truth now.
  return { success: true, synced: { products: 0, categories: 0, brands: 0 } };
}

export function clearAdminLocalStorage() {
  // No-op: admin localStorage cleared on client-side disabled. Server should be authoritative.
  console.log('✅ clearAdminLocalStorage: no-op (localStorage disabled)');
}

export function getLocalStorageStats() {
  return { products: 0, categories: 0, brands: 0 };
}
