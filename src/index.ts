import { AnchorElement, convertTextToAnchorElement, createOGCard, isAnchorElement, isTextNode } from "./util/hast.js";
import type { Plugin, Transformer } from "unified";
import { downloadImage, getOGData, isValidURL } from "./util/network.js";
import { restoreBuildCache, saveBuildCache } from "./util/cache.js";
import { RehypeOGCardOptions } from "./types.js";
import type { Root } from "hast";
import { isElement } from "hast-util-is-element";
import path from "path";
import { visitParents } from "unist-util-visit-parents";

const DEFAULT_OPTIONS: Required<RehypeOGCardOptions> = {
    buildCache: false,
    buildCachePath: "./node_modules/.cache",
    crawlerUserAgent:
        // eslint-disable-next-line max-len
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    decoding: "async",
    enableSameTextURLConversion: false,
    excludeDomains: [] as const,
    loading: "lazy",
    serverCache: true,
    serverCachePath: "./public",
    shortenURL: true
} as const;

/**
 * Rehype plugin to create OG card from bare links.
 * @param options Plugin options.
 * @returns Transformer function.
 */
// eslint-disable-next-line max-lines-per-function
const rehypeOGCard: Plugin<[RehypeOGCardOptions | undefined], Root> = (
    options?: RehypeOGCardOptions
): Transformer<Root> => {
    const mergedOptions = {
        ...DEFAULT_OPTIONS,
        ...options
    };

    if (mergedOptions.buildCache && !mergedOptions.serverCache) {
        throw new Error("[rehype-og-card] `buildCache` option requires `serverCache` option to be enabled.");
    }

    mergedOptions.serverCachePath = path.posix.join(mergedOptions.serverCachePath, "./rehype-og-card/");
    mergedOptions.buildCachePath = path.posix.join(mergedOptions.buildCachePath, "./rehype-og-card/");

    /**
     * Transform function to create OG card from bare links.
     * @param tree Root node of the HAST tree.
     */
    // eslint-disable-next-line max-lines-per-function
    const transform: Transformer<Root> = async (tree) => {
        if (mergedOptions.buildCache) {
            await restoreBuildCache(mergedOptions.buildCachePath, mergedOptions.serverCachePath);
        }

        const linkCardPromises: Promise<void>[] = [];

        // eslint-disable-next-line max-statements, max-lines-per-function
        visitParents<Root, string[]>(tree, ["element", "text"], (node, ancestors): void => {
            let anchorNode: AnchorElement | null = null;

            const isBareLink = node.type === "text" && isValidURL(node.value.trim());
            const isValidAnchor = isAnchorElement(node) && isValidURL(node.properties.href);

            if (isBareLink) {
                anchorNode = convertTextToAnchorElement(node);
            } else if (mergedOptions.enableSameTextURLConversion && isValidAnchor) {
                const isSameTextURL =
                    // eslint-disable-next-line no-magic-numbers
                    node.children.length === 1 &&
                    isTextNode(node.children[0]) &&
                    node.children[0].value === node.properties.href;

                if (!isSameTextURL) return;

                anchorNode = node;
            } else {
                return;
            }
            // eslint-disable-next-line no-magic-numbers
            if (!isElement(ancestors[ancestors.length - 1], "p")) return;

            const shouldSkip = ancestors.some(
                (ancestor) => isElement(ancestor) && ["ul", "ol"].includes(ancestor.tagName)
            );
            if (shouldSkip) return;

            // eslint-disable-next-line no-magic-numbers
            const isTheOnlyChild = ancestors[ancestors.length - 1].children.length === 1;
            if (!isTheOnlyChild) return;

            const targetURL = new URL(anchorNode.properties.href);
            if (mergedOptions.excludeDomains?.includes(targetURL.hostname)) return;

            // eslint-disable-next-line jsdoc/require-jsdoc, max-statements
            const linkCardPromise = async (): Promise<void> => {
                const OGData = await getOGData(anchorNode.properties.href, mergedOptions.crawlerUserAgent);
                if (!OGData) return;

                if (OGData.OGImageURL && mergedOptions.serverCache) {
                    const filename = await downloadImage({
                        directly: mergedOptions.serverCachePath,
                        url: OGData.OGImageURL,
                        userAgent: mergedOptions.crawlerUserAgent
                    });

                    if (filename && mergedOptions.serverCache) {
                        OGData.OGImageURL = path.posix.join("/rehype-og-card", filename);
                    }
                }

                if (OGData.faviconURL && mergedOptions.serverCache) {
                    const filename = await downloadImage({
                        directly: mergedOptions.serverCachePath,
                        url: OGData.faviconURL,
                        userAgent: mergedOptions.crawlerUserAgent
                    });

                    if (filename && mergedOptions.serverCache) {
                        OGData.faviconURL = path.posix.join("/rehype-og-card", filename);
                    }
                }

                if (mergedOptions.shortenURL) {
                    const shortenedURL = new URL(anchorNode.properties.href);
                    OGData.displayURL = shortenedURL.hostname;
                }

                const OGCard = createOGCard(OGData, mergedOptions);

                // eslint-disable-next-line no-magic-numbers
                const index = ancestors[ancestors.length - 1].children.indexOf(node);
                // eslint-disable-next-line no-magic-numbers
                if (index === -1) return;
                // eslint-disable-next-line no-magic-numbers
                ancestors[ancestors.length - 1].children.splice(index, 1, OGCard);
            };
            linkCardPromises.push(linkCardPromise());
        });

        await Promise.all(linkCardPromises);

        if (mergedOptions.buildCache) {
            await saveBuildCache(mergedOptions.serverCachePath, mergedOptions.buildCachePath);
        }
    };

    return transform;
};

export default rehypeOGCard;
export { RehypeOGCardOptions };
