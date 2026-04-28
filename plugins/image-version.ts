export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  return {
    provide: {
      imgV: (url: string | undefined | null) => {
        if (!url) return url;
        if (typeof url !== 'string') return url;
        if (url.startsWith('data:')) return url;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}v=${config.public.BUILD_TIME}`;
      }
    }
  }
})
