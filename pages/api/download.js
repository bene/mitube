import * as util from "util";
import fetch from "node-fetch";
import * as fs from "fs";
import * as mime from "mime-types";
import * as stream from "stream";
import * as path from "path";
import { spawn } from "child_process";

import * as DB from "../../logic/database";
import { DownloadStatus } from "../../logic/database";

const streamPipeline = util.promisify(stream.pipeline);

export default function handler(req, res) {
  const { url } = req.body;

  let dl = spawn("youtube-dl", [
    url,
    "-o",
    path.join("data", "videos", "%(id)s.%(ext)s"),
    "--write-info-json",
  ]);
  let infoFilePath;

  dl.stdout.on("data", (data) => {
    const raw = `${data}`;

    if (raw.includes("Writing video description metadata as JSON to")) {
      infoFilePath = raw.split(": ")[1].split("\n")[0];
    }
  });

  dl.stderr.on("data", (data) => {
    console.log(`stderr: ${data}`);
  });

  dl.on("error", (error) => {
    console.log(`error: ${error.message}`);
  });

  dl.on("close", async (code) => {
    let info = JSON.parse(fs.readFileSync(infoFilePath, "utf-8"));
    let {
      id,
      title,
      description,
      uploader,
      upload_date: uploadDate,
      duration,
      categories,
      tags,
      thumbnail,
      ext,
    } = info;

    // Fetch thumbnail
    const result = await fetch(thumbnail);
    if (!result.ok) {
      console.log("Could not fetch thumbnail");
    }

    const contentType = result.headers.get("content-type");
    const thumbnailExt = mime.extension(contentType);
    const thumbnailFileName = `${id}.${thumbnailExt}`;

    // Save thumbnail
    await streamPipeline(
      result.body,
      fs.createWriteStream(path.join("data", "thumbnails", thumbnailFileName))
    );

    // Humanize duration
    if (duration >= 3600) {
      duration = `${Math.floor(duration / 3600)}:${Math.floor(
        (duration % 3600) / 60
      )
        .toString()
        .padStart(2, "0")}:${(duration % 60).toString().padStart(2, "0")}`;
    } else {
      duration = `${Math.floor(duration / 60)}:${(duration % 60)
        .toString()
        .padStart(2, "0")}`;
    }

    // Add metadata to database
    DB.add(id, {
      url,
      title,
      description,
      uploader,
      uploadDate,
      duration,
      categories,
      tags,
      DownloadStatus: DownloadStatus.Complete,
      thumbnailType: thumbnailExt,
      videoType: ext,
    });
  });

  res.status(202).end();
}
