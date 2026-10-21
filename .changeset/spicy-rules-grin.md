---
"rehype-og-card": major
---

feat: add `svgHandling` option

For security reasons, rehype-og-card now rasterizes SVG images. While you can restore the previous behavior by setting `svgHandling: "preserve"`, this is not recommended. If you are using server-side caching for `rehype-og-card`, it is recommended that you clear the cache after updating to this version.
