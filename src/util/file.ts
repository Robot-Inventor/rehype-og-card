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

export { checkFileExists };
