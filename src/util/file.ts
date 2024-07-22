import fs from "fs";

/**
 * Check if the file exists.
 * @param filePath Path to check.
 * @returns `true` if the file exists, `false` otherwise.
 */
const checkFileExists = async (filePath: string): Promise<boolean> => {
    try {
        await fs.promises.access(filePath);
        return true;
    } catch {
        return false;
    }
};

/**
 * Check if the file exists.
 * @param filePath Path to check.
 * @returns `true` if the file exists, `false` otherwise.
 */
const checkFileExistsSync = (filePath: string): boolean => {
    let result = false;
    fs.access(filePath, (error) => {
        result = !error;
    });
    return result;
};

/**
 * Create directory.
 * @param dir Directory path.
 */
const createDirectorySync = (dir: string): void => {
    fs.mkdir(dir, { recursive: true }, (error) => {
        if (error) {
            // eslint-disable-next-line no-console
            console.error("[rehype-og-card] Failed to copy files: ", error);
        }
    });
};

/**
 * Copy directory from source to destination.
 * @param source Source directory.
 * @param destination Destination directory.
 */
const copyDirectory = (source: string, destination: string): void => {
    const sourceExists = checkFileExistsSync(source);
    if (!sourceExists) return;

    const destinationExists = checkFileExistsSync(destination);
    if (!destinationExists) {
        createDirectorySync(destination);
    }

    fs.cp(source, destination, { recursive: true }, (error) => {
        if (error) {
            // eslint-disable-next-line no-console
            console.error("[rehype-og-card] Failed to copy files: ", error);
        }
    });
};

export { checkFileExists, checkFileExistsSync, createDirectorySync, copyDirectory };
