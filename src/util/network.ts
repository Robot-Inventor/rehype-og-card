import type { OGCardData, RehypeOGCardOptions } from "../types.js";
import { checkFileExists, generateFilename } from "./file.js";
import { isCacheExpired, readCacheIndex, writeCacheIndex } from "./cache.js";
import fetch from "node-fetch";
import fs from "node:fs/promises";
import path from "node:path";
import { rasterizeSVG } from "./svg.js";
import scraper from "open-graph-scraper";

/**
 * Check if the URL is valid.
 * @param url URL to check.
 * @returns `true` if the URL is valid, `false` otherwise.
 */
const isValidURL = (url: string): boolean => {
    const ALLOWED_PROTOCOLS = ["http:", "https:"];
    const parsedUrl = URL.parse(url);

    return Boolean(parsedUrl && ALLOWED_PROTOCOLS.includes(parsedUrl.protocol));
};

/**
 * Resolve an absolute URL from a raw URL and a base URL.
 * @param rawURL Raw URL to resolve.
 * @param baseURL Base URL to resolve against.
 * @returns Resolved absolute URL or `undefined` if the raw URL is invalid.
 */
const resolveAbsoluteURL = (rawURL: string | undefined, baseURL: string): string | undefined => {
    // oxlint-disable-next-line no-undefined
    if (!rawURL) return undefined;

    const parsedUrl = URL.parse(rawURL, baseURL);
    // oxlint-disable-next-line no-undefined
    return parsedUrl ? parsedUrl.href : undefined;
};

/**
 * Get OG card data from given URL.
 * @param url URL to get OG card data.
 * @param userAgent User agent to use for fetching.
 * @returns OG card data.
 */
const getOGData = async (url: string, userAgent: string): Promise<OGCardData | null> => {
    try {
        const { result } = await scraper({
            fetchOptions: {
                headers: {
                    "user-agent": userAgent
                }
            },
            url
        });
        const OGImage = result.ogImage ? result.ogImage[0] : null;
        const OGImageURL = resolveAbsoluteURL(OGImage?.url, url);
        const resolvedFaviconURL = result.favicon ? resolveAbsoluteURL(result.favicon, url) : null;
        const faviconURL = resolvedFaviconURL ?? `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`;
        return {
            OGImageAlt: OGImage?.alt,
            OGImageHeight: OGImage?.height,
            OGImageURL,
            OGImageWidth: OGImage?.width,
            description: result.ogDescription,
            displayURL: url,
            faviconURL,
            // oxlint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            title: result.ogTitle || url,
            url
        };
    } catch (error) {
        // oxlint-disable-next-line no-console
        console.error("[rehype-og-card] Error fetching OG data:", error);
        return null;
    }
};

interface DownloadImageOptions {
    /**
     * URL to download image.
     */
    url: string;
    /**
     * Directory to save the downloaded image.
     */
    directory: string;
    /**
     * User agent to use for fetching the image.
     */
    userAgent: string;
    /**
     * Cache expiration time in milliseconds.
     * Set to `false` to disable expiration.
     */
    cacheMaxAge: number | false;
    /**
     * How to handle SVG images.
     * @default "rasterize"
     */
    svgHandling?: RehypeOGCardOptions["svgHandling"];
}

/**
 * Restore an unexpired cached image.
 * @param options Image cache options.
 * @param filenames Possible cached image filenames.
 * @returns Cached filename, or `null` if no valid file exists.
 */
const restoreImageCache = async (options: DownloadImageOptions, filenames: Set<string>): Promise<string | null> => {
    const index = await readCacheIndex(options.directory);
    const cached = await Promise.all(
        [...filenames].map(async (filename) => {
            const cachedPath = path.join(options.directory, filename);
            if (!(await checkFileExists(cachedPath))) return null;

            const cachedAt = index[filename]?.createdAt;
            if (
                options.cacheMaxAge === false ||
                (typeof cachedAt === "number" && !isCacheExpired(cachedAt, options.cacheMaxAge))
            ) {
                return filename;
            }

            await fs.rm(cachedPath, { force: true });
            return null;
        })
    );
    return cached.find((filename) => filename !== null) ?? null;
};

/**
 * Download image from given URL. If the image already exists, return the filename.
 * @param options Options to download image.
 * @returns Filename of the downloaded image.
 */
// oxlint-disable-next-line max-statements
const downloadImage = async (options: DownloadImageOptions): Promise<string | null> => {
    if (!isValidURL(options.url)) {
        // oxlint-disable-next-line no-console
        console.error("[rehype-og-card] Invalid thumbnail URL:", options.url);
        return null;
    }

    try {
        const svgHandling = options.svgHandling ?? "rasterize";
        const stem = generateFilename(options.url, false);
        let filename = generateFilename(options.url);
        const candidates = new Set([filename, `${stem}.png`]);

        const cachedFilename = await restoreImageCache(options, candidates);
        if (cachedFilename) return cachedFilename;

        const response = await fetch(options.url, {
            headers: {
                "user-agent": options.userAgent
            },
            // oxlint-disable-next-line no-magic-numbers
            signal: AbortSignal.timeout(10 * 1000)
        });

        if (!response.ok) return null;

        const contentType = response.headers.get("content-type");
        const normalizedContentType = contentType?.replace(/;.*/u, "").trim().toLowerCase();
        const isSVG =
            normalizedContentType === "image/svg+xml" ||
            [options.url, response.url].some((url) => path.extname(new URL(url).pathname).toLowerCase() === ".svg");
        if (isSVG && svgHandling === "omit") return null;

        if (!isSVG && !normalizedContentType?.startsWith("image/")) {
            // oxlint-disable-next-line no-console
            console.error("[rehype-og-card] Invalid image content type:", contentType ?? "unknown", "for", options.url);
            return null;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const shouldRasterize = isSVG && svgHandling === "rasterize";
        const imageBuffer = shouldRasterize ? await rasterizeSVG(buffer) : buffer;
        if (shouldRasterize) {
            filename = `${stem}.png`;
        }

        await fs.mkdir(options.directory, { recursive: true });
        await fs.writeFile(path.join(options.directory, filename), imageBuffer);

        const cachedAt = Date.now();
        const index = await readCacheIndex(options.directory);
        index[filename] = { createdAt: cachedAt };
        await writeCacheIndex(options.directory, index);

        return filename;
    } catch (error) {
        // oxlint-disable-next-line no-console
        console.error("[rehype-og-card] Error downloading image:", error);
        return null;
    }
};

export { isValidURL, getOGData, downloadImage };
