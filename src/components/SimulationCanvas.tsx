"use client";
import React, { useEffect, useRef } from 'react';

interface SimulationCanvasProps {
  pressure: number;
  vacuum: number;
  velocity: number;
  noise: number;
  mode: string;
  showParticles: boolean;
  hasSilencer: boolean;
  speedFactor: number;
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  pressure, vacuum, velocity, noise, mode, showParticles, hasSilencer, speedFactor
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<{x: number, y: number, vx: number, vy: number, type: string, life: number}[]>([]);
  const animationRef = useRef<number | null>(null);

  const geo = {
    inletX: 0, inletY: 150, inletW: 150, inletH: 60,
    throatX: 150, throatY: 170, throatW: 40, throatH: 20,
    diffuserX: 190, diffuserY: 150, diffuserW: 80, diffuserH: 60,
    outletX: 270, outletY: 155, outletW: 630, outletH: 50,
    suctionX: 160, suctionY: 190, suctionW: 30, suctionH: 60,
    cavityX: 100, cavityY: 250, cavityW: 600, cavityH: 220,
    ballR: 90
  };

  const numParticles = 400;

  useEffect(() => {
    const resetParticle = () => {
      const isMainStream = Math.random() > 0.35;
      if (isMainStream) {
        return { x: Math.random() * geo.inletW, y: geo.inletY + Math.random() * geo.inletH, vx: 0, vy: 0, type: 'N2', life: 0 };
      } else {
        let px, py, d;
        let attempts = 0;
        const cx = geo.cavityX + geo.cavityW * 0.7; // Right 1/3 side
        const cy = geo.cavityY + geo.cavityH / 2;
        do {
          px = geo.cavityX + Math.random() * geo.cavityW;
          py = geo.cavityY + Math.random() * geo.cavityH;
          const dx = px - cx; const dy = py - cy;
          d = Math.sqrt(dx * dx + dy * dy);
          attempts++;
        } while (d < geo.ballR + 5 && attempts < 10);
        return { x: px, y: py, vx: 0, vy: 0, type: 'Air', life: 0 };
      }
    };

    particlesRef.current = Array.from({ length: numParticles }, resetParticle);
  }, []); 

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply cylindrical 3D shading over color
    const applyCylindricalShade = (x: number, y: number, w: number, h: number, horizontal: boolean) => {
      const shade = horizontal 
        ? ctx.createLinearGradient(0, y, 0, y + h) 
        : ctx.createLinearGradient(x, 0, x + w, 0);
      shade.addColorStop(0, 'rgba(0,0,0,0.6)');
      shade.addColorStop(0.2, 'rgba(255,255,255,0.2)');
      shade.addColorStop(0.5, 'rgba(255,255,255,0)');
      shade.addColorStop(0.8, 'rgba(255,255,255,0.1)');
      shade.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = shade;
      ctx.fillRect(x, y, w, h);
    };

    const drawField = () => {
      const factor = (pressure - 3.0) / 4.0;
      
      if (mode === 'pressure') {
        const gradMain = ctx.createLinearGradient(0, 0, 900, 0);
        const startColor = `rgba(${200 + factor * 55}, ${200 - factor * 200}, 0, 1)`;
        gradMain.addColorStop(0, startColor);
        gradMain.addColorStop(0.3, '#2ecc71'); gradMain.addColorStop(1, '#2ecc71');
        ctx.fillStyle = gradMain; ctx.fillRect(0, 0, 900, 500);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(geo.cavityX, geo.cavityY, geo.cavityW, geo.cavityH);
        ctx.fillRect(geo.suctionX, geo.throatY, geo.suctionW, geo.cavityY - geo.throatY);
      }
      else if (mode === 'vacuum') {
        ctx.fillStyle = '#111'; ctx.fillRect(0, 0, 900, 500);
        const vacIntensity = factor * 0.85; 
        const r = 52 * (1 - vacIntensity); const g = 152 * (1 - vacIntensity); const b = 219 * (1 - vacIntensity) + 128 * vacIntensity;
        const vacColor = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
        ctx.fillStyle = '#2ecc71'; ctx.fillRect(geo.inletX, geo.inletY, geo.inletW, geo.inletH);
        ctx.fillStyle = vacColor; ctx.fillRect(geo.cavityX, geo.cavityY, geo.cavityW, geo.cavityH);
        const gradSuction = ctx.createLinearGradient(0, geo.throatY, 0, geo.cavityY);
        gradSuction.addColorStop(0, '#000080'); gradSuction.addColorStop(1, vacColor);
        ctx.fillStyle = gradSuction; ctx.fillRect(geo.suctionX, geo.throatY, geo.suctionW, geo.cavityY - geo.throatY);
        const gradOut = ctx.createLinearGradient(geo.throatX, 0, geo.outletX, 0);
        gradOut.addColorStop(0, '#2ecc71'); gradOut.addColorStop(0.2, '#000080'); gradOut.addColorStop(1, '#2ecc71');
        ctx.fillStyle = gradOut; ctx.fillRect(geo.throatX, geo.throatY, 900, 60);
      }
      else if (mode === 'velocity') {
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, 900, 500);
        const gradVel = ctx.createLinearGradient(0, 0, 900, 0);
        gradVel.addColorStop(0, '#e67e22');
        if (pressure > 4.5) { gradVel.addColorStop(0.18, '#ecf0f1'); gradVel.addColorStop(0.22, '#e74c3c'); }
        else { gradVel.addColorStop(0.18, '#f1c40f'); gradVel.addColorStop(0.22, '#e67e22'); }
        gradVel.addColorStop(1, '#f1c40f'); ctx.fillStyle = gradVel; ctx.fillRect(0, geo.inletY, 900, 100);
      }
      else if (mode === 'noise') {
        ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, 900, 500);
        let noiseAlpha = 0.2 + factor * 0.8;
        if (hasSilencer) noiseAlpha *= 0.3;
        const gradNoise = ctx.createLinearGradient(geo.throatX, 0, geo.outletX + 200, 0);
        if (hasSilencer) {
          gradNoise.addColorStop(0, `rgba(46, 204, 113, ${noiseAlpha})`); gradNoise.addColorStop(1, `rgba(46, 204, 113, ${noiseAlpha})`);
        } else {
          gradNoise.addColorStop(0, `rgba(231, 76, 60, ${noiseAlpha})`); gradNoise.addColorStop(0.1, `rgba(255, 255, 255, ${noiseAlpha})`);
          gradNoise.addColorStop(1, `rgba(243, 156, 18, ${noiseAlpha})`);
        }
        ctx.fillStyle = gradNoise; ctx.fillRect(geo.throatX, geo.throatY, 900, geo.throatH);
        
        ctx.shadowBlur = hasSilencer ? 10 : (20 + factor * 40);
        ctx.shadowColor = hasSilencer ? "#2ecc71" : "red";
        ctx.fillStyle = hasSilencer ? "rgba(46, 204, 113, 0.5)" : "rgba(255, 0, 0, 0.5)";
        ctx.fillRect(geo.throatX, geo.throatY - 5, 200, geo.throatH + 10);
        ctx.shadowBlur = 0;
      }

      // Add 3D Volume to the fluid
      applyCylindricalShade(0, geo.inletY, geo.throatX, geo.inletH, true); // Inlet pipe
      applyCylindricalShade(geo.throatX, geo.throatY, 900, geo.throatH, true); // Throat & Diffuser pipe
      applyCylindricalShade(geo.outletX, geo.outletY, 900, geo.outletH, true); // Outlet pipe
      applyCylindricalShade(geo.suctionX, geo.throatY + geo.throatH, geo.suctionW, geo.suctionH, false); // Suction pipe
    };

    const drawAnnotations = (cx: number, cy: number) => {
      // Common Pipe Labels
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '16px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText("N2 Inlet", 20, geo.inletY - 15);
      ctx.fillText("Suction 1/2\"", geo.suctionX + 40, geo.cavityY - 15);

      ctx.textAlign = 'center';
      ctx.fillText("Eductor Throat", geo.throatX + geo.throatW/2, geo.throatY - 15);
      
      // The Ball
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillText("20\" Ball (Solid)", cx, cy + 5);

      // Cavity Area Title (Inside the Cavity Rectangle, on the left side)
      ctx.textAlign = 'left';
      ctx.font = 'bold 34px Inter, sans-serif';
      ctx.fillStyle = '#ef4444'; 
      ctx.fillText("Cavity Area", geo.cavityX + 20, cy - 40);

      // Top Header Values (Moved up to y=40, spread out with center/right alignment)
      const topY = 40;
      
      if (mode === 'pressure') {
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.shadowBlur = 10; ctx.shadowColor = '#000';
        
        // 1. Inlet (Left)
        ctx.textAlign = 'left';
        ctx.fillStyle = '#fff';
        ctx.fillText(`① 질소 주입 압력(Inlet): ${pressure.toFixed(1)} bar`, 20, topY);
        
        // 3. Velocity (Center)
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`③ 최대 유속(Throat): ${velocity.toFixed(0)} m/s`, 450, topY);

        // 4. Noise (Right)
        ctx.textAlign = 'right';
        ctx.fillStyle = noise > 85 ? '#ef4444' : '#10b981';
        ctx.fillText(`④ 소음: ${noise.toFixed(0)} dB`, 880, topY);

        // 2. Vacuum (Inside Cavity Area, under the title)
        ctx.textAlign = 'left';
        ctx.font = 'bold 36px Inter, sans-serif';
        ctx.fillStyle = '#ef4444';
        ctx.fillText("② 흡입 부압:", geo.cavityX + 20, cy + 10);
        ctx.fillText(`${vacuum.toFixed(2)} bar`, geo.cavityX + 65, cy + 50);
        ctx.shadowBlur = 0;
      } 
      else if (mode === 'vacuum') {
        ctx.textAlign = 'left';
        ctx.font = 'bold 36px Inter, sans-serif';
        ctx.shadowBlur = 15; ctx.shadowColor = '#000';
        if (vacuum > -0.2) ctx.fillStyle = '#ef4444'; 
        else if (vacuum > -0.4) ctx.fillStyle = '#f59e0b'; 
        else ctx.fillStyle = '#3b82f6'; 
        ctx.fillText("② 흡입 부압:", geo.cavityX + 20, cy + 10);
        ctx.fillText(`${vacuum.toFixed(2)} bar`, geo.cavityX + 65, cy + 50);
        ctx.shadowBlur = 0;
      } 
      else if (mode === 'velocity') {
        ctx.textAlign = 'center';
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.shadowBlur = 15; ctx.shadowColor = '#000';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`③ 최대 유속(Throat): ${velocity.toFixed(0)} m/s`, 450, topY);
        ctx.shadowBlur = 0;
      } 
      else if (mode === 'noise') {
        ctx.textAlign = 'right';
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.shadowBlur = 15; ctx.shadowColor = '#000';
        ctx.fillStyle = noise > 85 ? '#ef4444' : '#10b981';
        ctx.fillText(`④ 소음 레벨: ${noise.toFixed(0)} dB`, 880, topY);
        
        ctx.textAlign = 'center';
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.fillStyle = '#ef4444';
        ctx.fillText(`⚠ ${noise.toFixed(0)} dB`, geo.throatX, geo.throatY - 25);

        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`🔊 ${(noise - 15).toFixed(0)} dB`, geo.outletX + 150, geo.outletY - 20);
        ctx.shadowBlur = 0;
      }
    };

    const buildFluidPath = () => {
      ctx.beginPath();
      ctx.rect(geo.inletX, geo.inletY, geo.inletW, geo.inletH);
      ctx.moveTo(geo.inletX + geo.inletW, geo.inletY);
      ctx.lineTo(geo.throatX, geo.throatY); ctx.lineTo(geo.throatX + geo.throatW, geo.throatY);
      ctx.lineTo(geo.diffuserX + geo.diffuserW, geo.outletY); ctx.lineTo(geo.outletX + geo.outletW, geo.outletY);
      ctx.lineTo(geo.outletX + geo.outletW, geo.outletY + geo.outletH); ctx.lineTo(geo.diffuserX + geo.diffuserW, geo.outletY + geo.outletH);
      ctx.lineTo(geo.throatX + geo.throatW, geo.throatY + geo.throatH); ctx.lineTo(geo.throatX, geo.throatY + geo.throatH);
      ctx.lineTo(geo.inletX + geo.inletW, geo.inletY + geo.inletH); ctx.lineTo(geo.inletX, geo.inletY + geo.inletH);
      ctx.rect(geo.suctionX, geo.throatY + geo.throatH, geo.suctionW, geo.suctionH);
      ctx.rect(geo.cavityX, geo.cavityY, geo.cavityW, geo.cavityH);
    };

    const drawGeometry = () => {
      // Dark deep space background
      const bgGrad = ctx.createRadialGradient(450, 250, 0, 450, 250, 600);
      bgGrad.addColorStop(0, '#1e293b');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Clip inside the fluid domain to draw the field
      ctx.save(); 
      buildFluidPath(); 
      ctx.clip(); 
      drawField(); 
      ctx.restore();

      const cx = geo.cavityX + geo.cavityW * 0.7; // Right 1/3 side
      const cy = geo.cavityY + geo.cavityH / 2;
      
      // Realistic 3D Ball
      const ballGrad = ctx.createRadialGradient(cx - 30, cy - 30, 10, cx, cy, geo.ballR);
      ballGrad.addColorStop(0, '#e2e8f0');
      ballGrad.addColorStop(0.5, '#64748b');
      ballGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = ballGrad; 
      ctx.beginPath(); ctx.arc(cx, cy, geo.ballR, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = '#0f172a'; ctx.stroke();

      // Silencer
      if (hasSilencer) {
        const silencerGrad = ctx.createLinearGradient(0, geo.outletY - 15, 0, geo.outletY + geo.outletH + 15);
        silencerGrad.addColorStop(0, '#064e3b');
        silencerGrad.addColorStop(0.5, '#10b981');
        silencerGrad.addColorStop(1, '#064e3b');
        ctx.fillStyle = silencerGrad;
        ctx.fillRect(800, geo.outletY - 15, 80, geo.outletH + 30);
        
        ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Inter'; 
        ctx.textAlign = 'center';
        ctx.fillText("SILENCER", 840, geo.outletY + 25);
      }

      // Metallic Pipe Outlines
      const metalStroke = ctx.createLinearGradient(0, 0, 900, 500);
      metalStroke.addColorStop(0, '#94a3b8');
      metalStroke.addColorStop(0.5, '#e2e8f0');
      metalStroke.addColorStop(1, '#64748b');
      ctx.strokeStyle = metalStroke; 
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(0, geo.inletY); ctx.lineTo(geo.inletX + geo.inletW, geo.inletY);
      ctx.lineTo(geo.throatX, geo.throatY); ctx.lineTo(geo.throatX + geo.throatW, geo.throatY);
      ctx.lineTo(geo.outletX, geo.outletY); ctx.lineTo(900, geo.outletY); ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, geo.inletY + geo.inletH); ctx.lineTo(geo.inletX + geo.inletW, geo.inletY + geo.inletH);
      ctx.lineTo(geo.throatX, geo.throatY + geo.throatH); ctx.lineTo(geo.suctionX, geo.throatY + geo.throatH);
      ctx.lineTo(geo.suctionX, geo.cavityY); ctx.stroke();

      ctx.strokeRect(geo.cavityX, geo.cavityY, geo.cavityW, geo.cavityH);

      ctx.beginPath();
      ctx.moveTo(geo.suctionX + geo.suctionW, geo.cavityY);
      ctx.lineTo(geo.suctionX + geo.suctionW, geo.throatY + geo.throatH);
      ctx.lineTo(geo.throatX + geo.throatW, geo.throatY + geo.throatH);
      ctx.lineTo(geo.outletX, geo.outletY + geo.outletH); ctx.lineTo(900, geo.outletY + geo.outletH); ctx.stroke();

      drawAnnotations(cx, cy);
    };

    const updateParticles = () => {
      if (!showParticles) return;
      const cx = geo.cavityX + geo.cavityW * 0.7; // Right 1/3 side
      const cy = geo.cavityY + geo.cavityH / 2;
      
      const resetParticle = () => {
        const isMainStream = Math.random() > 0.35;
        if (isMainStream) {
          return { x: Math.random() * geo.inletW, y: geo.inletY + Math.random() * geo.inletH, vx: 0, vy: 0, type: 'N2', life: 0 };
        } else {
          let px, py, d;
          let attempts = 0;
          do {
            px = geo.cavityX + Math.random() * geo.cavityW;
            py = geo.cavityY + Math.random() * geo.cavityH;
            const dx = px - cx; const dy = py - cy;
            d = Math.sqrt(dx * dx + dy * dy);
            attempts++;
          } while (d < geo.ballR + 5 && attempts < 10);
          return { x: px, y: py, vx: 0, vy: 0, type: 'Air', life: 0 };
        }
      };

      ctx.save();
      buildFluidPath();
      ctx.clip();

      particlesRef.current.forEach(p => {
        const spd = speedFactor;
        
        if (p.type === 'Air' && p.y > geo.cavityY) {
          const dx = p.x - cx; const dy = p.y - cy;
          if (Math.sqrt(dx * dx + dy * dy) < geo.ballR + 2) {
            const nx = dx / Math.sqrt(dx * dx + dy * dy); const ny = dy / Math.sqrt(dx * dx + dy * dy);
            p.x = cx + nx * (geo.ballR + 3); p.y = cy + ny * (geo.ballR + 3);
          }
        }
        
        if (p.y >= geo.cavityY) {
          const targetX = geo.suctionX + geo.suctionW / 2;
          const dx = targetX - p.x;
          let suctionStr = 1.0 * spd;
          if (pressure < 3.5) suctionStr *= 0.2;
          p.vx = dx * 0.03 + (Math.random() - 0.5) * 0.5; p.vy = -suctionStr;
          
          if (p.y + p.vy < geo.cavityY) {
            if (p.x < geo.suctionX + 2) { p.y = geo.cavityY; p.vx = 1.5; p.vy = 0; }
            else if (p.x > geo.suctionX + geo.suctionW - 2) { p.y = geo.cavityY; p.vx = -1.5; p.vy = 0; }
          }
        }
        else if (p.y < geo.cavityY && p.y > geo.throatY + geo.throatH) {
          if (p.x <= geo.suctionX) { p.x = geo.suctionX + 2; p.vx = 0.5; }
          if (p.x >= geo.suctionX + geo.suctionW) { p.x = geo.suctionX + geo.suctionW - 2; p.vx = -0.5; }
          
          const distToThroat = p.y - (geo.throatY + geo.throatH);
          if (distToThroat < 20) {
            p.vx += 0.5 * spd; // Smoothly curve right
            p.vy = -1.5 * spd; 
          } else {
            p.vx = (geo.suctionX + geo.suctionW / 2 - p.x) * 0.1; 
            p.vy = -3 * spd;
          }
        }
        else {
          p.type = 'N2';
          if (p.x < geo.throatX) {
            p.vx = 4 * spd; p.vy = 0;
          }
          else if (p.x >= geo.throatX && p.x < geo.throatX + geo.throatW) {
            p.vx = 8 * spd; 
            if (p.y < geo.throatY + 2) p.vy = 0.5;
            else if (p.y > geo.throatY + geo.throatH - 2) p.vy = -0.5;
            else p.vy = 0;
          }
          else if (p.x >= geo.throatX + geo.throatW && p.x < geo.outletX) {
            p.vx = 6 * spd;
            p.vy += (Math.random() - 0.5) * 0.2 * spd;
          }
          else {
            p.vx = 5 * spd;
            p.vy = 0;
            if (p.y < geo.outletY + 2) p.y = geo.outletY + 2;
            if (p.y > geo.outletY + geo.outletH - 2) p.y = geo.outletY + geo.outletH - 2;
          }
        }

        // Motion Blur Rendering (Drawing lines instead of circles)
        if (mode === 'pressure') ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        else if (mode === 'vacuum') ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        else if (mode === 'velocity') {
          if (pressure > 6) ctx.strokeStyle = '#fff';
          else if (pressure > 4) ctx.strokeStyle = '#f59e0b';
          else ctx.strokeStyle = '#3b82f6';
        } else if (mode === 'noise') ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 1.5, p.y - p.vy * 1.5); // Tail based on velocity
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        p.x += p.vx; p.y += p.vy;

        p.life++;
        if (p.x > 900 || p.y < 0 || p.life > 600) { Object.assign(p, resetParticle()); }
      });
      
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGeometry();
      updateParticles();
      animationRef.current = requestAnimationFrame(animate);
    };

    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [pressure, vacuum, velocity, noise, mode, showParticles, hasSilencer, speedFactor]); 

  return (
    <div className="w-full max-w-[900px] relative aspect-[900/500] rounded-2xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] border border-slate-600/50">
      <canvas ref={canvasRef} width={900} height={500} className="w-full h-full block bg-[#020617]" />
    </div>
  );
};

export default SimulationCanvas;
