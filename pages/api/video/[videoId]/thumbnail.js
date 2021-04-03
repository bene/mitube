import * as fs from "fs";
import * as path from "path";
import * as mime from "mime-types";

import * as DB from "../../../../logic/database";

export default async function handler(req, res) {
  const { videoId } = req.query;
  const video = DB.get(videoId);
  const filePath = path.join(
    "data",
    "thumbnails",
    `${videoId}.${video.thumbnailType}`
  );
  const stat = fs.statSync(filePath);

  const downloadStream = fs.createReadStream(filePath);

  res.writeHead(200, {
    "Content-Type": mime.lookup(video.thumbnailType),
    "Content-Length": stat.size,
  });

  await new Promise((resolve) => {
    downloadStream.pipe(res);
    downloadStream.on("end", resolve);
  });
}
