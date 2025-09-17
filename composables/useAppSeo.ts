export function useAppSeo(settings: any, url: string) {
  const title = settings?.global?.ogp?.title || process.env.META_TITLE
  const description =
    stripHtml(settings?.global?.ogp?.description) || process.env.META_DESCRIPTION
  const image = settings?.global?.ogp?.image || process.env.META_IMAGE
  const favicon =
    settings?.global?.ogp?.favicon || '/favicon.ico'

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    ogUrl: url || process.env.META_URL,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
  })

  useHead({
    link: [
      { rel: 'icon', type: 'image/png', href: favicon }
    ]
  })
}

function stripHtml(html = '') {
  return html?.replace(/<\/?[^>]+(>|$)/g, '').trim()
}
