import React, { useEffect, useRef } from 'react';

export default function ThreeBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX - width / 2) / 100;
      mouseY = (e.clientY - height / 2) / 100;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const points = [];
    const rows = 20;
    const cols = 20;
    const spacing = 45;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        points.push({
          x: (c - cols / 2) * spacing,
          y: 100,
          z: (r - rows / 2) * spacing,
          baseY: 100,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    let angleX = 0.4;
    let angleY = 0.2;
    const focalLength = 400;

    const animate = (time) => {
      if (!canvas) return;
      ctx.clearRect(0, 0, width, height);

      angleY += (mouseX * 0.05 - angleY) * 0.1;
      angleX += (mouseY * 0.05 + 0.4 - angleX) * 0.1;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      const projected = points.map((p) => {
        const wave = Math.sin(time * 0.0015 + p.phase + (p.x * 0.01) + (p.z * 0.01)) * 35;
        const currentY = p.baseY + wave;

        let rx = p.x * cosY - p.z * sinY;
        let rz = p.z * cosY + p.x * sinY;

        let ry = currentY * cosX - rz * sinX;
        rz = rz * cosX + currentY * sinX;

        const scale = focalLength / (focalLength + rz + 300);
        const screenX = rx * scale + width / 2;
        const screenY = ry * scale + height / 2;

        return { x: screenX, y: screenY, z: rz, scale };
      });

      ctx.lineWidth = 0.65;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const p1 = projected[idx];

          if (c < cols - 1) {
            const p2 = projected[idx + 1];
            const opacity = Math.min(Math.max(p1.scale * 0.18, 0.01), 0.28);
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }

          if (r < rows - 1) {
            const p2 = projected[idx + cols];
            const opacity = Math.min(Math.max(p1.scale * 0.18, 0.01), 0.28);
            ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }

          if (p1.scale > 0.4) {
            const opacity = Math.min(Math.max(p1.scale * 0.22, 0.02), 0.45);
            ctx.fillStyle = `rgba(16, 185, 129, ${opacity})`;
            ctx.beginPath();
            ctx.arc(p1.x, p1.y, 1.2 * p1.scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-80" 
    />
  );
}
