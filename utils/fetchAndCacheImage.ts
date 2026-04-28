export const fetchAndCacheImage = async (url: string) => {
  try {
    const cachedResponse = await caches.match(url)
    if (cachedResponse) return cachedResponse.url

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.url
  } catch (error) {
    console.error('Error fetching or caching image:', error)
    return null
  }
}
