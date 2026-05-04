/* eslint-disable */
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

function VideoCall({ onClose }) {
  const location = useLocation();
  
  const callInfo = location.state || {};
  const { callType, recipientId, recipientName } = callInfo;
  
  const currentUserId = localStorage.getItem('teams_user_id') ? parseInt(localStorage.getItem('teams_user_id')) : 0;
  const currentUserName = localStorage.getItem('teams_user_name') || 'User';
  
  // Video/Audio state
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // Call state
  const [inCall, setInCall] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');
  const [incomingCall, setIncomingCall] = useState(null);
  
  // Manual mode
  const [roomId, setRoomId] = useState('');
  const [joinId, setJoinId] = useState('');
  
  // WebSocket
  const [stompClient, setStompClient] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [peerConnection, setPeerConnection] = useState(null);
  
  // Chat
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const originalStreamRef = useRef(null);
  
  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // ========== LEAVE CALL ==========
  const leaveCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
    }
    if (stompClient && stompClient.active) {
      stompClient.deactivate();
    }
    setCallStatus('idle');
    setInCall(false);
    onClose(); // This returns to dashboard
  };

  // ========== TOGGLE MUTE ==========
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // ========== TOGGLE VIDEO ==========
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
      // Also update peer connection
      if (peerConnection) {
        const senders = peerConnection.getSenders();
        const videoSender = senders.find(s => s.track?.kind === 'video');
        if (videoSender && localStream.getVideoTracks()[0]) {
          videoSender.replaceTrack(localStream.getVideoTracks()[0]);
        }
      }
    }
  };

  // ========== SCREEN SHARING ==========
  const restoreCamera = () => {
    if (originalStreamRef.current) {
      setLocalStream(originalStreamRef.current);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = originalStreamRef.current;
      }
      if (peerConnection) {
        const senders = peerConnection.getSenders();
        const videoSender = senders.find(s => s.track?.kind === 'video');
        const newVideoTrack = originalStreamRef.current.getVideoTracks()[0];
        if (videoSender && newVideoTrack) {
          videoSender.replaceTrack(newVideoTrack);
        }
      }
    }
  };

  const shareScreen = async () => {
    try {
      if (!isScreenSharing) {
        // Start screen share
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        
        // Replace video track with screen share
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnection?.getSenders().find(s => s.track?.kind === 'video');
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
        
        // Update local video display
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        setLocalStream(screenStream);
        setIsScreenSharing(true);
        
        // When user stops screen sharing
        videoTrack.onended = () => {
          restoreCamera();
          setIsScreenSharing(false);
        };
      } else {
        // Stop screen share and restore camera
        restoreCamera();
        setIsScreenSharing(false);
      }
    } catch (err) {
      console.error('Screen share error:', err);
    }
  };

  // ========== CREATE PEER CONNECTION ==========
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(configuration);
    
    pc.onicecandidate = (event) => {
      if (event.candidate && stompClient && wsConnected) {
        const targetId = callStatus === 'calling' ? recipientId : incomingCall?.callerId;
        if (targetId) {
          stompClient.publish({
            destination: '/app/call.ice',
            body: JSON.stringify({
              targetUserId: targetId,
              candidate: event.candidate
            })
          });
        }
      }
    };
    
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
    
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }
    
    setPeerConnection(pc);
    return pc;
  };

  // ========== INITIATE CALL ==========
  const initiateCall = async () => {
    if (!recipientId) {
      alert('No recipient selected');
      return;
    }
    
    setCallStatus('calling');
    
    if (stompClient && wsConnected) {
      stompClient.publish({
        destination: '/app/call.request',
        body: JSON.stringify({
          calleeId: recipientId,
          callerId: currentUserId,
          callerName: currentUserName
        })
      });
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      originalStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCallStatus('idle');
      alert('Cannot access camera');
    }
  };

  // ========== HANDLE INCOMING CALL ==========
  const handleIncomingCallRequest = (data) => {
    if (callStatus !== 'idle') return;
    setIncomingCall({ callerId: data.callerId, callerName: data.callerName });
    setCallStatus('ringing');
  };

  // ========== ACCEPT CALL ==========
  const acceptCall = async () => {
    if (!incomingCall) return;
    
    setCallStatus('connecting');
    setInCall(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      originalStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      return;
    }
    
    const pc = createPeerConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    if (stompClient && wsConnected) {
      stompClient.publish({
        destination: '/app/call.offer',
        body: JSON.stringify({
          calleeId: incomingCall.callerId,
          callerId: currentUserId,
          callerName: currentUserName,
          offer: offer
        })
      });
      
      stompClient.publish({
        destination: '/app/call.response',
        body: JSON.stringify({
          callerId: incomingCall.callerId,
          accepted: true
        })
      });
    }
    
    setIncomingCall(null);
  };

  // ========== REJECT CALL ==========
  const rejectCall = () => {
    if (incomingCall && stompClient && wsConnected) {
      stompClient.publish({
        destination: '/app/call.response',
        body: JSON.stringify({
          callerId: incomingCall.callerId,
          accepted: false
        })
      });
    }
    setIncomingCall(null);
    setCallStatus('idle');
    leaveCall();
  };

  // ========== HANDLE CALL OFFER ==========
  const handleCallOffer = async (data) => {
    if (callStatus !== 'calling') return;
    
    const pc = peerConnection || createPeerConnection();
    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    if (stompClient && wsConnected) {
      stompClient.publish({
        destination: '/app/call.answer',
        body: JSON.stringify({
          callerId: recipientId,
          answer: answer
        })
      });
    }
  };

  // ========== HANDLE CALL ANSWER ==========
  const handleCallAnswer = async (data) => {
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
      setCallStatus('connected');
      setInCall(true);
    }
  };

  // ========== HANDLE ICE CANDIDATE ==========
  const handleIceCandidate = async (data) => {
    if (peerConnection && data.candidate) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (err) {
        console.error('ICE error:', err);
      }
    }
  };

  // ========== HANDLE CALL RESPONSE ==========
  const handleCallResponse = (data) => {
    if (data.accepted) {
      setCallStatus('connecting');
      const pc = createPeerConnection();
      (async () => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        if (stompClient && wsConnected) {
          stompClient.publish({
            destination: '/app/call.offer',
            body: JSON.stringify({
              calleeId: recipientId,
              callerId: currentUserId,
              callerName: currentUserName,
              offer: offer
            })
          });
        }
      })();
    } else {
      setCallStatus('idle');
      alert('Call rejected');
      leaveCall();
    }
  };

  // ========== SEND CHAT ==========
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, { text: newMessage, isMe: true }]);
    setNewMessage('');
  };

  // ========== MANUAL MODE ==========
  const createRoom = () => {
    const newId = Math.random().toString(36).substring(2, 10);
    setRoomId(newId);
    setInCall(true);
    setCallStatus('connected');
    
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
        originalStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch(err => alert('Cannot access camera'));
  };

  const joinRoom = () => {
    if (!joinId.trim()) {
      alert('Enter room ID');
      return;
    }
    setRoomId(joinId);
    setInCall(true);
    setCallStatus('connected');
    
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
        originalStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch(err => alert('Cannot access camera'));
  };

  // ========== WEBSOCKET SETUP ==========
  useEffect(() => {
    if (callType !== 'dm') return;
    
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8081/ws'),
      debug: (str) => {},
      reconnectDelay: 5000,
      onConnect: () => {
        setWsConnected(true);
        
        client.subscribe(`/user/queue/call.request`, (message) => {
          handleIncomingCallRequest(JSON.parse(message.body));
        });
        client.subscribe(`/user/queue/call.offer`, (message) => {
          handleCallOffer(JSON.parse(message.body));
        });
        client.subscribe(`/user/queue/call.answer`, (message) => {
          handleCallAnswer(JSON.parse(message.body));
        });
        client.subscribe(`/user/queue/call.ice`, (message) => {
          handleIceCandidate(JSON.parse(message.body));
        });
        client.subscribe(`/user/queue/call.response`, (message) => {
          handleCallResponse(JSON.parse(message.body));
        });
        
        if (callType === 'dm' && recipientId && callStatus === 'idle') {
          initiateCall();
        }
      },
      onStompError: (error) => console.error(error)
    });
    
    client.activate();
    setStompClient(client);
    
    return () => {
      if (client && client.active) {
        client.deactivate();
      }
    };
  }, [callType]);

  // ========== RENDER ==========
  
  // Incoming call modal
  if (incomingCall && callStatus === 'ringing') {
    return (
      <div style={styles.modal}>
        <div style={styles.incomingContainer}>
          <div style={styles.incomingIcon}>📞</div>
          <h2>Incoming Call</h2>
          <p style={styles.incomingName}>{incomingCall.callerName}</p>
          <div style={styles.incomingButtons}>
            <button onClick={acceptCall} style={styles.acceptBtn}>Accept</button>
            <button onClick={rejectCall} style={styles.rejectBtn}>Reject</button>
          </div>
        </div>
      </div>
    );
  }
  
  // Calling status
  if (callStatus === 'calling') {
    return (
      <div style={styles.modal}>
        <div style={styles.waitingContainer}>
          <div style={styles.ringingIcon}>📞🔔</div>
          <h2>Calling {recipientName || 'User'}...</h2>
          <button onClick={leaveCall} style={styles.cancelBtn}>Cancel</button>
        </div>
      </div>
    );
  }
  
  // Active call
  if (inCall && callStatus === 'connected') {
    return (
      <div style={styles.modal}>
        <div style={styles.container}>
          <div style={styles.videoArea}>
            <div style={styles.remoteVideoBox}>
              <video ref={remoteVideoRef} autoPlay playsInline style={styles.remoteVideo} />
              <div style={styles.remoteLabel}>{recipientName || 'Remote User'}</div>
            </div>
            <div style={styles.localVideoBox}>
              <video ref={localVideoRef} autoPlay muted playsInline style={styles.localVideo} />
              <div style={styles.localLabel}>You {isMuted ? '(Muted)' : ''}</div>
            </div>
            <div style={styles.controls}>
              <button onClick={toggleMute} style={styles.btn}>{isMuted ? '🔇' : '🎤'}</button>
              <button onClick={toggleVideo} style={styles.btn}>{isVideoOff ? '📹❌' : '📹'}</button>
              <button onClick={shareScreen} style={styles.btn}>{isScreenSharing ? '🖥️❌' : '🖥️'}</button>
              <button onClick={leaveCall} style={styles.leaveBtn}>Leave</button>
            </div>
          </div>
          <div style={styles.chatSidebar}>
            <div style={styles.chatHeader}>Chat</div>
            <div style={styles.chatMessages}>
              {messages.map((msg, i) => (
                <div key={i} style={msg.isMe ? styles.myMessage : styles.otherMessage}>
                  {msg.text}
                </div>
              ))}
            </div>
            <div style={styles.chatInput}>
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                style={styles.msgInput}
              />
              <button onClick={sendMessage} style={styles.sendBtn}>Send</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Manual mode (default)
  return (
    <div style={styles.modal}>
      <div style={styles.joinContainer}>
        <h2>Video Call</h2>
        <button onClick={createRoom} style={styles.greenBtn}>Create Meeting</button>
        <p>OR</p>
        <input
          type="text"
          placeholder="Room ID"
          value={joinId}
          onChange={(e) => setJoinId(e.target.value)}
          style={styles.input}
        />
        <button onClick={joinRoom} style={styles.blueBtn}>Join</button>
        <button onClick={leaveCall} style={styles.grayBtn}>Cancel</button>
      </div>
    </div>
  );
}

const styles = {
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 2000,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  joinContainer: {
    backgroundColor: '#1a1a1a', padding: '40px', borderRadius: '16px',
    textAlign: 'center', width: '350px', color: 'white'
  },
  greenBtn: {
    width: '100%', padding: '12px', backgroundColor: '#22c55e',
    color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '16px'
  },
  blueBtn: {
    width: '100%', padding: '12px', backgroundColor: '#667eea',
    color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '16px'
  },
  grayBtn: {
    width: '100%', padding: '12px', backgroundColor: '#555',
    color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '12px'
  },
  input: {
    width: '100%', padding: '12px', backgroundColor: '#333',
    border: '1px solid #555', borderRadius: '8px', color: 'white'
  },
  waitingContainer: {
    backgroundColor: '#1a1a1a', padding: '40px', borderRadius: '16px',
    textAlign: 'center', width: '350px', color: 'white'
  },
  ringingIcon: { fontSize: '48px', marginBottom: '20px' },
  cancelBtn: {
    padding: '12px 24px', backgroundColor: '#ef4444',
    color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px'
  },
  incomingContainer: {
    backgroundColor: '#1a1a1a', padding: '40px', borderRadius: '16px',
    textAlign: 'center', width: '350px', color: 'white'
  },
  incomingIcon: { fontSize: '48px', marginBottom: '20px' },
  incomingName: { fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#667eea' },
  incomingButtons: { display: 'flex', gap: '16px', justifyContent: 'center' },
  acceptBtn: {
    padding: '12px 24px', backgroundColor: '#22c55e',
    color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px'
  },
  rejectBtn: {
    padding: '12px 24px', backgroundColor: '#ef4444',
    color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px'
  },
  container: {
    display: 'flex', width: '90%', height: '80%',
    backgroundColor: '#1a1a1a', borderRadius: '12px', overflow: 'hidden'
  },
  videoArea: { flex: 3, display: 'flex', flexDirection: 'column', padding: '20px', position: 'relative' },
  remoteVideoBox: {
    flex: 1, backgroundColor: '#333', borderRadius: '8px',
    position: 'relative', overflow: 'hidden', marginBottom: '12px'
  },
  remoteVideo: { width: '100%', height: '100%', objectFit: 'cover' },
  remoteLabel: {
    position: 'absolute', bottom: '10px', left: '10px',
    backgroundColor: 'rgba(0,0,0,0.6)', color: 'white',
    padding: '4px 8px', borderRadius: '4px', fontSize: '12px'
  },
  localVideoBox: {
    position: 'absolute', bottom: '30px', right: '30px',
    width: '200px', height: '150px', backgroundColor: '#333',
    borderRadius: '8px', overflow: 'hidden', border: '2px solid #667eea'
  },
  localVideo: { width: '100%', height: '100%', objectFit: 'cover' },
  localLabel: {
    position: 'absolute', bottom: '5px', left: '5px',
    backgroundColor: 'rgba(0,0,0,0.6)', color: 'white',
    padding: '2px 6px', borderRadius: '4px', fontSize: '10px'
  },
  controls: { display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px' },
  btn: {
    width: '48px', height: '48px', borderRadius: '50%',
    backgroundColor: '#3d3d3d', color: 'white', border: 'none', fontSize: '20px', cursor: 'pointer'
  },
  leaveBtn: {
    width: '48px', height: '48px', borderRadius: '50%',
    backgroundColor: '#ef4444', color: 'white', border: 'none', fontSize: '20px', cursor: 'pointer'
  },
  chatSidebar: {
    width: '280px', backgroundColor: '#2d2d2d', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #444'
  },
  chatHeader: {
    padding: '16px', borderBottom: '1px solid #444', color: 'white', fontWeight: 'bold'
  },
  chatMessages: {
    flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px'
  },
  myMessage: {
    backgroundColor: '#667eea', color: 'white', padding: '8px 12px', borderRadius: '12px', maxWidth: '80%', alignSelf: 'flex-end'
  },
  otherMessage: {
    backgroundColor: '#444', color: 'white', padding: '8px 12px', borderRadius: '12px', maxWidth: '80%', alignSelf: 'flex-start'
  },
  chatInput: {
    padding: '16px', borderTop: '1px solid #444', display: 'flex', gap: '8px'
  },
  msgInput: {
    flex: 1, padding: '8px', borderRadius: '8px', border: 'none', outline: 'none', backgroundColor: '#444', color: 'white'
  },
  sendBtn: {
    padding: '8px 16px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'
  }
};

export default VideoCall;