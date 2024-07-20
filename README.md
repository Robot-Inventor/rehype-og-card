# rehype-og-card

Rehype plugin to convert text links to link cards inspired by [remark-link-card](https://github.com/gladevise/remark-link-card). Bare links are converted to link cards, but not links in lists or non-bare links.

| Features                                       |                                     remark-link-card                                      |      rehype-og-card       |
| :--------------------------------------------- | :---------------------------------------------------------------------------------------: | :-----------------------: |
| Plugin type                                    |                                          Remark                                           |          Rehype           |
| TypeScript support                             |                                             ❌                                             |             ✅             |
| Convert bare links to link cards               |                                             ✅                                             |             ✅             |
| Shorten URLs displayed on link cards           |                                             ✅                                             |             ✅             |
| Server-side cache for images                   |                                             ✅                                             |             ✅             |
| Cache images with long URLs                    | ❌ ([implemented](https://github.com/gladevise/remark-link-card/pull/16) but not released) |             ✅             |
| Build cache for Open Graph metadata and images |                                             ❌                                             | Planned to be implemented |
| Exclude links in lists from conversion         |                                             ❌                                             |             ✅             |
| Exclude specific domains from conversion       |                                             ❌                                             |             ✅             |
| Lazy loading images                            |                                             ❌                                             |             ✅             |
| Async decoding images                          |                                             ❌                                             |             ✅             |
| Customize the crawler's user agent string      |                                             ❌                                             |             ✅             |

## Installation

```sh
npm install rehype-og-card
```

## Usage

```js
import rehypeOGCard, { RehypeOGCardOptions } from "rehype-og-card";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";

const processorFactory = (options?: RehypeOGCardOptions) => {
    return unified().use(remarkParse).use(remarkRehype).use(rehypeOGCard, options).use(rehypeStringify);
};

const main = async () => {
    const processor = processorFactory({ serverCache: false });

    const input = `
this is a link: https://blog.google/products/android/world-emoji-day-2024/

\`https://blog.google/products/android/world-emoji-day-2024/\`

https://blog.google/products/android/world-emoji-day-2024/

[https://blog.google/products/android/world-emoji-day-2024/](https://blog.google/products/android/world-emoji-day-2024/)

[Google blog](https://blog.google/products/android/world-emoji-day-2024/)
    `.trim();

    const result = await processor.process(input);
    console.log(result.toString());
};

main();
```

Output:

```html
<p>this is a link: https://blog.google/products/android/world-emoji-day-2024/</p>
<p><code>https://blog.google/products/android/world-emoji-day-2024/</code></p>
<p><a class="rlc-container" href="https://blog.google/products/android/world-emoji-day-2024/">
    <div class="rlc-info">
        <div class="rlc-title">10 fun facts about emoji for World Emoji Day</div>
        <div class="rlc-description">Celebrate World Emoji Day with Google, and check out what’s new for Emoji Kitchen.</div>
        <div class="rlc-url-container">
            <img class="rlc-favicon" loading="lazy" decoding="async" src="https://www.google.com/s2/favicons?domain=blog.google" alt="favicon" width="16" height="16">
            <span class="rlc-url">blog.google</span>
        </div>
    </div>
    <div class="rlc-image-container">
        <img class="rlc-image" loading="lazy" decoding="async" src="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/world_emoji_day_v2_1.width-1300.png" alt="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/world_emoji_day_v2_1.width-1300.png">
    </div>
</a></p>
<p><a href="https://blog.google/products/android/world-emoji-day-2024/">https://blog.google/products/android/world-emoji-day-2024/</a></p>
<p><a href="https://blog.google/products/android/world-emoji-day-2024/">Google blog</a></p>
```

## What will be converted to link cards and what won't?

The following links will be converted to link cards:

- Bare links
- Links that have the same URL and text (if you enable the `enableSameTextURLConversion` option)

The following links will NOT be converted to link cards:

- Links in lists
- Links in code blocks
- Links in sentences
- Non-bare links
- Links that have the same URL and text (if you disable the `enableSameTextURLConversion` option)

## Options

All options are optional.

### `crawlerUserAgent`

User agent to use for fetching the OG metadata and images.

- Type: `string`
- Default: `"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"`

### `decoding`

`decoding` attribute of the image element.

- Type: `"sync" | "async" | "auto"`
- Default: `"async"`

### `enableSameTextURLConversion`

Whether to enable converting the links that have the same URL and text (e.g., `[https://example.com](https://example.com)`).

- Type: `boolean`
- Default: `false`

### `excludeDomains`

Domains to exclude from conversion.

- Type: `string[]`
- Default: `[]`

### `loading`

`loading` attribute of the image element.

- Type: `"eager" | "lazy"`
- Default: `"lazy"`

### `serverCache`

Whether to cache the OG data on the server.

- Type: `boolean`
- Default: `true`

### `serverCachePath`

Path to save the server cache.

- Type: `string`
- Default: `"./public/rehype-og-card-cache/"`

### `shortenURL`

Whether to shorten the displayed URL.

- Type: `boolean`
- Default: `true`
