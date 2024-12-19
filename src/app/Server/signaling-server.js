// const WebSocket = require('ws');

// const server = new WebSocket.Server({ port: 8080 });

// const clients = new Map();

// server.on('connection', (socket) => {
//   const id = Math.random().toString(36).substr(2, 9);
//   clients.set(id, socket);

//   console.log(`Client connected: ${id}`);

//   socket.on('message', (message) => {
//     const data = JSON.parse(message);

//     if (data.targetId && clients.has(data.targetId)) {
//       clients.get(data.targetId).send(JSON.stringify({ from: id, ...data }));
//     }
//   });

//   socket.on('close', () => {
//     clients.delete(id);
//     console.log(`Client disconnected: ${id}`);
//   });
// });

// const WebSocket = require('ws');

// const server = new WebSocket.Server({ port: 8080 });

// const rooms = new Map(); // Map of rooms and their connected clients

// server.on('connection', (socket) => {
//   console.log('New client connected');

//   socket.on('message', (message) => {
//     const data = JSON.parse(message);

//     // Handle room creation or joining
//     if (data.type === 'createRoom') {
//       const roomId = data.roomId;
//       rooms.set(roomId, [socket]);
//       console.log(`Room created: ${roomId}`);
//       socket.send(JSON.stringify({ type: 'roomCreated', roomId }));
//     } else if (data.type === 'joinRoom') {
//       const roomId = data.roomId;
//       if (rooms.has(roomId)) {
//         rooms.get(roomId).push(socket);
//         console.log(`Client joined room: ${roomId}`);
//         socket.send(JSON.stringify({ type: 'roomJoined', roomId }));
//         broadcastToRoom(roomId, { type: 'userJoined', roomId });
//       } else {
//         socket.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
//       }
//     }

//     // Forward signaling messages to all other clients in the room
//     if (data.type === 'offer' || data.type === 'answer' || data.type === 'candidate') {
//       const roomId = data.roomId;
//       if (rooms.has(roomId)) {
//         rooms.get(roomId).forEach((client) => {
//           if (client !== socket) {
//             client.send(JSON.stringify(data));
//           }
//         });
//       }
//     }
//   });

//   socket.on('close', () => {
//     for (const [roomId, clients] of rooms.entries()) {
//       rooms.set(roomId, clients.filter((client) => client !== socket));
//       if (rooms.get(roomId).length === 0) {
//         rooms.delete(roomId);
//         console.log(`Room deleted: ${roomId}`);
//       }
//     }
//     console.log('Client disconnected');
//   });
// });

// function broadcastToRoom(roomId, message) {
//   if (rooms.has(roomId)) {
//     rooms.get(roomId).forEach((client) => client.send(JSON.stringify(message)));
//   }
// }

// console.log('Signaling server is running on ws://localhost:8080');
const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });
const rooms = new Map();

server.on('connection', (socket, request) => {
  const urlParams = new URLSearchParams(request.url.split('?')[1]);
  const roomId = urlParams.get('roomId');

  if (!rooms.has(roomId)) {
    rooms.set(roomId, []);
  }
  rooms.get(roomId).push(socket);

//   socket.on('message', (message) => {
//     const roomSockets = rooms.get(roomId);
//     roomSockets.forEach((client) => {
//       if (client !== socket && client.readyState === WebSocket.OPEN) {
//         client.send(message);
//       }
//     });
//   });


    socket.on('message', (message) => {
    console.log('Received message from client:', message); // Log the raw message
    
    // Ensure message is in JSON format
    let parsedMessage;
    try {
        parsedMessage = JSON.parse(message);
    } catch (error) {
        console.error('Invalid JSON received:', message);
        return;
    }

    // Forward the message to other clients in the room
    const roomSockets = rooms.get(roomId);
    roomSockets.forEach((client) => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(parsedMessage)); // Send valid JSON
        }
    });
    });

    socket.on('close', () => {
        const roomSockets = rooms.get(roomId);
        rooms.set(
            roomId,
            roomSockets.filter((client) => client !== socket)
        );
    });
});
