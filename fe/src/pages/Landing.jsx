import React, { useState, useEffect, useRef } from 'react';
import { AnimatedText } from '../components/ui/AnimatedUnderlineText';
import { ShaderAnimation } from '../components/ui/ShaderAnimation';
import { InteractiveRobotSpline } from '../components/ui/InteractiveRobotSpline';
import { ContainerScroll } from '../components/ui/ContainerScrollAnimation';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import logoImg from '../assets/logo.png';
import dashboardPreview from '../assets/dashboard-preview.png';
import demoVideo from '../assets/studyfriend-demo.mp4';
import api from '../api/axios';

gsap.registerPlugin(ScrollTrigger);

/* ─── Floating Shape ─── */
function ElegantShape({ delay = 0, width = 400, height = 100, rotate = 0, gradient, style: extraStyle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 2.4, delay, ease: [0.23, 0.86, 0.39, 0.96], opacity: { duration: 1.2 } }}
      style={{ position: 'absolute', ...extraStyle }}
    >
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width, height, position: 'relative' }}
      >
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '9999px',
          background: `linear-gradient(135deg, ${gradient}, transparent)`,
          backdropFilter: 'blur(2px)',
          border: '2px solid rgba(255,255,255,0.15)',
          boxShadow: '0 8px 32px 0 rgba(255,255,255,0.1)',
        }} />
      </motion.div>
    </motion.div>
  );
}

/* ─── Ripple Button ─── */
function RippleButton({ children, href, onClick, variant = 'primary', style: extra }) {
  const [ripples, setRipples] = useState([]);
  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const key = Date.now();
    setRipples(p => [...p, { key, x, y, size }]);
    setTimeout(() => setRipples(p => p.filter(r => r.key !== key)), 700);
    if (onClick) onClick(e);
  };

  const base = {
    position: 'relative', overflow: 'hidden', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.85rem 2rem', borderRadius: '9999px',
    fontFamily: 'inherit', fontSize: '1rem', fontWeight: 700,
    border: 'none', textDecoration: 'none', transition: 'all 0.3s',
    ...extra
  };
  const styles = variant === 'primary'
    ? { ...base, background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', boxShadow: '0 6px 24px rgba(99,102,241,0.35)' }
    : { ...base, background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.18)' };

  const El = href ? 'a' : 'button';
  return (
    <El href={href} style={styles} onClick={handleClick} className="ripple-btn">
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {ripples.map(r => (
          <span key={r.key} style={{
            position: 'absolute', left: r.x, top: r.y, width: r.size, height: r.size,
            borderRadius: '50%', background: 'rgba(255,255,255,0.25)',
            transform: 'scale(0)', animation: 'ripple-expand 0.65s ease-out forwards',
          }} />
        ))}
      </div>
    </El>
  );
}

/* ─── Feature Carousel ─── */
const FEATURES = [
  { icon: '🧠', title: 'Cognitive Matching', desc: 'Our AI analyses your focus style, energy peak, and learning type to find the perfect partner — not just by subject.', color: '#6366f1' },
  { icon: '🤝', title: 'Accountability Contracts', desc: 'Stake XP on your sessions. No-shows lose consistency points. Commitment becomes a game mechanic.', color: '#10b981' },
  { icon: '🚨', title: 'SOS Breakdown Buddy', desc: 'Stuck on a derivation at midnight? Fire an SOS beacon and get matched with an online expert in seconds.', color: '#ef4444' },
  { icon: '🏆', title: 'XP & Leaderboards', desc: 'Every session you complete earns XP. Rise up the campus leaderboard and unlock Pro perks as you study.', color: '#f59e0b' },
  { icon: '🎙️', title: 'Live Study Rooms', desc: 'Jump into real-time audio/video sessions with collaborative whiteboard and synced Pomodoro timers.', color: '#22d3ee' },
  { icon: '⚡', title: 'AI Flashcard Engine', desc: 'Paste lecture notes and watch the AI generate quiz-ready flashcards with spaced-repetition scheduling.', color: '#a78bfa' },
];

function FeatureCarousel() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive(a => (a + 1) % FEATURES.length), 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
        {/* Left: selector list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {FEATURES.map((f, i) => (
            <button key={i} onClick={() => setActive(i)} style={{
              textAlign: 'left', padding: '1rem 1.25rem', borderRadius: '14px',
              border: `1px solid ${active === i ? f.color + '55' : 'rgba(255,255,255,0.05)'}`,
              background: active === i ? `${f.color}12` : 'rgba(255,255,255,0.02)',
              cursor: 'pointer', transition: 'all 0.25s', fontFamily: 'inherit',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.4rem' }}>{f.icon}</span>
                <span style={{
                  fontWeight: 700, fontSize: '0.9rem',
                  color: active === i ? f.color : 'rgba(255,255,255,0.6)',
                  transition: 'color 0.25s',
                }}>{f.title}</span>
              </div>
              <AnimatePresence>
                {active === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.5rem', lineHeight: 1.6 }}>{f.desc}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          ))}
        </div>

        {/* Right: visual showcase */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.4 }}
              style={{
                borderRadius: '24px', padding: '3rem 2.5rem',
                background: `radial-gradient(ellipse at 30% 30%, ${FEATURES[active].color}20, rgba(255,255,255,0.03) 60%)`,
                border: `1px solid ${FEATURES[active].color}30`,
                minHeight: 340, display: 'flex', flexDirection: 'column',
                alignItems: 'flex-start', justifyContent: 'flex-end',
                boxShadow: `0 0 80px ${FEATURES[active].color}15`,
              }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>{FEATURES[active].icon}</div>
              <h3 style={{
                fontFamily: '"Space Grotesk",sans-serif', fontWeight: 800, fontSize: '1.8rem',
                color: '#f0f0f5', marginBottom: '0.75rem', letterSpacing: '-0.02em',
              }}>{FEATURES[active].title}</h3>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{FEATURES[active].desc}</p>
              <div style={{
                marginTop: '1.5rem', display: 'inline-flex', padding: '0.4rem 1rem',
                borderRadius: '9999px', background: `${FEATURES[active].color}20`,
                border: `1px solid ${FEATURES[active].color}40`,
                color: FEATURES[active].color, fontWeight: 700, fontSize: '0.75rem',
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>Premium Feature</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ─── Static Constants have been removed in favor of dynamic API stats ─── */
/* ─── Floating Dock ─── */
const DOCK_ITEMS = [
  { icon: '🏠', label: 'Dashboard', href: '/dashboard' },
  { icon: '🎯', label: 'Find Matches', href: '/matches' },
  { icon: '💬', label: 'Messages', href: '/messages' },
  { icon: '🏆', label: 'Leaderboard', href: '/leaderboard' },
  { icon: '⚡', label: 'Flashcards', href: '/flashcards' },
  { icon: '🎮', label: 'Arcade', href: '/arcade' },
];

function FloatingDock() {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.25rem',
          padding: '0.6rem 1rem', borderRadius: '20px',
          background: 'rgba(15,20,35,0.8)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        }}>
        {DOCK_ITEMS.map((item, i) => (
          <a key={i} href={item.href}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none' }}>
            <motion.div animate={{ scale: hovered === i ? 1.25 : 1, y: hovered === i ? -6 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{ width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
                background: hovered === i ? 'rgba(99,102,241,0.15)' : 'transparent', cursor: 'pointer', transition: 'background 0.2s',
              }}>
              {item.icon}
            </motion.div>
            <AnimatePresence>
              {hovered === i && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                  style={{
                    position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(15,20,35,0.95)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px', padding: '4px 10px', whiteSpace: 'nowrap',
                    fontSize: '0.68rem', fontWeight: 700, color: '#fff',
                  }}>
                  {item.label}
                </motion.div>
              )}
            </AnimatePresence>
          </a>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Pricing ─── */
const PLAN_META = [
  { key: 'basic', name: 'Starter', price: 'FREE', desc: 'Core matching and public squads.', features: ['3 Connections', 'Basic Matching', 'Public Squads', 'Standard Support'], color: '#64748b' },
  { key: 'pro', name: 'Pro', desc: 'Advanced AI matching & unlimited connections.', features: ['Unlimited Connections', 'AI Cognitive Match', 'Private Squads', 'SOS Buddy System', 'Priority Support'], color: '#6366f1', popular: true },
  { key: 'squad', name: 'Squad', desc: 'For institutions and high-frequency groups.', features: ['Everything in Pro', '50 Squad Members', 'Admin Analytics', 'Immutable Vault', 'Dedicated Support'], color: '#10b981' },
];

function Pricing() {
  const [annual, setAnnual] = useState(true);
  const [live, setLive] = useState({});
  useEffect(() => { api.get('/billing/pricing').then(r => setLive(r.data || {})).catch(() => {}); }, []);
  const maxDiscount = Math.max(...Object.values(live).map(p => p.annualDiscount || 0), 0);

  return (
    <section style={{ padding: '6rem 0', position: 'relative' }} id="pricing">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={S.badge}>PRICING</div>
          <h2 style={S.sectionTitle}>Simple, transparent pricing</h2>
          {/* Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: annual ? 'rgba(255,255,255,0.35)' : '#fff', fontWeight: 600 }}>Monthly</span>
            <div onClick={() => setAnnual(a => !a)} style={{
              width: 48, height: 26, borderRadius: 9999, cursor: 'pointer', position: 'relative',
              background: annual ? '#6366f1' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute',
                top: 3, left: annual ? 'calc(100% - 23px)' : 3, transition: 'left 0.3s',
              }} />
            </div>
            <span style={{ fontSize: '0.9rem', color: annual ? '#fff' : 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
              Annual {maxDiscount > 0 && <span style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', borderRadius: 9999, padding: '2px 8px', fontSize: '0.75rem', marginLeft: 6 }}>Save {maxDiscount}%</span>}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem' }} className="pricing-grid">
          {PLAN_META.map(plan => {
            const liveData = live[plan.key];
            const price = plan.key === 'basic' ? 'FREE'
              : annual ? (liveData?.annualMonthly ? `₹${liveData.annualMonthly.toLocaleString('en-IN')}` : plan.key === 'pro' ? '₹799' : '₹1,299')
              : (liveData?.effectivePrice ? `₹${liveData.effectivePrice.toLocaleString('en-IN')}` : plan.key === 'pro' ? '₹999' : '₹1,599');
            const annualTotal = liveData?.annualTotal;

            return (
              <motion.div key={plan.key} whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300 }} style={{
                borderRadius: '20px', padding: '1.75rem',
                border: `1px solid ${plan.popular ? plan.color + '55' : 'rgba(255,255,255,0.08)'}`,
                background: plan.popular ? `${plan.color}10` : 'rgba(255,255,255,0.02)',
                boxShadow: plan.popular ? `0 0 60px ${plan.color}20` : 'none',
                display: 'flex', flexDirection: 'column', position: 'relative',
              }}>
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                    background: plan.color, borderRadius: 9999, padding: '3px 14px',
                    fontSize: '0.7rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap',
                  }}>MOST POPULAR</div>
                )}
                <div style={{ fontWeight: 800, fontSize: '1rem', color: plan.color, marginBottom: '0.25rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{plan.name}</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: '"Space Grotesk",sans-serif', color: '#f0f0f5', lineHeight: 1, marginBottom: '0.25rem' }}>{price}</div>
                {annual && annualTotal && plan.key !== 'basic' && (
                  <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, marginBottom: '0.5rem' }}>₹{annualTotal.toLocaleString('en-IN')} billed annually</div>
                )}
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem', lineHeight: 1.5 }}>{plan.desc}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, marginBottom: '1.5rem' }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)' }}>
                      <svg width="14" height="14" fill="none" stroke={plan.color} strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                      {f}
                    </div>
                  ))}
                </div>
                <a href="/register" style={{
                  display: 'block', textAlign: 'center', padding: '0.85rem', borderRadius: '12px',
                  textDecoration: 'none', fontWeight: 800, fontSize: '0.88rem', transition: 'all 0.25s',
                  border: `1.5px solid ${plan.popular ? plan.color : 'rgba(255,255,255,0.15)'}`,
                  background: plan.popular ? plan.color : 'transparent',
                  color: '#fff', cursor: 'pointer',
                }}>
                  {plan.key === 'basic' ? 'Get Started Free' : `Upgrade to ${plan.name}`}
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Shared styles ─── */
const S = {
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.25rem 0.9rem', borderRadius: 9999,
    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
    fontSize: '0.68rem', fontWeight: 800, color: '#818cf8',
    textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1rem',
  },
  sectionTitle: {
    fontFamily: '"Space Grotesk",sans-serif', fontWeight: 900,
    fontSize: 'clamp(2rem,4.5vw,3.2rem)', color: '#f0f0f5',
    letterSpacing: '-0.03em', lineHeight: 1.08,
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.3 + i * 0.15, ease: [0.25, 0.4, 0.25, 1] } }),
};

const UNIS = ['KIIT University','C.V. Raman Global University','IIT Bombay','NIT Rourkela','BITS Pilani','VIT Vellore','SRM Chennai','Delhi University','IIIT Hyderabad','Manipal University'];

/* ─── Main Landing ─── */
export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [current, setCurrent] = useState(0);
  const [platformStats, setPlatformStats] = useState([
    { val: '...', label: 'Active Students' },
    { val: '...', label: 'Universities' },
    { val: '...', label: 'Match Accuracy' },
    { val: '...', label: 'Study Hours Logged' },
  ]);
  const spRef = useRef(null);

  // Fetch Live Platform Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/public/stats');
        
        // Simple metric formatter
        const formatK = (num) => (num >= 1000 ? (num / 1000).toFixed(1) + 'K' : num);
        
        setPlatformStats([
          { val: formatK(data.activeStudents) + '+', label: 'Active Students' },
          { val: data.universities + '+', label: 'Universities' },
          { val: data.matchAccuracy + '%', label: 'Match Accuracy' },
          { val: formatK(data.studyHours) + '+', label: 'Study Hours Logged' },
        ]);
      } catch (e) {
        console.error("Failed to fetch platform metrics", e);
      }
    };
    fetchStats();
  }, []);

  // Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    return () => { lenis.destroy(); };
  }, []);

  // Scroll effects
  useEffect(() => {
    const h = () => {
      setScrolled(window.scrollY > 50);
      const tot = document.documentElement.scrollHeight - window.innerHeight;
      if (spRef.current) spRef.current.style.width = (window.scrollY / tot * 100) + '%';
    };
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  // Gallery auto-advance
  useEffect(() => {
    const id = setInterval(() => setCurrent(c => (c + 1) % UNIS.length), 2800);
    return () => clearInterval(id);
  }, []);

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
    html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
    body{font-family:'Inter',sans-serif;background:#030712;color:#f0f0f5;line-height:1.6;overflow-x:hidden}
    @keyframes ripple-expand{0%{transform:scale(0);opacity:1}100%{transform:scale(1);opacity:0}}
    @keyframes marquee-slide{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
    @keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.6)}}
    @keyframes float-up{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
    .ripple-btn:hover{transform:translateY(-2px)!important;filter:brightness(1.08)}
    .lnav-link{font-size:.875rem;font-weight:500;color:rgba(255,255,255,0.5);text-decoration:none;transition:color .2s;position:relative}
    .lnav-link::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:2px;background:#6366f1;border-radius:9999px;transition:.3s}
    .lnav-link:hover{color:#fff}.lnav-link:hover::after{width:100%}
    @media(max-width:640px){.lnav-links,.lnav-actions{display:none!important}.mob-toggle{display:flex!important}.pricing-grid{grid-template-columns:1fr!important}}
    @media(max-width:900px){.pricing-grid{grid-template-columns:1fr 1fr!important}.feature-grid{grid-template-columns:1fr!important}}
    .pricing-grid .feat-plan{transform:scale(1.03)}
    .feature-grid{grid-template-columns:1fr 1fr}
  `;

  return (
    <>
      <style>{CSS}</style>

      {/* Scroll progress */}
      <div ref={spRef} style={{ position: 'fixed', top: 0, left: 0, height: 3, background: 'linear-gradient(90deg,#6366f1,#10b981)', zIndex: 10001, width: 0, transition: 'width .1s' }} />

      {/* Background grid */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)', backgroundSize: '60px 60px', zIndex: -2, pointerEvents: 'none' }} />

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 14, left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 3rem)', maxWidth: 1100, zIndex: 1000,
        background: scrolled ? 'rgba(3,7,18,0.92)' : 'rgba(15,20,35,0.5)',
        backdropFilter: 'blur(24px)', borderRadius: 9999,
        border: `1px solid ${scrolled ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)'}`,
        padding: '0.7rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.3s', boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none',
      }}>
        <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#fff', fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: '1.05rem' }}>
          <img src={logoImg} alt="Logo" style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'contain' }} />
          StudyFriend
        </a>
        <div className="lnav-links" style={{ display: 'flex', gap: '1.75rem' }}>
          {[['#features', 'Features'], ['#how', 'How It Works'], ['#pricing', 'Pricing']].map(([href, label]) => (
            <a key={href} href={href} className="lnav-link">{label}</a>
          ))}
        </div>
        <div className="lnav-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <a href="/login" style={{ padding: '0.5rem 1rem', color: 'rgba(255,255,255,0.6)', borderRadius: 9999, fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', transition: 'color .2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>Log In</a>
          <RippleButton href="/register" variant="primary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.875rem' }}>Start Free →</RippleButton>
        </div>
        <button className="mob-toggle" onClick={() => setMobile(!mobile)} style={{ display: 'none', flexDirection: 'column', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          {[0, 1, 2].map(i => <span key={i} style={{ width: 22, height: 2, background: '#fff', borderRadius: 9999, display: 'block', transition: '.3s' }} />)}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(3,7,18,0.98)', backdropFilter: 'blur(24px)', zIndex: 5000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
            {[['#features', 'Features'], ['#how', 'How It Works'], ['#pricing', 'Pricing'], ['/login', 'Log In'], ['/register', 'Get Started']].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMobile(false)} style={{ color: '#fff', textDecoration: 'none', fontSize: '1.6rem', fontWeight: 700, fontFamily: '"Space Grotesk",sans-serif' }}>{label}</a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ HERO ══ */}
      <section id="top" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#030712' }}>

        {/* ── WebGL Shader Background ── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <ShaderAnimation speed={0.8} />
        </div>

        {/* ── Dark overlay so text stays readable ── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'rgba(3,7,18,0.72)', backdropFilter: 'blur(0.5px)' }} />

        {/* Floating shapes — above shader, below content */}
        <ElegantShape delay={0.3} width={600} height={140} rotate={12} gradient="rgba(99,102,241,0.22)" style={{ left: '-5%', top: '20%', zIndex: 2 }} />
        <ElegantShape delay={0.5} width={500} height={120} rotate={-15} gradient="rgba(16,185,129,0.18)" style={{ right: '0%', top: '70%', zIndex: 2 }} />
        <ElegantShape delay={0.4} width={300} height={80} rotate={-8} gradient="rgba(168,85,247,0.18)" style={{ left: '10%', bottom: '10%', zIndex: 2 }} />
        <ElegantShape delay={0.6} width={200} height={60} rotate={20} gradient="rgba(245,158,11,0.18)" style={{ right: '20%', top: '12%', zIndex: 2 }} />
        <ElegantShape delay={0.7} width={150} height={40} rotate={-25} gradient="rgba(34,211,238,0.18)" style={{ left: '25%', top: '8%', zIndex: 2 }} />

        {/* Global radial glow */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 60%)', pointerEvents: 'none', zIndex: 2 }} />

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 820, padding: '0 1.5rem', paddingTop: 80 }}>
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 1rem', borderRadius: 9999, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '1.5rem' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>AI-POWERED STUDY MATCHING</span>
            </div>
          </motion.div>

          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" style={{ marginBottom: '1.5rem' }}>
            {/* "Find your" — gradient fade-up line */}
            <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 900, fontSize: 'clamp(3rem,8vw,6.5rem)', lineHeight: 0.95, letterSpacing: '-0.04em', marginBottom: '0.25rem' }}>
              <span style={{ background: 'linear-gradient(180deg,#fff 0%,rgba(255,255,255,0.75) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Find your</span>
            </div>

            {/* "Study Tribe." — AnimatedText with SVG underline draw */}
            <AnimatedText
              text="Study Tribe."
              className="pb-6"
              textClassName="font-black"
              textStyle={{
                fontFamily: '"Space Grotesk",sans-serif',
                fontSize: 'clamp(3rem,8vw,6.5rem)',
                letterSpacing: '-0.04em',
                lineHeight: 0.95,
                background: 'linear-gradient(135deg,#818cf8 0%,#fff 45%,#10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              underlineClassName="text-indigo-400"
              underlinePath="M 0,10 Q 75,0 150,10 Q 225,20 300,10"
              underlineHoverPath="M 0,10 Q 75,20 150,10 Q 225,0 300,10"
              underlineDuration={1.8}
            />
          </motion.div>

          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
            <p style={{ fontSize: 'clamp(1rem,2vw,1.2rem)', color: 'rgba(255,255,255,0.4)', maxWidth: 520, margin: '0 auto 2.5rem', lineHeight: 1.7, fontWeight: 400 }}>
              The ultimate study operating system — AI-matched partners, live rooms, XP-staked accountability, and an SOS rescue system. All in one platform.
            </p>
          </motion.div>

          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <RippleButton href="/register" variant="primary">
              Start for Free
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </RippleButton>
            <RippleButton href="#features" variant="ghost">Explore Features</RippleButton>
          </motion.div>

          {/* Stats */}
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible"
            style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginTop: '4rem', flexWrap: 'wrap' }}>
            {platformStats.map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)', alignSelf: 'center' }} />}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: '1.75rem', fontWeight: 900, color: '#f0f0f5', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
                </div>
              </React.Fragment>
            ))}
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, #030712 100%)', pointerEvents: 'none', zIndex: 5 }} />
      </section>

      {/* ── Floating Dock preview ── */}
      <section style={{ padding: '2rem 0 4rem', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '1.25rem' }}>Your app — accessible everywhere</p>
        <FloatingDock />
      </section>

      {/* ── Marquee ── */}
      <div style={{ padding: '2.5rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <p style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '1.25rem' }}>Trusted by students from</p>
        <div style={{ display: 'flex', width: 'max-content', animation: 'marquee-slide 40s linear infinite' }}>
          {[0, 1].map(k => (
            <div key={k} style={{ display: 'flex', gap: '3rem', padding: '0 1.5rem' }} aria-hidden={k === 1}>
              {UNIS.map(u => <span key={u} style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,0.22)', whiteSpace: 'nowrap' }}>{u}</span>)}
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '7rem 0', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={S.badge}>CAPABILITIES</div>
          <h2 style={S.sectionTitle}>Everything you need to<br />study smarter</h2>
        </div>
        <FeatureCarousel />
      </section>

      {/* ── DASHBOARD SCROLL REVEAL ── */}
      <section style={{ background: '#030712', padding: '0 0 2rem' }}>
        <ContainerScroll
          titleComponent={
            <div style={{ textAlign: 'center' }}>
              <div style={S.badge}>SEE IT IN ACTION</div>
              <h2 style={{
                fontFamily: '"Space Grotesk",sans-serif', fontWeight: 900,
                fontSize: 'clamp(2rem,5vw,3.5rem)', letterSpacing: '-0.04em',
                color: '#f0f0f5', lineHeight: 1.05, marginBottom: '1rem',
              }}>
                Your study hub,
                <br />
                <span style={{
                  background: 'linear-gradient(135deg,#818cf8 0%,#fff 45%,#10b981 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  beautifully organised.
                </span>
              </h2>
              <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
                Real-time matches, live study rooms, XP leaderboards and AI flashcards — all in one glassmorphic dashboard.
              </p>
            </div>
          }
        >
          {/* Dashboard preview video */}
          <video
            src={demoVideo}
            autoPlay
            loop
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', borderRadius: 12 }}
            draggable={false}
          />
        </ContainerScroll>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding: '6rem 0', position: 'relative' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={S.badge}>HOW IT WORKS</div>
            <h2 style={S.sectionTitle}>Three steps to finding<br />your perfect study partner</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem' }} className="feature-grid">
            {[
              { step: '01', title: 'Complete Your Psyche Profile', desc: 'Answer a 4-step quiz about your focus style, learning type, energy peak, and subjects. Takes 90 seconds.', icon: '🧬', color: '#6366f1' },
              { step: '02', title: 'Get AI-Matched Instantly', desc: 'Our MongoDB aggregation pipeline scores compatibility across cognitive traits and academic goals to surface your best matches.', icon: '⚙️', color: '#10b981' },
              { step: '03', title: 'Study, Compete & Level Up', desc: 'Lock in sessions with XP contracts, help peers with SOS beacons, and rise up the leaderboard together.', icon: '🚀', color: '#a78bfa' },
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.15 }}
                style={{ position: 'relative', borderRadius: '20px', padding: '2rem', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ fontFamily: '"Space Grotesk",monospace', fontSize: '0.7rem', fontWeight: 900, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>{step.step}</div>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{step.icon}</div>
                <h3 style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 800, fontSize: '1.15rem', color: '#f0f0f5', marginBottom: '0.75rem' }}>{step.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{step.desc}</p>
                <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', width: 36, height: 36, borderRadius: 10, background: `${step.color}15`, border: `1px solid ${step.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: step.color }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MEET WHOBEE 3D ROBOT ── */}
      <section style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: '#030712', display: 'flex', alignItems: 'stretch' }}>
        {/* Grid overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', position: 'relative', zIndex: 1 }} className="robot-grid">

          {/* Left — copy */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 3rem 4rem 6rem', pointerEvents: 'none' }} className="robot-copy">
            <div style={S.badge}>MEET YOUR BUDDY</div>
            <h2 style={{
              fontFamily: '"Space Grotesk",sans-serif', fontWeight: 900,
              fontSize: 'clamp(2.4rem,4.5vw,4rem)', letterSpacing: '-0.04em',
              lineHeight: 1.05, color: '#f0f0f5', marginBottom: '1.25rem',
            }}>
              Say hello to{' '}
              <span style={{ background: 'linear-gradient(135deg,#818cf8,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Whobee
              </span>
              ,<br />your AI study companion.
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, maxWidth: 460, marginBottom: '2rem' }}>
              Whobee is always on standby — ready to match you with the perfect study partner, remind you of upcoming sessions, and fire SOS beacons when you need a rescue.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', pointerEvents: 'all' }}>
              <a href="/register" style={{
                padding: '0.85rem 2rem', borderRadius: 9999,
                background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff',
                fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none',
                boxShadow: '0 6px 24px rgba(99,102,241,0.35)', transition: 'all .25s',
              }}>Meet Whobee →</a>
              <a href="#features" style={{
                padding: '0.85rem 1.75rem', borderRadius: 9999,
                border: '1.5px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)',
                fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', transition: 'all .25s',
              }}>Explore Features</a>
            </div>
            {/* Stats mini-row */}
            <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
              {[['24/7', 'Always Online'], ['<2s', 'Match Speed'], ['98%', 'Accuracy']].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: '1.6rem', fontWeight: 900, color: '#f0f0f5', lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Spline 3D robot (fully interactive, pointer-events:all) */}
          <div style={{ position: 'relative', minHeight: '100vh' }}>
            <InteractiveRobotSpline
              scene="https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode"
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>

        <style>{`
          @media(max-width:900px){
            .robot-grid{grid-template-columns:1fr!important;}
            .robot-copy{padding:3rem 1.5rem!important;}
          }
        `}</style>
      </section>

      {/* ── PRICING ── */}
      <Pricing />

      {/* ── CTA ── */}
      <section style={{ padding: '8rem 0', textAlign: 'center', position: 'relative', background: 'radial-gradient(ellipse at 50% 100%,rgba(16,185,129,0.07) 0%,transparent 60%)' }}>
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={S.badge}>GET STARTED</div>
            <h2 style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 900, fontSize: 'clamp(2.5rem,6vw,4.5rem)', letterSpacing: '-0.04em', lineHeight: 1.02, marginBottom: '1.5rem', color: '#f0f0f5' }}>
              Ready to find your<br />
              <span style={{ background: 'linear-gradient(135deg,#818cf8,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>study tribe?</span>
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.4)', marginBottom: '2.5rem', lineHeight: 1.7 }}>Join 2,500+ students already using StudyFriend. Free forever — upgrade when you're ready.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              <RippleButton href="/register" variant="primary" style={{ fontSize: '1.05rem', padding: '1rem 2.5rem' }}>
                Start Free — No Credit Card
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </RippleButton>
              <RippleButton href="/login" variant="ghost" style={{ fontSize: '1.05rem', padding: '1rem 2rem' }}>Sign In</RippleButton>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '2.5rem 0 2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#fff', fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700 }}>
            <img src={logoImg} alt="Logo" style={{ width: 30, height: 30, borderRadius: 8 }} />
            StudyFriend
          </a>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)' }}>© 2026 StudyFriend Inc.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[['/login', 'Log In'], ['/register', 'Sign Up']].map(([href, label]) => (
              <a key={href} href={href} style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color .2s' }} onMouseEnter={e => e.target.style.color = '#818cf8'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}>{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
