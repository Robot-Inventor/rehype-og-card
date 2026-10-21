import sharp from "sharp";

const MAX_WIDTH = 1200;
const MAX_HEIGHT = 628;

/**
 * Convert SVG to PNG without loading resources referenced by the SVG.
 * @param buffer Downloaded SVG.
 * @returns PNG within the link card image bounds.
 */
const rasterizeSVG = async (buffer: Buffer): Promise<Buffer> =>
    // Buffer input leaves librsvg's base URL unset, preventing external file references.
    sharp(buffer)
        .resize({
            fit: "inside",
            height: MAX_HEIGHT,
            width: MAX_WIDTH,
            withoutEnlargement: true
        })
        .png()
        .toBuffer();

export { rasterizeSVG };
