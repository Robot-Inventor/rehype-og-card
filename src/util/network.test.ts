import { expect, it, vi } from "vitest";

it("should validate URL", async () => {
    vi.resetModules();
    const { isValidURL } = await import("./network.js");

    expect(isValidURL("https://example.com")).toBe(true);
    expect(isValidURL("http://example.com")).toBe(true);
    expect(isValidURL("HtTpS://example.com/path")).toBe(true);
});

it("should invalidate invalid URL", async () => {
    vi.resetModules();
    const { isValidURL } = await import("./network.js");

    expect(isValidURL("example.com")).toBe(false);
    expect(isValidURL("ftp://example.com")).toBe(false);
    expect(isValidURL("mailto:info@example.com")).toBe(false);
    expect(isValidURL("data:text/plain,Hello%2C%20World!")).toBe(false);
});

it("resolves root-relative og:image URLs against the page origin", async () => {
    vi.resetModules();
    const mockScraper = vi.fn().mockResolvedValue({
        result: {
            favicon: undefined,
            ogDescription: "Description",
            ogImage: [
                {
                    alt: "Alt text",
                    height: 630,
                    url: "/assets/og-image.png",
                    width: 1200
                }
            ],
            ogTitle: "Example title"
        }
    });

    vi.doMock("open-graph-scraper", () => ({
        __esModule: true,
        default: mockScraper
    }));

    const { getOGData } = await import("./network.js");
    const data = await getOGData("https://example.invalid/blog/post", "CustomAgent/1.0");

    expect(data?.OGImageURL).toBe("https://example.invalid/assets/og-image.png");
    expect(data?.OGImageAlt).toBe("Alt text");
    expect(mockScraper).toHaveBeenCalledWith({
        fetchOptions: {
            headers: {
                "user-agent": "CustomAgent/1.0"
            }
        },
        url: "https://example.invalid/blog/post"
    });

    vi.doUnmock("open-graph-scraper");
    vi.resetModules();
    vi.clearAllMocks();
});
