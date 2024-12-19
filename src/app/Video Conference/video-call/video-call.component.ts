import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-video-call',
  standalone: false,
  templateUrl: './video-call.component.html',
  styleUrl: './video-call.component.scss'
})
  
export class VideoCallComponent {
  localStream!: MediaStream;
  remoteStream!: MediaStream;
  peerConnection!: RTCPeerConnection;
  signalingServer!: WebSocket;
  roomId!: string;

  iceServers = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('roomId')!; // Retrieve the roomId
    if (this.roomId) {
      this.initializeSignalingServer();
      this.getMedia();
    }
  }

  initializeSignalingServer() {
    // this.signalingServer = new WebSocket('ws://localhost:8080');
    // this.signalingServer.onmessage = (event) => this.handleSignalingMessage(event.data);
    // this.signalingServer = new WebSocket('ws://localhost:8080');
    this.signalingServer = new WebSocket(`ws://localhost:8080?roomId=${this.roomId}`);

    this.signalingServer.onopen = () => {
      console.log('WebSocket connected');
    };

    this.signalingServer.onmessage = (event) => this.handleSignalingMessage(event.data);

    this.signalingServer.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.signalingServer.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  async getMedia() {
    try {
      console.log('Accessing media devices...');
      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
      localVideo.srcObject = this.localStream;

      this.setupPeerConnection();
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  }

  // setupPeerConnection() {
  //   console.log('Setting up peer connection...');
  //   this.peerConnection = new RTCPeerConnection(this.iceServers);

  //   this.localStream.getTracks().forEach((track) => {
  //     console.log('Adding track:', track);
  //     this.peerConnection.addTrack(track, this.localStream);
  //   });

  //   this.peerConnection.ontrack = (event) => {
  //     console.log('Remote stream received');
  //     if (!this.remoteStream) {
  //       this.remoteStream = new MediaStream();
  //     }
  //     this.remoteStream.addTrack(event.track);
  //   };

  //   this.peerConnection.onicecandidate = (event) => {
  //     if (event.candidate) {
  //       console.log('Sending ICE candidate:', event.candidate);
  //       this.signalingServer.send(
  //         JSON.stringify({ type: 'candidate', candidate: event.candidate })
  //       );
  //     }
  //   };
  // }
  setupPeerConnection() {
    console.log('Setting up peer connection...');
    this.peerConnection = new RTCPeerConnection(this.iceServers);

    // Add local stream tracks to the peer connection
    this.localStream.getTracks().forEach((track) => {
      console.log('Adding track:', track);
      this.peerConnection.addTrack(track, this.localStream);
    });

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('Remote stream received');
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
        const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
        remoteVideo.srcObject = this.remoteStream;
      }
      this.remoteStream.addTrack(event.track);
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate:', event.candidate);
        this.signalingServer.send(
          JSON.stringify({ type: 'candidate', candidate: event.candidate })
        );
      }
    };

    // Log connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state: ${this.peerConnection.connectionState}`);
    };
  }


  async createOffer() {
    console.log('Creating offer...');
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    this.signalingServer.send(
      JSON.stringify({ type: 'offer', sdp: this.peerConnection.localDescription })
    );
  }


  async handleSignalingMessage(message: string) {
    const data = JSON.parse(message);

    if (data.type === 'offer') {
      console.log('Received offer');
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      this.signalingServer.send(
        JSON.stringify({ type: 'answer', sdp: this.peerConnection.localDescription })
      );
    } else if (data.type === 'answer') {
      console.log('Received answer');
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
    } else if (data.type === 'candidate') {
      console.log('Received ICE candidate:', data.candidate);
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (error) {
        console.error('Error adding received ICE candidate:', error);
      }
    }
  }
}
