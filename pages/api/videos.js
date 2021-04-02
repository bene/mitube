import * as DB from "../../logic/database";

export default function handler(req, res) {
  res.json(JSON.stringify(DB._data));
}
