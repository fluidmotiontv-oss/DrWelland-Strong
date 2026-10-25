import * as THREE from 'three';

// Bruce Cathie's Harmonic Grid Constants (simplified for visualization)
// 144,000 / 162,000 / 172,800 etc.
export const HARMONIC_C = 144000; // Reciprocal of speed of light in Cathie's units
export const GRID_UNIT = 30; // 30 minutes of arc

export interface GridNode {
  position: THREE.Vector3;
  id: string;
  harmonic: number;
}

export function generateGridNodes(radius: number): GridNode[] {
  const nodes: GridNode[] = [];
  
  // Cathie's grid is complex, but often visualizes as a icosahedral or similar geometric mesh
  // For this interactive piece, we'll use a modified subdivision grid
  const phi = (1 + Math.sqrt(5)) / 2;
  
  // Base icosahedron vertices
  const baseVertices = [
    [-1,  phi,  0], [ 1,  phi,  0], [-1, -phi,  0], [ 1, -phi,  0],
    [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
    [ phi,  0, -1], [ phi,  0,  1], [-phi,  0, -1], [-phi,  0,  1]
  ];

  baseVertices.forEach((v, i) => {
    const pos = new THREE.Vector3(v[0], v[1], v[2]).normalize().multiplyScalar(radius);
    nodes.push({
      position: pos,
      id: `node-${i}`,
      harmonic: Math.random() * 100 // Visual representation of resonance
    });
  });

  // Add more nodes at intersections of major ley lines (simplified)
  for (let lat = -90; lat <= 90; lat += 15) {
    for (let lon = 0; lon < 360; lon += 30) {
      const phiLat = (90 - lat) * (Math.PI / 180);
      const thetaLon = lon * (Math.PI / 180);

      const x = radius * Math.sin(phiLat) * Math.cos(thetaLon);
      const y = radius * Math.cos(phiLat);
      const z = radius * Math.sin(phiLat) * Math.sin(thetaLon);

      nodes.push({
        position: new THREE.Vector3(x, y, z),
        id: `latlon-${lat}-${lon}`,
        harmonic: Math.random() * 50
      });
    }
  }

  return nodes;
}

export function generateLeyLines(radius: number): THREE.Vector3[][] {
  const lines: THREE.Vector3[][] = [];
  
  // Major longitudinal "Harmonic Corridors"
  for (let lon = 0; lon < 360; lon += 45) {
    const points: THREE.Vector3[] = [];
    for (let lat = -90; lat <= 90; lat += 5) {
      const phiLat = (90 - lat) * (Math.PI / 180);
      const thetaLon = lon * (Math.PI / 180);
      points.push(new THREE.Vector3(
        radius * Math.sin(phiLat) * Math.cos(thetaLon),
        radius * Math.cos(phiLat),
        radius * Math.sin(phiLat) * Math.sin(thetaLon)
      ));
    }
    lines.push(points);
  }

  // Equator and Tropics
  [0, 23.5, -23.5, 66.5, -66.5].forEach(lat => {
    const points: THREE.Vector3[] = [];
    for (let lon = 0; lon <= 360; lon += 5) {
      const phiLat = (90 - lat) * (Math.PI / 180);
      const thetaLon = lon * (Math.PI / 180);
      points.push(new THREE.Vector3(
        radius * Math.sin(phiLat) * Math.cos(thetaLon),
        radius * Math.cos(phiLat),
        radius * Math.sin(phiLat) * Math.sin(thetaLon)
      ));
    }
    lines.push(points);
  });

  return lines;
}
