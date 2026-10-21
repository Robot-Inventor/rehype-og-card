import { startTestServer, stopTestServer } from "./server.js";

/**
 * Global setup of Vitest. Start the test HTTP server.
 * @returns The teardown function to stop the test HTTP server.
 */
const setup = async (): Promise<() => Promise<void>> => {
    await startTestServer();

    return async (): Promise<void> => {
        await stopTestServer();
    };
};

export default setup;
