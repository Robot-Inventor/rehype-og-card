import { startTestServer, stopTestServer } from "./server.js";
export default async function setup() {
    await startTestServer();
    return async () => {
        await stopTestServer();
    };
}
