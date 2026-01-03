import { startTestServer, stopTestServer } from "./server.js";
export default async function setup() {
    console.log("[Global Setup] Starting test server...");
    await startTestServer();
    console.log("[Global Setup] Test server started on port 3456");
    return async () => {
        console.log("[Global Teardown] Stopping test server...");
        await stopTestServer();
        console.log("[Global Teardown] Test server stopped");
    };
}
