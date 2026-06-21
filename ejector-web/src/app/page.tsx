"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../components/Header';
import SimulationCanvas from '../components/SimulationCanvas';
import ControlPanel from '../components/ControlPanel';
import AnalysisBox from '../components/AnalysisBox';

export default function Home() {
  const [pressure, setPressure] = useState<number>(5.0);
  const [mode, setMode] = useState<string>('pressure');
  const [showParticles, setShowParticles] = useState<boolean>(true);
  const [hasSilencer, setHasSilencer] = useState<boolean>(false);

  // Derived physics state
  const [vacuum, setVacuum] = useState<number>(-0.42);
  const [velocity, setVelocity] = useState<number>(340);
  const [noise, setNoise] = useState<number>(95);
  const [speedFactor, setSpeedFactor] = useState<number>(1.0);

  // Audio Context Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;
    noiseNodeRef.current = noiseNode;

    const filterNode = ctx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.value = 800;
    filterNodeRef.current = filterNode;

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0;
    gainNodeRef.current = gainNode;

    noiseNode.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseNode.start();
  }, []);

  useEffect(() => {
    const factor = (pressure - 3.0) / 4.0;
    
    let idealVacuum = -0.05 - (factor * 0.90);
    let currentVacuum = idealVacuum * 0.85;
    if (currentVacuum < -0.95) currentVacuum = -0.95;

    let baseNoise = 70 + (factor * 48);
    let currentNoise = baseNoise;

    if (hasSilencer) {
      currentNoise = baseNoise - 20;
      currentVacuum = currentVacuum * 0.95;
    }

    let currentVelocity = 250 + (factor * 200);
    let currentSpeedFactor = 0.4 + (factor * 0.8);

    setVacuum(currentVacuum);
    setNoise(currentNoise);
    setVelocity(currentVelocity);
    setSpeedFactor(currentSpeedFactor);

    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      let baseVol = (pressure - 2.5) / 5.0;
      if (baseVol < 0) baseVol = 0;
      if (baseVol > 1) baseVol = 1;

      const gainNode = gainNodeRef.current;
      const filterNode = filterNodeRef.current;
      const currentTime = audioCtxRef.current.currentTime;

      if (gainNode && filterNode) {
        if (hasSilencer) {
          gainNode.gain.setTargetAtTime(baseVol * 0.05, currentTime, 0.1);
          filterNode.frequency.setTargetAtTime(400, currentTime, 0.1);
        } else {
          gainNode.gain.setTargetAtTime(baseVol * 0.5, currentTime, 0.1);
          filterNode.frequency.setTargetAtTime(1200, currentTime, 0.1);
        }
      }
    }
  }, [pressure, hasSilencer]);

  const handleInteraction = () => {
    initAudio();
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  return (
    <div className="page-wrapper" onClick={handleInteraction}>
      <Header />
      
      <main className="main-content">
        <SimulationCanvas 
          pressure={pressure}
          vacuum={vacuum}
          velocity={velocity}
          noise={noise}
          mode={mode}
          showParticles={showParticles}
          hasSilencer={hasSilencer}
          speedFactor={speedFactor}
        />

        <ControlPanel 
          pressure={pressure}
          setPressure={setPressure}
          mode={mode}
          setMode={setMode}
          showParticles={showParticles}
          setShowParticles={setShowParticles}
          hasSilencer={hasSilencer}
          setHasSilencer={setHasSilencer}
        />

        <AnalysisBox vacuum={vacuum} />
      </main>
    </div>
  );
}
