import {
    type AnchorElement,
    convertTextToAnchorElement,
    createOGCard,
    isAnchorElement,
    isTextNode
} from "./util/hast.js";
import type { Plugin, Transformer } from "unified";
import { checkFileExistsSync, createDirectorySync } from "./util/file.js";
import { downloadImage, getOGData, isValidURL } from "./util/network.js";
import { restoreBuildCache, restoreOGDataBuildCache, saveBuildCacheFile, saveOGDataBuildCache } from "./util/cache.js";
import type { RehypeOGCardOptions } from "./types.js";
import type { Root } from "hast";
import { isElement } from "hast-util-is-element";
import path from "path";
import { visitParents } from "unist-util-visit-parents";

// eslint-disable-next-line no-magic-numbers
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
// eslint-disable-next-line no-magic-numbers
const DEFAULT_CACHE_MAX_AGE_MS = 30 * ONE_DAY_MS;

const DEFAULT_OPTIONS: Required<RehypeOGCardOptions> = {
    buildCache: false,
    buildCacheMaxAge: DEFAULT_CACHE_MAX_AGE_MS,
    buildCachePath: "./node_modules/.cache",
    crawlerUserAgent:
        "Mozilla/5.0 (compatible; rehype-og-card/2.0; +https://github.com/Robot-Inventor/rehype-og-card/; purpose=link-preview; twitterbot-compatible)",
    decoding: "async",
    enableSameTextURLConversion: false,
    excludeDomains: [] as const,
    loading: "lazy",
    openInNewTab: false,
    serverCache: true,
    serverCacheMaxAge: DEFAULT_CACHE_MAX_AGE_MS,
    serverCachePath: "./public",
    shortenURL: true
} as const;

/**
 * Rehype plugin to create OG card from bare links.
 * @param options Plugin options.
 * @returns Transformer function.
 */
// eslint-disable-next-line max-lines-per-function, max-statements
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

    const buildCacheExists = checkFileExistsSync(mergedOptions.buildCachePath);
    if (mergedOptions.buildCache) {
        if (buildCacheExists) {
            restoreBuildCache(
                mergedOptions.buildCachePath,
                mergedOptions.serverCachePath,
                mergedOptions.buildCacheMaxAge
            );
        } else {
            createDirectorySync(mergedOptions.buildCachePath);
        }
    }

    /**
     * Transform function to create OG card from bare links.
     * @param tree Root node of the HAST tree.
     */
    // eslint-disable-next-line max-lines-per-function
    const transform: Transformer<Root> = async (tree) => {
        const linkCardPromises: Array<Promise<void>> = [];

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
                    node.children[0] &&
                    isTextNode(node.children[0]) &&
                    node.children[0].value.trim() === node.properties.href;

                if (!isSameTextURL) return;

                anchorNode = node;
            } else {
                return;
            }

            // eslint-disable-next-line no-magic-numbers
            const parent = ancestors[ancestors.length - 1];
            if (!parent) return;

            if (!isElement(parent, "p")) return;

            const shouldSkip = ancestors.some(
                (ancestor) => isElement(ancestor) && ["ul", "ol"].includes(ancestor.tagName)
            );
            if (shouldSkip) return;

            // eslint-disable-next-line no-magic-numbers
            const isTheOnlyChild = parent.children.length === 1;
            if (!isTheOnlyChild) return;

            const targetURL = new URL(anchorNode.properties.href);
            if (mergedOptions.excludeDomains.includes(targetURL.hostname)) return;

            // eslint-disable-next-line jsdoc/require-jsdoc, max-statements, max-lines-per-function
            const linkCardPromise = async (): Promise<void> => {
                let OGData = mergedOptions.buildCache
                    ? await restoreOGDataBuildCache(
                          anchorNode.properties.href,
                          mergedOptions.buildCachePath,
                          mergedOptions.buildCacheMaxAge
                      )
                    : null;

                if (!OGData) {
                    OGData = await getOGData(anchorNode.properties.href, mergedOptions.crawlerUserAgent);
                    if (!OGData) return;
                    if (mergedOptions.buildCache) {
                        void saveOGDataBuildCache(anchorNode.properties.href, OGData, mergedOptions.buildCachePath);
                    }
                }

                if (OGData.OGImageURL && mergedOptions.serverCache) {
                    const filename = await downloadImage({
                        cacheMaxAge: mergedOptions.serverCacheMaxAge,
                        directory: mergedOptions.serverCachePath,
                        url: OGData.OGImageURL,
                        userAgent: mergedOptions.crawlerUserAgent
                    });

                    if (filename) {
                        OGData.OGImageURL = path.posix.join("/rehype-og-card", filename);
                    }

                    if (filename && mergedOptions.buildCache) {
                        const downloadedFilePath = path.join(mergedOptions.serverCachePath, filename);
                        const buildCachePath = path.join(mergedOptions.buildCachePath, filename);
                        void saveBuildCacheFile(downloadedFilePath, buildCachePath);
                    }
                }

                if (OGData.faviconURL && mergedOptions.serverCache) {
                    const filename = await downloadImage({
                        cacheMaxAge: mergedOptions.serverCacheMaxAge,
                        directory: mergedOptions.serverCachePath,
                        url: OGData.faviconURL,
                        userAgent: mergedOptions.crawlerUserAgent
                    });

                    if (filename) {
                        OGData.faviconURL = path.posix.join("/rehype-og-card", filename);
                    }

                    if (filename && mergedOptions.buildCache) {
                        const downloadedFilePath = path.join(mergedOptions.serverCachePath, filename);
                        const buildCachePath = path.join(mergedOptions.buildCachePath, filename);
                        void saveBuildCacheFile(downloadedFilePath, buildCachePath);
                    }
                }

                if (mergedOptions.shortenURL) {
                    const shortenedURL = new URL(anchorNode.properties.href);
                    OGData.displayURL = shortenedURL.hostname;
                }

                const OGCard = createOGCard(OGData, mergedOptions);

                const index = parent.children.indexOf(node);
                // eslint-disable-next-line no-magic-numbers
                if (index === -1) return;
                // eslint-disable-next-line no-magic-numbers
                parent.children.splice(index, 1, OGCard);
            };
            linkCardPromises.push(linkCardPromise());
        });

        await Promise.all(linkCardPromises);
    };

    return transform;
};

export default rehypeOGCard;
export type { RehypeOGCardOptions };
