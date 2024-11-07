import { randomUUID } from 'crypto';
import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

const rooms: Record<string, Record<string, WebSocket>> = {};

wss.on('connection', function connection(ws, req) {
  const url = new URL(req.url, 'ws://localhost:8080');

  const connectionId = randomUUID();
  const roomId = url.searchParams.get('roomId');

  if (!rooms[roomId]) rooms[roomId] = {}; // create the room
  if (!rooms[roomId][connectionId]) rooms[roomId][connectionId] = ws; // join the room

  ws.on('error', console.error);

  ws.on("message", data => {
    Object.entries(rooms[roomId]).forEach(([, sock]) => sock.send(data));
  });

  ws.on("close", () => {
    delete rooms[roomId][connectionId]
  });
});
