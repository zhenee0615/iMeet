const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });
const rooms = new Map();

server.on('connection', (socket, request) => {
  const urlParams = new URLSearchParams(request.url.split('?')[1]);
  const roomId = urlParams.get('roomId');

  if (!roomId) {
    console.error('Room ID is missing');
    socket.close();
    return;
  }

  if (!rooms.has(roomId)) {
    rooms.set(roomId, []);
  }

  rooms.get(roomId).push(socket);
  console.log(`Client joined room: ${roomId}`);

  socket.on('message', (message) => {
    const roomSockets = rooms.get(roomId);
    roomSockets.forEach((client) => {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  socket.on('close', () => {
    const roomSockets = rooms.get(roomId);
    rooms.set(
      roomId,
      roomSockets.filter((client) => client !== socket)
    );
    console.log(`Client disconnected from room: ${roomId}`);
  });
});
