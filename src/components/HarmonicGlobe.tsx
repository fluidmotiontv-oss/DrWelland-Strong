import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { generateGridNodes, generateLeyLines } from '../utils/mathGrid';
import { audioService } from '../services/audioService';

interface HarmonicGlobeProps {
  onNodeClick: (nodeId: string) => void;
  showLeyLines: boolean;
  ufoMode: boolean;
}

const HarmonicGlobe: React.FC<HarmonicGlobeProps> = ({ onNodeClick, showLeyLines, ufoMode }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();

  const globeRadius = 5;

  // Setup Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07090e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Earth Sphere (Atmospheric Glow)
    const earthGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x111b27,
      transparent: true,
      opacity: 0.6,
      wireframe: true,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earth);

    // Inner Core
    const coreGeo = new THREE.SphereGeometry(globeRadius * 0.95, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x0a121d,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(core);

    // Grid Nodes
    const nodes = generateGridNodes(globeRadius);
    const nodeGeo = new THREE.IcosahedronGeometry(0.1, 1);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    
    nodes.forEach(node => {
      const mesh = new THREE.Mesh(nodeGeo, nodeMat.clone());
      mesh.position.copy(node.position);
      mesh.userData = { id: node.id, type: 'node' };
      globeGroup.add(mesh);
    });

    // Ley Lines
    const leyLines = generateLeyLines(globeRadius);
    leyLines.forEach(points => {
      const curve = new THREE.CatmullRomCurve3(points);
      const pointsArray = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(pointsArray);
      const material = new THREE.LineBasicMaterial({ 
        color: 0x06b6d4, 
        transparent: true, 
        opacity: 0.3 
      });
      const line = new THREE.Line(geometry, material);
      line.userData = { type: 'leyLine' };
      globeGroup.add(line);
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 2, 50);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // UFO Corridors (Animated Arcs)
    const corridorsGroup = new THREE.Group();
    scene.add(corridorsGroup);

    // Easter Egg: Kombucha Bottle (Simplified geometric representation)
    const kombuchaGroup = new THREE.Group();
    const bottleGeo = new THREE.CylinderGeometry(0.05, 0.08, 0.25, 8);
    const bottleMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, metalness: 0.5, roughness: 0.2 });
    const bottle = new THREE.Mesh(bottleGeo, bottleMat);
    kombuchaGroup.add(bottle);
    
    const capGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.03, 8);
    const capMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.14;
    kombuchaGroup.add(cap);

    // Place it at a specific "harmonic" node (e.g., node-0)
    if (nodes.length > 0) {
      kombuchaGroup.position.copy(nodes[0].position.clone().multiplyScalar(1.05));
      kombuchaGroup.lookAt(new THREE.Vector3(0,0,0));
      kombuchaGroup.rotateX(Math.PI/2);
      kombuchaGroup.userData = { id: 'easter-egg', type: 'kombucha' };
      globeGroup.add(kombuchaGroup);
    }

    // Interaction
    const handlePointerDown = (event: PointerEvent) => {
      mouse.x = (event.clientX / width) * 2 - 1;
      mouse.y = -(event.clientY / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(globeGroup.children, true);

      if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData.type === 'node') {
          onNodeClick(object.userData.id);
          audioService.playNodePulse();
          
          // Visual Pulse
          const originalScale = object.scale.x;
          new Promise(resolve => {
            let scale = 1;
            const animatePulse = () => {
              scale += 0.1;
              object.scale.set(scale, scale, scale);
              if (scale < 3) requestAnimationFrame(animatePulse);
              else resolve(null);
            };
            animatePulse();
          }).then(() => {
            object.scale.set(originalScale, originalScale, originalScale);
          });
        } else if (object.parent?.userData.type === 'kombucha' || object.userData.type === 'kombucha') {
          onNodeClick('kombucha-found');
          audioService.playHarmonicChord();
        }
      }
    };

    mountRef.current.addEventListener('pointerdown', handlePointerDown);

    // Animation Loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      if (globeGroup) {
        globeGroup.rotation.y += 0.001;
      }

      // UFO Mode Animation
      if (ufoMode) {
        // Add flickering or moving lights
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      const w = mountRef.current?.clientWidth || width;
      const h = mountRef.current?.clientHeight || height;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeEventListener('pointerdown', handlePointerDown);
      renderer.dispose();
      scene.clear();
    };
  }, [ufoMode]);

  // Update visibility based on props
  useEffect(() => {
    if (!globeGroupRef.current) return;
    globeGroupRef.current.children.forEach(child => {
      if (child.userData.type === 'leyLine') {
        child.visible = showLeyLines;
      }
    });
  }, [showLeyLines]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};

export default HarmonicGlobe;
