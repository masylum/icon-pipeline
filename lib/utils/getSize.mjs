import { gzipSize } from "gzip-size";
import brotliSize from "brotli-size";
import prettyBytes from "pretty-bytes";

function formatSize(size, filename, type, raw) {
  const pretty = raw ? `${size} B` : prettyBytes(size);
  return {
    size: size,
    pretty: pretty,
    type: type,
  };
}

export async function getSizeInfo(code, filename) {
  const raw = code.length < 5000;
  const gzip = formatSize(await gzipSize(code), filename, "gzip", raw);
  const brotli = formatSize(await brotliSize(code), filename, "br", raw);
  return {
    gzip,
    brotli,
  };
}
