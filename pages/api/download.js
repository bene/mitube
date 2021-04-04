import * as util from "util";
import fetch from "node-fetch";
import * as fs from "fs";
import * as mime from "mime-types";
import * as stream from "stream";
import * as path from "path";
import { spawn } from "child_process";

import * as DB from "../../logic/database";
import { DownloadStatus, SetMetaData, UpdateMetaData } from "../../logic/types";
import { pushUpdate } from "../../logic/updates";

const streamPipeline = util.promisify(stream.pipeline);

export default function handler(req, res) {
  const { url } = req.body;

  let dl = spawn("youtube-dl", [
    url,
    "-o",
    path.join("data", "videos", "%(id)s.%(ext)s"),
    "--write-info-json",
  ]);

  let videoId;
  let infoFilePath;
  let infoFileWriteStarted = false;
  let infoFileRead = false;
  let lastPushedProgress = 0;

  dl.stdout.on("data", async (data) => {
    const raw = `${data}`;

    // Parse download progress
    if (raw.includes("%") && !!videoId) {
      let percentRaw = raw.split("%")[0];
      percentRaw = percentRaw.split(" ");
      percentRaw = percentRaw[percentRaw.length - 1];
      percentRaw = percentRaw.trim();

      const percent = parseFloat(percentRaw);

      // Send progress to clients
      if (percent - lastPushedProgress > 5) {
        lastPushedProgress = percent;

        pushUpdate(UpdateMetaData, {
          id: videoId,
          progress: percent,
        });
      }
    }

    if (raw.includes("Writing video description metadata as JSON")) {
      infoFilePath = raw.split(": ")[1].split("\n")[0];
      infoFileWriteStarted = true;
    } else {
      if (infoFileWriteStarted && !infoFileRead) {
        let info = JSON.parse(fs.readFileSync(infoFilePath, "utf-8"));

        videoId = info.id;
        infoFileRead = true;

        // Fetch thumbnail
        const result = await fetch(info.thumbnail);
        if (!result.ok) {
          console.log("Could not fetch thumbnail");
        }

        const contentType = result.headers.get("content-type");
        const thumbnailExt = mime.extension(contentType);
        const thumbnailFileName = `${videoId}.${thumbnailExt}`;

        // Save thumbnail
        await streamPipeline(
          result.body,
          fs.createWriteStream(
            path.join("data", "thumbnails", thumbnailFileName)
          )
        );

        const metaData = {
          id: info.id,
          title: info.title,
          description: info.description,
          uploader: info.uploader,
          uploadDate: info.uploadDate,
          duration: info.duration,
          categories: info.categories,
          tags: info.tags,
          thumbnailType: thumbnailExt,
          videoType: info.ext,
          DownloadStatus: DownloadStatus.Downloading,
        };

        // Humanize duration
        if (metaData.duration >= 3600) {
          metaData.duration = `${Math.floor(
            metaData.duration / 3600
          )}:${Math.floor((metaData.duration % 3600) / 60)
            .toString()
            .padStart(2, "0")}:${(metaData.duration % 60)
            .toString()
            .padStart(2, "0")}`;
        } else {
          metaData.duration = `${Math.floor(metaData.duration / 60)}:${(
            metaData.duration % 60
          )
            .toString()
            .padStart(2, "0")}`;
        }

        // Add metadata to database
        DB.add(videoId, metaData);

        //
        pushUpdate(UpdateMetaData, metaData);

        // Send response
        res.status(202).json(metaData);
      }
    }
  });

  dl.stderr.on("data", (data) => {
    console.log(`stderr: ${data}`);
  });

  dl.on("error", (error) => {
    console.log(`error: ${error.message}`);
  });

  dl.on("close", async (code) => {
    DB.set(videoId, {
      DownloadStatus:
        code === 0 ? DownloadStatus.Complete : DownloadStatus.Error,
    });
    pushUpdate(UpdateMetaData, {
      id: videoId,
      DownloadStatus:
        code === 0 ? DownloadStatus.Complete : DownloadStatus.Error,
    });
  });
}
