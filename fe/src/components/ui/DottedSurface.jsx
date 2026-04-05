import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function DottedSurface({ className, ...props }) {
  const { theme } = useTheme();

  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // ── Mobile performance guard ──────────────────────────────────────────
    // On screens < 768px we skip the canvas entirely (hidden via CSS) and
    // render a lightweight CSS gradient fallback instead.
    // Reduce particle count on tablets (768–1024px) for battery savings.
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth < 1024;

    if (isMobile) return; // Canvas is hidden via CSS; nothing to mount.

    const SEPARATION = 150;
    // Reduce particle grid on tablets to half
    const AMOUNTX = isTablet ? 20 : 40;
    const AMOUNTY = isTablet ? 30 : 60;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 2000, 10000);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      10000,
    );
    camera.position.set(0, 355, 1220);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isTablet, // skip antialiasing on tablet for perf
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isTablet ? 1 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(scene.fog.color, 0);

    containerRef.current.appendChild(renderer.domElement);

    // Create particles
    const positions = [];
    const colors = [];

    // Create geometry for all particles
    const geometry = new THREE.BufferGeometry();

    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        const y = 0; // Will be animated
        const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

        positions.push(x, y, z);
        if (theme === 'dark') {
          colors.push(200 / 255, 200 / 255, 200 / 255);
        } else {
          colors.push(0, 0, 0);
        }
      }
    }

    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    // Create material
    const material = new THREE.PointsMaterial({
      size: 8,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    // Create points object
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let count = 0;
    let animationId;

    // Animation function — throttle on tablet to ~30fps for battery savings
    let lastFrame = 0;
    const TARGET_FPS = isTablet ? 30 : 60;
    const FRAME_INTERVAL = 1000 / TARGET_FPS;

    const animate = (timestamp = 0) => {
      animationId = requestAnimationFrame(animate);

      const delta = timestamp - lastFrame;
      if (delta < FRAME_INTERVAL) return; // throttle
      lastFrame = timestamp - (delta % FRAME_INTERVAL);

      const positionAttribute = geometry.attributes.position;
      const posArray = positionAttribute.array;

      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          const index = i * 3;

          posArray[index + 1] =
            Math.sin((ix + count) * 0.3) * 50 +
            Math.sin((iy + count) * 0.5) * 50;

          i++;
        }
      }

      positionAttribute.needsUpdate = true;

      renderer.render(scene, camera);
      count += 0.1;
    };

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Pause when tab is backgrounded to conserve GPU
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(sceneRef.current?.animationId);
      else animate();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Start animation
    animate();

    // Store references
    sceneRef.current = {
      scene,
      camera,
      renderer,
      particles: [points],
      animationId,
      count,
    };

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', onVisibility);

      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);

        sceneRef.current.scene.traverse((object) => {
          if (object instanceof THREE.Points) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((mat) => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        });

        sceneRef.current.renderer.dispose();

        if (containerRef.current && sceneRef.current.renderer.domElement) {
          containerRef.current.removeChild(
            sceneRef.current.renderer.domElement,
          );
        }
      }
    };
  }, [theme]);

  return (
    <>
      {/* Canvas — hidden on mobile via CSS .heavy-canvas-animation class */}
      <div
        ref={containerRef}
        className={cn('pointer-events-none fixed inset-0 z-0 heavy-canvas-animation', className)}
        {...props}
      />
      {/* Lightweight CSS gradient fallback shown on mobile instead of canvas */}
      <div className="mobile-gradient-fallback" aria-hidden="true" />
    </>
  );
}

