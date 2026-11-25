// news-image-20261125: Wednesday 25 November 2026, summed up in one image.
//
// The poster beside this file (entry.png) is the entry itself: a broadsheet
// front page for the day — the second Houthi strike on Riyadh's tallest
// tower as the lead, with the Bangladesh garment wage deal, Shenzhou-24's
// Pakistani astronaut, the CIA breach and the Colombia car bomb below it,
// plus Champions League, Sooryavanshi's 204 and the UN's HIV warning.
//
// The grading sandbox has no network and passes no input, so the day's
// news is baked into the image at build time and this program's job is
// only to deliver those exact bytes to the output directory, unchanged,
// on every run.
//
// Run locally the same way the harness does:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Before delivering, hold the baked poster up against the gate's own
// limits from the competition rules: it must read as a PNG or a JPEG
// from its magic bytes, weigh at most 1 MiB, and fit within 1024x1024
// pixels. A bad bake should fail loudly here, not silently at the gate.
const BYTE_LIMIT = 1_048_576;
const SIDE_LIMIT = 1024;

const poster = new URL("./entry.png", import.meta.url);
const bytes = readFileSync(poster);

const pngMagic = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const looksPng = bytes.length > 24 && pngMagic.every((b, i) => bytes[i] === b);
const looksJpeg = bytes.length > 2 && bytes[0] === 0xff && bytes[1] === 0xd8;
if (!looksPng && !looksJpeg) {
  throw new Error("entry.png is neither a PNG nor a JPEG");
}
if (bytes.length > BYTE_LIMIT) {
  throw new Error(`entry.png weighs ${bytes.length} bytes, over the 1 MiB limit`);
}
if (looksPng) {
  // In a PNG the IHDR chunk comes first; its width and height are the
  // big-endian uint32s at offsets 16 and 20.
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width > SIDE_LIMIT || height > SIDE_LIMIT) {
    throw new Error(`entry.png is ${width}x${height}, over 1024x1024`);
  }
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
copyFileSync(poster, join(outDir, "entry.png"));
