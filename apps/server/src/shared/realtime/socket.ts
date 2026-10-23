import { Server } from "socket.io";
import type { Server as HTTPServer } from "node:http";
import { jwt } from "#shared/lib/jwt";
import { env } from "#shared/config/env";
import { UnauthorizedError } from "../errors/http-errors";

export let io: Server;

export function initSocket(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: { origin: env.CLIENT_ORIGIN, credentials: true },
  });

  io.use((socket, next) => {
    try {
      const payload = jwt.verifyAccessToken(socket.handshake.auth.token);
      socket.data.userId = payload.userId;
      socket.data.role = payload.role;
      socket.data.department = payload.department;
      next();
    } catch {
      next(new UnauthorizedError("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    if (socket.data.department) socket.join(socket.data.department);
    if (
      socket.data.role === "GENERAL_MANAGER" ||
      socket.data.role === "OWNER"
    ) {
      socket.join("management");
    }
  });
}
