---
"rehype-og-card": major
---

feat: add cache expiration options for build and server cache

Note: When `buildCacheMaxAge` is set to a number (default 30 days), legacy build cache entries created by older versions without `cachedAt` (and image entries missing `cache.json`) may be deleted on first run.
