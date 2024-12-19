// const WebSocket = require('ws');

// const server = new WebSocket.Server({ port: 8080 });
// const rooms = new Map();

// server.on('connection', (socket, request) => {
//   const urlParams = new URLSearchParams(request.url.split('?')[1]);
//   const roomId = urlParams.get('roomId');

//   if (!rooms.has(roomId)) {
//     rooms.set(roomId, []);
//   }
//   rooms.get(roomId).push(socket);

// //   socket.on('message', (message) => {
// //     const roomSockets = rooms.get(roomId);
// //     roomSockets.forEach((client) => {
// //       if (client !== socket && client.readyState === WebSocket.OPEN) {
// //         client.send(message);
// //       }
// //     });
// //   });


//     socket.on('message', (message) => {
//     console.log('Received message from client:', message); // Log the raw message
    
//     // Ensure message is in JSON format
//     let parsedMessage;
//     try {
//         parsedMessage = JSON.parse(message);
//     } catch (error) {
//         console.error('Invalid JSON received:', message);
//         return;
//     }

//     // Forward the message to other clients in the room
//     const roomSockets = rooms.get(roomId);
//     roomSockets.forEach((client) => {
//         if (client !== socket && client.readyState === WebSocket.OPEN) {
//         client.send(JSON.stringify(parsedMessage)); // Send valid JSON
//         }
//     });
//     });

//     socket.on('close', () => {
//         const roomSockets = rooms.get(roomId);
//         rooms.set(
//             roomId,
//             roomSockets.filter((client) => client !== socket)
//         );
//     });
// });

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
  });
});
