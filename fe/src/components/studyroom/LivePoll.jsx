import { useState, useEffect } from 'react';
import { BarChart2, Plus, Trash2, Send, X, Vote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const T = {
  primary: '#6366F1',
  text:    '#F1F5F9',
  muted:   '#94A3B8',
  dim:     '#475569',
  bSub:    'rgba(255,255,255,0.06)',
  accent:  '#8B5CF6',
};

export default function LivePoll({ socket, roomId, session, isDark }) {
  const { user } = useAuth();
  const isHost = session?.host?._id === user?._id || session?.host === user?._id;

  const [poll, setPoll]     = useState(null);
  const [voted, setVoted]   = useState(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft]   = useState({ question: '', options: ['', ''] });

  useEffect(() => {
    if (!socket) return;
    const onNew  = (p) => { setPoll(p); setVoted(null); };
    const onVote = (p) => setPoll(p);
    const onEnd  = ()  => setPoll(null);
    socket.on('poll:new',    onNew);
    socket.on('poll:update', onVote);
    socket.on('poll:end',    onEnd);
    return () => {
      socket.off('poll:new', onNew);
      socket.off('poll:update', onVote);
      socket.off('poll:end', onEnd);
    };
  }, [socket]);

  const launch = () => {
    if (!draft.question.trim() || draft.options.filter(o => o.trim()).length < 2) return;
    const newPoll = {
      question: draft.question,
      options: draft.options.filter(o => o.trim()).map(t => ({ text: t, votes: 0, voters: [] })),
    };
    socket?.emit('poll:create', { roomId, poll: newPoll });
    setCreating(false);
    setDraft({ question: '', options: ['', ''] });
  };

  const vote = (idx) => {
    if (voted !== null) return;
    setVoted(idx);
    socket?.emit('poll:vote', { roomId, optionIndex: idx, userId: user._id });
  };

  const endPoll = () => { socket?.emit('poll:end', { roomId }); setPoll(null); };

  const totalVotes = poll?.options.reduce((s, o) => s + o.votes, 0) || 0;
  const optionColors = ['#6366F1','#22C55E','#F59E0B','#EC4899'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: T.accent, boxShadow: `0 0 8px ${T.accent}80`,
        }} />
        <span style={{ fontSize: 10, fontWeight: 800, color: T.accent, textTransform: 'uppercase', letterSpacing: 0.8 }}>
          Live Poll
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 5 }}>
          {isHost && !poll && (
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setCreating(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 9px', borderRadius: 7,
                background: creating ? `${T.accent}25` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${creating ? `${T.accent}40` : 'rgba(255,255,255,0.08)'}`,
                color: creating ? T.accent : T.muted,
                fontSize: 10, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {creating ? <X size={10} /> : <Plus size={10} />}
              {creating ? 'Cancel' : 'New Poll'}
            </motion.button>
          )}
          {isHost && poll && (
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={endPoll}
              style={{
                padding: '3px 9px', borderRadius: 7, cursor: 'pointer',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#ef4444', fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <X size={10} /> End Poll
            </motion.button>
          )}
        </div>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 7,
              padding: '10px', borderRadius: 10,
              background: 'rgba(139,92,246,0.06)',
              border: '1px solid rgba(139,92,246,0.2)',
            }}>
              <input
                placeholder="Poll question…"
                value={draft.question}
                onChange={e => setDraft(d => ({ ...d, question: e.target.value }))}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, padding: '7px 10px',
                  color: T.text, fontSize: 12, outline: 'none',
                  fontFamily: 'inherit',
                }}
                onFocus={e => e.target.style.borderColor = `${T.accent}60`}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              {draft.options.map((opt, i) => (
                <div key={i} style={{ display: 'flex', gap: 5 }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                    background: optionColors[i % optionColors.length],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, fontWeight: 800, color: '#fff', marginTop: 8,
                  }}>
                    {i + 1}
                  </div>
                  <input
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={e => { const o = [...draft.options]; o[i] = e.target.value; setDraft(d => ({ ...d, options: o })); }}
                    style={{
                      flex: 1, background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 7, padding: '6px 10px',
                      color: T.text, fontSize: 11, outline: 'none', fontFamily: 'inherit',
                    }}
                    onFocus={e => e.target.style.borderColor = `${optionColors[i % optionColors.length]}50`}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                  {draft.options.length > 2 && (
                    <button
                      onClick={() => setDraft(d => ({ ...d, options: d.options.filter((_, j) => j !== i) }))}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {draft.options.length < 4 ? (
                  <button
                    onClick={() => setDraft(d => ({ ...d, options: [...d.options, ''] }))}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: T.accent, fontSize: 11, fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: 3,
                    }}
                  >
                    <Plus size={11} /> Add option
                  </button>
                ) : <div />}

                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={launch}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                    background: `linear-gradient(135deg, ${T.accent}, #6366F1)`,
                    border: 'none', color: '#fff',
                    fontSize: 11, fontWeight: 700,
                    boxShadow: `0 4px 12px ${T.accent}40`,
                  }}
                >
                  <Send size={11} /> Launch
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active poll */}
      {poll ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0, lineHeight: 1.4 }}>
            {poll.question}
          </p>
          {poll.options.map((opt, i) => {
            const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
            const isVoted = voted === i;
            const color = optionColors[i % optionColors.length];
            return (
              <motion.div
                key={i}
                whileHover={voted === null ? { scale: 1.01 } : {}}
                whileTap={voted === null ? { scale: 0.99 } : {}}
                onClick={() => vote(i)}
                style={{
                  borderRadius: 10, overflow: 'hidden', cursor: voted === null ? 'pointer' : 'default',
                  background: isVoted ? `${color}12` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isVoted ? `${color}40` : 'rgba(255,255,255,0.07)'}`,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px' }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                    background: isVoted ? color : 'rgba(255,255,255,0.08)',
                    border: `2px solid ${isVoted ? color : 'rgba(255,255,255,0.12)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}>
                    {isVoted && (
                      <svg width={7} height={7} viewBox="0 0 7 7" fill="none">
                        <circle cx={3.5} cy={3.5} r={2.5} fill="#fff" />
                      </svg>
                    )}
                  </div>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: isVoted ? T.text : T.muted }}>
                    {opt.text}
                  </span>
                  {voted !== null && (
                    <span style={{ fontSize: 11, fontWeight: 800, color: color }}>{pct}%</span>
                  )}
                </div>
                {voted !== null && (
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.04)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      style={{ height: '100%', background: `linear-gradient(90deg, ${color}88, ${color})` }}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
          <p style={{ fontSize: 10, color: T.dim, textAlign: 'right', margin: 0, fontWeight: 600 }}>
            {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
          </p>
        </motion.div>
      ) : !creating && (
        <div style={{
          padding: '14px', textAlign: 'center',
          background: 'rgba(139,92,246,0.04)',
          border: '1px dashed rgba(139,92,246,0.15)',
          borderRadius: 10,
        }}>
          <Vote size={20} color="rgba(139,92,246,0.3)" style={{ marginBottom: 6 }} />
          <p style={{ fontSize: 11, color: T.dim, margin: 0 }}>
            {isHost ? 'Click "New Poll" to launch a poll' : 'No active poll'}
          </p>
        </div>
      )}
    </div>
  );
}
