import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createBrotliCompress, createGzip } from "node:zlib";

const root = fileURLToPath(new URL("../", import.meta.url));
const port = Number(process.env.PORT || 4173);
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml"
};

function staticCacheHeaders(filePath, requestUrl) {
  const extension = extname(filePath).toLowerCase();
  const pathname = decodeURIComponent(requestUrl.pathname || "");
  const hasVersion = requestUrl.searchParams.has("v");
  const immutableAsset = hasVersion || pathname.startsWith("/assets/") || pathname.startsWith("/.data/");
  const cacheableAsset = immutableAsset || [".js", ".css", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".ico", ".woff", ".woff2"].includes(extension);
  if (!cacheableAsset || extension === ".html") {
    return {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0"
    };
  }
  if (!immutableAsset) {
    return {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0"
    };
  }
  return {
    "Cache-Control": "public, max-age=31536000, immutable"
  };
}

function staticCompressionHeaders(request, extension, info) {
  if (![".css", ".html", ".js", ".json", ".svg"].includes(extension) || Number(info?.size || 0) < 1024) {
    return {};
  }
  const acceptEncoding = String(request.headers["accept-encoding"] || "");
  if (/\bbr\b/u.test(acceptEncoding)) {
    return {
      "Content-Encoding": "br",
      Vary: "Accept-Encoding"
    };
  }
  if (/\bgzip\b/u.test(acceptEncoding)) {
    return {
      "Content-Encoding": "gzip",
      Vary: "Accept-Encoding"
    };
  }
  return {};
}

function pipeStaticFile(filePath, response, encoding) {
  const stream = createReadStream(filePath);
  if (encoding === "br") {
    stream.pipe(createBrotliCompress()).pipe(response);
    return;
  }
  if (encoding === "gzip") {
    stream.pipe(createGzip()).pipe(response);
    return;
  }
  stream.pipe(response);
}

createServer(async (request, response) => {
  const requestUrl = new URL(request.url, "http://localhost");
  const pathname = decodeURIComponent(requestUrl.pathname);
  if (pathname === "/__health") {
    response.writeHead(204, {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0"
    });
    response.end();
    return;
  }
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = normalize(join(root, relativePath));

  const isAllowedDataFile = relativePath === ".data/market-prices.js" || /^\.data\/catalog-locales\/[^/]+\.js$/.test(relativePath);
  if (!filePath.startsWith(root) || relativePath.startsWith(".git") || (relativePath.startsWith(".data") && !isAllowedDataFile)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("Not a file");
    const extension = extname(filePath).toLowerCase();
    const compressionHeaders = staticCompressionHeaders(request, extension, info);
    response.writeHead(200, {
      "Content-Type": mimeTypes[extension] || "application/octet-stream",
      ...staticCacheHeaders(filePath, requestUrl),
      ...compressionHeaders
    });
    pipeStaticFile(filePath, response, compressionHeaders["Content-Encoding"]);
  } catch {
    response.writeHead(404).end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`CS2 Skin Atlas static server: http://127.0.0.1:${port}`);
});
