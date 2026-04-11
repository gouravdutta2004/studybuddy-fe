import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

/**
 * Silently register the service worker and re-subscribe to push if permission
 * was previously granted. Called after every successful login/register flow.
 */
async function tryAutoSubscribePush() {
  try {
    if (
      !window.Notification ||
      window.Notification.permission !== 'granted' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window)
    ) return;

    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    const { data } = await api.get('/push/vapid-public-key');
    const rawKey = data.publicKey;
    const padding = '='.repeat((4 - (rawKey.length % 4)) % 4);
    const base64 = (rawKey + padding).replace(/-/g, '+').replace(/_/g, '/');
    const bytes = new Uint8Array(atob(base64).split('').map(c => c.charCodeAt(0)));

    const sub = existing || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: bytes });
    await api.post('/push/subscribe', { subscription: sub.toJSON() });
  } catch {
    // Silent fail — user can enable manually from Navbar
  }
}

/**
 * Fires the daily-ping endpoint and patches the local user object with
 * the freshest streak / badge data returned from the server.
 * Idempotent — can be called many times per day safely.
 */
async function sendDailyPing(setUser) {
  try {
    const { data } = await api.post('/gamification/daily-ping');
    // Merge new streak/badge/xp data into the cached user object
    setUser(prev => prev ? {
      ...prev,
      streak: data.streak,
      currentStreak: data.streak,
      lastStudyDate: data.lastStudyDate,
      badges: data.badges,
      xp: data.xp,
      level: data.level,
    } : prev);
  } catch {
    // Non-critical — don't block the user
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: validate stored token before using it, then load user
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Quick client-side expiry check before hitting the network
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setLoading(false);
          return;
        }
      } catch {
        localStorage.removeItem('token');
        setLoading(false);
        return;
      }

      api.get('/auth/me')
        .then(res => {
          setUser(res.data);
          tryAutoSubscribePush();
          sendDailyPing(setUser);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    tryAutoSubscribePush();
    // Fire ping right after login so streak is fresh
    sendDailyPing(setUser);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    tryAutoSubscribePush();
    sendDailyPing(setUser);
    return data;
  };

  const googleLogin = async (payload) => {
    const { data } = await api.post('/auth/google', payload);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    tryAutoSubscribePush();
    sendDailyPing(setUser);
    return data;
  };

  const logout = () => {
    // Privacy: wipe ALL locally stored auth data on logout
    localStorage.removeItem('token');
    sessionStorage.clear();
    // Wipe any cached user-sensitive keys that may have been set by other components
    const PRIVACY_KEYS = ['draft_message', 'last_search', 'user_prefs'];
    PRIVACY_KEYS.forEach(k => localStorage.removeItem(k));
    setUser(null);
  };

  const updateUser = (updatedFields) => setUser(prev => prev ? { ...prev, ...updatedFields } : updatedFields);

  // Hard-refresh user from the server (use after KYC or profile mutations)
  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
      return data;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, googleLogin, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
