// Tentukan nama cache dan file yang ingin di-cache
const CACHE_NAME = `gacharary-v2 - ${self.location.origin}`
const FOLLBACK_IMAGE = '/images/gacha-aichi.png'
const urlsToCache = [
  '/images/sparkling.png',
  '/images/gacha-aichi.png',
  '/images/close.svg',
  '/images/export.svg',
  '/images/text-char.png',
  '/icons/icon-gift.svg',
]

self.addEventListener('install', function (event) {
  self.skipWaiting()
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        console.log('Opened cache')
        return cache.addAll(urlsToCache).then(() => {
          console.log('Add all cache')
        })
      })
      .catch((error) => {
        console.error('Failed to cache:', error)
      })
  )
})

self.addEventListener('activate', function (event) {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches
      .keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName)
            }
          })
        )
      })
      .catch((error) => {
        console.error('Failed to clean up old caches:', error)
      })
  )

  return self.clients.claim()
})

self.addEventListener('message', async (event) => {
  if (event.data?.type === 'CACHE_IMAGES') {
    const urls = event.data.payload;
    const cache = await caches.open(CACHE_NAME);

    for (const url of urls) {
      try {
        const response = await fetch(url, { mode: 'cors' });
        if (response.ok) {
          await cache.put(url, response.clone());
          console.log('[SW] Cached from middleware:', url);
        }
      } catch (err) {
        console.error('[SW] Failed to cache image:', url, err);
      }
    }
  }
});

self.addEventListener('fetch', (event) => {
  if (
    event.request.destination === 'image' ||
    event.request.url.endsWith('.jpg') ||
    event.request.url.endsWith('.jpeg') ||
    event.request.url.endsWith('.png')
  ) {
    event.respondWith(handleImageRequest(event));
  } else if (
    event.request.url.endsWith('.mp4') &&
    event.request.headers.has('range')
  ) {
    event.respondWith(handleRangeRequest(event.request))
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      }),
    );
  }
});

const FALLBACK_IMAGE = '/images/gacha-aichi.png'

const handleImageRequest = async (event) => {
  const cache = await caches.open(CACHE_NAME);
  const response = await cache.match(event.request.url);

  if (!response) {
    try {
      const fetchResponse = await fetch(event.request);
      cache.put(event.request, fetchResponse.clone());
      return fetchResponse;
    } catch (error) {
      console.error(`Fetch failed for ${event.request.url}. Using fallback image.`);
      const fallbackResponse = await cache.match(FALLBACK_IMAGE);

      if (!fallbackResponse) {
        return fallbackResponse || new Response('Fallback image not found', { status: 404 });
      }
      return fallbackResponse;
    }
  }

  return response;
};
async function handleRangeRequest(request) {
  const cache = await caches.open(CACHE_NAME)
  const response = await cache.match(request.url)

  if (!response) {
    return fetch(request)
  }

  const range = request.headers.get('range')
  const bytes = /bytes\=(\d+)\-(\d+)?/.exec(range)
  const start = Number(bytes[1])
  const videoBlob = await response.blob()
  const videoArrayBuffer = await videoBlob.arrayBuffer()
  const videoSize = videoArrayBuffer.byteLength

  const end = bytes[2] ? Number(bytes[2]) : videoSize - 1
  const chunk = videoArrayBuffer.slice(start, end + 1)

  return new Response(chunk, {
    status: 206,
    statusText: 'Partial Content',
    headers: [
      ['Cache-Control', 'public, max-age=3600'],
      ['Content-Range', `bytes ${start}-${end}/${videoSize}`],
      ['Content-Length', chunk.byteLength],
      ['Content-Type', 'video/mp4'],
    ],
  })
}