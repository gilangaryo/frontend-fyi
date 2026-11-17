// Resize + recompress master images for display on the web.
// Usage: node scripts/optimize-images.mjs <srcDir> <outDir> [maxWidth=1600] [quality=85]
// Masters stay untouched in srcDir; outputs keep the same base name as .webp.
import sharp from "sharp";
import { readdir, mkdir, stat } from "node:fs/promises";
import path from "node:path";

const [srcDir, outDir, maxW = "1600", q = "85"] = process.argv.slice(2);
if (!srcDir || !outDir) {
    console.error("Usage: node scripts/optimize-images.mjs <srcDir> <outDir> [maxWidth] [quality]");
    process.exit(1);
}

await mkdir(outDir, { recursive: true });
const files = (await readdir(srcDir)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

for (const f of files) {
    const src = path.join(srcDir, f);
    const out = path.join(outDir, f.replace(/\.(jpe?g|png|webp)$/i, ".webp"));
    const before = (await stat(src)).size;
    const info = await sharp(src)
        .rotate()
        .resize({ width: Number(maxW), withoutEnlargement: true })
        .webp({ quality: Number(q), effort: 6, smartSubsample: true })
        .toFile(out);
    console.log(
        `${f}: ${(before / 1024).toFixed(0)} KB -> ${(info.size / 1024).toFixed(0)} KB (${info.width}x${info.height})`,
    );
}
