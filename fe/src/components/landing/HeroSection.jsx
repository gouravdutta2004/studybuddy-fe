import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import AcademiaLogo from './AcademiaLogo';
import HeroGlobe from './HeroGlobe';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const TRAIL_COUNT = 5;

const cursorBase = { position:'fixed', top:0, left:0, pointerEvents:'none', zIndex:9999, transform:'translate(-50%,-50%)', borderRadius:'50%' };

const S = {
  hero: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', padding:'130px 0 60px', textAlign:'center', background:'radial-gradient(ellipse at 50% 0%,rgba(124,58,237,0.14) 0%,rgba(16,185,129,0.05) 40%,transparent 70%)', cursor: 'none' },
  inner: { position:'relative', zIndex:2, width:'100%', maxWidth:1100, margin:'0 auto', padding:'0 1.5rem' },
  cardWrap: { perspective:1200 },
  card: { width:'100%', maxWidth:960, margin:'0 auto', background:'#0f1423', border:'1.5px solid rgba(124,58,237,0.18)', borderRadius:32, boxShadow:'0 20px 60px rgba(0,0,0,0.5),0 0 60px rgba(124,58,237,0.2),inset 0 1px 0 rgba(255,255,255,0.05)', position:'relative', transformStyle:'preserve-3d', transition:'transform .6s cubic-bezier(0.34,1.56,0.64,1)', willChange: 'clip-path, transform' },
  bbar: { display:'flex', alignItems:'center', gap:7, padding:'13px 18px', background:'rgba(0,0,0,0.28)', borderBottom:'1px solid rgba(255,255,255,0.06)' },
  dotR: { width:11, height:11, borderRadius:'50%', background:'#ff5f57' },
  dotY: { width:11, height:11, borderRadius:'50%', background:'#febc2e' },
  dotG: { width:11, height:11, borderRadius:'50%', background:'#28c840' },
  burl: { flex:1, marginLeft:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:9999, padding:'5px 14px', fontSize:'0.72rem', color:'#5a5f7a' },
  blive: { fontSize:'0.7rem', padding:'4px 10px', background:'rgba(16,185,129,0.12)', color:'#10b981', border:'1px solid rgba(16,185,129,0.22)', borderRadius:9999, fontWeight:700 },
  hcontent: { padding:'3rem 3rem 3.5rem' },
  badge: { fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'#10b981', marginBottom:'1.25rem', display:'inline-block' },
  htitle: { fontFamily:'"Space Grotesk",sans-serif', fontSize:'clamp(2.8rem,8vw,5.5rem)', fontWeight:900, lineHeight:.98, letterSpacing:'-.03em', marginBottom:'1.25rem', color:'#f0f0f5', willChange: 'clip-path' },
  gt: { background:'linear-gradient(135deg,#f0f0f5 0%,#a78bfa 50%,#7c3aed 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' },
  hsub: { fontSize:'1.05rem', color:'#8b8fa8', maxWidth:500, margin:'0 auto 2rem', lineHeight:1.7 },
  ctas: { display:'flex', alignItems:'center', justifyContent:'center', gap:'1rem', flexWrap:'wrap' },
  btnP: { display:'inline-flex', alignItems:'center', gap:'.5rem', padding:'.9rem 2rem', background:'linear-gradient(135deg,#7c3aed,#5b21b6)', color:'#fff', borderRadius:9999, fontWeight:600, fontSize:'1rem', cursor:'none', border:'none', fontFamily:'inherit', boxShadow:'0 6px 20px rgba(124,58,237,0.25)', transition:'all .3s', textDecoration:'none', zIndex: 10, position: 'relative' },
  btnO: { display:'inline-flex', alignItems:'center', gap:'.5rem', padding:'.9rem 1.75rem', border:'1.5px solid rgba(255,255,255,0.2)', color:'#f0f0f5', borderRadius:9999, fontWeight:600, fontSize:'1rem', cursor:'none', background:'none', fontFamily:'inherit', transition:'all .3s', textDecoration:'none', zIndex: 10, position: 'relative' },
  stats: { display:'flex', justifyContent:'center', gap:'2.5rem', marginTop:'2.5rem', flexWrap:'wrap' },
  statVal: { fontFamily:'"Space Grotesk",sans-serif', fontSize:'1.8rem', fontWeight:800, lineHeight:1 },
  statLbl: { fontSize:'0.72rem', color:'#5a5f7a', marginTop:4 },
  sdiv: { width:1, height:34, background:'rgba(255,255,255,0.06)', alignSelf:'center' },
  scrollHint: { position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:8, color:'#5a5f7a', fontSize:'.68rem', opacity:0, animation:'fiu .8s ease 2.4s forwards', pointerEvents:'none' },
  orb1: { position:'absolute', borderRadius:'50%', filter:'blur(120px)', width:700, height:700, background:'rgba(124,58,237,0.08)', top:-250, right:-150, willChange:'transform' },
  orb2: { position:'absolute', borderRadius:'50%', filter:'blur(120px)', width:500, height:500, background:'rgba(16,185,129,0.06)', bottom:-200, left:-100, willChange:'transform' },
  customCursor: { ...cursorBase, width:24, height:24, backgroundColor:'#10b981', filter:'blur(4px)', mixBlendMode:'screen', zIndex:9999 },
  customCursorDot: { ...cursorBase, width:5, height:5, backgroundColor:'#fff', zIndex:10000 },
};

const trailStyle = (i) => ({
  position:'fixed', top:0, left:0, pointerEvents:'none',
  zIndex: 9997 - i,
  width: Math.max(4, 18 - i * 2.8),
  height: Math.max(4, 18 - i * 2.8),
  borderRadius: '50%',
  backgroundColor: i % 2 === 0 ? '#7c3aed' : '#10b981',
  opacity: Math.max(0.04, 0.22 - i * 0.04),
  filter: `blur(${2 + i * 1.5}px)`,
  transform: 'translate(-50%, -50%)',
  mixBlendMode: 'screen',
});

export default function HeroSection() {
  const cardRef = useRef(null);
  const countersInit = useRef(false);
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);
  const trailRefs = useRef([]);
  const titleRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const sectionRef = useRef(null);

  // 1. Clip-path entry animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current,
        { clipPath: 'inset(35% 35% 35% 35% round 2rem)', scale: 0.85, opacity: 0 },
        { clipPath: 'inset(0% 0% 0% 0% round 2rem)', scale: 1, opacity: 1, duration: 2.2, ease: 'power3.inOut', delay: 0.3 }
      );
      gsap.fromTo(titleRef.current,
        { clipPath: 'circle(0% at 50% 100%)', yPercent: 35 },
        { clipPath: 'circle(150% at 50% 50%)', yPercent: 0, duration: 2.5, ease: 'expo.out', delay: 1.4 }
      );
    });
    return () => ctx.revert();
  }, []);

  // 2. Parallax orbs on scroll scrub
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(orb1Ref.current, {
        yPercent: -60, xPercent: 15,
        scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 1.5 }
      });
      gsap.to(orb2Ref.current, {
        yPercent: 40, xPercent: -20,
        scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 2 }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // 3. Ambient orb float (GSAP yoyo, replaces CSS @keyframes)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(orb1Ref.current, { x: 50, y: -40, scale: 1.1, duration: 12, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to(orb2Ref.current, { x: -40, y: 50, scale: 0.9, duration: 16, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 });
    });
    return () => ctx.revert();
  }, []);

  // 4. Custom cursor with 5-ghost trail
  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;
    const trails = trailRefs.current;
    if (!cursor || !dot) return;

    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.4, ease: 'power3' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.4, ease: 'power3' });
    const xDot = gsap.quickTo(dot, 'x', { duration: 0.08 });
    const yDot = gsap.quickTo(dot, 'y', { duration: 0.08 });

    const trailFns = trails.map((t, i) => ({
      x: gsap.quickTo(t, 'x', { duration: 0.12 + i * 0.08, ease: 'power2' }),
      y: gsap.quickTo(t, 'y', { duration: 0.12 + i * 0.08, ease: 'power2' }),
    }));

    const onMove = (e) => {
      xTo(e.clientX); yTo(e.clientY);
      xDot(e.clientX); yDot(e.clientY);
      trailFns.forEach(fn => { fn.x(e.clientX); fn.y(e.clientY); });
    };
    const onEnter = () => gsap.to(cursor, { width: 52, height: 52, backgroundColor: '#7c3aed', duration: 0.3 });
    const onLeave = () => gsap.to(cursor, { width: 24, height: 24, backgroundColor: '#10b981', duration: 0.3 });

    window.addEventListener('mousemove', onMove);
    const links = document.querySelectorAll('a, button');
    links.forEach(l => { l.addEventListener('mouseenter', onEnter); l.addEventListener('mouseleave', onLeave); });
    return () => {
      window.removeEventListener('mousemove', onMove);
      links.forEach(l => { l.removeEventListener('mouseenter', onEnter); l.removeEventListener('mouseleave', onLeave); });
    };
  }, []);

  // 5. Card magnetic tilt
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const rx = (e.clientY - r.top - r.height / 2) / 26;
      const ry = (r.width / 2 - (e.clientX - r.left)) / 26;
      el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-5px)`;
    };
    const onLeave = () => { el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)'; };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, []);

  // 6. Animated counters
  useEffect(() => {
    if (countersInit.current) return;
    countersInit.current = true;
    const counters = document.querySelectorAll('.hero-counter');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target; const t = +el.dataset.t; const s = performance.now();
        const tick = (now) => {
          const p = Math.min((now - s) / 2000, 1);
          el.textContent = Math.round(t * (1 - Math.pow(1 - p, 3))).toLocaleString();
          if (p < 1) requestAnimationFrame(tick); else el.textContent = t.toLocaleString();
        };
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(c => obs.observe(c));
    return () => obs.disconnect();
  }, []);

  const magOver = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px,${(e.clientY - r.top - r.height / 2) * 0.22}px)`;
  };
  const magOut = (e) => { e.currentTarget.style.transform = ''; };

  const handleScrollDown = () => {
    const target = document.getElementById('features');
    if (target) window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
  };

  return (
    <section ref={sectionRef} style={S.hero} id="top" onClick={(e) => {
      if (e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON' && !e.target.closest('a')) handleScrollDown();
    }}>
      <style>{`
        @keyframes fiu{from{opacity:0;transform:translate(-50%,28px)}to{opacity:1;transform:translate(-50%,0)}}
        @keyframes scrollBounce{0%,100%{transform:translateX(-50%) translateY(0);opacity:1}50%{transform:translateX(-50%) translateY(10px);opacity:.25}}
        .hero-btn-p:hover{transform:translateY(-2px)!important;box-shadow:0 12px 32px rgba(124,58,237,0.35)!important}
        .hero-btn-o:hover{border-color:#7c3aed!important;background:rgba(124,58,237,0.08)!important;transform:translateY(-2px)!important}
        body,*,*::before,*::after{cursor:none!important}
      `}</style>

      {/* WebGL Three.js particle sphere */}
      <HeroGlobe />

      {/* Custom cursor: blob + dot */}
      <div ref={cursorRef} style={S.customCursor} />
      <div ref={cursorDotRef} style={S.customCursorDot} />

      {/* Ghost trail */}
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div key={i} ref={el => { trailRefs.current[i] = el; }} style={trailStyle(i)} />
      ))}

      {/* Parallax ambient orbs */}
      <div ref={orb1Ref} style={S.orb1} />
      <div ref={orb2Ref} style={S.orb2} />

      {/* Motion-path orbit ring decoration */}
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:1, opacity:0.1 }} viewBox="0 0 1400 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="og" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#10b981"/></linearGradient>
          <linearGradient id="og2" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#a78bfa"/></linearGradient>
        </defs>
        <ellipse cx="700" cy="450" rx="520" ry="275" fill="none" stroke="url(#og)" strokeWidth="1"/>
        <ellipse cx="700" cy="450" rx="360" ry="185" fill="none" stroke="url(#og2)" strokeWidth="0.7"/>
      </svg>

      <div style={S.inner}>
        <div style={S.cardWrap}>
          <div ref={cardRef} style={S.card}>
            <div className="aca-container" style={{ position:'absolute', top:'-15%', right:'-5%', width:200, height:250, zIndex:10, filter:'drop-shadow(0 20px 30px rgba(0,0,0,0.5))', pointerEvents:'auto', transform:'rotate(10deg)' }}>
              <AcademiaLogo />
            </div>
            <div style={S.bbar}>
              <div style={S.dotR}/><div style={S.dotY}/><div style={S.dotG}/>
              <div style={S.burl}>studyfriend.co.in</div>
              <div style={S.blive}>● Live</div>
            </div>
            <div style={S.hcontent}>
              <div style={S.badge}>✦ STUDYFRIEND</div>
              <h1 ref={titleRef} style={S.htitle}>Find your<br/><span style={S.gt}>Tribe.</span></h1>
              <p style={S.hsub}>The ultimate study operating system. Match with perfect study partners, join live hubs, and accelerate your learning.</p>
              <div style={S.ctas}>
                <a href="/register" className="hero-btn-p" style={S.btnP} onMouseMove={magOver} onMouseLeave={magOut}>
                  Start Free
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
                <a href="#watch" className="hero-btn-o" style={S.btnO} onMouseMove={magOver} onMouseLeave={magOut}>
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21"/></svg>
                  Watch Demo
                </a>
              </div>
              <div style={S.stats}>
                <div style={{textAlign:'center'}}><div className="hero-counter" data-t="2500" style={S.statVal}>0</div><div style={S.statLbl}>Active Students</div></div>
                <div style={S.sdiv}/>
                <div style={{textAlign:'center'}}><div className="hero-counter" data-t="15" style={S.statVal}>0</div><div style={S.statLbl}>Universities</div></div>
                <div style={S.sdiv}/>
                <div style={{textAlign:'center'}}><div className="hero-counter" data-t="98" style={S.statVal}>0</div><div style={S.statLbl}>Match Rate %</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={S.scrollHint}>
        <div style={{width:22,height:36,border:'2px solid rgba(255,255,255,0.12)',borderRadius:11,position:'relative'}}>
          <div style={{width:3,height:7,background:'#7c3aed',borderRadius:9999,position:'absolute',top:6,left:'50%',animation:'scrollBounce 2s ease-in-out infinite'}}/>
        </div>
        <span>Scroll to explore</span>
      </div>
    </section>
  );
}
