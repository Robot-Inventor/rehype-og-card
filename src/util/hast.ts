import type { Element, ElementContent, Text } from "hast";
import type { OGCardData, RehypeOGCardOptions } from "../types.js";
import { h } from "hastscript";
import { isElement } from "hast-util-is-element";

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
    Boolean(node) && isElement(node, "a") && "href" in node.properties && typeof node.properties["href"] === "string";

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
 * Create OG card element from given data.
 * @param data Data to create OG card.
 * @param options Options to create OG card.
 * @returns OG card element.
 */
const createOGCard = (
    data: OGCardData,
    options: Required<{
        loading: RehypeOGCardOptions["loading"];
        decoding: RehypeOGCardOptions["decoding"];
        openInNewTab: RehypeOGCardOptions["openInNewTab"];
    }>
): Element => {
    const openInNewTab = {
        rel: "noopener noreferrer",
        target: "_blank"
    };

    const card = h("div.og-card-container", [
        h("a", { href: data.url, ...(options.openInNewTab ? openInNewTab : {}) }, [
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
                          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
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

export { type AnchorElement, isTextNode, isAnchorElement, convertTextToAnchorElement, createOGCard };
