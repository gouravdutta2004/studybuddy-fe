/**
 * MobileBottomNav — Spotify/Instagram-style Fixed Bottom Navigation
 *
 * Visible only on mobile (< md breakpoint). Mirrors the top NAV items
 * and shows the 5 most important destinations. Replaces the hamburger
 * drawer for navigation on small screens.
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, MessageCircle, Trophy, Joystick } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '@mui/material';

/* 5 core destinations — the absolute essentials for bottom bar */
const BOTTOM_NAV = [
  { to: '/dashboard',    icon: BookOpen,      label: 'Home',     color: '#6366f1' },
  { to: '/browse',       icon: Search,        label: 'Browse',   color: '#22d3ee' },
  { to: '/messages',     icon: MessageCircle, label: 'Messages', color: '#818cf8' },
  { to: '/leaderboard',  icon: Trophy,        label: 'Ranks',    color: '#eab308' },
  { to: '/arcade',       icon: Joystick,      label: 'Arcade',   color: '#f59e0b' },
];

export default function MobileBottomNav({ unreadMessages = 0 }) {
  const location = useLocation();
  const muiTheme = useTheme();
  const isDark = muiTheme.palette.mode === 'dark';

  return (
    <nav
      aria-label="Mobile navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9900,
        /* Only visible on mobile — hidden on md+ via CSS */
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'space-around',
        height: 64,
        /* Safe area inset for iPhone notch/home bar */
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: isDark
          ? 'rgba(4, 6, 18, 0.96)'
          : 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: `1px solid ${isDark ? 'rgba(99,102,241,0.12)' : 'rgba(0,0,0,0.06)'}`,
        boxShadow: isDark
          ? '0 -8px 32px rgba(0,0,0,0.4)'
          : '0 -4px 20px rgba(0,0,0,0.06)',
      }}
      /* Hide this element on screens >= 768px via a global CSS rule in index.css */
      className="mobile-bottom-nav"
    >
      {BOTTOM_NAV.map(({ to, icon: Icon, label, color }) => {
        const isActive = location.pathname.startsWith(to);
        const showBadge = to === '/messages' && unreadMessages > 0;

        return (
          <Link
            key={to}
            to={to}
            aria-label={label}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              textDecoration: 'none',
              position: 'relative',
              /* Minimum 44×44px touch target (Apple HIG) */
              minWidth: 44,
              minHeight: 44,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {/* Active indicator — pill above icon */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="bottomNavPill"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  exit={{ scaleX: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    width: 32,
                    height: 3,
                    borderRadius: '0 0 4px 4px',
                    background: color,
                    boxShadow: `0 0 8px ${color}`,
                  }}
                />
              )}
            </AnimatePresence>

            {/* Icon with badge */}
            <motion.div
              animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -2 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{ position: 'relative' }}
            >
              <Icon
                size={22}
                color={isActive ? color : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')}
                strokeWidth={isActive ? 2.5 : 1.8}
                style={{ transition: 'color 0.2s, stroke-width 0.2s' }}
              />
              {/* Unread dot badge */}
              {showBadge && (
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute',
                    top: -3, right: -4,
                    width: 9, height: 9,
                    borderRadius: '50%',
                    background: '#ef4444',
                    border: `2px solid ${isDark ? '#040612' : '#ffffff'}`,
                    boxShadow: '0 0 6px rgba(239,68,68,0.7)',
                  }}
                />
              )}
            </motion.div>

            {/* Label */}
            <span style={{
              fontSize: '0.6rem',
              fontWeight: isActive ? 800 : 500,
              color: isActive ? color : (isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)'),
              letterSpacing: 0.3,
              transition: 'color 0.2s, font-weight 0.2s',
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              lineHeight: 1,
            }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
