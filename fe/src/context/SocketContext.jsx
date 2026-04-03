import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001', {
            withCredentials: true
        });
        setSocket(newSocket);

        newSocket.emit('setup', user._id);

        newSocket.on('notification', (data) => {
            toast(data.message, {
                icon: '🔔',
                style: { borderRadius: '10px', background: '#333', color: '#fff' },
            });
        });

        newSocket.on('message_received', (message) => {
            if (!window.location.pathname.includes('/messages')) {
                const senderName = message.sender?.name || 'a connection';
                toast(`New message from ${senderName}`, {
                    icon: '💬',
                    style: { borderRadius: '10px', background: '#333', color: '#fff' },
                });
            }
        });

        newSocket.on('quest_completed', (data) => {
            toast.success(`🎉 Quest Completed: ${data.questName}\n+${data.xp} XP!`, {
                duration: 5000,
                style: { borderRadius: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', fontWeight: 'bold', padding: '16px' },
            });
        });

        // SOS Beacon System
        newSocket.on('incoming_sos', (payload) => {
            toast((t) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#ef4444' }}>🚨 SOS Beacon: {payload.subject}</div>
                    <div style={{ fontSize: '0.85rem' }}><b>{payload.userName}</b> is stuck on: <i>{payload.topic}</i></div>
                    <button 
                        onClick={() => {
                            newSocket.emit('accept_sos', { callerId: payload.userId, helperName: user.name });
                            toast.dismiss(t.id);
                        }}
                        style={{ background: '#ef4444', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 800, marginTop: '4px' }}
                    >
                        Accept & Help
                    </button>
                </div>
            ), {
                duration: 15000,
                style: { border: '2px solid #ef4444', backgroundColor: '#fff0f0' } // simple fallback inline styling
            });
        });

        newSocket.on('sos_accepted', ({ roomId, helperName }) => {
            toast.success(`${helperName || 'An expert'} accepted your SOS! Routing...`, {
                duration: 4000, icon: '🚀'
            });
            setTimeout(() => {
                window.location.href = `/live?room=${roomId}`;
            }, 1500);
        });

        return () => {
            newSocket.off('notification');
            newSocket.off('message_received');
            newSocket.off('quest_completed');
            newSocket.disconnect();
            setSocket(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
