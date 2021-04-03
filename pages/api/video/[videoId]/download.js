import * as fs from "fs";
import * as path from "path";
import * as mime from "mime-types";

import * as DB from "../../../../logic/database";

export default async function handler(req, res) {
  const { videoId } = req.query;
  const video = DB.get(videoId);
  const videoFilePath = path.join(
    "data",
    "videos",
    `${videoId}.${video.videoType}`
  );

  const options = {};

  let start;
  let end;

  const range = req.headers.range;
  if (range) {
    const bytesPrefix = "bytes=";
    if (range.startsWith(bytesPrefix)) {
      const bytesRange = range.substring(bytesPrefix.length);
      const parts = bytesRange.split("-");
      if (parts.length === 2) {
        const rangeStart = parts[0] && parts[0].trim();
        if (rangeStart && rangeStart.length > 0) {
          options.start = start = parseInt(rangeStart);
        }
        const rangeEnd = parts[1] && parts[1].trim();
        if (rangeEnd && rangeEnd.length > 0) {
          options.end = end = parseInt(rangeEnd);
        }
      }
    }
  }

  res.setHeader("content-type", mime.lookup(video.videoType));

  const contentLength = fs.statSync(videoFilePath).size;

  if (req.method === "HEAD") {
    res.status(200);
    res.setHeader("accept-ranges", "bytes");
    res.setHeader("content-length", contentLength);
    return res.end();
  }

  let retrievedLength;
  if (!!start && !!end) {
    retrievedLength = end + 1 - start;
  } else if (!!start) {
    retrievedLength = contentLength - start;
  } else if (!!end) {
    retrievedLength = end + 1;
  } else {
    retrievedLength = contentLength;
  }

  res.status(!!start || !!end ? 206 : 200);
  res.setHeader("content-length", retrievedLength);

  if (!!range) {
    res.setHeader(
      "content-range",
      `bytes ${start || 0}-${end || contentLength - 1}/${contentLength}`
    );
    res.setHeader("accept-ranges", "bytes");
  }

  const downloadStream = fs.createReadStream(videoFilePath, options);
  await new Promise((resolve) => {
    downloadStream.pipe(res);
    downloadStream.on("end", resolve);
  });
}
