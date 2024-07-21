import { checkFileExists } from "../util.js";
import fs from "fs/promises";
import path from "path";

/**
 * Copy directory from source to destination.
 * @param source Source directory.
 * @param destination Destination directory.
 */
// eslint-disable-next-line max-statements
const copyDirectory = async (source: string, destination: string): Promise<void> => {
    const sourceExists = await checkFileExists(source);
    if (!sourceExists) return;

    const destinationExists = await checkFileExists(destination);
    if (!destinationExists) {
        await fs.mkdir(destination, { recursive: true });
    }

    const files = await fs.readdir(source);
    const promises: Promise<void>[] = [];
    for (const file of files) {
        const sourceFile = path.join(source, file);
        const destFile = path.join(destination, file);
        promises.push(fs.copyFile(sourceFile, destFile));
    }

    await Promise.all(promises);
};

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
