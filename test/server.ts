import { createServer } from "node:http";
import { h } from "hastscript";
import { once } from "node:events";
import { toHtml } from "hast-util-to-html";

const TEST_SERVER_PORT = 3456;
const TEST_ORIGIN = `http://127.0.0.1:${TEST_SERVER_PORT}`;

const createHTML = ({ image = `${TEST_ORIGIN}/test-image.png`, favicon = "/favicon.ico" } = {}) => {
    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta property="og:title" content="Test Page Title">
    <meta property="og:description" content="This is a test page description for OG card testing">
    ${toHtml(h("meta", { property: "og:image", content: image }))}
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Test image alt text">
    ${toHtml(h("link", { rel: "icon", href: favicon }))}
    <title>Test Page Title</title>
</head>
</html>`;
};

const SIMPLE_PNG = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
);

const changingSVGRequests = new Map<string, number>();

const server = createServer((req, res) => {
    const { pathname, searchParams } = new URL(req.url ?? "/", TEST_ORIGIN);

    res.setHeader("Content-Type", "text/html");

    if (pathname.startsWith("/svg-fixture/")) {
        const width = Number(searchParams.get("width") ?? 2400);
        const height = Number(searchParams.get("height") ?? 1256);

        const changingKey = searchParams.get("changing");
        let color = "red";

        if (changingKey) {
            const requests = (changingSVGRequests.get(changingKey) ?? 0) + 1;
            changingSVGRequests.set(changingKey, requests);

            color = requests === 1 ? "blue" : "red";
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

        case "/svg-page": {
            const image =
                Buffer.from(searchParams.get("image") ?? "", "base64url").toString() || "/svg-fixture/image.svg";

            const favicon =
                Buffer.from(searchParams.get("favicon") ?? "", "base64url").toString() ||
                "/svg-fixture/favicon.svg?width=32&height=16";

            res.end(createHTML({ image, favicon }));

            break;
        }

        case "/svg-redirect":
            res.writeHead(302, { Location: "/svg-fixture/redirected.svg?mime=image%2Fpng" });

            res.end();

            break;

        case "/svg-changing-count":
            res.setHeader("Content-Type", "text/plain");

            res.end(String(changingSVGRequests.get(searchParams.get("key") ?? "") ?? 0));

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
            res.writeHead(403, { "Content-Type": "text/plain" });

            res.end("Forbidden");

            break;

        default:
            res.writeHead(404, { "Content-Type": "text/plain" });

            res.end("Not Found");
    }
});

const startTestServer = async (): Promise<void> => {
    server.listen(TEST_SERVER_PORT, "127.0.0.1");
    await once(server, "listening");
};

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
