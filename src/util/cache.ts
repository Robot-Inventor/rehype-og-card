import { checkFileExists } from "../util.js";
import fs from "fs/promises";

/**
 * Save build cache if server cache exists.
 * @param serverCachePath Server cache path.
 * @param buildCachePath Build cache path.
 */
const saveBuildCache = async (serverCachePath: string, buildCachePath: string): Promise<void> => {
    const buildCacheExists = await checkFileExists(buildCachePath);
    const serverCacheExists = await checkFileExists(serverCachePath);

    if (!serverCacheExists) return;

    if (!buildCacheExists) {
        await fs.mkdir(buildCachePath, { recursive: true });
    }

    await fs.copyFile(serverCachePath, buildCachePath);
};

/**
 * Restore build cache if it exists.
 * @param buildCachePath Build cache path.
 * @param serverCachePath Server cache path.
 */
const restoreBuildCache = async (buildCachePath: string, serverCachePath: string): Promise<void> => {
    const buildCacheExists = await checkFileExists(buildCachePath);
    const serverCacheExists = await checkFileExists(serverCachePath);

    if (!buildCacheExists) return;

    if (!serverCacheExists) {
        await fs.mkdir(serverCachePath, { recursive: true });
    }

    await fs.copyFile(buildCachePath, serverCachePath);
};

export { saveBuildCache, restoreBuildCache };
