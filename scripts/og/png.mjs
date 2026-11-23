/**
 * Lossless PNG recompression for the cards. Chromium's screenshot encoder
 * favours speed; picking the best filter per row and deflating at level 9
 * takes the photo card from about 410 KB to about 290 KB without changing a
 * pixel. `bits` below 8 first rounds each channel to that many bits, for a
 * photo whose grain would otherwise cost more than the size budget allows.
 * Reads and writes 8-bit RGB or RGBA, non-interlaced, which is what a
 * Chromium screenshot produces.
 */
import { crc32, deflateSync, inflateSync } from "node:zlib";

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const CHANNELS = { 2: 3, 6: 4 };

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

/** The predictor for filter type `f` at byte `i` of row `y`. */
function predict(f, px, stride, bpp, y, i) {
  const a = i >= bpp ? px[y * stride + i - bpp] : 0;
  const b = y > 0 ? px[(y - 1) * stride + i] : 0;
  const c = y > 0 && i >= bpp ? px[(y - 1) * stride + i - bpp] : 0;
  switch (f) {
    case 0:
      return 0;
    case 1:
      return a;
    case 2:
      return b;
    case 3:
      return (a + b) >> 1;
    default:
      return paeth(a, b, c);
  }
}

function chunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, "latin1");
  const tail = Buffer.alloc(4);
  tail.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, tail]);
}

/**
 * @param {Buffer} png a Chromium screenshot
 * @param {number} [bits] bits kept per colour channel, 1 to 8
 * @returns {Buffer} a smaller file; the same pixels when `bits` is 8
 */
export function recompress(png, bits = 8) {
  const idat = [];
  let width = 0;
  let height = 0;
  let colorType = 0;
  for (let o = 8; o < png.length;) {
    const len = png.readUInt32BE(o);
    const type = png.toString("latin1", o + 4, o + 8);
    const data = png.subarray(o + 8, o + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
      if (data[8] !== 8 || data[12] !== 0 || !(colorType in CHANNELS)) {
        throw new Error("recompress: only 8-bit RGB or RGBA, not interlaced");
      }
    } else if (type === "IDAT") {
      idat.push(data);
    }
    o += 12 + len;
  }
  const bpp = CHANNELS[colorType];
  const stride = width * bpp;
  const raw = inflateSync(Buffer.concat(idat));
  const px = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y += 1) {
    const f = raw[y * (stride + 1)];
    for (let i = 0; i < stride; i += 1) {
      const v = raw[y * (stride + 1) + 1 + i];
      px[y * stride + i] = (v + predict(f, px, stride, bpp, y, i)) & 255;
    }
  }
  if (bits < 8) {
    const step = 2 ** (8 - bits);
    for (let i = 0; i < px.length; i += 1) {
      if (bpp === 4 && i % 4 === 3) continue;
      px[i] = Math.min(255, Math.round(px[i] / step) * step);
    }
  }
  const out = Buffer.alloc(height * (stride + 1));
  const row = Buffer.alloc(stride);
  const best = Buffer.alloc(stride);
  for (let y = 0; y < height; y += 1) {
    let bestScore = Infinity;
    let bestFilter = 0;
    for (let f = 0; f < 5; f += 1) {
      let score = 0;
      for (let i = 0; i < stride; i += 1) {
        const r =
          (px[y * stride + i] - predict(f, px, stride, bpp, y, i)) & 255;
        row[i] = r;
        score += r < 128 ? r : 256 - r;
      }
      if (score < bestScore) {
        bestScore = score;
        bestFilter = f;
        row.copy(best);
      }
    }
    out[y * (stride + 1)] = bestFilter;
    best.copy(out, y * (stride + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = colorType;
  return Buffer.concat([
    SIGNATURE,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(out, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
