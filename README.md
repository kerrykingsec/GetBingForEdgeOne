<p align="right">
  <a href="./README.zh-CN.md">简体中文</a>
</p>

# Bing Daily Wallpaper Redirector (Edge Function)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/Platform-Edge%20Function-blue.svg)](https://workers.cloudflare.com/)

This is a serverless edge function designed for platforms like [Cloudflare Workers](https://workers.cloudflare.com/), [Tencent Cloud EdgeOne](https://cloud.tencent.com/product/eo), or [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions). Its core purpose is to intelligently redirect users to the Bing Image of the Day that corresponds to their geographical region, utilizing an efficient adaptive caching mechanism to provide an optimal user experience.

When you access the URL where this function is deployed, you will be instantly redirected to the high-resolution Bing wallpaper of the day for your region.

## ✨ Features

- **🌏 Geo-IP Redirection**: Automatically detects the user's country and serves the appropriate regional Bing wallpaper.
- **⚡️ Adaptive Caching**: The cache's Time-To-Live (TTL) is dynamically calculated to expire precisely at midnight in the user's local timezone. This ensures maximum cache efficiency and immediate updates when a new image is released, without manual intervention.
- **🚀 High Performance**: The vast majority of requests are served directly from the edge cache, resolving in milliseconds without needing to contact Bing's servers.
- **💪 Resilient**: Includes robust error handling and gracefully degrades when the upstream API (Bing) has issues or if the user's region is not explicitly defined.
- **🍃 Lightweight & Dependency-Free**: Written in clean, modern JavaScript with zero external NPM dependencies, ensuring extremely fast cold starts and minimal resource consumption.

## ⚙️ How It Works

This function follows a highly efficient "cache-first" strategy.

1.  A user's request hits the edge node.
2.  The function first checks its cache for a valid image response corresponding to the user's market region (`mkt`).
3.  **Cache Hit**:
    -   If found, the function immediately returns a `302` redirect to the cached image URL. The process ends here, resulting in an extremely fast response.
4.  **Cache Miss**:
    -   If not found in the cache, the function sends a request to the official Bing API to fetch the image metadata.
    -   It extracts the high-resolution image URL from the API response.
    -   **Dynamic TTL Calculation**: It precisely calculates the remaining seconds until the next midnight in the user's specific timezone.
    -   It creates a `302` redirect response and sets its `Cache-Control` header's `max-age` to the calculated remaining seconds.
    -   This complete response is stored in the cache for subsequent users and is returned to the current user.

## 🚀 Deployment

1.  Choose your preferred edge computing platform (e.g., Cloudflare Workers, Tencent Cloud EdgeOne, Vercel Edge Functions).
2.  Create a new edge function/worker within your platform's dashboard.
3.  Copy the code from the `index.js` file in this repository into your function's editor.
4.  Save and deploy.
5.  Your platform will provide a URL upon deployment. Accessing this URL will now automatically redirect to the daily Bing wallpaper!

## 🔧 Configuration

You can add, remove, or modify the supported regions by editing the `mktUrls` object at the top of the file.

```javascript
const mktUrls = {
  US: 'en-US', // United States
  DE: 'de-DE', // Germany
  // Add more here...
};
```

## 📜 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
