import { type ServerResponse, createServer } from "node:http";
import { h } from "hastscript";
import { once } from "node:events";
import { toHtml } from "hast-util-to-html";

const TEST_SERVER_URL = new URL("http://127.0.0.1:3456");
const TEST_SERVER_PORT = Number(TEST_SERVER_URL.port);
const TEST_ORIGIN = TEST_SERVER_URL.origin;

/** Default dimensions of the SVG fixture. */
const SVG_DEFAULT_WIDTH = "2400";
const SVG_DEFAULT_HEIGHT = "1256";

/**
 * Request count before the changing SVG is served for the first time, and the
 * increment of the count applied on each request.
 */
const REQUEST_COUNT_INITIAL = 0;
const REQUEST_COUNT_INCREMENT = 1;

/** HTTP status codes used by the test server. */
const HTTP_FOUND = 302;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;

/**
 * Create the HTML of a test page embedding the specified OG image and favicon.
 * @param options - URLs of the OG image and favicon embedded in the page.
 * @param options.image - URL of the OG image embedded in the page.
 * @param options.favicon - URL of the favicon embedded in the page.
 * @returns The HTML of the test page.
 */
const createHTML = ({
    image = `${TEST_ORIGIN}/test-image.png`,
    favicon = "/favicon.ico"
} = {}): string => `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta property="og:title" content="Test Page Title">
    <meta property="og:description" content="This is a test page description for OG card testing">
    ${toHtml(h("meta", { content: image, property: "og:image" }))}
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Test image alt text">
    ${toHtml(h("link", { href: favicon, rel: "icon" }))}
    <title>Test Page Title</title>
</head>
</html>`;

const SIMPLE_PNG = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
);

const changingSVGRequests = new Map<string, number>();

/**
 * Serve the SVG fixture to test the SVG handling options. The fixture emulates
 * a malicious SVG, and its fill color changes on the first request when the
 * "changing" query parameter is specified.
 * @param res - The response to write the SVG fixture to.
 * @param searchParams - Query parameters to customize the SVG fixture.
 */
const sendSvgFixture = (res: ServerResponse, searchParams: URLSearchParams): void => {
    const width = searchParams.get("width") ?? SVG_DEFAULT_WIDTH;
    const height = searchParams.get("height") ?? SVG_DEFAULT_HEIGHT;

    const changingKey = searchParams.get("changing");
    let color = "red";

    if (changingKey) {
        const requestCount = changingSVGRequests.get(changingKey) ?? REQUEST_COUNT_INITIAL;

        changingSVGRequests.set(changingKey, requestCount + REQUEST_COUNT_INCREMENT);

        color = requestCount === REQUEST_COUNT_INITIAL ? "blue" : "red";
    }

    const svg = `<svg
            xmlns="http://www.w3.org/2000/svg"
            width="${width}"
            height="${height}"
            onload="alert(document.domain)"
        >
            <script>alert(document.domain)</script>
            <rect width="50%" height="50%" fill="${color}"/>
        </svg>`;

    res.setHeader("Content-Type", searchParams.get("mime") ?? "image/svg+xml");
    res.end(searchParams.has("invalid") ? "not an SVG" : svg);
};

/**
 * Serve a test page whose OG image and favicon URLs are specified as Base64
 * URL-encoded query parameters.
 * @param res - The response to write the test page to.
 * @param searchParams - Query parameters to specify the image and favicon URLs.
 */
const sendSvgPage = (res: ServerResponse, searchParams: URLSearchParams): void => {
    const imageParam = searchParams.get("image");
    const faviconParam = searchParams.get("favicon");

    const image = imageParam === null ? "/svg-fixture/image.svg" : Buffer.from(imageParam, "base64url").toString();

    const favicon =
        faviconParam === null
            ? "/svg-fixture/favicon.svg?width=32&height=16"
            : Buffer.from(faviconParam, "base64url").toString();

    res.end(createHTML({ favicon, image }));
};

const server = createServer((req, res) => {
    const { pathname, searchParams } = new URL(req.url ?? "/", TEST_ORIGIN);

    res.setHeader("Content-Type", "text/html");

    if (pathname.startsWith("/svg-fixture/")) {
        sendSvgFixture(res, searchParams);

        return;
    }

    switch (pathname) {
        case "/test-page":
            res.end(createHTML());

            break;

        case "/test-page-non-image":
            res.end(createHTML({ image: `${TEST_ORIGIN}/not-image` }));

            break;

        case "/test-page-non-favicon":
            res.end(createHTML({ favicon: "/not-image" }));

            break;

        case "/simple-page":
            res.end(`<!doctype html>
<html>
<head>
    <link rel="icon" href="/favicon.ico">
    <title>Example Domain</title>
</head>
</html>`);

            break;

        case "/svg-page":
            sendSvgPage(res, searchParams);

            break;

        case "/svg-redirect":
            res.writeHead(HTTP_FOUND, { Location: "/svg-fixture/redirected.svg?mime=image%2Fpng" });

            res.end();

            break;

        case "/svg-changing-count":
            res.setHeader("Content-Type", "text/plain");

            res.end(String(changingSVGRequests.get(searchParams.get("key") ?? "") ?? REQUEST_COUNT_INITIAL));

            break;

        case "/test-image.png":
        case "/favicon.ico":
            res.setHeader("Content-Type", "image/png");

            res.end(SIMPLE_PNG);

            break;

        case "/not-image":
            res.end("<!doctype html><p>not an image</p>");

            break;

        case "/forbidden-image":
            res.writeHead(HTTP_FORBIDDEN, { "Content-Type": "text/plain" });

            res.end("Forbidden");

            break;

        default:
            res.writeHead(HTTP_NOT_FOUND, { "Content-Type": "text/plain" });

            res.end("Not Found");
    }
});

/** Start the test HTTP server and wait until it starts listening. */
const startTestServer = async (): Promise<void> => {
    server.listen(TEST_SERVER_PORT, TEST_SERVER_URL.hostname);
    await once(server, "listening");
};

/** Stop the test HTTP server and wait until it is closed. */
const stopTestServer = (): Promise<void> =>
    new Promise((resolve, reject) => {
        server.close((error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });

export { startTestServer, stopTestServer };
