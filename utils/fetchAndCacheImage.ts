export const fetchAndCacheImage = async (url: string) => {
  const CACHE_NAME = `gacharary-v2 - ${globalThis.location.origin}`

  try {
    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match(url)

    if (cachedResponse) return cachedResponse.url

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    await cache.put(url, response.clone())
    return response.url
  } catch (error) {
    console.error('Error fetching or caching image:', error)
    return null
  }
}
