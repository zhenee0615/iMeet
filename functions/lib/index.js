"use strict";
// import * as functions from "firebase-functions";
// import * as admin from "firebase-admin";
// const cors = require('cors')({ origin: true });
// const StreamChat = require("stream-chat").StreamChat;
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeStreamUserToken = exports.createStreamToken = exports.createStreamUser = void 0;
// admin.initializeApp();
// export const createStreamUser = functions.https.onRequest((request, response) => {
//     cors(request, response, async () => {
//         const { user } = request.body;
//         if (!user) {
//             throw new functions.https.HttpsError("failed-precondition", "Bad request");
//         } else {
//             try {
//             } catch (error) {
//                 throw new functions.https.HttpsError(
//                   "aborted",
//                   "Could not create Stream user",
//                 );
//             }
//         }
//     })
// });
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const cors = require('cors')({ origin: true });
const StreamChat = require('stream-chat').StreamChat;
const serverStreamClient = StreamChat.getInstance(functions.config().stream.key, functions.config().stream.secret);
admin.initializeApp();
exports.createStreamUser = functions.https.onRequest((request, response) => {
    cors(request, response, async () => {
        const { user } = request.body;
        if (!user) {
            throw new functions.https.HttpsError('failed-precondition', 'Bad request');
        }
        else {
            try {
                await serverStreamClient.upsertUser({
                    id: user.uid,
                    name: user.displayName,
                    email: user.email,
                });
                response.status(200).send({ message: 'User created' });
            }
            catch (error) {
                throw new functions.https.HttpsError('aborted', 'Could not create Stream user');
            }
        }
    });
});
exports.createStreamToken = functions.https.onRequest((request, response) => {
    cors(request, response, async () => {
        const { user } = request.body;
        if (!user) {
            throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' + 'while authenticated.');
        }
        try {
            const token = await serverStreamClient.createToken(user.uid);
            response.status(200).send({ token });
        }
        catch (err) {
            throw new functions.https.HttpsError('aborted', 'Could not get Stream user');
        }
    });
});
exports.revokeStreamUserToken = functions.https.onRequest((request, response) => {
    cors(request, response, async () => {
        const { user } = request.body;
        if (!user) {
            throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' + 'while authenticated.');
        }
        try {
            await serverStreamClient.revokeUserToken(user.uid);
            response.status(200).send({});
        }
        catch (err) {
            throw new functions.https.HttpsError('aborted', 'Could not get Stream user');
        }
    });
});
//# sourceMappingURL=index.js.map