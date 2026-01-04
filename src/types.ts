import { type } from "arktype";

interface RehypeOGCardOptions {
    /**
     * Domains to exclude from conversion.
     */
    excludeDomains?: string[];
    /**
     * `decoding` attribute of the image element.
     * @default "async"
     */
    decoding?: HTMLImageElement["decoding"];
    /**
     * `loading` attribute of the image element.
     * @default "lazy"
     */
    loading?: HTMLImageElement["loading"];
    /**
     * Whether to shorten the displayed URL.
     * @default true
     */
    shortenURL?: boolean;
    /**
     * Whether to open the link in a new tab.
     * @default false
     */
    openInNewTab?: boolean;
    /**
     * Whether to enable converting the links
     * that have the same URL and text (e.g., `[https://example.com](https://example.com)`).
     * @default false
     */
    enableSameTextURLConversion?: boolean;
    /**
     * Whether to cache the OG data on the server.
     * @default true
     */
    serverCache?: boolean;
    /**
     * Path to save the server cache.
     * Specify the directory whose contents will be copied to the root.
     * For example, for an Astro project, specify the `public` directory.
     * @default "./public"
     */
    serverCachePath?: string;
    /**
     * Cache expiration time for server cache in milliseconds.
     * Set to `false` to disable expiration.
     * Expiration is calculated from the cached timestamp stored in the cache itself.
     * @default 2592000000
     */
    serverCacheMaxAge?: number | false;
    /**
     * Whether to cache the OG metadata and images for the next build.
     * `buildCache` option requires `serverCache` option to be enabled.
     * @default false
     */
    buildCache?: boolean;
    /**
     * Path to save the build cache.
     * For Astro projects, specify the `./node_modules/.astro` directory.
     * @default "./node_modules/.cache"
     */
    buildCachePath?: string;
    /**
     * Cache expiration time for build cache in milliseconds.
     * Set to `false` to disable expiration.
     * Expiration is calculated from the cached timestamp stored in the cache itself.
     * @default 2592000000
     */
    buildCacheMaxAge?: number | false;
    /**
     * User agent to use for fetching the OG metadata and images.
     * @default "Mozilla/5.0 (compatible; rehype-og-card/2.0; +https://github.com/Robot-Inventor/rehype-og-card/; purpose=link-preview; twitterbot-compatible)"
     */
    crawlerUserAgent?: string;
}

interface OGCardData {
    url: string;
    title: string;
    description?: string | undefined;
    displayURL: string;
    faviconURL?: string | undefined;
    OGImageURL?: string | undefined;
    OGImageAlt?: string | undefined;
    OGImageWidth?: number | undefined;
    OGImageHeight?: number | undefined;
}

const cacheIndexSchema = type({
    "[string]": {
        createdAt: "number"
    }
});

type CacheIndex = typeof cacheIndexSchema.infer;

export { cacheIndexSchema, type RehypeOGCardOptions, type OGCardData, type CacheIndex };
