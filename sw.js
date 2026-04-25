// 1. 업데이트 시 아래 버전 숫자를 꼭 바꿔주세요 (예: v1 -> v2)
const CACHE_NAME = 'planner-v2'; 

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  // 만약 아이콘 파일명이 icon-192.png 라면 아래도 추가하세요
  // './icon-192.png' 
];

// 서비스 워커 설치 (새 파일 다운로드)
self.addEventListener('install', (e) => {
  // 새 서비스 워커가 설치되자마자 즉시 활성화되도록 강제함
  self.skipWaiting(); 
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// 서비스 워커 활성화 (이전 버전의 낡은 캐시 삭제)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 현재 CACHE_NAME과 다른 이전 캐시가 있다면 삭제함
          if (cacheName !== CACHE_NAME) {
            console.log('구버전 캐시 삭제됨:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // 즉시 브라우저 제어권 획득
  );
});

// 파일 요청 시 캐시 우선 사용
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      // 캐시에 있으면 캐시 반환, 없으면 네트워크에서 가져옴
      return response || fetch(e.request);
    })
  );
});