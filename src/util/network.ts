import { checkFileExists, generateFilename } from "./file.js";
import { isCacheExpired, readCacheIndex, writeCacheIndex } from "./cache.js";
import type { OGCardData } from "../types.js";
import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";
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
    // eslint-disable-next-line no-undefined
    if (!rawURL) return undefined;

    const parsedUrl = URL.parse(rawURL, baseURL);
    // eslint-disable-next-line no-undefined
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
        const faviconURL = result.favicon
            ? `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`
            : // eslint-disable-next-line no-undefined
              undefined;
        return {
            OGImageAlt: OGImage?.alt,
            OGImageHeight: OGImage?.height,
            OGImageURL,
            OGImageWidth: OGImage?.width,
            description: result.ogDescription,
            displayURL: url,
            faviconURL,
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            title: result.ogTitle || url,
            url
        };
    } catch (error) {
        // eslint-disable-next-line no-console
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
    cacheMaxAge?: number | false;
}

/**
 * Download image from given URL. If the image already exists, return the filename.
 * @param options Options to download image.
 * @returns Filename of the downloaded image.
 */
// eslint-disable-next-line max-statements, max-lines-per-function
const downloadImage = async (options: DownloadImageOptions): Promise<string | null> => {
    if (!isValidURL(options.url)) {
        // eslint-disable-next-line no-console
        console.error("[rehype-og-card] Invalid thumbnail URL:", options.url);
        return null;
    }

    try {
        const filename = generateFilename(options.url);
        const savePath = path.posix.join(options.directory, filename);

        // If the file already exists, return the filename.
        const fileExists = await checkFileExists(savePath);
        if (fileExists) {
            if (options.cacheMaxAge === false) return filename;

            const index = await readCacheIndex(options.directory);

            const entry = index[filename];
            const cachedAt = entry?.createdAt;
            const maxAge = options.cacheMaxAge ?? false;
            if (typeof cachedAt === "number" && !isCacheExpired(cachedAt, maxAge)) return filename;

            if (typeof entry !== "undefined") {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete index[filename];
                await writeCacheIndex(options.directory, index);
            }

            await fs.rm(savePath, { force: true });
        }

        const response = await fetch(options.url, {
            headers: {
                "user-agent": options.userAgent
            },
            // eslint-disable-next-line no-magic-numbers
            signal: AbortSignal.timeout(10 * 1000)
        });

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const saveDirectoryExists = await checkFileExists(options.directory);
        if (!saveDirectoryExists) {
            await fs.mkdir(options.directory, { recursive: true });
        }
        await fs.writeFile(savePath, buffer);

        const cachedAt = Date.now();
        const index = await readCacheIndex(options.directory);
        index[filename] = { createdAt: cachedAt };
        await writeCacheIndex(options.directory, index);

        return filename;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("[rehype-og-card] Error downloading image:", error);
        return null;
    }
};

export { isValidURL, getOGData, downloadImage };
