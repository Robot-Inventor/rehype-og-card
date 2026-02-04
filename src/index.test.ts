import { expect, it } from "vitest";
import rehypeOGCard, { RehypeOGCardOptions } from "./index.js";
import { readCacheIndex, restoreBuildCache, restoreOGDataBuildCache, writeCacheIndex } from "./util/cache.js";
import { checkFileExists, generateFilename } from "./util/file.js";
import { downloadImage } from "./util/network.js";
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
this is a link: http://127.0.0.1:3456/test-page

\`http://127.0.0.1:3456/test-page\`

http://127.0.0.1:3456/test-page

[http://127.0.0.1:3456/test-page](http://127.0.0.1:3456/test-page)

[Test page](http://127.0.0.1:3456/test-page)
    `.trim();

    const expected = `
<p>this is a link: http://127.0.0.1:3456/test-page</p>
<p><code>http://127.0.0.1:3456/test-page</code></p>
<div class="og-card-container"><a href="http://127.0.0.1:3456/test-page"><div class="og-card-info"><div class="og-card-title">Test Page Title</div><div class="og-card-description">This is a test page description for OG card testing</div><div class="og-card-url-container"><img class="og-card-favicon" alt="favicon" decoding="async" height="16" loading="lazy" src="http://127.0.0.1:3456/favicon.ico" width="16"><span class="og-card-url">127.0.0.1</span></div></div><div class="og-card-image-container"><img class="og-card-image" alt="Test image alt text" decoding="async" height="630" loading="lazy" src="http://127.0.0.1:3456/test-image.png" width="1200"></div></a></div>
<p><a href="http://127.0.0.1:3456/test-page">http://127.0.0.1:3456/test-page</a></p>
<p><a href="http://127.0.0.1:3456/test-page">Test page</a></p>
    `.trim();

    const result = await processor.process(input);
    expect(result.toString().trim()).toBe(expected);
});

it("`removeParentPTag` option should keep parent <p> when disabled", async () => {
    const processor = processorFactory({ removeParentPTag: false, serverCache: false });

    const input = `
http://127.0.0.1:3456/test-page
    `.trim();

    const expected = `
<p><div class="og-card-container"><a href="http://127.0.0.1:3456/test-page"><div class="og-card-info"><div class="og-card-title">Test Page Title</div><div class="og-card-description">This is a test page description for OG card testing</div><div class="og-card-url-container"><img class="og-card-favicon" alt="favicon" decoding="async" height="16" loading="lazy" src="http://127.0.0.1:3456/favicon.ico" width="16"><span class="og-card-url">127.0.0.1</span></div></div><div class="og-card-image-container"><img class="og-card-image" alt="Test image alt text" decoding="async" height="630" loading="lazy" src="http://127.0.0.1:3456/test-image.png" width="1200"></div></a></div></p>
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

http://127.0.0.1:3456/test-page

[This link](https://example.com) is a link to example.com and should not be converted to an OG card.
    `.trim();

    const expected = `
<h1>Title</h1>
<p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores eum voluptates eos hic nobis optio inventore dolores cum repellat.</p>
<p>Esse officia a perspiciatis nihil dolore quam doloremque distinctio iure beatae!</p>
<div class="og-card-container"><a href="http://127.0.0.1:3456/test-page"><div class="og-card-info"><div class="og-card-title">Test Page Title</div><div class="og-card-description">This is a test page description for OG card testing</div><div class="og-card-url-container"><img class="og-card-favicon" alt="favicon" decoding="async" height="16" loading="lazy" src="http://127.0.0.1:3456/favicon.ico" width="16"><span class="og-card-url">127.0.0.1</span></div></div><div class="og-card-image-container"><img class="og-card-image" alt="Test image alt text" decoding="async" height="630" loading="lazy" src="http://127.0.0.1:3456/test-image.png" width="1200"></div></a></div>
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
[http://127.0.0.1:3456/test-page](http://127.0.0.1:3456/test-page)
    `.trim();

    const expected = `
<div class="og-card-container"><a href="http://127.0.0.1:3456/test-page"><div class="og-card-info"><div class="og-card-title">Test Page Title</div><div class="og-card-description">This is a test page description for OG card testing</div><div class="og-card-url-container"><img class="og-card-favicon" alt="favicon" decoding="async" height="16" loading="lazy" src="http://127.0.0.1:3456/favicon.ico" width="16"><span class="og-card-url">127.0.0.1</span></div></div><div class="og-card-image-container"><img class="og-card-image" alt="Test image alt text" decoding="async" height="630" loading="lazy" src="http://127.0.0.1:3456/test-image.png" width="1200"></div></a></div>
    `.trim();

    const result = await processor.process(input);
    expect(result.toString().trim()).toBe(expected);
});

it("should not create OG card in list items", async () => {
    const processor = processorFactory({ serverCache: false });

    const input = `
- [http://127.0.0.1:3456/test-page](http://127.0.0.1:3456/test-page)
    `.trim();

    const expected = `
<ul>
<li><a href="http://127.0.0.1:3456/test-page">http://127.0.0.1:3456/test-page</a></li>
</ul>
    `.trim();

    const result = await processor.process(input);
    expect(result.toString().trim()).toBe(expected);
});

it("if the website does not have some of the OG tags, it should not throw an error", async () => {
    const processor = processorFactory({ serverCache: false });

    const input = `
http://127.0.0.1:3456/simple-page
    `.trim();

    const expected = `
<div class="og-card-container"><a href="http://127.0.0.1:3456/simple-page"><div class="og-card-info"><div class="og-card-title">Example Domain</div><div class="og-card-url-container"><img class="og-card-favicon" alt="favicon" decoding="async" height="16" loading="lazy" src="http://127.0.0.1:3456/favicon.ico" width="16"><span class="og-card-url">127.0.0.1</span></div></div></a></div>
    `.trim();

    const result = await processor.process(input);
    expect(result.toString().trim()).toBe(expected);
});

it("`excludeDomains` option should exclude specified domains", async () => {
    const processor = processorFactory({ excludeDomains: ["127.0.0.1"] });

    const input = `
http://127.0.0.1:3456/test-page
    `.trim();

    const expected = `
<p>http://127.0.0.1:3456/test-page</p>
    `.trim();

    const result = await processor.process(input);
    expect(result.toString().trim()).toBe(expected);
});

it("if `shortenURL` option is `false`, it should not shorten the URL", async () => {
    const processor = processorFactory({ shortenURL: false, serverCache: false });

    const input = `
http://127.0.0.1:3456/test-page
    `.trim();

    const expected = `
<div class="og-card-container"><a href="http://127.0.0.1:3456/test-page"><div class="og-card-info"><div class="og-card-title">Test Page Title</div><div class="og-card-description">This is a test page description for OG card testing</div><div class="og-card-url-container"><img class="og-card-favicon" alt="favicon" decoding="async" height="16" loading="lazy" src="http://127.0.0.1:3456/favicon.ico" width="16"><span class="og-card-url">http://127.0.0.1:3456/test-page</span></div></div><div class="og-card-image-container"><img class="og-card-image" alt="Test image alt text" decoding="async" height="630" loading="lazy" src="http://127.0.0.1:3456/test-image.png" width="1200"></div></a></div>
    `.trim();

    const result = await processor.process(input);
    expect(result.toString().trim()).toBe(expected);
});

it("server cache should work", async () => {
    const serverCachePath = "./.cache/server-cache/";

    await fs.rm(serverCachePath, { recursive: true, force: true });
    const processor = processorFactory({ serverCache: true, serverCachePath });

    const input = `
http://127.0.0.1:3456/test-page
    `.trim();

    const expected = `
<div class="og-card-container"><a href="http://127.0.0.1:3456/test-page"><div class="og-card-info"><div class="og-card-title">Test Page Title</div><div class="og-card-description">This is a test page description for OG card testing</div><div class="og-card-url-container"><img class="og-card-favicon" alt="favicon" decoding="async" height="16" loading="lazy" src="/rehype-og-card/0b0642dc81d1061bb482d2901421f2ae9f9f2079f72d2d294fad20b741c2fed9" width="16"><span class="og-card-url">127.0.0.1</span></div></div><div class="og-card-image-container"><img class="og-card-image" alt="Test image alt text" decoding="async" height="630" loading="lazy" src="/rehype-og-card/191e9828b06abb9605450abfdb0555bca5fc3c5d73433e2c1de5b20416669443.png" width="1200"></div></a></div>
    `.trim();

    const result = await processor.process(input);
    expect(result.toString().trim()).toBe(expected);

    // The cache contains: 1 OG image file + 1 favicon file + 1 cache index file
    const cache = await fs.readdir(path.join(serverCachePath, "rehype-og-card"));
    expect(cache.length).toBe(3);
});

it("should omit OG images when response content type is not an image", async () => {
    const serverCachePath = "./.cache/server-cache-non-image/";

    await fs.rm(serverCachePath, { recursive: true, force: true });
    const processor = processorFactory({ serverCache: true, serverCachePath });

    const input = `
http://127.0.0.1:3456/test-page-non-image
    `.trim();

    const expected = `
<div class="og-card-container"><a href="http://127.0.0.1:3456/test-page-non-image"><div class="og-card-info"><div class="og-card-title">Test Page Title</div><div class="og-card-description">This is a test page description for OG card testing</div><div class="og-card-url-container"><img class="og-card-favicon" alt="favicon" decoding="async" height="16" loading="lazy" src="/rehype-og-card/0b0642dc81d1061bb482d2901421f2ae9f9f2079f72d2d294fad20b741c2fed9" width="16"><span class="og-card-url">127.0.0.1</span></div></div></a></div>
    `.trim();

    const result = await processor.process(input);
    expect(result.toString().trim()).toBe(expected);

    const cache = await fs.readdir(path.join(serverCachePath, "rehype-og-card"));
    expect(cache.length).toBe(2);
});

it("server cache expiration disabled should keep cached images", async () => {
    const serverCachePath = "./.cache/server-cache-no-expire/rehype-og-card";

    await fs.rm("./.cache/server-cache-no-expire", { recursive: true, force: true });
    await fs.mkdir(serverCachePath, { recursive: true });

    const url = "https://example.com/image.png";
    const filename = generateFilename(url);
    const filePath = path.join(serverCachePath, filename);
    await fs.writeFile(filePath, "image");

    const cacheIndex = { [filename]: { createdAt: Date.now() - 1000 } } as const satisfies CacheIndex;
    await writeCacheIndex(serverCachePath, cacheIndex);

    const statBefore = await fs.stat(filePath);
    const restored = await downloadImage({
        cacheMaxAge: false,
        directory: serverCachePath,
        url,
        userAgent: "rehype-og-card-test"
    });
    expect(restored).toBe(filename);

    const statAfter = await fs.stat(filePath);
    expect(statAfter.mtimeMs).toBe(statBefore.mtimeMs);

    const indexAfter = await readCacheIndex(serverCachePath);
    expect(indexAfter).toEqual(cacheIndex);
});

it("server cache should expire images and re-download", async () => {
    const serverCachePath = "./.cache/server-cache-expire/";
    const cacheDirectory = path.join(serverCachePath, "rehype-og-card");
    // This is the SHA-256 hash of "http://127.0.0.1:3456/test-image.png"
    const imageFilename = "191e9828b06abb9605450abfdb0555bca5fc3c5d73433e2c1de5b20416669443.png";

    await fs.rm(serverCachePath, { recursive: true, force: true });
    const processor = processorFactory({ serverCache: true, serverCachePath, serverCacheMaxAge: 100 });

    const input = `
http://127.0.0.1:3456/test-page
    `.trim();

    await processor.process(input);

    const indexBefore = await readCacheIndex(cacheDirectory);
    const createdAtBefore = indexBefore[imageFilename]?.createdAt;
    expect(typeof createdAtBefore).toBe("number");

    const imagePath = path.join(cacheDirectory, imageFilename);
    const statBefore = await fs.stat(imagePath);

    indexBefore[imageFilename] = { createdAt: Date.now() - 1000 };
    await writeCacheIndex(cacheDirectory, indexBefore);

    await processor.process(input);

    const indexAfter = await readCacheIndex(cacheDirectory);
    const createdAtAfter = indexAfter[imageFilename]?.createdAt;
    expect(typeof createdAtAfter).toBe("number");
    expect(createdAtAfter).toBeGreaterThan(createdAtBefore as number);

    const statAfter = await fs.stat(imagePath);
    expect(statAfter.mtimeMs).toBeGreaterThan(statBefore.mtimeMs);
});

it("build cache expiration should prune images and metadata", async () => {
    const buildCachePath = "./.cache/build-cache-expire/rehype-og-card";
    const serverCachePath = "./.cache/server-cache-expire-build/rehype-og-card";

    await fs.rm("./.cache/build-cache-expire", { recursive: true, force: true });
    await fs.rm("./.cache/server-cache-expire-build", { recursive: true, force: true });
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

it("build cache expiration disabled should keep entries", async () => {
    const buildCachePath = "./.cache/build-cache-no-expire/rehype-og-card";
    const serverCachePath = "./.cache/server-cache-no-expire-build/rehype-og-card";

    await fs.rm("./.cache/build-cache-no-expire", { recursive: true, force: true });
    await fs.rm("./.cache/server-cache-no-expire-build", { recursive: true, force: true });
    await fs.mkdir(buildCachePath, { recursive: true });

    const cachedAt = Date.now() - 1000;
    await fs.writeFile(path.join(buildCachePath, "image.png"), "image");
    const cacheIndex = { "image.png": { createdAt: cachedAt } } as const satisfies CacheIndex;
    await writeCacheIndex(buildCachePath, cacheIndex);

    restoreBuildCache(buildCachePath, serverCachePath, false);

    const buildCacheEntries = (await fs.readdir(buildCachePath)).sort();
    expect(buildCacheEntries).toEqual(["cache.json", "image.png"]);

    const serverCacheEntries = (await fs.readdir(serverCachePath)).sort();
    expect(serverCacheEntries).toEqual(["cache.json", "image.png"]);

    const cacheIndexAfterRestore = await readCacheIndex(buildCachePath);
    expect(cacheIndexAfterRestore).toEqual(cacheIndex);
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
    const serverCachePath = "./.cache/server-cache/";
    const buildCachePath = "./.cache/build-cache/";

    await fs.rm(serverCachePath, { recursive: true, force: true });
    await fs.rm(buildCachePath, { recursive: true, force: true });
    const processor = processorFactory({ buildCache: true, buildCachePath, serverCachePath });

    const input = `
http://127.0.0.1:3456/test-page
    `.trim();

    const expected = `
<div class="og-card-container"><a href="http://127.0.0.1:3456/test-page"><div class="og-card-info"><div class="og-card-title">Test Page Title</div><div class="og-card-description">This is a test page description for OG card testing</div><div class="og-card-url-container"><img class="og-card-favicon" alt="favicon" decoding="async" height="16" loading="lazy" src="/rehype-og-card/0b0642dc81d1061bb482d2901421f2ae9f9f2079f72d2d294fad20b741c2fed9" width="16"><span class="og-card-url">127.0.0.1</span></div></div><div class="og-card-image-container"><img class="og-card-image" alt="Test image alt text" decoding="async" height="630" loading="lazy" src="/rehype-og-card/191e9828b06abb9605450abfdb0555bca5fc3c5d73433e2c1de5b20416669443.png" width="1200"></div></a></div>
    `.trim();

    const result = await processor.process(input);
    expect(result.toString().trim()).toBe(expected);

    // Wait for cache to be saved.
    await setTimeout(1000);

    // The cache contains: 1 OG image file + 1 favicon file + 1 OG metadata JSON file + 1 cache index file
    const cache = await fs.readdir(path.join(buildCachePath, "rehype-og-card"));
    expect(cache.length).toBe(4);
});

it("restoreOGDataBuildCache should remove expired metadata", async () => {
    const buildCachePath = "./.cache/build-cache-expire-meta/rehype-og-card";

    await fs.rm("./.cache/build-cache-expire-meta", { recursive: true, force: true });
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
