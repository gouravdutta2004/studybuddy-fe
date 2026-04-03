import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * TextReveal — VWLAB-style split-character clip-path stagger reveal.
 * Usage: <TextReveal tag="h2" delay={0.2}>Your heading here</TextReveal>
 */
export default function TextReveal({
  children,
  tag: Tag = 'span',
  delay = 0,
  stagger = 0.028,
  duration = 0.9,
  ease = 'expo.out',
  className = '',
  style = {},
  triggerStart = 'top 90%',
}) {
  const wrapRef = useRef(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    // Split text into individual character spans
    const text = wrap.textContent;
    wrap.innerHTML = '';
    wrap.style.lineHeight = 'inherit';

    const chars = [...text].map((char) => {
      const outer = document.createElement('span');
      outer.style.display = 'inline-block';
      outer.style.overflow = 'hidden';
      outer.style.verticalAlign = 'bottom';
      // Preserve word spacing
      if (char === ' ') {
        outer.style.width = '0.3em';
        outer.innerHTML = '&nbsp;';
      } else {
        const inner = document.createElement('span');
        inner.textContent = char;
        inner.style.display = 'inline-block';
        inner.style.willChange = 'transform, clip-path';
        outer.appendChild(inner);
      }
      wrap.appendChild(outer);
      return outer.querySelector('span') || outer;
    });

    const realChars = chars.filter(Boolean);

    // Set initial state: hidden below clip-path + translateY
    gsap.set(realChars, {
      yPercent: 110,
      clipPath: 'inset(0 0 100% 0)',
    });

    const ctx = gsap.context(() => {
      gsap.to(realChars, {
        yPercent: 0,
        clipPath: 'inset(0 0 0% 0)',
        duration,
        ease,
        stagger,
        delay,
        scrollTrigger: {
          trigger: wrap,
          start: triggerStart,
          toggleActions: 'play none none none',
        },
      });
    }, wrap);

    return () => ctx.revert();
  }, [children, delay, stagger, duration, ease, triggerStart]);

  return (
    <Tag ref={wrapRef} className={className} style={{ display: 'inline-block', ...style }}>
      {typeof children === 'string' ? children : ''}
    </Tag>
  );
}
