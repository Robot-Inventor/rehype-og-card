import { expect, it } from "vitest";
import rehypeOGCard, { RehypeOGCardOptions } from "./index.js";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";
import fs from "fs/promises";

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
<p><a class="rlc-container" href="https://example.com">
    <div class="rlc-info">
        <div class="rlc-title">Example Domain</div>
        <div class="rlc-url-container">
            <img class="rlc-favicon" loading="lazy" decoding="async" src="undefined" alt="favicon" width="16" height="16">
            <span class="rlc-url">example.com</span>
        </div>
    </div>
</a></p>
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
<p><a class="rlc-container" href="https://blog.google/products/android/world-emoji-day-2024/">
    <div class="rlc-info">
        <div class="rlc-title">10 fun facts about emoji for World Emoji Day</div>
        <div class="rlc-description">Celebrate World Emoji Day with Google, and check out what’s new for Emoji Kitchen.</div>
        <div class="rlc-url-container">
            <img class="rlc-favicon" loading="lazy" decoding="async" src="https://www.google.com/s2/favicons?domain=blog.google" alt="favicon" width="16" height="16">
            <span class="rlc-url">https://blog.google/products/android/world-emoji-day-2024/</span>
        </div>
    </div>
    <div class="rlc-image-container">
        <img class="rlc-image" loading="lazy" decoding="async" src="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/world_emoji_day_v2_1.width-1300.png" alt="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/world_emoji_day_v2_1.width-1300.png">
    </div>
</a></p>
    `.trim();

    const result = await processor.process(input);
    expect(result.toString().trim()).toBe(expected);
});

it("server cache should work", async () => {
    const serverCachePath = "./.cache/rehype-og-card/";

    await fs.rm(serverCachePath, { recursive: true, force: true });
    const processor = processorFactory({ serverCache: true, serverCachePath });

    const input = `
https://blog.google/products/android/world-emoji-day-2024/
    `.trim();

    const expected = `
<p><a class="rlc-container" href="https://blog.google/products/android/world-emoji-day-2024/">
    <div class="rlc-info">
        <div class="rlc-title">10 fun facts about emoji for World Emoji Day</div>
        <div class="rlc-description">Celebrate World Emoji Day with Google, and check out what’s new for Emoji Kitchen.</div>
        <div class="rlc-url-container">
            <img class="rlc-favicon" loading="lazy" decoding="async" src="/.cache/rehype-og-card/6400e93e712801882b406ea099a1e0a169968e1f7832730edda039a413889df8" alt="favicon" width="16" height="16">
            <span class="rlc-url">blog.google</span>
        </div>
    </div>
    <div class="rlc-image-container">
        <img class="rlc-image" loading="lazy" decoding="async" src="/.cache/rehype-og-card/43abb4af7ecae4a12a08f8381233161239d30a562dd395eefa3ce7aa81658644.png" alt="/.cache/rehype-og-card/43abb4af7ecae4a12a08f8381233161239d30a562dd395eefa3ce7aa81658644.png">
    </div>
</a></p>
    `.trim();

    const result = await processor.process(input);
    expect(result.toString().trim()).toBe(expected);

    const cache = await fs.readdir(serverCachePath);
    expect(cache.length).toBe(2);
});
