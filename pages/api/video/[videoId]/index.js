import * as DB from "../../../../logic/database";

export default function handler(req, res) {
  const { videoId } = req.query;
  res.json(
    JSON.stringify({
      id: videoId,
      ...DB.get(videoId),
    })
  );
}
