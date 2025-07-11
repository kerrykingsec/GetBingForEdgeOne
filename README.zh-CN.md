<p align="right">
  <a href="./README.md">English</a>
</p>

# Bing 每日壁纸地域重定向器 (Edge Function)

[![开源许可: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![平台](https://img.shields.io/badge/Platform-Edge%20Function-blue.svg)](https://cloud.tencent.com/product/eo)

这是一个为 [腾讯云 EdgeOne](https://cloud.tencent.com/product/eo)、[Cloudflare Workers](https://workers.cloudflare.com/) 等边缘计算平台设计的无服务器边缘函数。它的核心功能是智能地将用户重定向到对应其地理区域的“必应每日壁纸”，并利用高效的自适应缓存机制，为用户提供极致的访问速度。

当你访问此函数部署后的URL时，你会被直接重定向到当天你所在地区的必应高清壁纸。

## ✨ 主要特性

- **🌏 智能地域识别**：自动检测用户的国家/地区，并提供相应的必应壁纸。
- **⚡️ 自适应缓存**：缓存的过期时间 (TTL) 会被动态计算，精确设置为用户本地时区的午夜。这意味着缓存总能最大限度地发挥作用，并在图片更新的第一时间失效，无需人工干预。
- **🚀 高性能**：绝大部分请求都将直接由边缘节点的缓存响应，处理时间仅需几毫秒，无需与必应服务器进行通信。
- **💪 高弹性**：包含了稳健的错误处理机制，当上游API（必应）出现问题或用户地区未定义时，能平稳地降级处理。
- **🍃 轻量无依赖**：使用原生JavaScript编写，不依赖任何外部NPM包，确保了极快的冷启动速度和最小的资源占用。

## ⚙️ 工作原理

本函数遵循一个高效的“缓存优先”策略。

1.  用户的请求到达边缘节点。
2.  函数首先检查缓存中是否存在对应用户市场区域 (`mkt`) 的有效图片响应。
3.  **缓存命中 (Cache Hit)**：
    -   如果存在，函数会立即返回一个 `302` 重定向响应，将用户引导至缓存的图片URL。流程在此结束，响应速度极快。
4.  **缓存未命中 (Cache Miss)**：
    -   如果缓存中没有，函数会向必应官方API发起请求，获取图片元数据。
    -   从API响应中提取出高清图片URL。
    -   **计算动态TTL**：精确计算出距离用户所在时区下一个午夜零点的剩余秒数。
    -   创建一个 `302` 重定向响应，并将其 `Cache-Control` 头的 `max-age` 设置为上一步计算出的剩余秒数。
    -   将这个完整的响应存入缓存，以供后续用户使用，同时将其返回给当前用户。

## 🚀 如何部署

1.  选择一个你喜欢的边缘计算平台（例如：腾讯云EdgeOne、Cloudflare Workers、Vercel Edge Functions等）。
2.  在你的平台账户下，创建一个新的边缘函数/Worker。
3.  将本项目中的代码 (`index.js`) 复制到你的函数编辑器中。
4.  保存并部署。
5.  部署完成后，平台会提供一个URL。现在，访问这个URL就会自动重定向到每日壁纸！

## 🔧 自定义配置

你可以通过修改文件顶部的 `mktUrls` 对象来增加、删除或修改支持的国家/地区。

```javascript
const mktUrls = {
  CN: 'zh-CN', // 中国
  US: 'en-US', // 美国
  // 在这里添加更多...
};
```

## 📜 开源许可

本项目采用 [MIT License](https://opensource.org/licenses/MIT) 开源许可。
