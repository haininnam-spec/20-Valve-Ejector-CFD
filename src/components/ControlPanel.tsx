"use client";
import React from 'react';

interface ControlPanelProps {
  pressure: number;
  setPressure: (val: number) => void;
  mode: string;
  setMode: (mode: string) => void;
  showParticles: boolean;
  setShowParticles: (val: boolean) => void;
  hasSilencer: boolean;
  setHasSilencer: (val: boolean) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  pressure, setPressure, mode, setMode, showParticles, setShowParticles, hasSilencer, setHasSilencer
}) => {
  return (
    <div className="glass-panel control-panel mt-6">
      <div className="slider-group">
        <div className="slider-header">
          <span className="slider-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            질소 주입 압력(Inlet)
          </span>
          <span className="slider-value">{pressure.toFixed(1)} bar</span>
        </div>
        <input 
          type="range" 
          min="3.0" 
          max="7.0" 
          step="0.1" 
          value={pressure} 
          onChange={(e) => setPressure(parseFloat(e.target.value))} 
        />
      </div>

      <div className="button-grid">
        <button onClick={() => setMode('pressure')} className={`btn ${mode === 'pressure' ? 'active btn-pressure' : ''}`}>① 질소 주입 압력(Inlet)</button>
        <button onClick={() => setMode('vacuum')} className={`btn ${mode === 'vacuum' ? 'active btn-vacuum' : ''}`}>② 흡입 부압</button>
        <button onClick={() => setMode('velocity')} className={`btn ${mode === 'velocity' ? 'active btn-velocity' : ''}`}>③ 유속 (m/s)</button>
        <button onClick={() => setMode('noise')} className={`btn ${mode === 'noise' ? 'active btn-noise' : ''}`}>④ 소음 레벨</button>
        <button onClick={() => setShowParticles(!showParticles)} className={`btn ${showParticles ? 'active btn-particles' : ''}`}>✨ 입자 {showParticles ? 'On' : 'Off'}</button>
        <button onClick={() => setHasSilencer(!hasSilencer)} className={`btn ${hasSilencer ? 'active btn-silencer' : 'btn-silencer-off'}`}>
          {hasSilencer ? '🔇 소음기 ON' : '🔊 소음기 OFF'}
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
