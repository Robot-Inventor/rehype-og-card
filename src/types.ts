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
     * @default "./public"
     */
    serverCachePath?: string;
    /**
     * Whether to cache the OG metadata and images for the next build.
     * @default false
     */
    buildCache?: boolean;
    /**
     * Path to save the build cache.
     * @default "./node_modules/.cache"
     */
    buildCachePath?: string;
    /* eslint-disable max-len */
    /**
     * User agent to use for fetching the OG metadata and images.
     * @default "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
     */
    crawlerUserAgent?: string;
    /* eslint-enable max-len */
}

export { RehypeOGCardOptions };
