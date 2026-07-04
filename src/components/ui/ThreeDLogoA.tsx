import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useTheme } from "@/components/ThemeProvider";

interface ThreeDLogoAProps {
  className?: string;
  size?: number; // Size for fallback SVG
}

export function ThreeDLogoA({ className = "", size = 96 }: ThreeDLogoAProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL support
    let canvas: HTMLCanvasElement | null = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    canvas = null; // garbage collect
    if (!gl) {
      setWebglSupported(false);
      return;
    }

    // Three.js Setup
    let width = container.clientWidth || 96;
    let height = container.clientHeight || 96;

    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 10);
    camera.position.set(0, 0, 3.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Geometry: Extruded Custom Shape for Modern Geometric 'A'
    const shape = new THREE.Shape();
    // Outer border
    shape.moveTo(-0.4, -0.85);
    shape.lineTo(-0.14, 0.85);
    shape.lineTo(0.14, 0.85);
    shape.lineTo(0.4, -0.85);
    shape.lineTo(0.2, -0.85);
    shape.lineTo(0.12, -0.28);
    shape.lineTo(-0.12, -0.28);
    shape.lineTo(-0.2, -0.85);
    shape.closePath();

    // Inner cutout hole (Triangle)
    const hole = new THREE.Path();
    hole.moveTo(-0.08, -0.12);
    hole.lineTo(0, 0.42);
    hole.lineTo(0.08, -0.12);
    hole.closePath();
    shape.holes.push(hole);

    // Extrude configurations
    const extrudeSettings = {
      depth: 0.26,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.035,
      bevelThickness: 0.035,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    // Materials & Color configurations based on Theme
    const isDark = theme === "dark";
    
    // Premium Metallic paint physical material
    const material = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0x0ea5e9 : 0x2563eb, // Sky blue in dark, royal blue in light
      metalness: 0.9,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 1.0,
      emissive: isDark ? 0x0284c7 : 0x1d4ed8,
      emissiveIntensity: isDark ? 0.35 : 0.08,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.75 : 0.95);
    scene.add(ambientLight);

    // Top-left main highlighting light (Cyan/Blue)
    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, isDark ? 3.5 : 2.5);
    dirLight1.position.set(-1.8, 2.2, 2.8);
    scene.add(dirLight1);

    // Bottom-right contrasting light (Violet/Magenta)
    const dirLight2 = new THREE.DirectionalLight(0x818cf8, isDark ? 3.0 : 1.8);
    dirLight2.position.set(1.8, -2.2, 1.8);
    scene.add(dirLight2);

    // Animation variables
    let animationFrameId: number;
    let targetRotationX = 0;
    let targetRotationY = 0;
    const currentRotationX = { value: 0 };
    const currentRotationY = { value: 0 };

    // Mouse movement handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

      // Set target rotation based on hover
      targetRotationY = x * 1.0;
      targetRotationX = y * 0.8;
    };

    const handleMouseLeave = () => {
      targetRotationX = 0;
      targetRotationY = 0;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    // Resize Observer for Auto-Resizing the canvas to its parent container
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (newWidth === 0 || newHeight === 0) return;
        renderer.setSize(newWidth, newHeight);
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Smooth interpolation for mouse movements (Lerp)
      currentRotationX.value += (targetRotationX - currentRotationX.value) * 0.1;
      currentRotationY.value += (targetRotationY - currentRotationY.value) * 0.1;

      // Base floating rotation + mouse look parallax
      mesh.rotation.y = currentRotationY.value + Math.sin(elapsed * 0.9) * 0.15;
      mesh.rotation.x = currentRotationX.value + Math.cos(elapsed * 0.7) * 0.1;
      
      // Gentle wobble / tilt
      mesh.position.y = Math.sin(elapsed * 1.2) * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [theme]);

  // Fallback to high-end 3D CSS/SVG monogram if WebGL isn't supported
  if (!webglSupported) {
    return (
      <div 
        className={`relative flex items-center justify-center ${className}`}
        style={{ width: "100%", height: "100%" }}
      >
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full drop-shadow-[0_8px_16px_rgba(14,165,233,0.35)] animate-pulse"
        >
          <defs>
            <linearGradient id="leftLegGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="rightLegGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="crossBarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          
          {/* 3D Styled Letter A */}
          <path d="M 50 15 L 20 85 L 36 85 L 50 50 Z" fill="url(#leftLegGrad)" opacity="0.95" />
          <path d="M 50 15 L 80 85 L 64 85 L 50 50 Z" fill="url(#rightLegGrad)" opacity="0.95" />
          <path d="M 33 60 L 67 60 L 60 50 L 40 50 Z" fill="url(#crossBarGrad)" />
        </svg>
      </div>
    );
  }

  // Active WebGL Three.js Container
  return (
    <div 
      ref={containerRef} 
      className={`relative select-none outline-none filter drop-shadow-[0_12px_24px_rgba(14,165,233,0.35)] dark:drop-shadow-[0_16px_36px_rgba(56,189,248,0.45)] ${className}`}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
