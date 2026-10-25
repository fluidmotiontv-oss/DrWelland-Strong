import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { BiometricProfile } from '../types';

interface RadarChartProps {
  biometrics: BiometricProfile;
}

export const RadarChart: React.FC<RadarChartProps> = ({ biometrics }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 320;
    const height = 320;
    const radius = Math.min(width, height) / 2 - 40;
    const center = { x: width / 2, y: height / 2 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Metrics normalized 0 to 100
    const data = [
      { axis: 'Neural Coherence', value: biometrics.neuralCoherence },
      { axis: 'Cellular Vitality', value: biometrics.cellularVitality },
      { axis: 'HRV Balance', value: Math.min(100, (biometrics.hrv / 120) * 100) },
      { axis: 'Cardiovascular', value: Math.max(0, 100 - Math.abs(biometrics.heartRate - 72) * 1.5) },
      { axis: 'Oxygen Saturation', value: biometrics.oxygenSaturation },
      { axis: 'Stress Resilience', value: Math.max(0, 100 - biometrics.stressIndex * 1.5) },
    ];

    const totalAxes = data.length;
    const angleSlice = (Math.PI * 2) / totalAxes;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${center.x}, ${center.y})`);

    // Draw concentric polygon grid circles
    const levels = 4;
    for (let level = 1; level <= levels; level++) {
      const r = (radius / levels) * level;
      const points: [number, number][] = [];
      for (let i = 0; i < totalAxes; i++) {
        const angle = angleSlice * i - Math.PI / 2;
        points.push([r * Math.cos(angle), r * Math.sin(angle)]);
      }

      g.append('polygon')
        .attr('points', points.map((p) => p.join(',')).join(' '))
        .attr('stroke', '#1e293b')
        .attr('stroke-width', 1)
        .attr('fill', level === levels ? '#090d16' : 'none')
        .attr('fill-opacity', 0.5);
    }

    // Draw axis lines and labels
    data.forEach((d, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const lineCoordinates = {
        x2: radius * Math.cos(angle),
        y2: radius * Math.sin(angle),
      };

      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', lineCoordinates.x2)
        .attr('y2', lineCoordinates.y2)
        .attr('stroke', '#334155')
        .attr('stroke-width', 1);

      const labelRadius = radius + 22;
      const x = labelRadius * Math.cos(angle);
      const y = labelRadius * Math.sin(angle);

      g.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', '#94a3b8')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .text(d.axis);
    });

    // Compute radar polygon points
    const polygonPoints: [number, number][] = data.map((d, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const rScale = (Math.max(0, Math.min(100, d.value)) / 100) * radius;
      return [rScale * Math.cos(angle), rScale * Math.sin(angle)];
    });

    // Draw filled radar area
    g.append('polygon')
      .attr('points', polygonPoints.map((p) => p.join(',')).join(' '))
      .attr('fill', '#22d3ee')
      .attr('fill-opacity', 0.3)
      .attr('stroke', '#22d3ee')
      .attr('stroke-width', 2);

    // Draw data circles
    polygonPoints.forEach((p, i) => {
      g.append('circle')
        .attr('cx', p[0])
        .attr('cy', p[1])
        .attr('r', 4)
        .attr('fill', '#a855f7')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.5);
    });
  }, [biometrics]);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
      <svg ref={svgRef} className="overflow-visible" />
      <div className="text-[10px] font-mono text-cyan-400 mt-2 uppercase tracking-wider">
        Starfleet 6-Axis Vitality Equilibrium Matrix
      </div>
    </div>
  );
};
