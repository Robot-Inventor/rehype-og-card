import type { Element, ElementContent, Text } from "hast";
import { createHash } from "crypto";
import fs from "fs/promises";
import { isElement } from "hast-util-is-element";
import path from "path";

interface AnchorElement extends Element {
    tagName: "a";
    properties: {
        href: string;
    };
}

/**
 * Check if the node is a text node.
 * @param node Node to check.
 * @returns `true` if the node is a text node, `false` otherwise.
 */
const isTextNode = (node: ElementContent): node is Text =>
    Boolean(node) && typeof node === "object" && "type" in node && node.type === "text";

/**
 * Check if the node is an anchor element.
 * @param node Node to check.
 * @returns `true` if the node is an anchor element, `false` otherwise.
 */
const isAnchorElement = (node: unknown): node is AnchorElement =>
    Boolean(node) && isElement(node, "a") && "href" in node.properties && typeof node.properties.href === "string";

/**
 * Check if the URL is valid.
 * @param url URL to check.
 * @returns `true` if the URL is valid, `false` otherwise.
 */
const isValidURL = (url: string): boolean => {
    const ALLOWED_PROTOCOLS = ["http:", "https:"];

    try {
        const { protocol } = new URL(url);
        return ALLOWED_PROTOCOLS.includes(protocol.toLowerCase());
    } catch {
        return false;
    }
};

/**
 * Convert text node to anchor element. **This function does not check if the text is a valid URL.**
 * @param text Text node to convert.
 * @returns Anchor element.
 */
const convertTextToAnchorElement = (text: Text): AnchorElement =>
    ({
        children: [text],
        properties: {
            href: text.value.trim()
        },
        tagName: "a",
        type: "element"
    }) as const satisfies AnchorElement;

/**
 * Check if the file exists.
 * @param filePath Path to check.
 * @returns `true` if the file exists, `false` otherwise.
 */
const checkFileExists = async (filePath: string): Promise<boolean> => {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
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
    directly: string;
    /**
     * Whether to save and restore the image cache.
     */
    useBuildCache: boolean;
    /**
     * Directory to save the image cache.
     */
    buildCacheDirectory: string;
    /**
     * User agent to use for fetching the image.
     */
    userAgent: string;
}

/**
 * Download image from given URL.
 * @param options Options to download image.
 * @returns Path to the downloaded image.
 */
// eslint-disable-next-line max-statements
const downloadImage = async (options: DownloadImageOptions): Promise<string | null> => {
    if (!isValidURL(options.url)) {
        // eslint-disable-next-line no-console
        console.error("[rehype-og-card] Invalid thumbnail URL:", options.url);
        return null;
    }

    try {
        const hash = createHash("sha256").update(options.url).digest("hex");
        const filename = hash + path.extname(new URL(options.url).pathname);
        const savePath = path.posix.join(options.directly, filename);
        const buildCachePath = path.posix.join(options.buildCacheDirectory, filename);

        // If the file already exists, return the filename.
        const fileExists = await checkFileExists(savePath);
        if (fileExists) {
            return filename;
        }

        const buildCacheExists = await checkFileExists(buildCachePath);
        if (options.useBuildCache && buildCacheExists) {
            await fs.mkdir(options.directly, { recursive: true });
            await fs.copyFile(buildCachePath, savePath);
            return filename;
        }

        const response = await fetch(options.url, {
            headers: {
                "user-agent": options.userAgent
            }
        });

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await fs.mkdir(options.directly, { recursive: true });
        await fs.writeFile(savePath, buffer);

        if (options.useBuildCache) {
            await fs.mkdir(options.buildCacheDirectory, { recursive: true });
            await fs.writeFile(buildCachePath, buffer);
        }

        return filename;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("[rehype-og-card] Error downloading image:", error);
        return null;
    }
};

export { AnchorElement, isTextNode, isAnchorElement, isValidURL, convertTextToAnchorElement, downloadImage };
