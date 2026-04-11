import { useState, useEffect } from 'react';
import { Music, Play, Pause, SkipForward, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TRACKS = [
  { label: 'Lo-Fi Hip Hop',  id: 'jfKfPfyJRdk', emoji: '🎵', color: '#EC4899' },
  { label: 'Deep Focus',     id: 'lTRiuFIWV54', emoji: '🧠', color: '#6366F1' },
  { label: 'Nature Sounds',  id: 'eKFTSSKCzWA', emoji: '🌿', color: '#22C55E' },
  { label: 'White Noise',    id: 'nMfPqeZjc2c', emoji: '❄️', color: '#14B8A6' },
  { label: 'Jazz Study',     id: 'Dx5qFachd3A', emoji: '🎷', color: '#F59E0B' },
];

const T = {
  text:   '#F1F5F9',
  muted:  '#94A3B8',
  dim:    '#475569',
  bSub:   'rgba(255,255,255,0.06)',
  accent: '#EC4899',
};

export default function AmbientMusic({ isDark }) {
  const [open, setOpen]       = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume]   = useState(40);
  const [muted, setMuted]     = useState(false);
  const [player, setPlayer]   = useState(null);

  const track = TRACKS[trackIdx];

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }
  }, []);

  useEffect(() => {
    if (player && player.loadVideoById) {
      player.loadVideoById(track.id);
      if (!playing) player.stopVideo();
    }
  }, [trackIdx]);

  const initPlayer = () => {
    const p = new window.YT.Player('yt-ambient-player', {
      height: '0', width: '0',
      videoId: TRACKS[0].id,
      playerVars: { autoplay: 0, controls: 0, loop: 1, playlist: TRACKS[0].id },
      events: { onReady: (e) => { e.target.setVolume(40); setPlayer(e.target); } },
    });
  };

  const togglePlay = () => {
    if (!player) return;
    if (playing) { player.stopVideo(); } else { player.playVideo(); player.setVolume(muted ? 0 : volume); }
    setPlaying(p => !p);
  };

  const nextTrack = () => setTrackIdx(i => (i + 1) % TRACKS.length);

  const handleVolume = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (player) player.setVolume(val);
    if (val > 0) setMuted(false);
  };

  const toggleMute = () => {
    setMuted(m => { if (player) player.setVolume(!m ? 0 : volume); return !m; });
  };

  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden',
      background: `linear-gradient(135deg, rgba(236,72,153,0.06), rgba(15,23,42,0.4))`,
      border: '1px solid rgba(236,72,153,0.18)',
    }}>
      <div id="yt-ambient-player" style={{ display: 'none' }} />

      {/* Header / toggle row */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          padding: '10px 14px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(236,72,153,0.06)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 18, flexShrink: 0 }}>
          {[4, 8, 5, 11, 6].map((h, i) => (
            <motion.div
              key={i}
              animate={playing ? { height: [h, h * 2.2, h] } : { height: h }}
              transition={{ duration: 0.45, repeat: playing ? Infinity : 0, delay: i * 0.08 }}
              style={{
                width: 2.5, borderRadius: 2,
                background: playing ? T.accent : 'rgba(236,72,153,0.3)',
              }}
            />
          ))}
        </div>

        <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: T.text }}>
          {track.emoji} {track.label}
        </span>

        {playing && (
          <div style={{
            padding: '2px 7px', borderRadius: 5,
            background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.25)',
            fontSize: 9, fontWeight: 800, color: T.accent,
          }}>
            PLAYING
          </div>
        )}

        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={14} color={T.muted} />
        </motion.div>
      </div>

      {/* Expanded controls */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '10px 14px 12px',
              borderTop: '1px solid rgba(236,72,153,0.12)',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              {/* Track selector */}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {TRACKS.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setTrackIdx(i)}
                    style={{
                      padding: '4px 9px', borderRadius: 7, cursor: 'pointer',
                      background: trackIdx === i ? `${t.color}20` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${trackIdx === i ? `${t.color}40` : 'rgba(255,255,255,0.07)'}`,
                      color: trackIdx === i ? t.color : T.muted,
                      fontSize: 10, fontWeight: 700,
                      transition: 'all 0.2s',
                    }}
                  >
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>

              {/* Playback controls + volume */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Play/Pause */}
                <motion.button
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                  onClick={togglePlay}
                  style={{
                    width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
                    background: playing
                      ? `linear-gradient(135deg, ${track.color}cc, ${track.color})`
                      : `${track.color}20`,
                    border: `1px solid ${track.color}40`,
                    color: playing ? '#fff' : track.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: playing ? `0 4px 12px ${track.color}40` : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {playing ? <Pause size={15} /> : <Play size={15} />}
                </motion.button>

                {/* Skip */}
                <motion.button
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                  onClick={nextTrack}
                  style={{
                    width: 30, height: 30, borderRadius: '50%', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                    color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <SkipForward size={13} />
                </motion.button>

                {/* Mute */}
                <motion.button
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                  onClick={toggleMute}
                  style={{
                    width: 30, height: 30, borderRadius: '50%', cursor: 'pointer',
                    background: muted ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${muted ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)'}`,
                    color: muted ? '#ef4444' : T.muted,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                </motion.button>

                {/* Volume slider */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="range"
                    min={0} max={100}
                    value={muted ? 0 : volume}
                    onChange={handleVolume}
                    style={{
                      flex: 1, height: 4, borderRadius: 2, cursor: 'pointer',
                      WebkitAppearance: 'none', appearance: 'none',
                      background: `linear-gradient(90deg, ${track.color} 0%, ${track.color} ${muted ? 0 : volume}%, rgba(255,255,255,0.1) ${muted ? 0 : volume}%)`,
                    }}
                  />
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.muted, minWidth: 26, textAlign: 'right' }}>
                    {muted ? 0 : volume}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
