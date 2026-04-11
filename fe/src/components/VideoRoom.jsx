import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, MessageSquare, PhoneOff, MonitorUp } from 'lucide-react';
import { Box, IconButton, Typography } from '@mui/material';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" },
    { urls: "turn:openrelay.metered.ca:443", username: "openrelayproject", credential: "openrelayproject" },
    { urls: "turn:openrelay.metered.ca:443?transport=tcp", username: "openrelayproject", credential: "openrelayproject" }
  ]
};

export default function VideoRoom({ roomId, socket, onTogglePanel, showPanel }) {
  const localVideoRef = useRef();
  const remoteVideoesRef = useRef({});
  const peerConnections = useRef({});
  
  const [stream, setStream] = useState(null);
  const [peers, setPeers] = useState([]);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  useEffect(() => {
    if (!socket) return;
    let localStream = null;

    function createPeer(userToSignal, callerID, currentStream) {
      const peer = new RTCPeerConnection(ICE_SERVERS);
      currentStream.getTracks().forEach(track => peer.addTrack(track, currentStream));
      peer.onicecandidate = (e) => {
        if (e.candidate && socket) socket.emit('webrtc_signal', { to: userToSignal, signal: e.candidate });
      };
      peer.ontrack = (e) => {
         const remoteStream = e.streams[0];
         if (remoteVideoesRef.current[userToSignal]) remoteVideoesRef.current[userToSignal].srcObject = remoteStream;
      };
      peer.createOffer().then(offer => {
        peer.setLocalDescription(offer);
        if (socket) socket.emit('webrtc_signal', { to: userToSignal, signal: offer });
      });
      return peer;
    }

    function addPeer(incomingSignal, callerID, currentStream) {
      const peer = new RTCPeerConnection(ICE_SERVERS);
      currentStream.getTracks().forEach(track => peer.addTrack(track, currentStream));
      peer.onicecandidate = (e) => {
        if (e.candidate && socket) socket.emit('webrtc_signal', { to: callerID, signal: e.candidate });
      };
      peer.ontrack = (e) => {
         const remoteStream = e.streams[0];
         if (remoteVideoesRef.current[callerID]) remoteVideoesRef.current[callerID].srcObject = remoteStream;
      };
      peer.setRemoteDescription(new RTCSessionDescription(incomingSignal)).then(() => peer.createAnswer()).then(answer => {
        peer.setLocalDescription(answer);
        if (socket) socket.emit('webrtc_signal', { to: callerID, signal: answer });
      });
      return peer;
    }

    // 1. Get local media
    navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
      },
    })
      .then((currentStream) => {
        localStream = currentStream;
        setStream(currentStream);
        if (localVideoRef.current) localVideoRef.current.srcObject = currentStream;

        // Signal that WE are ready to receive connections securely
        socket.emit('ready_for_webrtc', { roomId });

        const onUserReady = (socketId) => {
          const peer = createPeer(socketId, socket.id, currentStream);
          peerConnections.current[socketId] = peer;
          setPeers(prev => [...prev, socketId]);
        };

        const onWebrtcSignal = ({ signal, from }) => {
          let peer = peerConnections.current[from];
          if (!peer) {
            peer = addPeer(signal, from, currentStream);
            peerConnections.current[from] = peer;
            setPeers(prev => [...prev, from]);
          } else {
            if (signal.type) peer.setRemoteDescription(new RTCSessionDescription(signal));
            else if (signal.candidate) peer.addIceCandidate(new RTCIceCandidate(signal));
          }
        };

        socket.on('user_ready_for_webrtc', onUserReady);
        socket.on('webrtc_signal', onWebrtcSignal);
      })
      .catch((err) => {
        console.error("Local stream error", err);
      });

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      Object.values(peerConnections.current).forEach(peer => peer.close());
      // eslint-disable-next-line react-hooks/exhaustive-deps
      peerConnections.current = {};
    };
  }, [roomId, socket]);

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !micOn;
      setMicOn(!micOn);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !videoOn;
      setVideoOn(!videoOn);
    }
  };

  return (
    <Box className="flex flex-col items-center justify-center pointer-events-auto w-full h-full p-4 relative z-50">
      
      {/* Phase 2 FIX: CSS Grid layout for video tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl overflow-y-auto pb-32">
        {/* Local Video */}
        <Box sx={{ position: 'relative', aspectRatio: '16/9', width: '100%', bgcolor: '#111', borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <video playsInline muted ref={localVideoRef} autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
          <Box sx={{ position: 'absolute', bottom: 12, left: 12, bgcolor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'white', px: 1.5, py: 0.5, borderRadius: 1.5 }}>
            <Typography variant="caption" fontWeight={600} fontSize="0.75rem">You</Typography>
          </Box>
          {!videoOn && (
            <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <VideoOff size={32} color="rgba(255,255,255,0.5)" />
            </Box>
          )}
        </Box>

        {/* Remote Videos */}
        {peers.map((peerId) => (
          <Box key={peerId} sx={{ position: 'relative', aspectRatio: '16/9', width: '100%', bgcolor: '#111', borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <video playsInline autoPlay ref={el => { if(el) remoteVideoesRef.current[peerId] = el; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <Box sx={{ position: 'absolute', bottom: 12, left: 12, bgcolor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'white', px: 1.5, py: 0.5, borderRadius: 1.5 }}>
               <Typography variant="caption" fontWeight={600} fontSize="0.75rem">Peer</Typography>
            </Box>
          </Box>
        ))}
      </div>

      {/* Phase 2 FIX: Fixed control bar highly visible at the bottom */}
      <Box sx={{ 
        position: 'fixed', bottom: { xs: 24, md: 32 }, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 }, 
        background: 'rgba(15, 15, 15, 0.85)', backdropFilter: 'blur(16px)', 
        px: 3, py: 1.5, borderRadius: '99px', border: '1px solid rgba(255,255,255,0.1)', 
        boxShadow: '0 12px 40px rgba(0,0,0,0.6)', zIndex: 9999 
      }}>
        <IconButton onClick={toggleMic} sx={{ 
          bgcolor: micOn ? 'rgba(255,255,255,0.15)' : '#ef4444', color: 'white', 
          width: { xs: 44, md: 52 }, height: { xs: 44, md: 52 },
          '&:hover': { bgcolor: micOn ? 'rgba(255,255,255,0.25)' : '#dc2626' } 
        }}>
          {micOn ? <Mic size={24} /> : <MicOff size={24} />}
        </IconButton>
        
        <IconButton onClick={toggleVideo} sx={{ 
          bgcolor: videoOn ? 'rgba(255,255,255,0.15)' : '#ef4444', color: 'white', 
          width: { xs: 44, md: 52 }, height: { xs: 44, md: 52 },
          '&:hover': { bgcolor: videoOn ? 'rgba(255,255,255,0.25)' : '#dc2626' } 
        }}>
          {videoOn ? <Video size={24} /> : <VideoOff size={24} />}
        </IconButton>

        {/* Screen Share Placeholder (UI ONLY for Phase 2 spec) */}
        <IconButton sx={{ 
          bgcolor: 'rgba(255,255,255,0.15)', color: 'white', 
          width: { xs: 44, md: 52 }, height: { xs: 44, md: 52 },
          '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } 
        }}>
          <MonitorUp size={20} />
        </IconButton>
        
        <Box sx={{ width: '1px', height: 32, bgcolor: 'rgba(255,255,255,0.2)', mx: 1 }} />
        
        <IconButton onClick={onTogglePanel} sx={{ 
          color: 'white', bgcolor: showPanel ? 'rgba(59,130,246,0.3)' : 'transparent', 
          width: { xs: 44, md: 52 }, height: { xs: 44, md: 52 },
          '&:hover': { bgcolor: 'rgba(59,130,246,0.4)' } 
        }}>
          <MessageSquare size={24} />
        </IconButton>
        
        <IconButton onClick={() => window.location.href='/sessions'} sx={{ 
          bgcolor: '#ef4444', color: 'white', fontWeight: 700,
          '&:hover': { bgcolor: '#dc2626' }, ml: 1, px: { xs: 2.5, md: 3 }, py: { xs: 1, md: 1.5 }, borderRadius: '99px', fontSize: '1rem' 
        }}>
          <PhoneOff size={20} style={{ marginRight: 8 }} />
          Leave
        </IconButton>
      </Box>
    </Box>
  );
}

