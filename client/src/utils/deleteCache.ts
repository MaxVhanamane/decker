
function clearUserCache() {
    // Delete entire cache by name
    if ('caches' in window) {
        caches.delete('auth-cache');
        caches.delete('decks-cache');
        caches.delete('search-cache');
        caches.delete('cards-cache');
    }

}

export { clearUserCache }
