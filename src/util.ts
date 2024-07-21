import type { Element, ElementContent, Text } from "hast";
import { createHash } from "crypto";
import fs from "fs/promises";
import { h } from "hastscript";
import { isElement } from "hast-util-is-element";
import path from "path";
import scraper from "open-graph-scraper";

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
    /* eslint-disable max-len */
    /**
     * User agent to use for fetching the OG metadata and images.
     * @default "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
     */
    crawlerUserAgent?: string;
    /* eslint-enable max-len */
}

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

interface OGCardData {
    url: string;
    title: string;
    description?: string;
    displayURL: string;
    faviconURL?: string;
    OGImageURL?: string;
    OGImageAlt?: string;
    OGImageWidth?: number;
    OGImageHeight?: number;
}

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

/**
 * Create OG card element from given data.
 * @param data Data to create OG card.
 * @param options Options to create OG card.
 * @returns OG card element.
 */
const createOGCard = (
    data: OGCardData,
    options: Required<{ loading: RehypeOGCardOptions["loading"]; decoding: RehypeOGCardOptions["decoding"] }>
): Element => {
    const card = h("div.og-card-container", [
        h("a", { href: data.url }, [
            h("div.og-card-info", [
                h("div.og-card-title", data.title),
                data.description ? h("div.og-card-description", data.description) : null,
                h("div.og-card-url-container", [
                    h("img.og-card-favicon", {
                        alt: "favicon",
                        decoding: options.decoding,
                        height: 16,
                        loading: options.loading,
                        src: data.faviconURL,
                        width: 16
                    }),
                    h("span.og-card-url", data.displayURL)
                ])
            ]),
            data.OGImageURL
                ? h("div.og-card-image-container", [
                      h("img.og-card-image", {
                          alt: data.OGImageAlt || data.OGImageURL,
                          decoding: options.decoding,
                          height: data.OGImageHeight,
                          loading: options.loading,
                          src: data.OGImageURL,
                          width: data.OGImageWidth
                      })
                  ])
                : null
        ])
    ]);

    return card;
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
 * Download image from given URL.
 * @param url URL to download image.
 * @param directly Path to save the image.
 * @param userAgent User agent to use for fetching.
 * @returns Path to the downloaded image.
 */
// eslint-disable-next-line max-statements
const downloadImage = async (url: string, directly: string, userAgent: string): Promise<string | null> => {
    if (!isValidURL(url)) {
        // eslint-disable-next-line no-console
        console.error("[rehype-og-card] Invalid thumbnail URL:", url);
        return null;
    }

    try {
        const response = await fetch(url, {
            headers: {
                "user-agent": userAgent
            }
        });

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const hash = createHash("sha256").update(url).digest("hex");
        const filename = hash + path.extname(new URL(url).pathname);
        const savePath = path.posix.join(directly, filename);

        await fs.mkdir(directly, { recursive: true });
        await fs.writeFile(savePath, buffer);

        return filename;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("[rehype-og-card] Error downloading image:", error);
        return null;
    }
};

export {
    AnchorElement,
    RehypeOGCardOptions,
    OGCardData,
    isTextNode,
    isAnchorElement,
    isValidURL,
    getOGData,
    createOGCard,
    convertTextToAnchorElement,
    downloadImage
};
