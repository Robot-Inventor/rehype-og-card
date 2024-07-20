import { toHtml } from "hast-util-to-html";
import { createOGCard, isValidURL, OGCardData } from "./util";
import { expect, it } from "vitest";

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
        loading: "lazy"
    } as const satisfies Parameters<typeof createOGCard>[1];

    const expected = `
<a class="rlc-container" href="https://example.com">
    <div class="rlc-info">
        <div class="rlc-title">Hello, &#x3C;script>alert('world');&#x3C;/script></div>
        <div class="rlc-description">&#x3C;b>World&#x3C;/b></div>
        <div class="rlc-url-container">
            <img class="rlc-favicon" loading="lazy" decoding="async" src="https://example.com/favicon.ico" alt="favicon" width="16" height="16">
            <span class="rlc-url">example.com</span>
        </div>
    </div>
    <div class="rlc-image-container">
        <img class="rlc-image" loading="lazy" decoding="async" src="https://example.com/image.jpg" alt="https://example.com/image.jpg">
    </div>
</a>
    `.trim();

    const result = toHtml(createOGCard(OGData, options));
    expect(result.trim()).toBe(expected);
});
