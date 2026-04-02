import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('theme', themeMode);
    const root = window.document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    // CSS custom properties for non-MUI components
    root.style.setProperty('--bg-primary', themeMode === 'dark' ? '#05080f' : '#f0f2f8');
    root.style.setProperty('--bg-card', themeMode === 'dark' ? '#0d1224' : '#ffffff');
    root.style.setProperty('--bg-card-2', themeMode === 'dark' ? '#0a0e1a' : '#f8faff');
    root.style.setProperty('--border', themeMode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)');
    root.style.setProperty('--border-strong', themeMode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)');
    root.style.setProperty('--text-primary', themeMode === 'dark' ? '#f1f5f9' : '#0f172a');
    root.style.setProperty('--text-secondary', themeMode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)');
    root.style.setProperty('--text-muted', themeMode === 'dark' ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.35)');
    root.style.setProperty('--icon-color', themeMode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)');
    root.style.setProperty('--hover-bg', themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)');
    root.style.setProperty('--shadow-sm', themeMode === 'dark' ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.07)');
    root.style.setProperty('--shadow-md', themeMode === 'dark' ? '0 8px 40px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.1)');
    root.style.setProperty('--navbar-bg', themeMode === 'dark' ? 'rgba(4,6,18,0.92)' : 'rgba(255,255,255,0.92)');
    root.style.setProperty('--sidebar-bg', themeMode === 'dark' ? 'rgba(4,6,18,0.96)' : 'rgba(255,255,255,0.96)');
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const muiTheme = useMemo(() => createTheme({
    palette: {
      mode: themeMode,
      primary: {
        main: '#6366f1',
        light: '#818cf8',
        dark: '#4f46e5',
      },
      secondary: {
        main: '#22d3ee',
        light: '#67e8f9',
        dark: '#0891b2',
      },
      background: {
        default: themeMode === 'dark' ? '#05080f' : '#f0f2f8',
        paper: themeMode === 'dark' ? '#0d1224' : '#ffffff',
      },
      text: {
        primary: themeMode === 'dark' ? '#f1f5f9' : '#0f172a',
        secondary: themeMode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
        disabled: themeMode === 'dark' ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.35)',
      },
      divider: themeMode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
      action: {
        hover: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        selected: themeMode === 'dark' ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.025em' },
      h2: { fontWeight: 700, letterSpacing: '-0.025em' },
      h3: { fontWeight: 700, letterSpacing: '-0.025em' },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 16 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.3s ease, color 0.3s ease',
            scrollbarWidth: 'thin',
            scrollbarColor: themeMode === 'dark' ? 'rgba(99,102,241,0.3) transparent' : 'rgba(0,0,0,0.15) transparent',
            '&::-webkit-scrollbar': { width: 6, height: 6 },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              background: themeMode === 'dark' ? 'rgba(99,102,241,0.3)' : 'rgba(0,0,0,0.15)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '10px 24px',
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: themeMode === 'dark' ? '#0d1224' : '#ffffff',
            border: `1px solid ${themeMode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            backgroundImage: 'none',
            boxShadow: themeMode === 'dark'
              ? '0 4px 24px rgba(0,0,0,0.4)'
              : '0 4px 16px rgba(0,0,0,0.07)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              backgroundColor: themeMode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            },
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            border: `1px solid ${themeMode === 'dark' ? 'rgba(99,102,241,0.15)' : 'rgba(0,0,0,0.08)'}`,
            boxShadow: themeMode === 'dark' ? '0 16px 48px rgba(0,0,0,0.6)' : '0 16px 48px rgba(0,0,0,0.12)',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            backgroundColor: themeMode === 'dark' ? '#0d1224' : '#ffffff',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            backgroundColor: themeMode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          },
        },
      },
    },
  }), [themeMode]);

  return (
    <ThemeContext.Provider value={{ theme: themeMode, toggleTheme, isDark: themeMode === 'dark' }}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
