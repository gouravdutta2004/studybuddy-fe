import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

/**
 * HeroGlobe — Three.js WebGL instanced-particle sphere.
 * VWLAB: "WebGL / 3D Animations" category.
 * Slowly rotates, reacts to mouse tilt. Full cleanup on unmount.
 */
export default function HeroGlobe() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ─── Scene setup ───────────────────────────────────────────────
    const scene = new THREE.Scene();
    const w = mount.clientWidth;
    const h = mount.clientHeight;

    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.z = 3.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ─── Geometry: Fibonacci sphere distribution ────────────────────
    const COUNT = 900;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    const colors = new Float32Array(COUNT * 3);

    // Purple + teal palette
    const palette = [
      new THREE.Color('#7c3aed'),
      new THREE.Color('#a78bfa'),
      new THREE.Color('#10b981'),
      new THREE.Color('#34d399'),
      new THREE.Color('#5b21b6'),
    ];

    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < COUNT; i++) {
      const theta = Math.acos(1 - (2 * (i + 0.5)) / COUNT);
      const phi = (2 * Math.PI * i) / goldenRatio;
      const r = 1.6 + (Math.random() - 0.5) * 0.25;

      positions[i * 3] = r * Math.sin(theta) * Math.cos(phi);
      positions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = r * Math.cos(theta);

      sizes[i] = Math.random() * 2.5 + 0.8;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // ─── Shader Material for soft glowing points ────────────────────
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexColors: true,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uTime;
        uniform float uPixelRatio;

        void main() {
          vColor = color;
          // Pulse alpha over time per particle
          vAlpha = 0.4 + 0.3 * sin(uTime * 1.2 + position.x * 4.0 + position.y * 2.0);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uPixelRatio * (120.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          // Soft circular point with glow falloff
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float strength = 1.0 - (dist * 2.0);
          strength = pow(strength, 2.0);
          gl_FragColor = vec4(vColor, strength * vAlpha);
        }
      `,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // ─── Mouse reaction ─────────────────────────────────────────────
    let targetX = 0;
    let targetY = 0;
    const handleMouseMove = (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 0.4;
      targetY = (e.clientY / window.innerHeight - 0.5) * 0.4;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // ─── Resize ─────────────────────────────────────────────────────
    const handleResize = () => {
      const nw = mount.clientWidth;
      const nh = mount.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    // ─── Animation loop ─────────────────────────────────────────────
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      material.uniforms.uTime.value = elapsed;

      // Slow base rotation
      points.rotation.y = elapsed * 0.08;
      points.rotation.x = elapsed * 0.03;

      // Smooth mouse-driven tilt
      points.rotation.y += (targetX - points.rotation.y * 0.1) * 0.02;
      points.rotation.x += (targetY - points.rotation.x * 0.1) * 0.02;

      renderer.render(scene, camera);
    };
    animate();

    // ─── Cleanup ────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.65,
      }}
    />
  );
}
