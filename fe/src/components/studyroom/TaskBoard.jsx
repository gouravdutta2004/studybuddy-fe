import { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2, ArrowRight, ListTodo } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COLS    = ['todo', 'doing', 'done'];
const LABELS  = { todo: 'To Do', doing: 'In Progress', done: 'Done' };
const COLORS  = { todo: '#6366F1', doing: '#F59E0B', done: '#22C55E' };

const T = {
  card:   '#1E293B',
  text:   '#F1F5F9',
  muted:  '#94A3B8',
  dim:    '#475569',
  bSub:   'rgba(255,255,255,0.06)',
};

export default function TaskBoard({ socket, roomId, isDark }) {
  const [tasks, setTasks] = useState([]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!socket) return;
    socket.on('task:add',    t  => setTasks(p => [...p, t]));
    socket.on('task:move',   ({ id, col }) => setTasks(p => p.map(t => t.id === id ? { ...t, col } : t)));
    socket.on('task:remove', ({ id })      => setTasks(p => p.filter(t => t.id !== id)));
    socket.on('task:sync',   ts => setTasks(ts));
    return () => {
      socket.off('task:add'); socket.off('task:move');
      socket.off('task:remove'); socket.off('task:sync');
    };
  }, [socket]);

  const addTask = () => {
    if (!draft.trim()) return;
    const t = { id: `${Date.now()}`, text: draft.trim(), col: 'todo' };
    socket?.emit('task:add', { roomId, task: t });
    setTasks(p => [...p, t]);
    setDraft('');
  };

  const move   = (id, currentCol) => {
    const next = COLS[COLS.indexOf(currentCol) + 1];
    if (!next) return;
    socket?.emit('task:move', { roomId, id, col: next });
    setTasks(p => p.map(t => t.id === id ? { ...t, col: next } : t));
  };

  const remove = (id) => {
    socket?.emit('task:remove', { roomId, id });
    setTasks(p => p.filter(t => t.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Add task input */}
      <div style={{
        display: 'flex', gap: 6,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10, padding: '6px 6px 6px 12px',
      }}>
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="Add a task for the room…"
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: T.text, fontSize: 12, fontFamily: 'inherit',
          }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={addTask}
          style={{
            width: 28, height: 28, borderRadius: 8,
            background: draft.trim()
              ? 'linear-gradient(135deg, #6366F1, #818CF8)'
              : 'rgba(255,255,255,0.06)',
            border: 'none', cursor: draft.trim() ? 'pointer' : 'default',
            color: draft.trim() ? '#fff' : T.dim,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: draft.trim() ? '0 4px 10px rgba(99,102,241,0.35)' : 'none',
          }}
        >
          <Plus size={14} />
        </motion.button>
      </div>

      {/* Columns */}
      {COLS.map(col => {
        const colTasks = tasks.filter(t => t.col === col);
        const accent   = COLORS[col];

        return (
          <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* column header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent, boxShadow: `0 0 6px ${accent}` }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                {LABELS[col]}
              </span>
              <span style={{
                marginLeft: 'auto', fontSize: 10, fontWeight: 700,
                padding: '1px 6px', borderRadius: 4,
                background: `${accent}15`, color: accent,
              }}>
                {colTasks.length}
              </span>
            </div>

            {/* tasks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <AnimatePresence>
                {colTasks.map(t => (
                  <motion.div
                    key={t.id} layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, x: 10 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '7px 10px', borderRadius: 9,
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${col === 'done' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)'}`,
                      transition: 'border-color 0.2s',
                    }}
                  >
                    {/* Checkbox */}
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => move(t.id, col)}
                      style={{
                        width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                        background: col === 'done' ? accent : 'transparent',
                        border: `2px solid ${accent}`,
                        cursor: col !== 'done' ? 'pointer' : 'default',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}
                    >
                      {col === 'done' && (
                        <svg width={9} height={9} viewBox="0 0 9 9" fill="none">
                          <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </motion.button>

                    {/* Text */}
                    <span style={{
                      flex: 1, fontSize: 12, color: col === 'done' ? T.dim : T.text,
                      textDecoration: col === 'done' ? 'line-through' : 'none',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {t.text}
                    </span>

                    {/* Move btn */}
                    {col !== 'done' && (
                      <motion.button
                        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                        onClick={() => move(t.id, col)}
                        style={{
                          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                          background: `${accent}18`, border: `1px solid ${accent}30`,
                          color: accent, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}
                      >
                        <ArrowRight size={10} />
                      </motion.button>
                    )}

                    {/* Delete */}
                    <motion.button
                      whileHover={{ scale: 1.15, color: '#ef4444' }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => remove(t.id)}
                      style={{
                        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                        background: 'transparent', border: 'none',
                        color: T.dim, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'color 0.2s',
                      }}
                    >
                      <Trash2 size={10} />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {colTasks.length === 0 && (
                <div style={{
                  padding: '8px', textAlign: 'center',
                  fontSize: 11, color: T.dim, fontStyle: 'italic',
                  borderRadius: 8, border: '1px dashed rgba(255,255,255,0.06)',
                }}>
                  empty
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
