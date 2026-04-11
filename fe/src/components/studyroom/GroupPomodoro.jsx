import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Coffee, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const FOCUS = 25 * 60;
const BREAK = 5 * 60;

const T = {
  primary: '#6366F1',
  accent:  '#22C55E',
  text:    '#F1F5F9',
  muted:   '#94A3B8',
  dim:     '#475569',
  bSub:    'rgba(255,255,255,0.06)',
};

export default function GroupPomodoro({ socket, roomId, session, isDark }) {
  const { user } = useAuth();
  const isHost = session?.host?._id === user?._id || session?.host === user?._id;

  const [timeLeft, setTimeLeft] = useState(FOCUS);
  const [running,  setRunning]  = useState(false);
  const [mode,     setMode]     = useState('focus');
  const intervalRef = useRef(null);

  const accent = mode === 'focus' ? T.primary : T.accent;
  const total  = mode === 'focus' ? FOCUS : BREAK;
  const pct    = (1 - timeLeft / total) * 100;
  const R = 38;
  const circumference = 2 * Math.PI * R;

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  useEffect(() => {
    if (!socket) return;
    const onSync = ({ timeLeft: t, running: r, mode: m }) => {
      setTimeLeft(t); setRunning(r); setMode(m);
    };
    const onTick = ({ timeLeft: t }) => setTimeLeft(t);
    socket.on('pomodoro:sync', onSync);
    socket.on('pomodoro:tick', onTick);
    return () => { socket.off('pomodoro:sync', onSync); socket.off('pomodoro:tick', onTick); };
  }, [socket]);

  useEffect(() => {
    if (!isHost) return;
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const next = prev - 1;
          socket?.emit('pomodoro:tick', { roomId, timeLeft: next });
          if (next <= 0) {
            clearInterval(intervalRef.current);
            const nextMode = mode === 'focus' ? 'break' : 'focus';
            const nextTime = nextMode === 'focus' ? FOCUS : BREAK;
            setMode(nextMode); setRunning(false); setTimeLeft(nextTime);
            socket?.emit('pomodoro:sync', { roomId, timeLeft: nextTime, running: false, mode: nextMode });
            try { new Audio('/bell.mp3').play(); } catch {}
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, isHost, mode, roomId, socket]);

  const broadcast = (newRunning, newMode = mode, newTime = timeLeft) => {
    socket?.emit('pomodoro:sync', { roomId, timeLeft: newTime, running: newRunning, mode: newMode });
  };

  const toggle = () => { const r = !running; setRunning(r); broadcast(r); };
  const reset  = () => {
    clearInterval(intervalRef.current);
    setRunning(false); setTimeLeft(FOCUS); setMode('focus');
    broadcast(false, 'focus', FOCUS);
  };

  const sessions = Math.floor((FOCUS - (mode === 'focus' ? timeLeft : 0)) / FOCUS * 4) || 0;

  return (
    <div style={{ padding: '12px 12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>

        {/* Ring timer */}
        <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
          <svg width={90} height={90} style={{ transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle cx={45} cy={45} r={R} fill="none"
              stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
            {/* Progress */}
            <motion.circle
              cx={45} cy={45} r={R}
              fill="none"
              stroke={accent}
              strokeWidth={7}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct / 100)}
              transition={{ duration: 0.8 }}
              style={{ filter: `drop-shadow(0 0 6px ${accent}88)` }}
            />
          </svg>

          {/* Center content */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 2,
          }}>
            {mode === 'focus'
              ? <Timer size={12} color={accent} />
              : <Coffee size={12} color={accent} />
            }
            <span style={{
              fontWeight: 900, fontSize: 15, color: T.text,
              fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5,
            }}>
              {fmt(timeLeft)}
            </span>
          </div>

          {/* Running pulse */}
          {running && (
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                position: 'absolute', inset: -4,
                borderRadius: '50%',
                border: `2px solid ${accent}`,
              }}
            />
          )}
        </div>

        {/* Right side: mode + controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Mode badge */}
          <div style={{
            padding: '4px 10px', borderRadius: 8,
            background: `${accent}15`, border: `1px solid ${accent}30`,
            fontSize: 10, fontWeight: 800, color: accent,
            textTransform: 'uppercase', letterSpacing: 0.8,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {mode === 'focus'
              ? <><Zap size={10} /> Focus Session</>
              : <><Coffee size={10} /> Break Time</>
            }
          </div>

          {isHost ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={toggle}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 14px', borderRadius: 9, cursor: 'pointer',
                  background: running ? 'rgba(245,158,11,0.15)' : `${accent}20`,
                  border: `1px solid ${running ? 'rgba(245,158,11,0.3)' : `${accent}35`}`,
                  color: running ? '#F59E0B' : accent,
                  fontSize: 12, fontWeight: 700,
                  boxShadow: running ? '0 4px 10px rgba(245,158,11,0.2)' : `0 4px 10px ${accent}25`,
                  transition: 'all 0.3s ease',
                }}
              >
                {running ? <Pause size={13} /> : <Play size={13} />}
                {running ? 'Pause' : 'Start'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={reset}
                style={{
                  width: 32, height: 32, borderRadius: 9, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <RotateCcw size={13} />
              </motion.button>
            </div>
          ) : (
            <div style={{
              fontSize: 10, color: T.dim, fontWeight: 600,
              padding: '4px 8px', borderRadius: 6,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              HOST CONTROLS ONLY
            </div>
          )}

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{
                width: i < sessions ? 14 : 6, height: 6,
                borderRadius: 3, transition: 'all 0.4s ease',
                background: i < sessions ? T.primary : 'rgba(255,255,255,0.1)',
              }} />
            ))}
            <span style={{ fontSize: 10, color: T.dim, marginLeft: 2, fontWeight: 600 }}>
              {sessions}/4
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
