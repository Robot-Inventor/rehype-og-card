import { afterEach, expect, it, vi } from "vitest";
import rehypeOGCard, { type RehypeOGCardOptions } from "./index.js";
import sharp from "sharp";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import type { Element } from "hast";
import { basename, join, resolve } from "node:path";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visitParents } from "unist-util-visit-parents";

const ORIGIN = "http://127.0.0.1:3456";
const IMAGE_HASH = createHash("sha256").update(`${ORIGIN}/svg-fixture/image.svg`).digest("hex");
const temporaryDirectories: string[] = [];

const createCache = async () => {
    const cacheRoot = resolve(".cache");
    await mkdir(cacheRoot, { recursive: true });
    const directory = await mkdtemp(join(cacheRoot, "svg-"));
    temporaryDirectories.push(directory);
    return directory;
};

afterEach(async () => {
    vi.useRealTimers();

    for (const directory of temporaryDirectories.splice(0)) {
        await rm(directory, { recursive: true, force: true });
    }
});

const createPageURL = (image = "/svg-fixture/image.svg", favicon?: string) => {
    const url = new URL("/svg-page", ORIGIN);
    url.searchParams.set("image", Buffer.from(image).toString("base64url"));

    if (favicon) {
        url.searchParams.set("favicon", Buffer.from(favicon).toString("base64url"));
    }

    return url.href;
};

const processPage = async (directory: string, options: RehypeOGCardOptions = {}, url = createPageURL()) => {
    const processor = unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypeOGCard, {
            serverCachePath: join(directory, "server"),
            buildCachePath: join(directory, "build"),
            ...options
        });

    const tree = await processor.run(processor.parse(url));
    const elements: Element[] = [];
    visitParents(tree, "element", (element) => {
        elements.push(element);
    });

    const findByClass = (className: string) =>
        elements.find((element) => {
            const classes = element.properties.className;
            return Array.isArray(classes) && classes.includes(className);
        });

    return {
        images: elements
            .filter((element) => element.tagName === "img")
            .map((element) => String(element.properties.src)),
        imageSrc: findByClass("og-card-image")?.properties.src?.toString(),
        faviconSrc: findByClass("og-card-favicon")?.properties.src?.toString(),
        title: findByClass("og-card-title")
            ?.children.filter((node) => node.type === "text")
            .map((node) => node.value)
            .join("")
    };
};

const readImage = async (directory: string, src: string) =>
    readFile(join(directory, "server", "rehype-og-card", basename(src)));

const readPNG = async (buffer: Buffer) => {
    const metadata = await sharp(buffer).metadata();
    expect(metadata.format).toBe("png");
    return metadata;
};

it("caches both SVG images as PNG by default using the legacy filename", async () => {
    const directory = await createCache();
    const card = await processPage(directory);
    const imageSrc = card.imageSrc!;
    const faviconSrc = card.faviconSrc!;

    expect(imageSrc).toBe(`/rehype-og-card/${IMAGE_HASH}.png`);
    expect(faviconSrc).toMatch(/\.png$/u);

    const image = await readPNG(await readImage(directory, imageSrc));
    expect([image.width, image.height]).toEqual([1200, 628]);

    const favicon = await readPNG(await readImage(directory, faviconSrc));
    expect([favicon.width, favicon.height]).toEqual([32, 16]);

    const entries = await readdir(join(directory, "server", "rehype-og-card"));
    expect(entries.filter((entry) => entry !== "cache.json").every((entry) => entry.endsWith(".png"))).toBe(true);
});

it("omits SVG OG images and favicons while keeping the card text", async () => {
    const directory = await createCache();
    const card = await processPage(directory, { svgHandling: "omit" });

    expect(card.images).toHaveLength(0);
    expect(card.title).toBe("Test Page Title");
});

it("preserves both original SVG files and the legacy filename when requested", async () => {
    const directory = await createCache();
    const card = await processPage(directory, { svgHandling: "preserve" });
    expect(card.imageSrc).toBe(`/rehype-og-card/${IMAGE_HASH}.svg`);

    for (const [src, originalURL] of [
        [card.imageSrc, "/svg-fixture/image.svg"],
        [card.faviconSrc, "/svg-fixture/favicon.svg?width=32&height=16"]
    ] as const) {
        const original = Buffer.from(await (await fetch(new URL(originalURL, ORIGIN))).arrayBuffer());
        expect(await readImage(directory, src!)).toEqual(original);
    }
});

it.each([
    ["case-insensitive MIME with parameters", "/svg-fixture/image.png?mime=IMAGE%2FSVG%2BXML%3Bcharset%3Dutf-8"],
    ["SVG extension with PNG MIME", "/svg-fixture/IMAGE.SVG?mime=image%2Fpng"],
    ["SVG extension with non-image MIME", "/svg-fixture/image.svg?mime=text%2Fplain"],
    ["redirect to an SVG extension", "/svg-redirect"]
])("rasterizes SVG identified by %s", async (_, imageURL) => {
    const directory = await createCache();
    const url = createPageURL(imageURL);
    const rasterized = await processPage(directory, { svgHandling: "rasterize" }, url);
    const buffer = await readImage(directory, rasterized.imageSrc!);

    await readPNG(buffer);
});

it.each([
    [2400, 600, 1200, 300],
    [512, 2048, 157, 628]
])("fits a %s × %s SVG within the bounds without cropping", async (width, height, outputWidth, outputHeight) => {
    const directory = await createCache();
    const card = await processPage(
        directory,
        {},
        createPageURL(`/svg-fixture/image.svg?width=${width}&height=${height}`)
    );
    const image = await readPNG(await readImage(directory, card.imageSrc!));

    expect([image.width, image.height]).toEqual([outputWidth, outputHeight]);
});

it("omits a failed SVG conversion without falling back to the SVG or losing the other image", async () => {
    const directory = await createCache();
    const card = await processPage(directory, {}, createPageURL("/svg-fixture/invalid.svg?invalid=1"));
    expect(card.imageSrc).toBeUndefined();

    await readPNG(await readImage(directory, card.faviconSrc!));
    expect(card.title).toBe("Test Page Title");
});

it.each(["omit", "rasterize"] as const)(
    "leaves remote SVG URLs unchanged without server caching (%s)",
    async (svgHandling) => {
        const directory = await createCache();
        const card = await processPage(directory, { serverCache: false, svgHandling });

        expect(card.imageSrc).toBe(`${ORIGIN}/svg-fixture/image.svg`);
        expect(card.faviconSrc).toBe(`${ORIGIN}/svg-fixture/favicon.svg?width=32&height=16`);
    }
);

it("refreshes expired SVG caches and restores the updated image without another download", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });

    const directory = await createCache();
    const options = {
        buildCache: true,
        buildCacheMaxAge: false,
        serverCacheMaxAge: 60_000
    } as const;

    const changingKey = basename(directory);
    const pageURL = createPageURL(
        `/svg-fixture/changing.svg?width=32&height=16&changing=${changingKey}`,
        "/test-image.png"
    );
    const initial = await processPage(directory, options, pageURL);
    const src = initial.imageSrc!;
    const initialBytes = await readImage(directory, src);

    vi.setSystemTime(Date.now() + options.serverCacheMaxAge + 1);

    const refreshed = await processPage(directory, options, pageURL);
    const refreshedSrc = refreshed.imageSrc!;
    const refreshedBytes = await readImage(directory, refreshedSrc);
    expect(refreshedBytes).not.toEqual(initialBytes);

    const countURL = `${ORIGIN}/svg-changing-count?key=${changingKey}`;
    expect(await (await fetch(countURL)).text()).toBe("2");

    await rm(join(directory, "server"), { recursive: true });
    const restored = await processPage(directory, options, pageURL);

    expect(await readImage(directory, restored.imageSrc!)).toEqual(refreshedBytes);
    expect(await (await fetch(countURL)).text()).toBe("2");
});
