import { useState, useEffect } from 'react';
import { Hand, X, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const T = {
  text:   '#F1F5F9',
  muted:  '#94A3B8',
  dim:    '#475569',
  accent: '#F59E0B',
  green:  '#22C55E',
  red:    '#ef4444',
};

export default function RaiseHand({ socket, roomId, session, isDark }) {
  const { user } = useAuth();
  const isHost = session?.host?._id === user?._id || session?.host === user?._id;
  const [queue, setQueue]     = useState([]);
  const [myHandUp, setMyHandUp] = useState(false);

  useEffect(() => {
    if (!socket) return;
    const onRaise = (data) =>
      setQueue(prev => prev.find(p => p.userId === data.userId) ? prev : [...prev, data]);
    const onLower = ({ userId }) => {
      setQueue(prev => prev.filter(p => p.userId !== userId));
      if (userId === user?._id) setMyHandUp(false);
    };
    const onSync = ({ queue: q }) => setQueue(q);
    socket.on('hand:raise', onRaise);
    socket.on('hand:lower', onLower);
    socket.on('hand:sync', onSync);
    return () => {
      socket.off('hand:raise', onRaise);
      socket.off('hand:lower', onLower);
      socket.off('hand:sync', onSync);
    };
  }, [socket, user]);

  const toggle = () => {
    if (myHandUp) {
      socket?.emit('hand:lower', { roomId, userId: user._id });
      setMyHandUp(false);
    } else {
      const data = { roomId, userId: user._id, name: user.name, avatar: user.avatar };
      socket?.emit('hand:raise', data);
      setMyHandUp(true);
    }
  };

  const dismiss = (userId) => socket?.emit('hand:lower', { roomId, userId });

  return (
    <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Toggle row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: T.muted }}>
            {queue.length === 0 ? 'No hands raised' : `${queue.length} hand${queue.length > 1 ? 's' : ''} raised`}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={toggle}
          animate={myHandUp ? { rotate: [-8, 8, -8] } : { rotate: 0 }}
          transition={myHandUp ? { repeat: Infinity, duration: 0.5 } : {}}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 9, cursor: 'pointer',
            background: myHandUp ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${myHandUp ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}`,
            color: myHandUp ? T.accent : T.muted,
            fontSize: 12, fontWeight: 700,
            boxShadow: myHandUp ? '0 4px 12px rgba(245,158,11,0.25)' : 'none',
            transition: 'all 0.3s ease',
          }}
        >
          <Hand size={13} />
          {myHandUp ? 'Lower Hand' : 'Raise Hand'}
        </motion.button>
      </div>

      {/* Queue */}
      <AnimatePresence>
        {queue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden' }}
          >
            {queue.map((p, i) => (
              <motion.div
                key={p.userId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '6px 8px', borderRadius: 8,
                  background: 'rgba(245,158,11,0.06)',
                  border: '1px solid rgba(245,158,11,0.15)',
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 800, color: T.accent, minWidth: 18 }}>
                  #{i + 1}
                </span>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: `linear-gradient(135deg, #F59E0B88, #F59E0B)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800, color: '#fff',
                }}>
                  {(p.name?.[0] || '?').toUpperCase()}
                </div>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.userId === user?._id ? 'You' : p.name}
                </span>
                {isHost && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => dismiss(p.userId)}
                      style={{
                        width: 24, height: 24, borderRadius: 6, cursor: 'pointer',
                        background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)',
                        color: T.green, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Volume2 size={11} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => dismiss(p.userId)}
                      style={{
                        width: 24, height: 24, borderRadius: 6, cursor: 'pointer',
                        background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)',
                        color: T.red, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <X size={11} />
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
