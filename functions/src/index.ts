// import * as functions from 'firebase-functions';
// import * as admin from 'firebase-admin';
// const cors = require('cors')({ origin: true });
// const StreamChat = require('stream-chat').StreamChat;

// const serverStreamClient = StreamChat.getInstance(
//   functions.config().stream.key,
//   functions.config().stream.secret,
// );

// admin.initializeApp();

// export const createStreamUser = functions.https.onRequest(
//   (request, response) => {
//     cors(request, response, async () => {
//       const { user } = request.body;
//       if (!user) {
//         throw new functions.https.HttpsError(
//           'failed-precondition',
//           'Bad request',
//         );
//       } else {
//         try {
//           await serverStreamClient.upsertUser({
//             id: user.uid,
//             name: user.displayName,
//             email: user.email,
//           });
//           response.status(200).send({ message: 'User created' });
//         } catch (error) {
//           throw new functions.https.HttpsError(
//             'aborted',
//             'Could not create Stream user',
//           );
//         }
//       }
//     });
//   },
// );

// export const createStreamToken = functions.https.onRequest(
//   (request, response) => {
//     cors(request, response, async () => {
//       const { user } = request.body;
//       if (!user) {
//         throw new functions.https.HttpsError(
//           'failed-precondition',
//           'The function must be called ' + 'while authenticated.',
//         );
//       }
//       try {
//         const token = await serverStreamClient.createToken(user.uid);
//         response.status(200).send({ token });
//       } catch (err) {
//         throw new functions.https.HttpsError(
//           'aborted',
//           'Could not get Stream user',
//         );
//       }
//     });
//   },
// );

// export const revokeStreamUserToken = functions.https.onRequest(
//   (request, response) => {
//     cors(request, response, async () => {
//       const { user } = request.body;
//       if (!user) {
//         throw new functions.https.HttpsError(
//           'failed-precondition',
//           'The function must be called ' + 'while authenticated.',
//         );
//       }
//       try {
//         await serverStreamClient.revokeUserToken(user.uid);
//         response.status(200).send({});
//       } catch (err) {
//         throw new functions.https.HttpsError(
//           'aborted',
//           'Could not get Stream user',
//         );
//       }
//     });
//   },
// );

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors from 'cors';
import { StreamChat } from 'stream-chat';

// Initialize CORS middleware
const corsHandler = cors({ origin: true });

// Initialize StreamChat client
const serverStreamClient = StreamChat.getInstance(
  functions.config().stream.key,
  functions.config().stream.secret,
);

// Initialize Firebase Admin
admin.initializeApp();

// Function to create a Stream user
export const createStreamUser = functions.https.onRequest(
  (request, response) => {
    corsHandler(request, response, async () => {
      const { user } = request.body;

      if (!user) {
        return response.status(400).json({
          error: 'Bad request: Missing user data.',
        });
      }

      try {
        await serverStreamClient.upsertUser({
          id: user.uid,
          name: user.displayName,
          email: user.email,
        });
        return response
          .status(200)
          .json({ message: 'User created successfully.' });
      } catch (error) {
        console.error('Error creating Stream user:', error);
        return response.status(500).json({
          error: 'Internal Server Error: Could not create Stream user.',
        });
      }
    });
  },
);

// Function to create a Stream token
export const createStreamToken = functions.https.onRequest(
  (request, response) => {
    corsHandler(request, response, async () => {
      const { user } = request.body;

      if (!user) {
        return response.status(400).json({
          error: 'Bad request: Missing user data.',
        });
      }

      try {
        const token = await serverStreamClient.createToken(user.uid);
        return response.status(200).json({ token });
      } catch (err) {
        console.error('Error creating Stream token:', err);
        return response.status(500).json({
          error: 'Internal Server Error: Could not create Stream token.',
        });
      }
    });
  },
);

// Function to revoke a Stream user token
export const revokeStreamUserToken = functions.https.onRequest(
  (request, response) => {
    corsHandler(request, response, async () => {
      const { user } = request.body;

      if (!user) {
        return response.status(400).json({
          error: 'Bad request: Missing user data.',
        });
      }

      try {
        await serverStreamClient.revokeUserToken(user.uid);
        return response
          .status(200)
          .json({ message: 'User token revoked successfully.' });
      } catch (err) {
        console.error('Error revoking Stream user token:', err);
        return response.status(500).json({
          error: 'Internal Server Error: Could not revoke Stream user token.',
        });
      }
    });
  },
);
