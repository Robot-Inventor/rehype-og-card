import type { OpenGraphScraperOptions } from "open-graph-scraper/types";
import { vi } from "vitest";

// open-graph-scraper 6.13.0 blocks requests to loopback addresses to prevent SSRF,
// but the integration tests scrape a fixture server on 127.0.0.1.
// Fetch the HTML without that guard and let the real scraper parse it.
vi.mock("open-graph-scraper", async (importOriginal) => {
    // Vitest exposes the CommonJS `export =` function as the `default` export.
    const ogScraper = await importOriginal<{
        default: (options: OpenGraphScraperOptions) => Promise<unknown>;
    }>();

    /**
     * Fetch a local page and scrape its Open Graph metadata.
     * @param options Options containing the page URL.
     * @param options.url URL of the page to scrape.
     * @returns Scraped Open Graph data.
     */
    const mockScraper = async (options: { url: string }): Promise<unknown> => {
        const response = await fetch(options.url);

        if (!response.ok) throw new Error(`Failed to fetch ${options.url}: ${response.status.toString()}`);

        return ogScraper.default({ html: await response.text() });
    };

    return {
        default: mockScraper
    };
});
