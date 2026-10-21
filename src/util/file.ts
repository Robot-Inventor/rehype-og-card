import { cp, existsSync, mkdirSync } from "node:fs";
import { access } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

/**
 * Check if the file exists.
 * @param filePath Path to check.
 * @returns `true` if the file exists, `false` otherwise.
 */
const checkFileExists = async (filePath: string): Promise<boolean> => {
    try {
        await access(filePath);
        return true;
    } catch {
        return false;
    }
};

/**
 * Create directory.
 * @param dir Directory path.
 */
const createDirectorySync = (dir: string): void => {
    mkdirSync(dir, { recursive: true });
};

/**
 * Copy directory from source to destination.
 * @param source Source directory.
 * @param destination Destination directory.
 */
const copyDirectory = (source: string, destination: string): void => {
    const sourceExists = existsSync(source);
    if (!sourceExists) return;

    const destinationExists = existsSync(destination);
    if (!destinationExists) {
        createDirectorySync(destination);
    }

    cp(source, destination, { recursive: true }, (error) => {
        if (error) {
            // oxlint-disable-next-line no-console
            console.error("[rehype-og-card] Failed to copy files: ", error);
        }
    });
};

/**
 * Generate filename from URL.
 * @param url URL to generate filename.
 * @param extension Include extension in the filename.
 * @returns Generated filename.
 */
const generateFilename = (url: string, extension = true): string => {
    const hash = createHash("sha256").update(url).digest("hex");
    const possibleExtension = path.extname(new URL(url).pathname).toLowerCase();
    const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif", ".svg"] as const;
    const extensionString = allowedExtensions.includes(possibleExtension as (typeof allowedExtensions)[number])
        ? possibleExtension
        : "";
    const filename = extension ? hash + extensionString : hash;
    return filename;
};

export { checkFileExists, createDirectorySync, copyDirectory, generateFilename };
