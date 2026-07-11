// Service worker tối giản — chỉ để đáp ứng tiêu chí cài đặt PWA của Chrome.
// Không cache gì cả để dữ liệu dashboard luôn được tải mới từ Google Sheets.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))
self.addEventListener('fetch', () => {})
