import { createServer, IncomingMessage, ServerResponse } from "http";

const TEST_SERVER_PORT = 3456;

const TEST_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta property="og:title" content="Test Page Title">
    <meta property="og:description" content="This is a test page description for OG card testing">
    <meta property="og:image" content="http://127.0.0.1:3456/test-image.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Test image alt text">
    <link rel="icon" href="/favicon.ico">
    <title>Test Page Title</title>
</head>
<body>
    <h1>Test Page</h1>
    <p>This is a test page for rehype-og-card testing.</p>
</body>
</html>`;

const NON_IMAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta property="og:title" content="Test Page Title">
    <meta property="og:description" content="This is a test page description for OG card testing">
    <meta property="og:image" content="http://127.0.0.1:3456/not-image">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Not an image">
    <link rel="icon" href="/favicon.ico">
    <title>Test Page Title</title>
</head>
<body>
    <h1>Test Page</h1>
    <p>This is a test page for rehype-og-card testing.</p>
</body>
</html>`;

const NON_FAVICON_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta property="og:title" content="Test Page Title">
    <meta property="og:description" content="This is a test page description for OG card testing">
    <meta property="og:image" content="http://127.0.0.1:3456/test-image.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Test image alt text">
    <link rel="icon" href="/not-image">
    <title>Test Page Title</title>
</head>
<body>
    <h1>Test Page</h1>
    <p>This is a test page for rehype-og-card testing.</p>
</body>
</html>`;

const SIMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link rel="icon" href="/favicon.ico">
    <title>Example Domain</title>
</head>
<body>
    <h1>Example Domain</h1>
    <p>This domain is for use in illustrative examples in documents.</p>
</body>
</html>`;

// Create a simple 1x1 PNG image (base64 encoded)
const SIMPLE_PNG = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
);

let server: ReturnType<typeof createServer> | null = null;

export const startTestServer = (): Promise<void> => {
    return new Promise((resolve) => {
        server = createServer((req: IncomingMessage, res: ServerResponse) => {
            // Handle CORS for testing
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type");

            if (req.method === "OPTIONS") {
                res.writeHead(200);
                res.end();
                return;
            }

            switch (req.url) {
                case "/test-page":
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.end(TEST_HTML);
                    break;

                case "/test-page-non-image":
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.end(NON_IMAGE_HTML);
                    break;
                case "/test-page-non-favicon":
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.end(NON_FAVICON_HTML);
                    break;

                case "/simple-page":
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.end(SIMPLE_HTML);
                    break;

                case "/test-image.png":
                    res.writeHead(200, { "Content-Type": "image/png" });
                    res.end(SIMPLE_PNG);
                    break;

                case "/not-image":
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.end("<!doctype html><p>not an image</p>");
                    break;

                case "/forbidden-image":
                    res.writeHead(403, { "Content-Type": "text/plain" });
                    res.end("Forbidden");
                    break;

                case "/favicon.ico":
                    res.writeHead(200, { "Content-Type": "image/png" });
                    res.end(SIMPLE_PNG);
                    break;

                default:
                    res.writeHead(404, { "Content-Type": "text/plain" });
                    res.end("Not Found");
            }
        });

        server.listen(TEST_SERVER_PORT, "127.0.0.1", () => {
            resolve();
        });
    });
};

export const stopTestServer = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (server) {
            server.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    server = null;
                    resolve();
                }
            });
        } else {
            resolve();
        }
    });
};
