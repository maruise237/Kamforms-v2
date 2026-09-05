const SITEMAP_URL = 'https://kamforms.com/sitemap.xml'
const SEARCH_ENGINES = [
  `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
  `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
]

async function ping() {
  const results = await Promise.allSettled(
    SEARCH_ENGINES.map(async url => {
      const res = await fetch(url, { method: 'GET' })
      return { url, status: res.status, ok: res.ok }
    })
  )

  for (const r of results) {
    if (r.status === 'fulfilled') {
      console.log(`[sitemap-ping] ${r.value.url} -> ${r.value.status}`)
    } else {
      console.error(`[sitemap-ping] failed: ${r.reason}`)
    }
  }
}

ping()
