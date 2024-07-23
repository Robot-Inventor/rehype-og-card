import { checkFileExists, generateFilename } from "./file.js";
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

    const lowerCaseURL = url.toLowerCase();
    const isLikelyURL = ALLOWED_PROTOCOLS.some((protocol) => lowerCaseURL.startsWith(protocol));
    if (!isLikelyURL) return false;

    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
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
        const faviconURL = result.favicon
            ? `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`
            : // eslint-disable-next-line no-undefined
              undefined;
        return {
            OGImageAlt: OGImage?.alt,
            OGImageHeight: OGImage?.height,
            OGImageURL: OGImage?.url,
            OGImageWidth: OGImage?.width,
            description: result.ogDescription,
            displayURL: url,
            faviconURL,
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
}

/**
 * Download image from given URL. If the image already exists, return the filename.
 * @param options Options to download image.
 * @returns Filename of the downloaded image.
 */
// eslint-disable-next-line max-statements
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
        if (fileExists) return filename;

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

        return filename;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("[rehype-og-card] Error downloading image:", error);
        return null;
    }
};

export { isValidURL, getOGData, downloadImage };
