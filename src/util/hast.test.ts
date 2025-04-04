import { toHtml } from "hast-util-to-html";
import { createOGCard } from "./hast.js";
import { expect, it } from "vitest";
import { OGCardData } from "../types";

it("should sanitize HTML in OG card", async () => {
    const OGData = {
        title: "Hello, <script>alert('world');</script>",
        description: "<b>World</b>",
        url: "https://example.com",
        displayURL: "example.com",
        faviconURL: "https://example.com/favicon.ico",
        OGImageURL: "https://example.com/image.jpg"
    } as const satisfies OGCardData;

    const options = {
        decoding: "async",
        loading: "lazy",
        openInNewTab: false
    } as const satisfies Parameters<typeof createOGCard>[1];

    const expected = `
<div class="og-card-container"><a href="https://example.com"><div class="og-card-info"><div class="og-card-title">Hello, &#x3C;script>alert('world');&#x3C;/script></div><div class="og-card-description">&#x3C;b>World&#x3C;/b></div><div class="og-card-url-container"><img class="og-card-favicon" alt="favicon" decoding="async" height="16" loading="lazy" src="https://example.com/favicon.ico" width="16"><span class="og-card-url">example.com</span></div></div><div class="og-card-image-container"><img class="og-card-image" alt="https://example.com/image.jpg" decoding="async" loading="lazy" src="https://example.com/image.jpg"></div></a></div>
    `.trim();

    const result = toHtml(createOGCard(OGData, options));
    expect(result.trim()).toBe(expected);
});

it("should respect `openInNewTab` option", async () => {
    const OGData = {
        title: "Hello, <script>alert('world');</script>",
        description: "<b>World</b>",
        url: "https://example.com",
        displayURL: "example.com",
        faviconURL: "https://example.com/favicon.ico",
        OGImageURL: "https://example.com/image.jpg"
    } as const satisfies OGCardData;

    const options = {
        decoding: "async",
        loading: "lazy",
        openInNewTab: true
    } as const satisfies Parameters<typeof createOGCard>[1];

    const expected = `
<div class="og-card-container"><a href="https://example.com" rel="noopener noreferrer" target="_blank"><div class="og-card-info"><div class="og-card-title">Hello, &#x3C;script>alert('world');&#x3C;/script></div><div class="og-card-description">&#x3C;b>World&#x3C;/b></div><div class="og-card-url-container"><img class="og-card-favicon" alt="favicon" decoding="async" height="16" loading="lazy" src="https://example.com/favicon.ico" width="16"><span class="og-card-url">example.com</span></div></div><div class="og-card-image-container"><img class="og-card-image" alt="https://example.com/image.jpg" decoding="async" loading="lazy" src="https://example.com/image.jpg"></div></a></div>
    `.trim();

    const result = toHtml(createOGCard(OGData, options));
    expect(result.trim()).toBe(expected);
});
