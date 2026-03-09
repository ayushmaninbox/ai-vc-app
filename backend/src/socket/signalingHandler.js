const Call = require('../models/Call');
const SignClassifier = require('../utils/signClassifier');
const GeminiUtility = require('../utils/gemini');

// Track active rooms: roomId -> { socketId -> userId }
const rooms = new Map();

// Helper to handle stability detection
const SIGN_THROTTLE_MS = 100; // Sample every 100ms
const SIGN_STABILITY_THRESHOLD_MS = 300; // Hold for 300ms to confirm

const initSocketHandlers = (io) => {
    // JWT-lite verification for socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Authentication required'));
        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            socket.userId = decoded.id;
            next();
        } catch {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id} (user: ${socket.userId})`);
        
        // Initialize buffering state for this socket
        socket.signWordBuffer = [];
        
        // Stability state
        socket.currentCandidateSign = null;
        socket.candidateStartTime = 0;
        socket.isCandidateConfirmed = false;

        // Join a call room
        socket.on('join-room', async ({ roomId }) => {
            socket.join(roomId);

            if (!rooms.has(roomId)) rooms.set(roomId, new Map());
            rooms.get(roomId).set(socket.id, socket.userId);

            // Notify others in the room
            socket.to(roomId).emit('user-joined', {
                socketId: socket.id,
                userId: socket.userId,
            });

            // Update call record
            try {
                const call = await Call.findOne({ roomId });
                if (call && call.status === 'waiting') {
                    call.status = 'active';
                    call.startedAt = new Date();
                    const alreadyIn = call.participants.some(
                        (p) => p.user?.toString() === socket.userId
                    );
                    if (!alreadyIn) {
                        call.participants.push({ user: socket.userId });
                    }
                    await call.save();
                }
            } catch (err) {
                console.error('Socket join-room DB error:', err.message);
            }

            const roomParticipants = rooms.get(roomId)
                ? [...rooms.get(roomId).entries()].map(([sid, uid]) => ({ socketId: sid, userId: uid }))
                : [];
            socket.emit('room-users', roomParticipants);
        });

        // WebRTC Offer/Answer/ICE relay
        socket.on('offer', ({ to, offer }) => io.to(to).emit('offer', { from: socket.id, offer }));
        socket.on('answer', ({ to, answer }) => io.to(to).emit('answer', { from: socket.id, answer }));
        socket.on('ice-candidate', ({ to, candidate }) => io.to(to).emit('ice-candidate', { from: socket.id, candidate }));

        // Speech-to-text caption
        socket.on('speech-caption', ({ roomId, text }) => {
            socket.to(roomId).emit('speech-caption', { text, from: socket.userId });
        });

        // Hand landmarks from deaf user → stability logic
        socket.on('hand-landmarks', ({ roomId, landmarks }) => {
            if (!landmarks || landmarks.length === 0) {
                // Clear candidate if hands are gone
                socket.currentCandidateSign = null;
                socket.candidateStartTime = 0;
                socket.isCandidateConfirmed = false;
                // Notify frontend to clear any "thinking" preview
                io.to(roomId).emit('sign-caption', { 
                    text: '', 
                    isFramed: false, 
                    isThinking: true, 
                    from: socket.userId,
                    buffer: socket.signWordBuffer
                });
                return;
            }
            
            const now = Date.now();
            if (!socket.lastSignSampleAt || now - socket.lastSignSampleAt > SIGN_THROTTLE_MS) {
                socket.lastSignSampleAt = now;
                
                const detectedSign = SignClassifier.classify(landmarks[0]);
                
                // If we detected a sign
                if (detectedSign) {
                    // Is this the same as the one we are currently "holding"?
                    if (detectedSign === socket.currentCandidateSign) {
                        const holdDuration = now - socket.candidateStartTime;
                        
                        // If held long enough and not already confirmed for this specific hold
                        if (holdDuration >= SIGN_STABILITY_THRESHOLD_MS && !socket.isCandidateConfirmed) {
                            socket.isCandidateConfirmed = true;
                            
                            // Add to buffer if it's not the same as the *last* confirmed word
                            const lastConfirmed = socket.signWordBuffer[socket.signWordBuffer.length - 1];
                            if (detectedSign !== lastConfirmed) {
                                socket.signWordBuffer.push(detectedSign);
                                console.log(`✅ Stability Confirmed: "${detectedSign}" for user ${socket.id}`);
                            }
                            
                            // Emit FULL update (buffer + confirmation)
                            io.to(roomId).emit('sign-caption', { 
                                text: detectedSign, 
                                isFramed: false,
                                from: socket.userId,
                                buffer: socket.signWordBuffer
                            });
                        }
                    } else {
                        // Different sign detected, start a new hold check
                        socket.currentCandidateSign = detectedSign;
                        socket.candidateStartTime = now;
                        socket.isCandidateConfirmed = false;
                        
                        // Emit a "thinking/live" update (buffer stays same, but text shows preview)
                        io.to(roomId).emit('sign-caption', { 
                            text: detectedSign, 
                            isFramed: false, 
                            isThinking: true, // Internal flag for preview
                            from: socket.userId,
                            buffer: socket.signWordBuffer
                        });
                    }
                } else {
                    // No sign detected by classifier, clear hold
                    socket.currentCandidateSign = null;
                    socket.candidateStartTime = 0;
                    socket.isCandidateConfirmed = false;
                }
            }
        });

        // Manual trigger to frame the current buffer
        socket.on('frame-buffer', async ({ roomId }) => {
            try {
                if (socket.signWordBuffer && socket.signWordBuffer.length > 0) {
                    const words = [...socket.signWordBuffer];
                    socket.signWordBuffer = []; // Clear buffer
                    
                    console.log(`🧠 Gemini: Manual framing for [${words.join(', ')}]`);
                    const framedSentence = await GeminiUtility.frameSentence(words);
                    
                    if (framedSentence) {
                        io.to(roomId).emit('sign-caption', { 
                            text: framedSentence, 
                            isFramed: true,
                            from: socket.userId,
                            buffer: [] 
                        });
                    }
                }
            } catch (err) {
                console.error('❌ Error in frame-buffer handler:', err.message);
                // On error, we could optionally restore the buffer, but clearing it is safer to prevent loops
            }
        });

        // Sign language caption relay
        socket.on('sign-caption', ({ roomId, text, confidence, isFramed }) => {
            socket.to(roomId).emit('sign-caption', { text, confidence, isFramed, from: socket.userId });
        });

        // Handle disconnect
        socket.on('disconnect', async () => {
            console.log(`❌ Socket disconnected: ${socket.id}`);
            socket.signWordBuffer = [];
            
            for (const [roomId, participants] of rooms.entries()) {
                if (participants.has(socket.id)) {
                    participants.delete(socket.id);
                    socket.to(roomId).emit('user-left', { socketId: socket.id, userId: socket.userId });

                    if (participants.size === 0) {
                        rooms.delete(roomId);
                        try {
                            const call = await Call.findOne({ roomId });
                            if (call && call.status !== 'ended') {
                                call.status = 'ended';
                                call.endedAt = new Date();
                                if (call.startedAt) {
                                    call.duration = Math.floor((call.endedAt - call.startedAt) / 1000);
                                }
                                await call.save();
                            }
                        } catch (err) {
                            console.error('Socket disconnect DB error:', err.message);
                        }
                    }
                    break;
                }
            }
        });
    });
};

module.exports = { initSocketHandlers };
