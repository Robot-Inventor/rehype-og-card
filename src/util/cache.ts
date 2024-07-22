import { checkFileExists, copyDirectory } from "./file.js";
import fs from "fs/promises";

/**
 * Save build cache if server cache exists.
 * @param serverCachePath Server cache path.
 * @param buildCachePath Build cache path.
 */
const saveBuildCacheFile = async (serverCachePath: string, buildCachePath: string): Promise<void> => {
    const serverCacheExists = await checkFileExists(serverCachePath);
    const buildCacheExists = await checkFileExists(buildCachePath);
    if (serverCacheExists && !buildCacheExists) {
        await fs.copyFile(serverCachePath, buildCachePath);
    }
};

/**
 * Restore build cache if it exists.
 * @param buildCachePath Build cache path.
 * @param serverCachePath Server cache path.
 */
const restoreBuildCache = (buildCachePath: string, serverCachePath: string): void => {
    copyDirectory(buildCachePath, serverCachePath);
};

export { saveBuildCacheFile, restoreBuildCache };
