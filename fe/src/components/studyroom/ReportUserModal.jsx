/**
 * ReportUserModal — Trust & Safety Panic Flow
 *
 * Shown inside the Study Room when a user clicks "Report & Leave".
 * Instantly disconnects WebRTC, files the report, navigates away.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertTriangle, X, Send, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const FONT = "'Plus Jakarta Sans','Inter',sans-serif";

const REASONS = [
  {
    id: 'HARASSMENT',
    label: 'Harassment',
    desc: 'Threatening, bullying, or intimidating behaviour',
    emoji: '⚠️',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.35)',
  },
  {
    id: 'NSFW',
    label: 'Inappropriate Content',
    desc: 'Sexual, violent, or NSFW material',
    emoji: '🔞',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.1)',
    border: 'rgba(249,115,22,0.35)',
  },
  {
    id: 'SPAM',
    label: 'Spam / Promotion',
    desc: 'Advertising, recruiting, or off-topic promotion',
    emoji: '📢',
    color: '#eab308',
    bg: 'rgba(234,179,8,0.1)',
    border: 'rgba(234,179,8,0.35)',
  },
  {
    id: 'OFF_TOPIC',
    label: 'Not Studying',
    desc: 'Persistently socialising with no academic intent',
    emoji: '💬',
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.1)',
    border: 'rgba(99,102,241,0.35)',
  },
];

export default function ReportUserModal({ open, onClose, session, socket, reportedUserId, reportedUserName }) {
  const navigate = useNavigate();
  const [selectedReason, setSelectedReason] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error('Please select a reason for your report.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Instantly disconnect from the room
      if (socket) {
        socket.emit('leave_study_room', { roomId: session?._id });
        socket.disconnect();
      }

      // 2. Fire the report API (non-blocking — navigate regardless)
      await api.post('/moderation/report', {
        reportedUserId,
        reason: selectedReason,
        notes: notes.trim(),
        sessionId: session?._id,
      });

      // 3. Show trust toast and route out
      toast.success(
        '🛡️ User reported and blocked. Thank you for keeping StudyFriend safe.',
        { duration: 5000 }
      );
      navigate('/sessions');
    } catch (err) {
      // Even if the API fails, we've already disconnected — still navigate
      toast.success(
        '🛡️ You have left the room. Thank you for keeping StudyFriend safe.',
        { duration: 5000 }
      );
      navigate('/sessions');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, fontFamily: FONT,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.88, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.88, y: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            style={{
              width: '100%', maxWidth: 480,
              background: 'rgba(10,13,22,0.98)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 20,
              boxShadow: '0 0 0 1px rgba(239,68,68,0.08), 0 40px 100px rgba(0,0,0,0.7)',
              overflow: 'hidden',
            }}
          >
            {/* Red accent top bar */}
            <div style={{ height: 3, background: 'linear-gradient(90deg, transparent, #ef4444, #f97316, transparent)' }} />

            {/* Header */}
            <div style={{ padding: '22px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <ShieldAlert size={22} color="#ef4444" />
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '1rem', color: 'white', lineHeight: 1.2 }}>
                    Report &amp; Leave Room
                  </div>
                  <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: 3 }}>
                    Reporting: <span style={{ color: '#ef4444' }}>{reportedUserName || 'this user'}</span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
                display: 'flex', marginTop: 2,
              }}>
                <X size={14} />
              </button>
            </div>

            <div style={{ padding: '18px 24px 24px' }}>
              {/* Warning notice */}
              <div style={{
                background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 10, padding: '10px 14px', marginBottom: 18,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <AlertTriangle size={13} color="#ef4444" />
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                  You will be <strong style={{ color: '#ef4444' }}>immediately disconnected</strong> from this session upon submission.
                </span>
              </div>

              {/* Reason selector */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>
                  Reason for report
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {REASONS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedReason(r.id)}
                      style={{
                        background: selectedReason === r.id ? r.bg : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${selectedReason === r.id ? r.border : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
                        textAlign: 'left', transition: 'all 0.18s',
                        transform: selectedReason === r.id ? 'scale(1.02)' : 'scale(1)',
                        boxShadow: selectedReason === r.id ? `0 4px 16px ${r.color}22` : 'none',
                      }}
                    >
                      <div style={{ fontSize: '1.1rem', marginBottom: 5 }}>{r.emoji}</div>
                      <div style={{ fontWeight: 800, fontSize: '0.78rem', color: selectedReason === r.id ? r.color : 'rgba(255,255,255,0.8)', marginBottom: 3 }}>
                        {r.label}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>
                        {r.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional notes */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
                  Additional details (optional)
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                  placeholder="Describe what happened..."
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
                    padding: '10px 12px', color: 'rgba(255,255,255,0.8)',
                    fontSize: '0.82rem', fontFamily: FONT, resize: 'none',
                    outline: 'none', minHeight: 72, boxSizing: 'border-box',
                    lineHeight: 1.5,
                  }}
                />
                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', textAlign: 'right', marginTop: 4 }}>
                  {notes.length}/500
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !selectedReason}
                  style={{
                    flex: 1, padding: '12px 0',
                    background: (submitting || !selectedReason)
                      ? 'rgba(255,255,255,0.06)'
                      : 'linear-gradient(135deg,#ef4444,#dc2626)',
                    border: 'none', borderRadius: 12, cursor: (submitting || !selectedReason) ? 'not-allowed' : 'pointer',
                    color: (submitting || !selectedReason) ? 'rgba(255,255,255,0.3)' : 'white',
                    fontWeight: 800, fontSize: '0.84rem', fontFamily: FONT,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    boxShadow: (!submitting && selectedReason) ? '0 4px 16px rgba(239,68,68,0.4)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {submitting
                    ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Reporting…</>
                    : <><Send size={14} /> Report &amp; Leave Now</>
                  }
                </button>
                <button
                  onClick={onClose}
                  disabled={submitting}
                  style={{
                    padding: '12px 18px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, cursor: 'pointer',
                    color: 'rgba(255,255,255,0.5)', fontWeight: 700,
                    fontSize: '0.84rem', fontFamily: FONT,
                  }}
                >
                  Cancel
                </button>
              </div>

              {/* GDPR note */}
              <div style={{ marginTop: 14, fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', lineHeight: 1.5 }}>
                🔒 Reports are reviewed by our safety team. False reporting may result in penalties.
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
