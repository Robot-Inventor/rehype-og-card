import { copyDirectory } from "./file.js";

/**
 * Save build cache if server cache exists.
 * @param serverCachePath Server cache path.
 * @param buildCachePath Build cache path.
 */
const saveBuildCache = async (serverCachePath: string, buildCachePath: string): Promise<void> => {
    await copyDirectory(serverCachePath, buildCachePath);
};

/**
 * Restore build cache if it exists.
 * @param buildCachePath Build cache path.
 * @param serverCachePath Server cache path.
 */
const restoreBuildCache = async (buildCachePath: string, serverCachePath: string): Promise<void> => {
    await copyDirectory(buildCachePath, serverCachePath);
};

export { saveBuildCache, restoreBuildCache };
