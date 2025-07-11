const mktUrls = {
  CN: 'zh-CN', US: 'en-US', JP: 'ja-JP', GB: 'en-GB',
  DE: 'de-DE', FR: 'fr-FR', CA: 'en-CA', AU: 'en-AU', IN: 'en-IN',
};
const defaultMkt = 'en-US';
const DEFAULT_CACHE_TTL = 3600; // 1 hour

/**
 * Calculates the number of seconds until the next midnight in a given timezone.
 * @param {string} timeZone IANA timezone name, e.g., "Asia/Shanghai".
 * @returns {number} The remaining seconds.
 */
function getSecondsUntilMidnight(timeZone) {
  try {
    const now = new Date();
    const options = { timeZone, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(now);
    const hour = parseInt(parts.find(p => p.type === 'hour').value, 10);
    const minute = parseInt(parts.find(p => p.type === 'minute').value, 10);
    const second = parseInt(parts.find(p => p.type === 'second').value, 10);
    const secondsPassedToday = hour * 3600 + minute * 60 + second;
    const ttl = (24 * 3600) - secondsPassedToday;
    return ttl > 0 ? ttl : DEFAULT_CACHE_TTL;
  } catch (error) {
    console.error(`Failed to calculate TTL for timezone ${timeZone}:`, error);
    return DEFAULT_CACHE_TTL;
  }
}

async function handleRequest(event) {
  const { request } = event;
  const { geo } = request.eo;
  const mkt = mktUrls[geo.countryCodeAlpha2] || defaultMkt;

  const cacheUrl = new URL(request.url);
  cacheUrl.searchParams.set('mkt', mkt);
  const cacheKey = new Request(cacheUrl.toString(), request);
  const cache = caches.default;

  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  const apiUrl = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=${mkt}`;

  try {
    const apiResponse = await fetch(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    if (!apiResponse.ok) {
      // 如果必应API返回非成功状态，抛出错误
      throw new Error(`Upstream API failed with status ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    const image = data?.images?.[0]; // 使用可选链安全地访问嵌套属性

    if (!image?.url) {
      // 如果响应中没有有效的图片URL，抛出错误
      throw new Error("Invalid image URL in upstream API response.");
    }

    const imageUrl = "https://www.bing.com" + image.url;
    const cacheTtl = geo.timezone ? getSecondsUntilMidnight(geo.timezone) : DEFAULT_CACHE_TTL;
    const response = Response.redirect(imageUrl, 302);
    
    response.headers.set('Cache-Control', `public, max-age=${cacheTtl}`);
    event.waitUntil(cache.put(cacheKey, response.clone()));
    
    return response;
  } catch (error) {
    // 记录关键错误，但返回给用户一个通用的错误信息
    console.error(`Request failed for mkt ${mkt}:`, error.message);
    // 502 Bad Gateway 更适合表示上游服务器（必应）出错
    return new Response("Could not retrieve Bing image.", { status: 502 });
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event));
});
