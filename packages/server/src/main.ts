import { randomUUID } from 'crypto';
import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

const rooms: Record<string, Record<string, WebSocket>> = {};

const leave = (roomId: string, connectionId: string): void => {
  // not present: do nothing
  if (!rooms[roomId][connectionId]) return;

  // if the one exiting is the last one, destroy the room
  if (Object.keys(rooms[roomId]).length === 1) delete rooms[roomId];
  // otherwise simply leave the room
  else delete rooms[roomId][connectionId];
  
};

wss.on('connection', function connection(ws, req) {
  const url = new URL(req.url, 'ws://localhost:8080');

  const connectionId = randomUUID();
  const roomId = url.searchParams.get('roomId');

  if (!rooms[roomId]) rooms[roomId] = {}; // create the room
  if (!rooms[roomId][connectionId]) rooms[roomId][connectionId] = ws; // join the room

  ws.on('error', console.error);

  ws.on("message", data => {
    // send the message to all in the room
    Object.entries(rooms[roomId]).forEach(([, sock]) => sock.send(data));
  });

  ws.on("close", () => {
    // for each room, remove the closed socket
    Object.keys(rooms).forEach(roomId => leave(roomId, connectionId));
  });
});
