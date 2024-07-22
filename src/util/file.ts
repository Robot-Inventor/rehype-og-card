import { createHash } from "crypto";
import fs from "fs/promises";
import path from "path";

/**
 * Check if the file exists.
 * @param filePath Path to check.
 * @returns `true` if the file exists, `false` otherwise.
 */
const checkFileExists = async (filePath: string): Promise<boolean> => {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
};

/**
 * Copy directory from source to destination.
 * @param source Source directory.
 * @param destination Destination directory.
 */
const copyDirectory = async (source: string, destination: string): Promise<void> => {
    const sourceExists = await checkFileExists(source);
    if (!sourceExists) return;

    const destinationExists = await checkFileExists(destination);
    if (!destinationExists) {
        await fs.mkdir(destination, { recursive: true });
    }

    await fs.cp(source, destination, { recursive: true });
};

/**
 * Generate filename from URL.
 * @param url URL to generate filename.
 * @param extension Include extension in the filename.
 * @returns Generated filename.
 */
const generateFilename = (url: string, extension: boolean = true): string => {
    const hash = createHash("sha256").update(url).digest("hex");
    const filename = extension ? hash + path.extname(new URL(url).pathname) : hash;
    return filename;
};

export { checkFileExists, copyDirectory, generateFilename };
