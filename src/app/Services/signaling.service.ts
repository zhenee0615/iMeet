// import { Injectable } from '@angular/core';
// import { Subject } from 'rxjs';

// interface SignalMessage {
//   type: 'offer' | 'answer' | 'candidate' | 'join' | 'joined' | 'room-exists';
//   payload?: any;
// }

// @Injectable({
//   providedIn: 'root',
// })
  
// export class SignalingService {
//   private socket: WebSocket;
//   private messageSubject = new Subject<SignalMessage>();

//   constructor() {
//     // Replace with your actual signaling server URL (WebSocket)
//     this.socket = new WebSocket('ws://your-signaling-server.com');

//     this.socket.onmessage = (event) => {
//       const data: SignalMessage = JSON.parse(event.data);
//       this.messageSubject.next(data);
//     };
//   }

//   public messages$ = this.messageSubject.asObservable();

//   joinRoom(roomId: string) {
//     const msg: SignalMessage = { type: 'join', payload: { roomId } };
//     this.socket.send(JSON.stringify(msg));
//   }

//   sendOffer(offer: RTCSessionDescriptionInit, roomId: string) {
//     const msg: SignalMessage = { type: 'offer', payload: { offer, roomId } };
//     this.socket.send(JSON.stringify(msg));
//   }

//   sendAnswer(answer: RTCSessionDescriptionInit, roomId: string) {
//     const msg: SignalMessage = { type: 'answer', payload: { answer, roomId } };
//     this.socket.send(JSON.stringify(msg));
//   }

//   sendCandidate(candidate: RTCIceCandidate, roomId: string) {
//     const msg: SignalMessage = { type: 'candidate', payload: { candidate, roomId } };
//     this.socket.send(JSON.stringify(msg));
//   }
// }

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

interface SignalMessage {
  type: 'offer' | 'answer' | 'candidate' | 'join' | 'joined' | 'room-exists';
  payload?: any;
}

@Injectable({ providedIn: 'root' })
export class SignalingService {
  private socket!: WebSocket;
  private messageSubject = new Subject<SignalMessage>();
  messages$ = this.messageSubject.asObservable();
  private isOpen = false;

  connect(roomId: string) {
    this.socket = new WebSocket(`ws://localhost:8080?roomId=${roomId}`);
    this.socket.onopen = () => {
      this.isOpen = true;
      this.joinRoom(roomId);
    };
    this.socket.onmessage = async (event) => {
      let messageData: string;

      if (event.data instanceof Blob) {
        messageData = await event.data.text(); // Convert Blob to text
      } else {
        messageData = event.data; // Already a string
      }

      const data: SignalMessage = JSON.parse(messageData);
      this.messageSubject.next(data);
    };
  }

  joinRoom(roomId: string) {
    if (this.isOpen) {
      const msg: SignalMessage = { type: 'join', payload: { roomId } };
      this.socket.send(JSON.stringify(msg));
    }
  }

  sendOffer(offer: RTCSessionDescriptionInit, roomId: string) {
    if (this.isOpen) {
      const msg: SignalMessage = { type: 'offer', payload: { offer, roomId } };
      this.socket.send(JSON.stringify(msg));
    }
  }

  sendAnswer(answer: RTCSessionDescriptionInit, roomId: string) {
    if (this.isOpen) {
      const msg: SignalMessage = { type: 'answer', payload: { answer, roomId } };
      this.socket.send(JSON.stringify(msg));
    }
  }

  sendCandidate(candidate: RTCIceCandidate, roomId: string) {
    if (this.isOpen) {
      const msg: SignalMessage = { type: 'candidate', payload: { candidate, roomId } };
      this.socket.send(JSON.stringify(msg));
    }
  }
}
