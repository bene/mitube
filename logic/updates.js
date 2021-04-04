import { Server } from "socket.io";

let server;

function register(res) {
  if (!server) {
    server = new Server(res.socket.server);
  }

  if (!res.socket.server.io) {
    res.socket.server.io = server;
  }

  res.end();
}

async function pushUpdate(event, payload) {
  if (!payload.timeDate) {
    payload.timeDate = new Date();
  }

  if (!!server) {
    server.emit(event, payload);
  }
}

export { register, pushUpdate };
