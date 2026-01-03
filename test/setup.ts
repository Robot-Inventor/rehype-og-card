import { startTestServer, stopTestServer } from "./server";

export default async function setup() {
    await startTestServer();
    
    return async () => {
        await stopTestServer();
    };
}
