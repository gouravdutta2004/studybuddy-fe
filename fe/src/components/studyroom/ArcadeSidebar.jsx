import React, { useState } from 'react';
import { Box, Typography, IconButton, Button, Tooltip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Gamepad2, Trophy, Info } from 'lucide-react';
import { useTheme } from '@mui/material';

import MemoryMatch from '../arcade/MemoryMatch';
import TypingRacer from '../arcade/TypingRacer';
import ZenBreather from '../arcade/ZenBreather';
import MathSprint from '../arcade/MathSprint';
import WordScramble from '../arcade/WordScramble';
import SnakeGame from '../arcade/SnakeGame';
import ColorMemory from '../arcade/ColorMemory';

const GAMES = [
  { id: 'typing', title: 'TYPE RACER', icon: Gamepad2, component: TypingRacer, color: '#38bdf8' },
  { id: 'memory', title: 'SYNAPSE MATCH', icon: Gamepad2, component: MemoryMatch, color: '#a78bfa' },
  { id: 'snake', title: 'PIXEL SNAKE', icon: Gamepad2, component: SnakeGame, color: '#22d3ee' },
  { id: 'math', title: 'MATH SPRINT', icon: Gamepad2, component: MathSprint, color: '#f59e0b' },
  { id: 'wordscramble', title: 'WORD SCRAMBLE', icon: Gamepad2, component: WordScramble, color: '#fbbf24' },
  { id: 'colormemory', title: 'COLOR MEMORY', icon: Gamepad2, component: ColorMemory, color: '#a855f7' },
  { id: 'zen', title: 'ZEN BREATHER', icon: Gamepad2, component: ZenBreather, color: '#34d399' },
];

export default function ArcadeSidebar({ isDark }) {
  const [activeGame, setActiveGame] = useState(null);
  const theme = useTheme();

  const activeData = GAMES.find(g => g.id === activeGame);
  const ActiveComponent = activeData?.component;

  const surfaceColor = isDark ? '#1e1e1e' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        {!activeGame ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '4px' }}
          >
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Trophy size={14} color="#eab308" />
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'text.secondary', letterSpacing: 1 }}>
                EARN XP DURING BREAKS
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
              {GAMES.map((game) => (
                <Button
                  key={game.id}
                  fullWidth
                  onClick={() => setActiveGame(game.id)}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1.5, px: 2,
                    borderRadius: '12px',
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${borderColor}`,
                    color: isDark ? '#e5e7eb' : '#374151',
                    '&:hover': {
                      bgcolor: `${game.color}15`,
                      borderColor: `${game.color}40`,
                    }
                  }}
                >
                  <Box sx={{
                    width: 32, height: 32, borderRadius: '8px',
                    bgcolor: game.color, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', mr: 2,
                    boxShadow: `0 4px 12px ${game.color}40`
                  }}>
                    <game.icon size={18} color="white" />
                  </Box>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: 0.5 }}>
                      {game.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', fontWeight: 500 }}>
                      XP Enabled
                    </Typography>
                  </Box>
                </Button>
              ))}
            </Box>

            <Box sx={{
              mt: 2, p: 1.5, borderRadius: '8px',
              bgcolor: 'rgba(59,130,246,0.05)',
              border: '1px solid rgba(59,130,246,0.1)',
              display: 'flex', alignItems: 'center', gap: 1.5
            }}>
              <Info size={14} color="#3b82f6" />
              <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', lineHeight: 1.4 }}>
                Play short games to refresh your mind. XP is automatically synced to your profile.
              </Typography>
            </Box>
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <IconButton
                size="small"
                onClick={() => setActiveGame(null)}
                sx={{ bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                <ArrowLeft size={14} />
              </IconButton>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: activeData?.color, letterSpacing: 1 }}>
                {activeData?.title}
              </Typography>
            </Box>

            <Box sx={{
              flex: 1, bgcolor: '#000', borderRadius: '12px',
              overflow: 'hidden', border: `1px solid ${activeData?.color}40`,
              position: 'relative'
            }}>
              {ActiveComponent && <ActiveComponent onBack={() => setActiveGame(null)} />}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
