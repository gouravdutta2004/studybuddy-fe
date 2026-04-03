import { motion } from 'framer-motion';

/**
 * FloatingBackground — Lightweight CSS ambient orb animation.
 *
 * Uses `fixed inset-0 z-[-1]` so it sits behind all page content automatically.
 * No props needed — just drop it anywhere inside your page root.
 *
 * Two orbs:
 *  - Indigo  → top-left area   (y+x translate + scale)
 *  - Emerald → bottom-right    (y+x translate + scale, staggered)
 */
export default function FloatingBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-950">

      {/* Glowing Orb 1 — Indigo */}
      <motion.div
        animate={{
          y: [0, -40, 0],
          x: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[20%] left-[15%] w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"
      />

      {/* Glowing Orb 2 — Emerald */}
      <motion.div
        animate={{
          y: [0, 50, 0],
          x: [0, -40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-[10%] right-[20%] w-[30rem] h-[30rem] bg-emerald-500/20 rounded-full blur-[120px]"
      />
    </div>
  );
}
