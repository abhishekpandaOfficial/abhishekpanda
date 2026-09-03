import { useEffect, useRef } from "react";
import * as THREE from "three";

export function PortfolioAtmosphere() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 30);
    camera.position.z = 7;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    host.appendChild(canvas);

    const positions: number[] = [];
    const nodes: THREE.Vector3[] = [];
    for (let index = 0; index < 34; index += 1) {
      const angle = index * 2.399;
      const radius = 1.2 + (index % 7) * 0.43;
      const node = new THREE.Vector3(
        Math.cos(angle) * radius * 1.35,
        Math.sin(angle) * radius * 0.78,
        ((index % 9) - 4) * 0.22,
      );
      nodes.push(node);
      positions.push(node.x, node.y, node.z);
    }

    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    const pointMaterial = new THREE.PointsMaterial({ color: 0x2563eb, size: 0.055, transparent: true, opacity: 0.48 });
    const points = new THREE.Points(pointGeometry, pointMaterial);

    const linePositions: number[] = [];
    nodes.forEach((node, index) => {
      const next = nodes[(index + 5) % nodes.length];
      linePositions.push(node.x, node.y, node.z, next.x, next.y, next.z);
    });
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.12 });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    const group = new THREE.Group();
    group.add(points, lines);
    scene.add(group);

    let targetX = 0;
    let targetY = 0;
    let frame = 0;
    let running = true;
    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const onPointerMove = (event: PointerEvent) => {
      targetY = (event.clientX / window.innerWidth - 0.5) * 0.16;
      targetX = (event.clientY / window.innerHeight - 0.5) * 0.1;
    };
    const onVisibility = () => {
      running = !document.hidden;
      if (running) frame = requestAnimationFrame(animate);
    };
    const animate = (time: number) => {
      if (!running) return;
      group.rotation.x += (targetX - group.rotation.x) * 0.025;
      group.rotation.y += (targetY + time * 0.000025 - group.rotation.y) * 0.02;
      group.position.y = Math.sin(time * 0.00028) * 0.08;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(host);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    resize();
    frame = requestAnimationFrame(animate);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      pointGeometry.dispose();
      pointMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return <div ref={hostRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />;
}
