import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const T = {
  text:   '#F1F5F9',
  muted:  '#94A3B8',
  dim:    '#475569',
  bSub:   'rgba(255,255,255,0.06)',
  accent: '#F59E0B',
};

const MEDALS = ['🥇','🥈','🥉','4️⃣','5️⃣'];
const RANK_GLOWS = [
  '0 0 12px rgba(245,158,11,0.5)',
  '0 0 10px rgba(148,163,184,0.3)',
  '0 0 10px rgba(180,119,76,0.3)',
  'none', 'none',
];

export default function RoomLeaderboard({ socket, roomId, isDark }) {
  const { user } = useAuth();
  const [board, setBoard] = useState({});

  useEffect(() => {
    if (!socket) return;
    socket.on('room_message', (msg) => {
      setBoard(prev => ({
        ...prev,
        [msg.senderId]: {
          name: msg.sender,
          xp: (prev[msg.senderId]?.xp || 0) + 5,
        }
      }));
    });
    socket.on('leaderboard:update', (data) => setBoard(data));
    socket.on('hand:raise', (data) => {
      setBoard(prev => ({
        ...prev,
        [data.userId]: { ...prev[data.userId], name: data.name, xp: (prev[data.userId]?.xp || 0) + 10 }
      }));
    });
    socket.on('poll:vote', (data) => {
      if (data.userId === user?._id) {
        setBoard(prev => ({
          ...prev,
          [user._id]: { ...prev[user._id], name: user.name, xp: (prev[user._id]?.xp || 0) + 15 }
        }));
      }
    });
  }, [socket, user]);

  const sorted = Object.entries(board)
    .map(([id, d]) => ({ id, ...d }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 5);

  const maxXP = sorted[0]?.xp || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: T.accent, boxShadow: `0 0 8px ${T.accent}`,
        }} />
        <span style={{ fontSize: 10, fontWeight: 800, color: T.accent, textTransform: 'uppercase', letterSpacing: 0.8 }}>
          Session XP Board
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          <TrendingUp size={11} color={T.accent} />
          <span style={{ fontSize: 10, color: T.dim, fontWeight: 600 }}>Live</span>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div style={{
          padding: '16px', textAlign: 'center',
          background: 'rgba(245,158,11,0.04)',
          border: '1px dashed rgba(245,158,11,0.15)',
          borderRadius: 10,
        }}>
          <Zap size={20} color="rgba(245,158,11,0.3)" style={{ marginBottom: 6 }} />
          <p style={{ fontSize: 11, color: T.dim, margin: 0 }}>
            Chat, vote & raise hands to earn XP!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <AnimatePresence>
            {sorted.map((p, i) => {
              const isMe = p.id === user?._id;
              const barPct = (p.xp / maxXP) * 100;

              return (
                <motion.div
                  key={p.id} layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30, delay: i * 0.04 }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 10,
                    background: isMe ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isMe ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.06)'}`,
                    boxShadow: i === 0 ? RANK_GLOWS[0] : 'none',
                    display: 'flex', flexDirection: 'column', gap: 5,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, lineHeight: 1 }}>{MEDALS[i]}</span>
                    <span style={{
                      flex: 1, fontSize: 12, fontWeight: 700,
                      color: isMe ? T.accent : T.text,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {isMe ? `You (${p.name})` : p.name}
                    </span>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 3,
                      padding: '2px 7px', borderRadius: 6,
                      background: 'rgba(245,158,11,0.15)',
                      border: '1px solid rgba(245,158,11,0.25)',
                    }}>
                      <Zap size={9} color={T.accent} />
                      <span style={{ fontSize: 10, fontWeight: 800, color: T.accent }}>
                        {p.xp} XP
                      </span>
                    </div>
                  </div>

                  {/* XP bar */}
                  <div style={{
                    height: 4, borderRadius: 2,
                    background: 'rgba(255,255,255,0.05)',
                    overflow: 'hidden',
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barPct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      style={{
                        height: '100%',
                        background: i === 0
                          ? 'linear-gradient(90deg, #F59E0B, #FCD34D)'
                          : i === 1
                          ? 'linear-gradient(90deg, #94A3B8, #CBD5E1)'
                          : 'linear-gradient(90deg, #6366F1, #818CF8)',
                        borderRadius: 2,
                        boxShadow: i === 0 ? '0 0 8px rgba(245,158,11,0.5)' : 'none',
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
