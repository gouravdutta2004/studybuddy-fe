import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Twitter, Instagram, Youtube, Linkedin, Github } from 'lucide-react';

const icons = [
  { name: 'Twitter', Icon: Twitter, color: '#1da1f2' },
  { name: 'Instagram', Icon: Instagram, color: '#e1306c' },
  { name: 'YouTube', Icon: Youtube, color: '#ff0000' },
  { name: 'LinkedIn', Icon: Linkedin, color: '#0a66c2' },
  { name: 'GitHub', Icon: Github, color: '#e5e7eb' },
];

export default function SocialDock() {
  const dockRef = useRef(null);
  const iconRefs = useRef([]);

  useEffect(() => {
    const minScale = 1;
    const maxScale = 2; // 2x magnification
    const radius = 150; // Radius of fisheye effect

    const handleMouseMove = (e) => {
      iconRefs.current.forEach((icon, index) => {
        if (!icon) return;
        const rect = icon.getBoundingClientRect();
        const iconCx = rect.left + rect.width / 2;
        const iconCy = rect.top + rect.height / 2;
        const dx = e.clientX - iconCx;
        const dy = e.clientY - iconCy;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let scale = minScale;
        if (distance < radius) {
          // Calculate scale based on distance, closer = bigger
          const intensity = 1 - (distance / radius);
          scale = minScale + (maxScale - minScale) * Math.pow(intensity, 1.5);
        }

        gsap.to(icon, {
          scale: scale,
          duration: 0.1,
          ease: "power2.out",
          transformOrigin: "bottom center" // Anchor expanding to the bottom
        });
      });
    };

    const handleMouseLeave = () => {
      iconRefs.current.forEach((icon) => {
        if (!icon) return;
        gsap.to(icon, {
          scale: minScale,
          duration: 0.3,
          ease: "elastic.out(1.2, 0.5)"
        });
      });
    };

    const container = dockRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div
      ref={dockRef}
      style={{
        position: 'absolute',
        bottom: 30,
        left: 40,
        display: 'flex',
        alignItems: 'flex-end',
        gap: '12px',
        padding: '10px 20px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        backdropFilter: 'blur(10px)',
        zIndex: 100
      }}
    >
      {icons.map((item, i) => (
        <a
          key={item.name}
          href="#"
          ref={el => iconRefs.current[i] = el}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: item.color,
            textDecoration: 'none',
            border: `1px solid ${item.color}40`,
            boxShadow: `0 4px 12px rgba(0,0,0,0.3), 0 0 0px ${item.color}00`,
            transition: 'box-shadow 0.3s, background 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `rgba(0,0,0,0.6)`;
            e.currentTarget.style.boxShadow = `0 10px 24px rgba(0,0,0,0.5), 0 0 20px ${item.color}66`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
            e.currentTarget.style.boxShadow = `0 4px 12px rgba(0,0,0,0.3), 0 0 0px ${item.color}00`;
          }}
        >
          <item.Icon size={20} strokeWidth={2.5} />
        </a>
      ))}
    </div>
  );
}
