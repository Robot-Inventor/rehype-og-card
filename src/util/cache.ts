import { checkFileExists, copyDirectory, generateFilename } from "./file.js";
import type { OGCardData } from "../types.js";
import fs from "fs/promises";
import path from "path";

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

/**
 * Save OG data to build cache.
 * @param url URL of the OG data.
 * @param OGData OG data to save.
 * @param buildCachePath Build cache path.
 */
const saveOGDataBuildCache = async (url: string, OGData: OGCardData, buildCachePath: string): Promise<void> => {
    const filename = generateFilename(url, false);
    const savePath = `${path.join(buildCachePath, filename)}.json`;
    const cacheDirectoryExists = await checkFileExists(buildCachePath);
    if (!cacheDirectoryExists) {
        await fs.mkdir(buildCachePath, { recursive: true });
    }
    await fs.writeFile(savePath, JSON.stringify(OGData));
};

/**
 * Restore OG data from build cache.
 * @param url URL of the OG data.
 * @param buildCachePath Build cache path.
 * @returns Restored OG data. If not found, returns `null`.
 */
const restoreOGDataBuildCache = async (url: string, buildCachePath: string): Promise<OGCardData | null> => {
    const filename = generateFilename(url, false);
    const savePath = `${path.join(buildCachePath, filename)}.json`;

    try {
        const data = await fs.readFile(savePath, "utf-8");
        return JSON.parse(data) as OGCardData;
    } catch {
        return null;
    }
};

export { saveBuildCacheFile, restoreBuildCache, saveOGDataBuildCache, restoreOGDataBuildCache };
