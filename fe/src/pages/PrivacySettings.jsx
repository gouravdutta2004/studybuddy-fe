/**
 * PrivacySettings — GDPR / India DPDP Compliance Page
 *
 * Route: /settings/privacy
 * Features: Data export download + permanent account deletion with "DELETE" confirmation
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Download, Trash2, AlertTriangle, Lock,
  FileJson, CheckCircle, X, Loader2, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const FONT = "'Plus Jakarta Sans','Inter',sans-serif";

// Glassmorphic card
function Card({ children, danger = false, style = {} }) {
  return (
    <div style={{
      background: danger ? 'rgba(239,68,68,0.03)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${danger ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 18, padding: 28, ...style,
    }}>
      {children}
    </div>
  );
}

function SectionLabel({ color, children }) {
  return (
    <div style={{ fontFamily: 'monospace', fontSize: '0.6rem', fontWeight: 800, color, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
      ▸ {children}
    </div>
  );
}

function InfoRow({ icon: Icon, color, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.025)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon size={14} color={color} />
        <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>{label}</span>
      </div>
      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{value}</span>
    </div>
  );
}

export default function PrivacySettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [downloading, setDownloading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await api.get('/compliance/export', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (user?.name || 'user').replace(/\s+/g, '_');
      a.download = `studyfriend_data_export_${safeName}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('📥 Your data has been downloaded.');
    } catch {
      toast.error('Failed to export data. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput.trim() !== 'DELETE') {
      toast.error('Please type DELETE to confirm.');
      return;
    }
    setDeleting(true);
    try {
      await api.delete('/compliance/delete-account');
      toast.success('Your account has been permanently deleted. Goodbye.', { duration: 6000 });
      logout?.();
      navigate('/');
    } catch {
      toast.error('Deletion failed. Please try again or contact support@studyfriend.co.in');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg,#070b14 0%,#0d1117 100%)',
      fontFamily: FONT, color: 'white', padding: '40px 24px',
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={20} color="#6366f1" />
            </div>
            <div>
              <h1 style={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: -0.5, margin: 0 }}>
                Privacy &amp; Data
              </h1>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: 2 }}>
                GDPR · India DPDP Act 2023 · Your Rights
              </div>
            </div>
          </div>

          {/* Legal banner */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 12, padding: '10px 16px', marginBottom: 32,
          }}>
            <Lock size={13} color="#818cf8" />
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
              StudyFriend complies with the <strong style={{ color: '#818cf8' }}>EU GDPR</strong> and <strong style={{ color: '#818cf8' }}>India's DPDP Act 2023</strong>.
              You have the right to access, export, and erase your personal data at any time.
            </span>
          </div>
        </motion.div>

        {/* ── Section 1: Your Rights ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Card style={{ marginBottom: 20 }}>
            <SectionLabel color="#6366f1">Your Data Rights</SectionLabel>
            <h2 style={{ fontWeight: 800, fontSize: '1rem', margin: '0 0 18px', color: 'white' }}>
              What data we hold about you
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <InfoRow icon={Shield} color="#10b981" label="Profile Data" value="Name, bio, subjects, avatar" />
              <InfoRow icon={FileJson} color="#6366f1" label="Activity Data" value="Sessions, study hours, XP" />
              <InfoRow icon={Lock} color="#f59e0b" label="Contract History" value="Anti-ghosting contracts &amp; outcomes" />
              <InfoRow icon={CheckCircle} color="#22d3ee" label="Messages" value="Encrypted conversation history" />
            </div>
          </Card>
        </motion.div>

        {/* ── Section 2: Download Data ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <Card style={{ marginBottom: 20 }}>
            <SectionLabel color="#10b981">Data Portability</SectionLabel>
            <h2 style={{ fontWeight: 800, fontSize: '1rem', margin: '0 0 6px', color: 'white' }}>
              Download My Data
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, marginBottom: 20 }}>
              Export a complete JSON archive of everything StudyFriend knows about you — your profile,
              sessions, contracts, messages, and XP history. This is your legal right under GDPR Article 20
              and India's DPDP Act Section 11.
            </p>

            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '12px 22px',
                background: downloading ? 'rgba(255,255,255,0.06)' : 'rgba(16,185,129,0.12)',
                border: `1px solid ${downloading ? 'rgba(255,255,255,0.1)' : 'rgba(16,185,129,0.35)'}`,
                borderRadius: 12, cursor: downloading ? 'not-allowed' : 'pointer',
                color: downloading ? 'rgba(255,255,255,0.3)' : '#10b981',
                fontWeight: 800, fontSize: '0.84rem', fontFamily: FONT,
                transition: 'all 0.2s',
              }}
            >
              {downloading
                ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Preparing Export…</>
                : <><Download size={15} /> Download My Data (JSON)</>
              }
            </button>

            <div style={{ marginTop: 12, fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', lineHeight: 1.5 }}>
              Download is generated in real-time. No pre-cached copies are stored.
            </div>
          </Card>
        </motion.div>

        {/* ── Section 3: Danger Zone ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card danger style={{ marginBottom: 32 }}>
            {/* Red accent left border */}
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ width: 3, borderRadius: 99, background: 'linear-gradient(180deg,#ef4444,#dc2626)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <SectionLabel color="#ef4444">Danger Zone</SectionLabel>
                <h2 style={{ fontWeight: 900, fontSize: '1.1rem', margin: '0 0 6px', color: '#ef4444' }}>
                  Permanently Delete Account
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, marginBottom: 20 }}>
                  This will <strong style={{ color: '#ef4444' }}>irreversibly</strong> erase your account, profile,
                  all study sessions, messages, contracts, XP, and badges.
                  This action <strong style={{ color: '#ef4444' }}>cannot be undone</strong>. Exercise this right under GDPR Article 17 / DPDP Act Section 12.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {['Your profile and avatar', 'All study sessions and history', 'Messages and conversations', 'XP, badges, and league standing', 'Anti-ghosting contracts'].map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
                      <X size={12} color="#ef4444" />{item}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setDeleteModal(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '12px 22px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.4)',
                    borderRadius: 12, cursor: 'pointer',
                    color: '#ef4444', fontWeight: 800, fontSize: '0.84rem',
                    fontFamily: FONT, transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                >
                  <Trash2 size={15} /> Delete My Account Permanently
                </button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Contact */}
        <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', lineHeight: 1.6 }}>
          Questions about your data? Contact our Data Protection Officer at{' '}
          <a href="mailto:privacy@studyfriend.co.in" style={{ color: '#6366f1', textDecoration: 'none' }}>
            privacy@studyfriend.co.in
          </a>
        </div>

      </div>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 99999,
              background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 20, fontFamily: FONT,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              style={{
                width: '100%', maxWidth: 440,
                background: 'rgba(10,13,22,0.99)',
                border: '1px solid rgba(239,68,68,0.35)',
                borderRadius: 20,
                boxShadow: '0 0 0 1px rgba(239,68,68,0.08), 0 40px 100px rgba(0,0,0,0.8)',
                overflow: 'hidden',
              }}
            >
              <div style={{ height: 3, background: 'linear-gradient(90deg,transparent,#ef4444,transparent)' }} />

              <div style={{ padding: '24px 26px 26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <AlertTriangle size={20} color="#ef4444" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: '1rem', color: 'white' }}>Final Confirmation</div>
                    <div style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 700, marginTop: 2 }}>
                      This action is permanent and cannot be reversed
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: 20 }}>
                  Type <strong style={{ color: '#ef4444', fontFamily: 'monospace', fontSize: '0.9rem', letterSpacing: 2 }}>DELETE</strong> in the box below to confirm permanent account erasure.
                </p>

                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="Type DELETE here…"
                  autoFocus
                  style={{
                    width: '100%', padding: '12px 14px',
                    background: 'rgba(239,68,68,0.06)',
                    border: `1px solid ${deleteInput === 'DELETE' ? 'rgba(239,68,68,0.6)' : 'rgba(239,68,68,0.2)'}`,
                    borderRadius: 10, color: '#ef4444',
                    fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700,
                    letterSpacing: 3, outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                    marginBottom: 20,
                  }}
                />

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteInput !== 'DELETE'}
                    style={{
                      flex: 1, padding: '12px 0',
                      background: deleteInput === 'DELETE' && !deleting
                        ? 'linear-gradient(135deg,#ef4444,#dc2626)'
                        : 'rgba(255,255,255,0.06)',
                      border: 'none', borderRadius: 12,
                      cursor: (deleting || deleteInput !== 'DELETE') ? 'not-allowed' : 'pointer',
                      color: deleteInput === 'DELETE' && !deleting ? 'white' : 'rgba(255,255,255,0.25)',
                      fontWeight: 800, fontSize: '0.84rem', fontFamily: FONT,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      boxShadow: deleteInput === 'DELETE' && !deleting ? '0 4px 16px rgba(239,68,68,0.4)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    {deleting
                      ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Deleting…</>
                      : <><Trash2 size={14} /> Erase Everything Permanently</>
                    }
                  </button>
                  <button
                    onClick={() => { setDeleteModal(false); setDeleteInput(''); }}
                    disabled={deleting}
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
