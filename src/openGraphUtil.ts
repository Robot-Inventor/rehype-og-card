import type { Element } from "hast";
import { RehypeOGCardOptions } from "./types.js";
import { h } from "hastscript";
import scraper from "open-graph-scraper";

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

export { OGCardData, createOGCard, getOGData };
