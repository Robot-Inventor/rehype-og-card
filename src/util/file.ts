import fs from "fs/promises";

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

export { checkFileExists, copyDirectory };
