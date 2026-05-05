// Extract version from registration URL (e.g., sw.js?v=1.1.9)
const params = new URLSearchParams(self.location.search)
const version = params.get('v') || 'v4' 
const CACHE_NAME = `gacharary-${version}-${self.location.origin}`
const urlsToCache = [
  '/',
  '/favicon.ico',
  '/icons/icon-gift.svg',
  '/images/apple_settings.webp',
  '/images/back-button.svg',
  '/images/bg-rainbow.png',
  '/images/bing.png',
  '/images/character.png',
  '/images/chrome.png',
  '/images/close.svg',
  '/images/edge.png',
  '/images/export.svg',
  '/images/firefox.png',
  '/images/gacha-aichi.png',
  '/images/gacha-ball.png',
  '/images/gacha-tom.png',
  '/images/green_base.png',
  '/images/header-logo.png',
  '/images/intl-icon.png',
  '/images/intl-icon.svg',
  '/images/location_services.png',
  '/images/meta-logo.png',
  '/images/privacy_and_security.png',
  '/images/r-bg.png',
  '/images/r.png',
  '/images/safari.png',
  '/images/sparkling.png',
  '/images/sr-bg.png',
  '/images/sr.png',
  '/images/ssr-bg.png',
  '/images/ssr.png',
  '/images/stars.png',
  '/images/tap_the_browser_refresh_button.png',
  '/images/text-char.png',
  '/images/warning.svg',
  '/images/while_using_this_app.png',
]

self.addEventListener('install', function (event) {
  self.skipWaiting()
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(urlsToCache)
      })
      .catch((error) => {
        console.error('Failed to cache during installment:', error)
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
  const type = event.data?.type
  if (type !== 'CACHE_IMAGES' && type !== 'CACHE_VIDEOS') return

  const urls = event.data.payload
  if (!Array.isArray(urls) || urls.length === 0) return

  const cache = await caches.open(CACHE_NAME)

  for (const url of urls) {
    try {
      let response
      if (type === 'CACHE_VIDEOS') {
        try {
          response = await fetch(url)
        } catch {
          response = await fetch(url, { mode: 'no-cors' })
        }
      } else {
        response = await fetch(url, { mode: 'no-cors' })
      }

      if (response.ok || response.type === 'opaque') {
        await cache.put(url, response.clone())
      }
    } catch (err) {
      console.error('[SW] Failed to cache:', url, err)
    }
  }
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // 1. Handle Built Assets (_nuxt) - Network First
  // Using NetworkFirst ensures that we don't serve old hashed assets
  if (url.pathname.startsWith('/_nuxt/')) {
    event.respondWith(networkFirst(event.request))
    return
  }

  // 2. Handle Images - Cache First (Static assets are safe to cache)
  if (
    event.request.destination === 'image' ||
    /\.(jpg|jpeg|png|gif|svg|webp|avif|ico)$/i.test(url.pathname)
  ) {
    event.respondWith(handleImageRequest(event))
    return
  }

  // 3. Handle Video - Range Request from Cache/Network
  if (
    url.pathname.endsWith('.mp4') &&
    event.request.headers.has('range')
  ) {
    event.respondWith(handleRangeRequest(event.request))
    return
  }

  // 4. Default Strategy - Network First
  // Primarily for index.html and navigation to ensure user gets latest version
  event.respondWith(networkFirst(event.request))
})

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    const cachedResponse = await cache.match(request)
    return cachedResponse || new Response('Offline and no cache available', { status: 503 })
  }
}

const FALLBACK_IMAGE = '/images/gacha-aichi.png'

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)
  const networkFetch = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  })

  return cachedResponse || networkFetch
}

async function handleImageRequest(event) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(event.request.url)

  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const fetchResponse = await fetch(event.request)
    if (fetchResponse.ok || fetchResponse.type === 'opaque') {
      cache.put(event.request, fetchResponse.clone())
    }
    return fetchResponse
  } catch (error) {
    console.error(`Fetch failed for ${event.request.url}. Using fallback if available.`)
    const fallbackResponse = await cache.match(FALLBACK_IMAGE)
    return fallbackResponse || new Response('Asset not found', { status: 404 })
  }
}

async function handleRangeRequest(request) {
  const cache = await caches.open(CACHE_NAME)
  let response = await cache.match(request.url)

  if (!response) {
    response = await fetch(request)
    // We don't cache range requests directly here, 
    // but the message listener CACHE_VIDEOS handles full video caching.
    return response
  }

  if (response.type === 'opaque') {
    return fetch(request)
  }

  try {
    const range = request.headers.get('range')
    const bytes = /bytes\=(\d+)\-(\d+)?/.exec(range)
    if (!bytes) {
      return fetch(request)
    }

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
  } catch (err) {
    console.error('[SW] Range request error:', err)
    return fetch(request)
  }
}
