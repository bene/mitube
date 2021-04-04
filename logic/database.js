import * as fs from "fs";
import * as path from "path";

let _data;

function get(id) {
  return _data[id];
}

function add(id, video) {
  _data[id] = video;
  commit();
}

function set(id, video) {
  _data[id] = {
    ..._data[id],
    ...video,
  };
  commit();
}

function searchVideos(query, { inTitle = true, inDescription = true }) {
  return Object.keys(_data)
    .map((id) => _data[id])
    .filter(
      (video) =>
        video.title.includes(query) || video.description.includes(query)
    );
}

function load() {
  if (!fs.existsSync(path.join("data", "database.json"))) {
    _data = {};
  } else {
    const raw = fs.readFileSync(path.join("data", "database.json"), "utf-8");
    _data = JSON.parse(raw);
  }
  console.info("Database loaded.");

  // Create thumbnails folder
  fs.mkdirSync(path.join("data", "thumbnails"), { recursive: true });
}

function commit() {
  fs.writeFileSync(
    path.join("data", "database.json"),
    JSON.stringify(_data, null, "  "),
    "utf-8"
  );
}

load();

export { get, add, set, searchVideos, _data };
