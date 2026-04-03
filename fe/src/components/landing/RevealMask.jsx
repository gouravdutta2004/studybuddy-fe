import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * RevealMask — wraps children and reveals them via clip-path curtain on scroll.
 * Matches the VWLAB "Reveal / Mask Animations" category.
 * Usage: <RevealMask><YourSection /></RevealMask>
 */
export default function RevealMask({
  children,
  direction = 'up',  // 'up' | 'left' | 'right'
  duration = 1.4,
  ease = 'expo.inOut',
  start = 'top 88%',
  style = {},
  className = '',
}) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const fromClip = {
      up: 'inset(100% 0% 0% 0%)',
      left: 'inset(0% 100% 0% 0%)',
      right: 'inset(0% 0% 0% 100%)',
    }[direction];

    const toClip = 'inset(0% 0% 0% 0%)';

    // Also counter-clip the inner so content stays in position
    const counterFrom = {
      up: 'inset(-100% 0% 100% 0%)',
      left: 'inset(0% -100% 0% 100%)',
      right: 'inset(0% 100% 0% -100%)',
    }[direction];

    gsap.set(outer, { clipPath: fromClip });
    gsap.set(inner, { clipPath: counterFrom });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: outer,
          start,
          toggleActions: 'play none none none',
        },
      });

      tl.to(outer, { clipPath: toClip, duration, ease }, 0);
      tl.to(inner, { clipPath: toClip, duration, ease }, 0);
    }, outer);

    return () => ctx.revert();
  }, [direction, duration, ease, start]);

  return (
    <div
      ref={outerRef}
      className={className}
      style={{ overflow: 'hidden', willChange: 'clip-path', ...style }}
    >
      <div ref={innerRef} style={{ willChange: 'clip-path' }}>
        {children}
      </div>
    </div>
  );
}
