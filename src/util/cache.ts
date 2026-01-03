import { type CacheIndex, type OGCardData, cacheIndexSchema } from "../types.js";
import { checkFileExists, generateFilename } from "./file.js";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { type } from "arktype";

/**
 * Check whether a cache entry is expired.
 * @param cachedAtMs Cached timestamp in milliseconds.
 * @param maxAgeMs Cache expiration time in milliseconds.
 * @returns `true` if expired, otherwise `false`.
 */
const isCacheExpired = (cachedAtMs: number, maxAgeMs: number | false): boolean => {
    if (maxAgeMs === false) return false;
    return Date.now() - cachedAtMs > maxAgeMs;
};

const CACHE_INDEX_FILENAME = "cache.json";

/**
 * Get the cache index path for a directory.
 * @param directory Cache directory path.
 * @returns Cache index path.
 */
const getCacheIndexPath = (directory: string): string => path.join(directory, CACHE_INDEX_FILENAME);

/**
 * Read cache index synchronously.
 * @param directory Cache directory path.
 * @returns Cache index data.
 */
const readCacheIndexSync = (directory: string): CacheIndex => {
    const indexPath = getCacheIndexPath(directory);
    try {
        const raw = fsSync.readFileSync(indexPath, "utf-8");
        const parsed: unknown = JSON.parse(raw);
        const validated = cacheIndexSchema(parsed);
        if (validated instanceof type.errors) return {};
        return validated;
    } catch {
        return {};
    }
};

/**
 * Write cache index synchronously.
 * @param directory Cache directory path.
 * @param index Cache index data.
 */
const writeCacheIndexSync = (directory: string, index: CacheIndex): void => {
    const indexPath = getCacheIndexPath(directory);
    fsSync.writeFileSync(indexPath, JSON.stringify(index));
};

/**
 * Read cache index.
 * @param directory Cache directory path.
 * @returns Cache index data.
 */
const readCacheIndex = async (directory: string): Promise<CacheIndex> => {
    const indexPath = getCacheIndexPath(directory);
    const exists = await checkFileExists(indexPath);
    if (!exists) return {};
    try {
        const raw = await fs.readFile(indexPath, "utf-8");
        const parsed: unknown = JSON.parse(raw);
        const validated = cacheIndexSchema(parsed);
        if (validated instanceof type.errors) return {};
        return validated;
    } catch {
        return {};
    }
};

/**
 * Write cache index.
 * @param directory Cache directory path.
 * @param index Cache index data.
 */
const writeCacheIndex = async (directory: string, index: CacheIndex): Promise<void> => {
    const indexPath = getCacheIndexPath(directory);
    await fs.writeFile(indexPath, JSON.stringify(index));
};

/**
 * Remove a cache file synchronously.
 * @param directory Cache directory path.
 * @param filename Cache filename.
 */
const removeCacheEntrySync = (directory: string, filename: string): void => {
    const filePath = path.join(directory, filename);
    fsSync.rmSync(filePath, { force: true });
};

/**
 * Remove expired cache files synchronously.
 * @param directory Cache directory path.
 * @param maxAgeMs Cache expiration time in milliseconds.
 */
// eslint-disable-next-line max-statements, max-lines-per-function
const pruneExpiredCacheFilesSync = (directory: string, maxAgeMs: number | false): void => {
    if (maxAgeMs === false) return;
    if (!fsSync.existsSync(directory)) return;

    const index = readCacheIndexSync(directory);
    let indexUpdated = false;

    const entries = fsSync.readdirSync(directory, { withFileTypes: true });
    for (const entry of entries) {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            pruneExpiredCacheFilesSync(entryPath, maxAgeMs);
            // eslint-disable-next-line no-continue
            continue;
        }

        // eslint-disable-next-line no-continue
        if (entry.name === CACHE_INDEX_FILENAME) continue;

        if (entry.name.endsWith(".json")) {
            try {
                const raw = fsSync.readFileSync(entryPath, "utf-8");
                const data = JSON.parse(raw) as { cachedAt?: number };

                if (typeof data.cachedAt !== "number") {
                    fsSync.rmSync(entryPath, { force: true });
                    // eslint-disable-next-line no-continue
                    continue;
                }

                if (isCacheExpired(data.cachedAt, maxAgeMs)) {
                    fsSync.rmSync(entryPath, { force: true });
                }
            } catch {
                fsSync.rmSync(entryPath, { force: true });
            }

            // eslint-disable-next-line no-continue
            continue;
        }

        const cachedAtMs = index[entry.name]?.createdAt;
        if (typeof cachedAtMs !== "number" || isCacheExpired(cachedAtMs, maxAgeMs)) {
            removeCacheEntrySync(directory, entry.name);
            indexUpdated = true;
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete index[entry.name];
        }
    }

    if (indexUpdated) {
        writeCacheIndexSync(directory, index);
    }
};

/**
 * Save build cache if server cache exists.
 * @param serverCachePath Server cache path.
 * @param buildCachePath Build cache path.
 */
// eslint-disable-next-line max-statements
const saveBuildCacheFile = async (serverCachePath: string, buildCachePath: string): Promise<void> => {
    const serverCacheExists = await checkFileExists(serverCachePath);
    const buildCacheExists = await checkFileExists(buildCachePath);
    if (serverCacheExists && !buildCacheExists) {
        await fs.copyFile(serverCachePath, buildCachePath);
    }

    const serverDirectory = path.dirname(serverCachePath);
    const buildDirectory = path.dirname(buildCachePath);
    const filename = path.basename(buildCachePath);
    const serverIndex = readCacheIndexSync(serverDirectory);
    const cachedAt =
        typeof serverIndex[filename]?.createdAt === "number" ? serverIndex[filename].createdAt : Date.now();
    const buildIndex = readCacheIndexSync(buildDirectory);
    buildIndex[filename] = { createdAt: cachedAt };
    writeCacheIndexSync(buildDirectory, buildIndex);
};

/**
 * Restore build cache if it exists.
 * @param buildCachePath Build cache path.
 * @param serverCachePath Server cache path.
 * @param maxAgeMs Cache expiration time in milliseconds.
 */
const restoreBuildCache = (buildCachePath: string, serverCachePath: string, maxAgeMs: number | false): void => {
    if (!fsSync.existsSync(buildCachePath)) return;

    pruneExpiredCacheFilesSync(buildCachePath, maxAgeMs);

    if (!fsSync.existsSync(serverCachePath)) {
        fsSync.mkdirSync(serverCachePath, { recursive: true });
    }

    fsSync.cpSync(buildCachePath, serverCachePath, { recursive: true });
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
    const payload = { ...OGData, cachedAt: Date.now() };
    await fs.writeFile(savePath, JSON.stringify(payload));
};

/**
 * Restore OG data from build cache.
 * @param url URL of the OG data.
 * @param buildCachePath Build cache path.
 * @param maxAgeMs Cache expiration time in milliseconds.
 * @returns Restored OG data. If not found, returns `null`.
 */
// eslint-disable-next-line max-statements
const restoreOGDataBuildCache = async (
    url: string,
    buildCachePath: string,
    maxAgeMs: number | false
): Promise<OGCardData | null> => {
    const filename = generateFilename(url, false);
    const savePath = `${path.join(buildCachePath, filename)}.json`;

    try {
        const data = await fs.readFile(savePath, "utf-8");
        const parsed = JSON.parse(data) as OGCardData & { cachedAt?: number };
        if (typeof parsed.cachedAt !== "number") {
            if (maxAgeMs === false) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { cachedAt: __, ...rest } = parsed;
                return rest;
            }
            await fs.rm(savePath, { force: true });
            return null;
        }

        if (isCacheExpired(parsed.cachedAt, maxAgeMs)) {
            await fs.rm(savePath, { force: true });
            return null;
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { cachedAt: __, ...rest } = parsed;
        return rest;
    } catch {
        return null;
    }
};

export {
    getCacheIndexPath,
    isCacheExpired,
    readCacheIndex,
    restoreBuildCache,
    restoreOGDataBuildCache,
    saveBuildCacheFile,
    saveOGDataBuildCache,
    writeCacheIndex
};
