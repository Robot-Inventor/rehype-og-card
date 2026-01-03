import { expect, it } from "vitest";
import rehypeOGCard, { RehypeOGCardOptions } from "./index.js";
import { readCacheIndex, restoreBuildCache, restoreOGDataBuildCache, writeCacheIndex } from "./util/cache.js";
import { checkFileExists, generateFilename } from "./util/file.js";
import type { CacheIndex, OGCardData } from "./types.js";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";
import fs from "fs/promises";
import path from "path";
import { setTimeout } from "timers/promises";

const processorFactory = (options?: RehypeOGCardOptions) => {
    return unified().use(remarkParse).use(remarkRehype).use(rehypeOGCard, options).use(rehypeStringify);
};

it("should create OG card from bare links", async () => {
    const processor = processorFactory({ serverCache: false });

    const input = `
this is a link: https://blog.google/products/android/world-emoji-day-2024/

\`https://blog.google/products/android/world-emoji-day-2024/\`

https://blog.google/products/android/world-emoji-day-2024/

[https://blog.google/products/android/world-emoji-day-2024/](https://blog.google/products/android/world-emoji-day-2024/)

[Google blog](https://blog.google/products/android/world-emoji-day-2024/)
    `.trim();

    const expected = `
<p>this is a link: https://blog.google/products/android/world-emoji-day-2024/</p>
<p><code>https://blog.google/products/android/world-emoji-day-2024/</code></p>
<p><div class="og-card-container"><a href="https://blog.google/products/android/world-emoji-day-2024/"><div class="og-card-info"><div class="og-card-title">10 fun facts about emoji for World Emoji Day</div><div class="og-card-description">Celebrate World Emoji Day with Google, and check out what’s new for Emoji Kitchen.</div><div class="og-card-url-container"><img class="og-card-favicon" alt="favicon" decoding="async" height="16" loading="lazy" src="https://www.google.com/s2/favicons?domain=blog.google" width="16"><span class="og-card-url">blog.google</span></div></div><div class="og-card-image-container"><img class="og-card-image" alt="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/world_emoji_day_v2_1.width-1300.png" decoding="async" loading="lazy" src="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/world_emoji_day_v2_1.width-1300.png"></div></a></div></p>
<p><a href="https://blog.google/products/android/world-emoji-day-2024/">https://blog.google/products/android/world-emoji-day-2024/</a></p>
<p><a href="https://blog.google/products/android/world-emoji-day-2024/">Google blog</a></p>
    `.trim();

    const result = await processor.process(input);
    expect(result.toString().trim()).toBe(expected);
});

it("should work with general use cases", async () => {
    const processor = processorFactory({ serverCache: false });

    const input = `
# Title

Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores eum voluptates eos hic nobis optio inventore dolores cum repellat.

Esse officia a perspiciatis nihil dolore quam doloremque distinctio iure beatae!

https://blog.google/products/android/world-emoji-day-2024/

[This link](https://example.com) is a link to example.com and should not be converted to an OG card.
    `.trim();

    const expected = `
<h1>Title</h1>
<p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores eum voluptates eos hic nobis optio inventore dolores cum repellat.</p>
<p>Esse officia a perspiciatis nihil dolore quam doloremque distinctio iure beatae!</p>
<p><div class="og-card-container"><a href="https://blog.google/products/android/world-emoji-day-2024/"><div class="og-card-info"><div class="og-card-title">10 fun facts about emoji for World Emoji Day</div><div class="og-card-description">Celebrate World Emoji Day with Google, and check out what’s new for Emoji Kitchen.</div><div class="og-card-url-container"><img class="og-card-favicon" alt="favicon" decoding="async" height="16" loading="lazy" src="https://www.google.com/s2/favicons?domain=blog.google" width="16"><span class="og-card-url">blog.google</span></div></div><div class="og-card-image-container"><img class="og-card-image" alt="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/world_emoji_day_v2_1.width-1300.png" decoding="async" loading="lazy" src="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/world_emoji_day_v2_1.width-1300.png"></div></a></div></p>
<p><a href="https://example.com">This link</a> is a link to example.com and should not be converted to an OG card.</p>
    `.trim();

    const result = await processor.process(input);
    expect(result.toString().trim()).toBe(expected);
});

it("should not create OG card from invalid URLs", async () => {
    const processor = processorFactory({ serverCache: false });

    const input = `
https://example[.]com
    `.trim();

    const expected = `
<p>https://example[.]com</p>
    `.trim();

    const result = await processor.process(input);
    expect(result.toString().trim()).toBe(expected);
});

it("`enableSameTextURLConversion` option should convert same text URL to anchor element", async () => {
    const processor = processorFactory({ enableSameTextURLConversion: true, serverCache: false });

    const input = `
[https://blog.google/products/android/world-emoji-day-2024/](https://blog.google/products/android/world-emoji-day-2024/)
    `.trim();

    const expected = `
<p><div class="og-card-container"><a href="https://blog.google/products/android/world-emoji-day-2024/"><div class="og-card-info"><div class="og-card-title">10 fun facts about emoji for World Emoji Day</div><div class="og-card-description">Celebrate World Emoji Day with Google, and check out what’s new for Emoji Kitchen.</div><div class="og-card-url-container"><img class="og-card-favicon" alt="favicon" decoding="async" height="16" loading="lazy" src="https://www.google.com/s2/favicons?domain=blog.google" width="16"><span class="og-card-url">blog.google</span></div></div><div class="og-card-image-container"><img class="og-card-image" alt="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/world_emoji_day_v2_1.width-1300.png" decoding="async" loading="lazy" src="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/world_emoji_day_v2_1.width-1300.png"></div></a></div></p>
    `.trim();

    const result = await processor.process(input);
    expect(result.toString().trim()).toBe(expected);
});

it("should not create OG card in list items", async () => {
    const processor = processorFactory({ serverCache: false });

    const input = `
- [https://blog.google/products/android/world-emoji-day-2024/](https://blog.google/products/android/world-emoji-day-2024/)
    `.trim();

    const expected = `
<ul>
<li><a href="https://blog.google/products/android/world-emoji-day-2024/">https://blog.google/products/android/world-emoji-day-2024/</a></li>
</ul>
    `.trim();

    const result = await processor.process(input);
    expect(result.toString().trim()).toBe(expected);
});

it("if the website does not have some of the OG tags, it should not throw an error", async () => {
    const processor = processorFactory({ serverCache: false });

    const input = `
https://example.com
    `.trim();

    const expected = `
<p><div class="og-card-container"><a href="https://example.com"><div class="og-card-info"><div class="og-card-title">Example Domain</div><div class="og-card-url-container"><img class="og-card-favicon" alt="favicon" decoding="async" height="16" loading="lazy" width="16"><span class="og-card-url">example.com</span></div></div></a></div></p>
    `.trim();

    const result = await processor.process(input);
    expect(result.toString().trim()).toBe(expected);
});

it("`excludeDomains` option should exclude specified domains", async () => {
    const processor = processorFactory({ excludeDomains: ["blog.google"] });

    const input = `
https://blog.google/products/android/world-emoji-day-2024/
    `.trim();

    const expected = `
<p>https://blog.google/products/android/world-emoji-day-2024/</p>
    `.trim();

    const result = await processor.process(input);
    expect(result.toString().trim()).toBe(expected);
});

it("if `shortenURL` option is `false`, it should not shorten the URL", async () => {
    const processor = processorFactory({ shortenURL: false, serverCache: false });

    const input = `
https://blog.google/products/android/world-emoji-day-2024/
    `.trim();

    const expected = `
<p><div class="og-card-container"><a href="https://blog.google/products/android/world-emoji-day-2024/"><div class="og-card-info"><div class="og-card-title">10 fun facts about emoji for World Emoji Day</div><div class="og-card-description">Celebrate World Emoji Day with Google, and check out what’s new for Emoji Kitchen.</div><div class="og-card-url-container"><img class="og-card-favicon" alt="favicon" decoding="async" height="16" loading="lazy" src="https://www.google.com/s2/favicons?domain=blog.google" width="16"><span class="og-card-url">https://blog.google/products/android/world-emoji-day-2024/</span></div></div><div class="og-card-image-container"><img class="og-card-image" alt="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/world_emoji_day_v2_1.width-1300.png" decoding="async" loading="lazy" src="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/world_emoji_day_v2_1.width-1300.png"></div></a></div></p>
    `.trim();

    const result = await processor.process(input);
    expect(result.toString().trim()).toBe(expected);
});

it("server cache should work", async () => {
    const serverCachePath = "./.cache/";

    await fs.rm(serverCachePath, { recursive: true, force: true });
    const processor = processorFactory({ serverCache: true, serverCachePath });

    const input = `
https://blog.google/products/android/world-emoji-day-2024/
    `.trim();

    const expected = `
<p><div class="og-card-container"><a href="https://blog.google/products/android/world-emoji-day-2024/"><div class="og-card-info"><div class="og-card-title">10 fun facts about emoji for World Emoji Day</div><div class="og-card-description">Celebrate World Emoji Day with Google, and check out what’s new for Emoji Kitchen.</div><div class="og-card-url-container"><img class="og-card-favicon" alt="favicon" decoding="async" height="16" loading="lazy" src="/rehype-og-card/6400e93e712801882b406ea099a1e0a169968e1f7832730edda039a413889df8" width="16"><span class="og-card-url">blog.google</span></div></div><div class="og-card-image-container"><img class="og-card-image" alt="/rehype-og-card/43abb4af7ecae4a12a08f8381233161239d30a562dd395eefa3ce7aa81658644.png" decoding="async" loading="lazy" src="/rehype-og-card/43abb4af7ecae4a12a08f8381233161239d30a562dd395eefa3ce7aa81658644.png"></div></a></div></p>
    `.trim();

    const result = await processor.process(input);
    expect(result.toString().trim()).toBe(expected);

    const cache = await fs.readdir(path.join(serverCachePath, "rehype-og-card"));
    expect(cache.length).toBe(3);
});

it("build cache expiration should prune images and metadata", async () => {
    const buildCachePath = "./.buildCache-expire/rehype-og-card";
    const serverCachePath = "./.cache-expire/rehype-og-card";

    await fs.rm("./.buildCache-expire", { recursive: true, force: true });
    await fs.rm("./.cache-expire", { recursive: true, force: true });
    await fs.mkdir(buildCachePath, { recursive: true });

    const cachedAt = Date.now() - 1000;
    await fs.writeFile(path.join(buildCachePath, "image.png"), "image");
    const cacheIndex = { "image.png": { createdAt: cachedAt } } as const satisfies CacheIndex;
    await writeCacheIndex(buildCachePath, cacheIndex);
    const ogUrl = "https://example.com";
    const ogFilename = `${generateFilename(ogUrl, false)}.json`;
    const ogPayload = {
        cachedAt,
        displayURL: "example.com",
        title: "Example Domain",
        url: ogUrl
    } as const satisfies OGCardData & { cachedAt: number };
    await fs.writeFile(path.join(buildCachePath, ogFilename), JSON.stringify(ogPayload));

    restoreBuildCache(buildCachePath, serverCachePath, 1);

    const buildCacheEntries = (await fs.readdir(buildCachePath)).sort();
    expect(buildCacheEntries).toEqual(["cache.json"]);

    const serverCacheEntries = (await fs.readdir(serverCachePath)).sort();
    expect(serverCacheEntries).toEqual(["cache.json"]);

    const cacheIndexAfterPrune = await readCacheIndex(buildCachePath);
    expect(cacheIndexAfterPrune).toEqual({});
});

it("should not convert URLs with non-HTTP(S) protocols", async () => {
    const processor = processorFactory({ serverCache: false });

    const input = `
mailto:info@example.com
    `.trim();

    const expected = `
<p>mailto:info@example.com</p>
    `.trim();

    const result = await processor.process(input);
    expect(result.toString().trim()).toBe(expected);
});

it("should work with `buildCache` option", async () => {
    const serverCachePath = "./.cache/";
    const buildCachePath = "./.buildCache/";

    await fs.rm(serverCachePath, { recursive: true, force: true });
    await fs.rm(buildCachePath, { recursive: true, force: true });
    const processor = processorFactory({ buildCache: true, buildCachePath, serverCachePath });

    const input = `
https://blog.google/products/android/world-emoji-day-2024/
    `.trim();

    const expected = `
<p><div class="og-card-container"><a href="https://blog.google/products/android/world-emoji-day-2024/"><div class="og-card-info"><div class="og-card-title">10 fun facts about emoji for World Emoji Day</div><div class="og-card-description">Celebrate World Emoji Day with Google, and check out what’s new for Emoji Kitchen.</div><div class="og-card-url-container"><img class="og-card-favicon" alt="favicon" decoding="async" height="16" loading="lazy" src="/rehype-og-card/6400e93e712801882b406ea099a1e0a169968e1f7832730edda039a413889df8" width="16"><span class="og-card-url">blog.google</span></div></div><div class="og-card-image-container"><img class="og-card-image" alt="/rehype-og-card/43abb4af7ecae4a12a08f8381233161239d30a562dd395eefa3ce7aa81658644.png" decoding="async" loading="lazy" src="/rehype-og-card/43abb4af7ecae4a12a08f8381233161239d30a562dd395eefa3ce7aa81658644.png"></div></a></div></p>
    `.trim();

    const result = await processor.process(input);
    expect(result.toString().trim()).toBe(expected);

    // Wait for cache to be saved.
    await setTimeout(1000);

    const cache = await fs.readdir(path.join(buildCachePath, "rehype-og-card"));
    expect(cache.length).toBe(4);
});

it("restoreOGDataBuildCache should remove expired metadata", async () => {
    const buildCachePath = "./.buildCache-expire-meta/rehype-og-card";

    await fs.rm("./.buildCache-expire-meta", { recursive: true, force: true });
    await fs.mkdir(buildCachePath, { recursive: true });

    const url = "https://example.com";
    const filename = generateFilename(url, false);
    const savePath = path.join(buildCachePath, `${filename}.json`);
    const expiredPayload = {
        cachedAt: Date.now() - 1000,
        displayURL: "example.com",
        title: "Example Domain",
        url
    } as const satisfies OGCardData & { cachedAt: number };
    await fs.writeFile(savePath, JSON.stringify(expiredPayload));

    const restored = await restoreOGDataBuildCache(url, buildCachePath, 1);
    expect(restored).toBeNull();

    const exists = await checkFileExists(savePath);
    expect(exists).toBe(false);
});
