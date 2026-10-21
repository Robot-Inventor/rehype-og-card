import {
    type AnchorElement,
    convertTextToAnchorElement,
    createOGCard,
    isAnchorElement,
    isTextNode
} from "./util/hast.js";
import type { Plugin, Transformer } from "unified";
import { downloadImage, getOGData, isValidURL } from "./util/network.js";
import { join, posix } from "node:path";
import { restoreBuildCache, restoreOGDataBuildCache, saveBuildCacheFile, saveOGDataBuildCache } from "./util/cache.js";
import type { RehypeOGCardOptions } from "./types.js";
import type { Root } from "hast";
import { createDirectorySync } from "./util/file.js";
import { existsSync } from "node:fs";
import { isElement } from "hast-util-is-element";
// oxlint-disable-next-line import/max-dependencies
import { visitParents } from "unist-util-visit-parents";

// oxlint-disable-next-line no-magic-numbers
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
// oxlint-disable-next-line no-magic-numbers
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
    removeParentPTag: true,
    serverCache: true,
    serverCacheMaxAge: DEFAULT_CACHE_MAX_AGE_MS,
    serverCachePath: "./public",
    shortenURL: true,
    svgHandling: "rasterize"
} as const;

/**
 * Rehype plugin to create OG card from bare links.
 * @param options Plugin options.
 * @returns Transformer function.
 */
// oxlint-disable-next-line max-lines-per-function
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

    mergedOptions.serverCachePath = posix.join(mergedOptions.serverCachePath, "./rehype-og-card/");
    mergedOptions.buildCachePath = posix.join(mergedOptions.buildCachePath, "./rehype-og-card/");

    const buildCacheExists = existsSync(mergedOptions.buildCachePath);
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
    // oxlint-disable-next-line max-lines-per-function
    const transform: Transformer<Root> = async (tree) => {
        const linkCardPromises: Array<Promise<void>> = [];

        // oxlint-disable-next-line max-lines-per-function
        visitParents(tree, ["element", "text"], (node, ancestors): void => {
            let anchorNode: AnchorElement | null = null;

            const isBareLink = node.type === "text" && isValidURL(node.value.trim());
            const isValidAnchor = isAnchorElement(node) && isValidURL(node.properties.href);

            if (isBareLink) {
                anchorNode = convertTextToAnchorElement(node);
            } else if (mergedOptions.enableSameTextURLConversion && isValidAnchor) {
                const isSameTextURL =
                    // oxlint-disable-next-line no-magic-numbers
                    node.children.length === 1 &&
                    node.children[0] &&
                    isTextNode(node.children[0]) &&
                    node.children[0].value.trim() === node.properties.href;

                if (!isSameTextURL) return;

                anchorNode = node;
            } else {
                return;
            }

            // oxlint-disable-next-line no-magic-numbers
            const parent = ancestors[ancestors.length - 1];
            if (!parent) return;

            if (!isElement(parent, "p")) return;

            const shouldSkip = ancestors.some(
                (ancestor) => isElement(ancestor) && ["ul", "ol"].includes(ancestor.tagName)
            );
            if (shouldSkip) return;

            // oxlint-disable-next-line no-magic-numbers
            const isTheOnlyChild = parent.children.length === 1;
            if (!isTheOnlyChild) return;

            const targetURL = new URL(anchorNode.properties.href);
            if (mergedOptions.excludeDomains.includes(targetURL.hostname)) return;

            // oxlint-disable-next-line max-statements jsdoc-js/require-jsdoc
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
                        await saveOGDataBuildCache(anchorNode.properties.href, OGData, mergedOptions.buildCachePath);
                    }
                }

                if (OGData.OGImageURL && mergedOptions.serverCache) {
                    const filename = await downloadImage({
                        cacheMaxAge: mergedOptions.serverCacheMaxAge,
                        directory: mergedOptions.serverCachePath,
                        svgHandling: mergedOptions.svgHandling,
                        url: OGData.OGImageURL,
                        userAgent: mergedOptions.crawlerUserAgent
                    });

                    if (filename) {
                        OGData.OGImageURL = posix.join("/rehype-og-card", filename);

                        if (mergedOptions.buildCache) {
                            const downloadedFilePath = join(mergedOptions.serverCachePath, filename);
                            const buildCachePath = join(mergedOptions.buildCachePath, filename);
                            await saveBuildCacheFile(downloadedFilePath, buildCachePath);
                        }
                    } else {
                        delete OGData.OGImageURL;
                    }
                }

                if (OGData.faviconURL && mergedOptions.serverCache) {
                    const filename = await downloadImage({
                        cacheMaxAge: mergedOptions.serverCacheMaxAge,
                        directory: mergedOptions.serverCachePath,
                        svgHandling: mergedOptions.svgHandling,
                        url: OGData.faviconURL,
                        userAgent: mergedOptions.crawlerUserAgent
                    });

                    if (filename) {
                        OGData.faviconURL = posix.join("/rehype-og-card", filename);
                        if (mergedOptions.buildCache) {
                            const downloadedFilePath = join(mergedOptions.serverCachePath, filename);
                            const buildCachePath = join(mergedOptions.buildCachePath, filename);
                            await saveBuildCacheFile(downloadedFilePath, buildCachePath);
                        }
                    } else {
                        delete OGData.faviconURL;
                    }
                }

                if (mergedOptions.shortenURL) {
                    const shortenedURL = new URL(anchorNode.properties.href);
                    OGData.displayURL = shortenedURL.hostname;
                }

                const OGCard = createOGCard(OGData, mergedOptions);

                const { removeParentPTag: shouldRemoveParentPTag } = mergedOptions;
                // oxlint-disable-next-line no-magic-numbers
                const replacementContainer = shouldRemoveParentPTag ? ancestors[ancestors.length - 2] : parent;
                const replacementTarget = shouldRemoveParentPTag ? parent : node;

                if (!replacementContainer || !("children" in replacementContainer)) return;

                const index = replacementContainer.children.indexOf(replacementTarget);
                // oxlint-disable-next-line no-magic-numbers
                if (index === -1) return;
                // oxlint-disable-next-line no-magic-numbers
                replacementContainer.children.splice(index, 1, OGCard);
            };
            linkCardPromises.push(linkCardPromise());
        });

        await Promise.all(linkCardPromises);
    };

    return transform;
};

export default rehypeOGCard;
export type { RehypeOGCardOptions };
