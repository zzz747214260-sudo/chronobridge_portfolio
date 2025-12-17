import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  Activity, Brain, Power, Cpu, Layers, Radio, Database, User, Zap,
  Maximize2, ChevronRight, Terminal, ScanLine, GitBranch, Lightbulb,
  Search, PenTool, Box, Target, Share2, Play, Sparkles, MessageSquare,
  FileText, Map, Waves, Eye, Lock, ArrowRight, Download, CheckCircle,
  Dna, Scale, ShieldAlert, Fingerprint, Monitor, BarChart2, TrendingUp,
  PieChart, AlertTriangle, Heart, Globe, Wifi, Command, Minimize, Hexagon,
  Radar, Crosshair, Server
} from 'lucide-react';
import SciFiInteractiveBackground from './Dream3D'; // 导入背景组件

// --- Global Configuration ---
const apiKey = "AIzaSyC51bntOsZ_79pawjJX8gI6tAvQzuKDMuc"; // Keep empty
const genAI = new GoogleGenerativeAI(apiKey);

// --- CSS & Keyframes ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100;300;500;700&family=Rajdhani:wght@300;500;600;700&display=swap');

    :root {
      --neon-blue: #00f3ff;
      --neon-purple: #bc13fe;
      --glass-bg: rgba(10, 20, 40, 0.7);
    }

    body {
      <SciFiInteractiveBackground />
      color: #e2e8f0;
      font-family: 'Rajdhani', sans-serif;
      overflow: hidden;
      margin: 0;
      padding: 0;
    }

    .font-mono { font-family: 'JetBrains Mono', monospace; }

    /* --- CRT Scanline Effect --- */
    .scanlines {
      background: linear-gradient(
        to bottom,
        rgba(255,255,255,0),
        rgba(255,255,255,0) 50%,
        rgba(0,0,0,0.1) 50%,
        rgba(0,0,0,0.1)
      );
      background-size: 100% 4px;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none;
      z-index: 9999;
      opacity: 0.1;
    }

    /* --- Holographic Card --- */
    .holo-card {
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      background: rgba(13, 22, 38, 0.4); /* More transparent for breathing room */
      backdrop-filter: blur(16px);
      border: 1px solid rgba(59, 130, 246, 0.15);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    }
    .holo-card:hover {
      background: rgba(13, 22, 38, 0.7);
      border-color: rgba(0, 243, 255, 0.5);
      box-shadow: 0 0 30px rgba(0, 243, 255, 0.1), inset 0 0 20px rgba(0, 243, 255, 0.05);
      transform: translateY(-4px);
    }

    /* --- Animations --- */
    @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
    @keyframes scan {
      0% { transform: translateY(-120%); opacity: 0.0; }
      15% { opacity: 0.9; }
      100% { transform: translateY(120%); opacity: 0.0; }
    }

    @keyframes loading {
      0% { transform: scaleX(0); }
      100% { transform: scaleX(1); }
    }

    .animate-spin-slow { animation: spin-slow 30s linear infinite; }
    .animate-spin-reverse { animation: spin-reverse 35s linear infinite; }
    
    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #050a14; }
    ::-webkit-scrollbar-thumb { background: #1e3a8a; border-radius: 3px; }

    /* 背景容器样式 */
    // .background-container {
    //   position: fixed;
    //   top: 0;
    //   left: 0;
    //   right: 0;
    //   bottom: 0;
    //   z-index: -2; /* 放在最底层 */
    //   pointer-events: none;
    // }
    
    /* 主内容容器 */
    .content-container {
      position: relative;
      z-index: 1;
      width: 100%;
      height: 100%;
    }
  `}</style>
);

// --- Utility Components ---

const ScrambleText = ({ text, className = "", delay = 0 }) => {
  const [display, setDisplay] = useState("");
  const chars = "!<>-_\\/[]{}—=+*^?#________";
  useEffect(() => {
    let timeout;
    let iteration = 0;
    const startScramble = () => {
      clearInterval(timeout);
      timeout = setInterval(() => {
        setDisplay(prev => text.split("").map((l, i) => i < iteration ? text[i] : chars[Math.floor(Math.random() * chars.length)]).join(""));
        if (iteration >= text.length) clearInterval(timeout);
        iteration += 1 / 3;
      }, 30);
    };
    setTimeout(startScramble, delay);
    return () => clearInterval(timeout);
  }, [text, delay]);
  return <span className={className}>{display}</span>;
};

const HoloCard = ({ children, className = "", delay = 0 }) => (
  <div className={`holo-card rounded-2xl relative overflow-hidden group ${className}`} style={{ animationDelay: `${delay}ms` }}>
    {/* Decorative Corners - subtle */}
    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-500/50 opacity-50 group-hover:opacity-100 transition-opacity" />
    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-500/50 opacity-50 group-hover:opacity-100 transition-opacity" />
    <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-500/50 opacity-50 group-hover:opacity-100 transition-opacity" />
    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-500/50 opacity-50 group-hover:opacity-100 transition-opacity" />

    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent -translate-y-full group-hover:animate-[scan_2s_linear_infinite] pointer-events-none" />
    {children}
  </div>
);

const CyberButton = ({ children, onClick, active, icon: Icon, isAi = false, color = 'cyan' }) => (
  <button onClick={onClick} className={`relative w-full text-left group overflow-hidden transition-all duration-300 py-5 px-6 mb-3 rounded-xl border ${active ? `bg-blue-900/30 border-${color}-400 text-${color}-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]` : 'bg-slate-900/20 border-transparent text-slate-500 hover:bg-slate-800/50 hover:border-slate-700 hover:text-blue-200'}`}>
    <div className="flex items-center gap-4 relative z-10">
      <div className={`p-2 rounded-lg bg-slate-950 border border-slate-800 transition-all duration-300 ${active ? 'border-cyan-400 text-cyan-400 scale-110' : 'group-hover:border-blue-400 group-hover:text-blue-400'}`}>
        {Icon && <Icon size={20} strokeWidth={1.5} />}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className={`font-bold text-sm tracking-[0.2em] uppercase transition-all duration-300 ${active ? 'translate-x-1 text-white' : 'group-hover:translate-x-1'}`}>{children}</span>
        <span className="text-[9px] font-mono opacity-50 flex items-center gap-1">{isAi ? <span className="text-purple-400 flex items-center gap-1"><Sparkles size={10} /> AI ENABLED</span> : 'SYSTEM MODULE'}</span>
      </div>
    </div>
    <div className={`absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent translate-x-[-100%] transition-transform duration-500 ease-out ${active ? 'translate-x-0' : 'group-hover:translate-x-0'}`} />
  </button>
);

const DataCard = ({ title, value, label, delay, variant = 'blue' }) => (
  <div
    className={`p-8 relative overflow-hidden rounded-xl bg-slate-900/30 backdrop-blur-md border-l-4 transition-all duration-500 hover:bg-slate-900/50 ${variant === 'red' ? 'border-red-500' : 'border-blue-500'}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <h3 className="text-slate-500 text-[10px] font-sans font-bold uppercase tracking-[0.25em] mb-4">{title}</h3>
    <div className={`text-4xl font-light font-sans tracking-tighter ${variant === 'red' ? 'text-white drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]'}`}>{value}</div>
    <div className={`text-[10px] mt-3 font-mono uppercase tracking-widest font-bold flex items-center gap-2 ${variant === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${variant === 'red' ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`} />
      {label}
    </div>
  </div>
);

// --- System Usage Pipeline (auto-advance + progress) ---
const ProcessPipeline = () => {
  const [activeStep, setActiveStep] = useState(2); // 默认先亮 MONITOR（可改 0~4）
  const steps = [
    { title: "POWER ON", desc: "Hold button 2s", icon: Power },
    { title: "CONNECT", desc: "Bluetooth Auto-Pair", icon: Share2 },
    { title: "MONITOR", desc: "EEG Cognitive Scan", icon: Activity },
    { title: "INTEGRATE", desc: "AI Dream Synthesis", icon: Brain },
    { title: "STORE", desc: "Cloud Data Sync", icon: Database },
  ];

  useEffect(() => {
    const t = setInterval(() => {
      setActiveStep((p) => (p + 1) % steps.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const progress = (activeStep / (steps.length - 1)) * 100;

  return (
    <HoloCard className="p-10" delay={80}>
      <div className="w-full text-center">
        <div className="inline-block relative mb-10">
          <div className="text-[11px] font-mono text-slate-400 tracking-[0.35em] uppercase pb-3 border-b border-cyan-500/30">
            SYSTEM USAGE PIPELINE (PAGE 6)
          </div>
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-16 h-[2px] bg-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
        </div>

        <div className="relative flex justify-between px-6">
          {/* Track */}
          <div className="absolute top-5 left-6 right-6 h-px bg-slate-800/80 overflow-hidden">
            {/* Progress (smooth) */}
            <div
              className="h-full bg-cyan-400/90 shadow-[0_0_14px_rgba(6,182,212,0.55)] transition-transform duration-1000 ease-in-out origin-left"
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </div>


          {steps.map((s, i) => {
            const Icon = s.icon;
            const reached = i <= activeStep;
            const active = i === activeStep;

            return (
              <div key={s.title} className="relative z-10 flex flex-col items-center min-w-[88px]">
                <div
                  className={[
                    "w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-700",
                    "bg-[#020408] backdrop-blur-md",
                    reached
                      ? "border-cyan-400/80 text-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.45)]"
                      : "border-slate-800 text-slate-700",
                    active ? "scale-[1.08]" : "",
                  ].join(" ")}
                >
                  <Icon size={18} strokeWidth={1.6} />
                </div>

                <div className="mt-6 text-[10px] font-bold tracking-[0.22em] uppercase transition-colors duration-500
  ${active ? 'text-white' : reached ? 'text-slate-300' : 'text-slate-600'}">
                  {s.title}
                </div>

                <div className={`mt-2 text-[9px] font-mono tracking-widest text-cyan-400 transition-all duration-500
  ${active ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}>
                  {s.desc}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </HoloCard>
  );
};

// --- VISUALIZATION COMPONENTS ---

// 1. Market Share Chart (Fixed Sizing)
const MarketShareChart = () => {
  const data = [
    { label: 'ALCOR', value: 50, color: '#06b6d4' },
    { label: 'CRYONICS', value: 30, color: '#8b5cf6' },
    { label: 'TOMORROW', value: 10, color: '#3b82f6' },
    { label: 'OTHERS', value: 10, color: '#64748b' },
  ];

  const r = 40;
  const c = 2 * Math.PI * r;
  let cumulativeOffset = 0;

  return (
    <div className="relative w-full h-64 flex items-center justify-center"> {/* Increased height */}
      <svg viewBox="0 0 100 100" className="w-48 h-48 transform -rotate-90">
        {data.map((d, i) => {
          const dashVal = (d.value / 100) * c;
          const dashArray = `${dashVal} ${c}`;
          const offset = -cumulativeOffset;
          cumulativeOffset += dashVal;
          return (
            <circle
              key={i}
              cx="50" cy="50" r={r}
              fill="transparent"
              stroke={d.color}
              strokeWidth="8"
              strokeDasharray={dashArray}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="hover:opacity-80 transition-all duration-300 cursor-pointer hover:stroke-[10]"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-3xl font-bold text-white tracking-tighter">2030+</div>
        <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Projection</div>
      </div>
      <div className="absolute -right-2 top-0 space-y-3 bg-slate-950/50 p-3 rounded-lg border border-slate-800 backdrop-blur-sm">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: d.color, color: d.color }} />
            <div className="text-[10px] font-mono text-slate-400">{d.label} <span className="text-white font-bold ml-1">{d.value}%</span></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. Competitor Radar Chart (Fixed Layout)
const CompetitorRadar = () => {
  const points = {
    chrono: "100,20 180,90 150,180 50,180 20,90",
    muse: "100,80 140,100 120,140 80,140 60,100",
    sleep: "100,100 120,110 110,130 90,130 80,110"
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 min-h-[250px]">
      <svg viewBox="0 0 200 200" className="w-full h-full max-w-[220px] overflow-visible">
        {/* Grid */}
        <polygon points="100,20 180,90 150,180 50,180 20,90" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
        <polygon points="100,40 160,92 137,160 62,160 40,92" fill="none" stroke="#1e293b" strokeWidth="1" />
        <line x1="100" y1="100" x2="100" y2="20" stroke="#334155" strokeWidth="0.5" />
        <line x1="100" y1="100" x2="180" y2="90" stroke="#334155" strokeWidth="0.5" />
        <line x1="100" y1="100" x2="150" y2="180" stroke="#334155" strokeWidth="0.5" />
        <line x1="100" y1="100" x2="50" y2="180" stroke="#334155" strokeWidth="0.5" />
        <line x1="100" y1="100" x2="20" y2="90" stroke="#334155" strokeWidth="0.5" />

        <polygon points={points.chrono} fill="rgba(6, 182, 212, 0.2)" stroke="#06b6d4" strokeWidth="2" className="drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-[pulse_3s_infinite]" />
        <polygon points={points.muse} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7" />
        <polygon points={points.sleep} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.5" />

        <text x="100" y="10" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">ADAPTABILITY</text>
        <text x="195" y="90" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="start">TECH</text>
        <text x="160" y="195" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">MEMORY</text>
        <text x="40" y="195" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">COMFORT</text>
        <text x="5" y="90" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">PRICE</text>
      </svg>

      <div className="absolute bottom-0 right-0 text-[9px] font-mono text-right bg-slate-950/80 p-3 rounded-lg border border-slate-800">
        <div className="text-cyan-400 font-bold flex items-center justify-end gap-2"><div className="w-1.5 h-1.5 bg-cyan-500 rounded-full" /> CHRONO</div>
        <div className="text-red-400 flex items-center justify-end gap-2 mt-1"><div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> MUSE</div>
        <div className="text-slate-500 flex items-center justify-end gap-2 mt-1"><div className="w-1.5 h-1.5 bg-slate-500 rounded-full" /> OTHERS</div>
      </div>
    </div>
  );
};

// 3. Brain Map (Same Logic, Better Rendering)
const BrainRegionMap = ({ activeRegion, setActiveRegion, setHoveredRegion }) => {
  const regions = [
    { id: 'FP1', name: 'Prefrontal (L)', info: 'Logic & Narrative', path: 'M 90 50 A 110 120 0 0 1 150 20 L 150 100 L 100 80 Z', type: 'active', color: '#06b6d4' },
    { id: 'FP2', name: 'Prefrontal (R)', info: 'Willpower', path: 'M 210 50 A 110 120 0 0 0 150 20 L 150 100 L 200 80 Z', type: 'active', color: '#06b6d4' },
    { id: 'T3', name: 'Temporal (L)', info: 'Auditory Memory', path: 'M 51 120 A 110 130 0 0 0 80 260 L 100 250 L 80 230 L 80 190 L 90 150 L 100 138 L 50 120', type: 'active', color: '#8b5cf6' },
    { id: 'T4', name: 'Temporal (R)', info: 'Emotional Audio', path: 'M 249 120 A 110 130 0 0 1 220 260 L 200 250 L 220 230 L 220 190 L 210 150 L 200 138 L 250 120', type: 'active', color: '#8b5cf6' },
    { id: 'O1', name: 'Occipital (L)', info: 'Visual Generator', path: 'M 80 260 A 110 90 0 0 0 150 280 L 150 250 L 140 240 L 100 250 L 80 260', type: 'active', color: '#ec4899' },
    { id: 'O2', name: 'Occipital (R)', info: 'Spatial Texture', path: 'M 220 260 A 110 90 0 0 1 150 280 L 150 250 L 160 240 L 200 250 L 220 260', type: 'active', color: '#ec4899' },
    { id: 'F7', name: 'Frontal (L)', info: 'Monitoring Only', path: 'M 90 23 A 110 180 0 0 0 50 95 L 100 110 L 150 110 L 150 73 L 100 52 Z', type: 'monitor', color: '#64748b' },
    { id: 'F8', name: 'Frontal (R)', info: 'Monitoring Only', path: 'M 210 23 A 110 180 0 0 1 250 95 L 200 110 L 150 110 L 150 73 L 200 52 Z', type: 'monitor', color: '#64748b' },
    { id: 'F3', name: 'Central (L)', info: 'Motor Locked', path: 'M 100 138 L 90 150 L 80 190 L 140 180 L 150 180 L 150 138', type: 'monitor', color: '#64748b' },
    { id: 'F4', name: 'Central (R)', info: 'Motor Locked', path: 'M 200 138 L 210 150 L 220 190 L 160 180 L 150 180 L 150 138', type: 'monitor', color: '#64748b' },
    { id: 'F5', name: 'Parietal (L)', info: 'Sensory Locked', path: 'M 80 190 L 80 230 L 100 250 L 140 240 L 150 250 L 150 180 L 140 180 L 80 190', type: 'monitor', color: '#64748b' },
    { id: 'F6', name: 'Parietal (R)', info: 'Spatial Locked', path: 'M 220 190 L 220 230 L 200 250 L 160 240 L 150 250 L 150 180 L 160 180 L 220 190', type: 'monitor', color: '#64748b' },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 300 320" className="w-full h-full drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">
        <line x1="150" y1="20" x2="150" y2="280" stroke="#1e3a8a" strokeWidth="0.5" strokeDasharray="4 4" />
        {regions.map((r) => (
          <path
            key={r.id} d={r.path}
            fill={activeRegion === r.id ? `${r.color}60` : (r.type === 'active' ? '#1e293b' : '#0f172a')}
            stroke={activeRegion === r.id ? r.color : (r.type === 'active' ? '#334155' : '#1e293b')}
            strokeWidth={activeRegion === r.id ? 2 : 1}
            className="cursor-pointer transition-all duration-300 hover:fill-opacity-50"
            onClick={() => setActiveRegion(r.id)}
            onMouseEnter={() => { setHoveredRegion(r); if (r.type === 'active') setActiveRegion(r.id); }}
            onMouseLeave={() => setHoveredRegion(null)}
          />
        ))}
      </svg>
    </div>
  );
};

const BrainVisualizer = ({ theta, gamma }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frameId;
    let time = 0;
    const resize = () => { canvas.width = canvas.parentElement.clientWidth; canvas.height = canvas.parentElement.clientHeight; };
    window.addEventListener('resize', resize);
    resize();
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'screen';
      const centerY = canvas.height / 2;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
      ctx.lineWidth = 3; // Thicker lines
      for (let x = 0; x < canvas.width; x++) {
        const y = centerY + Math.sin(x * 0.01 * (theta / 40) + time) * (theta * 0.8) * Math.sin(time * 0.5);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.8)';
      ctx.lineWidth = 3;
      for (let x = 0; x < canvas.width; x++) {
        const y = centerY + Math.sin(x * 0.05 * (gamma / 40) + time * 2) * (gamma * 0.5) + Math.cos(x * 0.1) * (gamma * 0.2);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      frameId = requestAnimationFrame(render);
    };
    render();
    return () => { cancelAnimationFrame(frameId); window.removeEventListener('resize', resize); };
  }, [theta, gamma]);
  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

const HeroUnit = ({ activePart, setActivePart, scale = 1 }) => {
  const parts = [
    { id: 0, label: 'MEMORY FOAM', icon: Layers, color: 'text-slate-400' },
    { id: 1, label: 'AI AGENT CHIP', icon: Cpu, color: 'text-cyan-400' },
    { id: 2, label: 'EEG SENSOR', icon: Activity, color: 'text-purple-400' },
    { id: 3, label: 'MICRO-RESPONSE', icon: Zap, color: 'text-yellow-400' },
    { id: 4, label: 'EYE TRACKER', icon: Eye, color: 'text-green-400' }
  ];

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center perspective-1000" style={{ transform: `scale(${scale})` }}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[400px] h-[400px] border border-dashed  rounded-full animate-spin-slow" />
        <div className="absolute w-[320px] h-[320px] border border-dotted border-cyan-500/30 rounded-full animate-spin-reverse" />
      </div>

      <div className="relative z-10 w-[280px] bg-slate-950/80 backdrop-blur-md border border-slate-700 rounded-[2rem] p-8 flex flex-col items-center gap-6 shadow-2xl transition-all duration-500 hover:scale-105 group">
        <div className="absolute -top-12 text-[10px] font-mono text-cyan-500 tracking-[0.3em] bg-black/60 px-4 py-2 rounded border border-cyan-900/50">UNIT: CHRONO-BRIDGE</div>

        <div onClick={() => setActivePart && setActivePart(1)} className={`w-full h-28 rounded-2xl border flex items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden ${activePart === 1 ? 'border-cyan-400 bg-cyan-900/20 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'border-slate-800 bg-black/40'}`}>
          <Cpu size={48} className={`transition-all duration-500 ${activePart === 1 ? 'text-cyan-400 scale-110' : 'text-slate-600'}`} />
          <div className="absolute bottom-2 right-3 text-[9px] font-mono text-slate-500">AI CORE</div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          {[2, 4, 3, 0].map((id) => {
            const Part = parts.find(p => p.id === id);
            return (
              <div key={id} onClick={() => setActivePart && setActivePart(id)} className={`h-20 rounded-2xl border flex flex-col items-center justify-center cursor-pointer transition-all ${activePart === id ? 'border-white/40 bg-white/10' : 'border-slate-800 hover:border-slate-600'}`}>
                <Part.icon size={20} className={activePart === id ? Part.color : 'text-slate-600'} />
                <span className="text-[9px] font-mono mt-2 text-slate-500 tracking-wider">{Part.label.split(' ')[0]}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};
// --- MEMORY ARCHIVE: Neural Data Storage ---
const MemoryDNA = () => {
  const [activeCol, setActiveCol] = useState(0);
  const cols = 5;

  useEffect(() => {
    const t = setInterval(() => {
      setActiveCol((p) => (p + 1) % cols);
    }, 1200);
    return () => clearInterval(t);
  }, []);

  const progress = cols === 1 ? 100 : (activeCol / (cols - 1)) * 100;

  return (
    <div className="relative w-full min-h-[520px] rounded-2xl border border-slate-800/70 bg-slate-950/30 overflow-hidden">
      {/* 顶部信息区 */}
      <div className="absolute top-6 left-6 z-10">
        <h3 className="text-blue-400 font-sans font-bold tracking-widest uppercase text-xs flex items-center gap-2">
          <Dna size={16} /> NEURAL DATA STORAGE
        </h3>
        <p className="text-[10px] text-slate-400 font-mono mt-2 tracking-wider">
          "Record dreams, capture creativity"
        </p>
      </div>

      {/* 扫描蓝条（从上到下） */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 right-0 top-0 h-[2px] bg-blue-400/70 shadow-[0_0_18px_rgba(59,130,246,0.55)] animate-[scan_4s_linear_infinite]" />
      </div>

      {/* 横向进度轨道 */}
      <div className="absolute left-16 right-16 top-[150px] h-px bg-slate-800/80">
        <div
          className="h-full bg-blue-400/90 shadow-[0_0_14px_rgba(59,130,246,0.55)] transition-transform duration-700 ease-in-out origin-left"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </div>

      {/* 主体：五列节点 */}
      <div className="w-full h-full flex items-center justify-center pt-32 pb-16">
        <div className="flex gap-16 relative h-[320px] items-center">
          {[...Array(cols)].map((_, i) => {
            const reached = i <= activeCol;
            const isActive = i === activeCol;

            return (
              // 关键：每列加 group，tooltip 绑定 group-hover
              <div
                key={i}
                className="relative w-0.5 h-[240px] flex flex-col justify-between items-center group"
              >
                {/* 上节点（蓝） */}
                <div
                  className={[
                    "absolute top-0 -left-2 w-4 h-4 rounded-full border-2 transition-all duration-300 cursor-pointer z-20",
                    "bg-[#0a1428]",
                    reached
                      ? "border-blue-400 shadow-[0_0_16px_rgba(59,130,246,0.75)]"
                      : "border-slate-700 opacity-60",
                    "group-hover:scale-150 group-hover:bg-blue-500",
                    isActive ? "scale-125" : "",
                  ].join(" ")}
                >
                  {/* TOOLTIP（上节点） */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-40 bg-[#0a1428] border border-blue-500 p-3 rounded text-[10px] text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-30 whitespace-nowrap text-center">
                    <div className="font-bold mb-1">MEMORY_FRAG_0{i}A</div>
                    <span className="text-slate-300 text-[9px]">TYPE: VISUAL CORTEX</span>
                  </div>
                </div>

                {/* 连接线 */}
                <div
                  className={[
                    "w-0.5 h-full transition-all duration-500",
                    reached
                      ? "bg-gradient-to-b from-blue-500/70 to-red-500/60"
                      : "bg-slate-800/70",
                    "group-hover:from-blue-500/90 group-hover:to-red-500/90",
                    isActive ? "shadow-[0_0_18px_rgba(59,130,246,0.25)]" : "",
                  ].join(" ")}
                />

                {/* 下节点（红） */}
                <div
                  className={[
                    "absolute bottom-0 -left-2 w-4 h-4 rounded-full border-2 transition-all duration-300 cursor-pointer z-20",
                    "bg-[#0a1428]",
                    reached
                      ? "border-red-400 shadow-[0_0_14px_rgba(239,68,68,0.65)]"
                      : "border-slate-700 opacity-60",
                    "group-hover:scale-125 group-hover:bg-red-500",
                    isActive ? "scale-110" : "",
                  ].join(" ")}
                >
                  {/* TOOLTIP（下节点） */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-40 bg-[#0a1428] border border-red-500 p-3 rounded text-[10px] text-red-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-30 whitespace-nowrap text-center">
                    <div className="font-bold mb-1">MEMORY_FRAG_0{i}B</div>
                    <span className="text-slate-300 text-[9px]">TYPE: EMOTIONAL</span>
                  </div>
                </div>

                {/* 底部编号 */}
                <div
                  className={[
                    "absolute -bottom-10 text-[9px] font-mono tracking-widest transition-opacity duration-300",
                    reached ? "text-slate-300/80 opacity-100" : "text-slate-600 opacity-60",
                    isActive ? "text-blue-300 opacity-100" : "",
                  ].join(" ")}
                >
                  FRAG_{String(i + 1).padStart(2, "0")}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Main Application ---
export default function ChronoBridge() {
  const [bootState, setBootState] = useState('BOOTING');
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [activeHardware, setActiveHardware] = useState(1);
  const [activeBrainRegion, setActiveBrainRegion] = useState('FP1');
  const [hoveredBrainRegion, setHoveredBrainRegion] = useState(null);

  const [theta, setTheta] = useState(45);
  const [gamma, setGamma] = useState(20);
  const [dreamSeed, setDreamSeed] = useState("");
  const [dreamOutput, setDreamOutput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  // --- BOOT SEQUENCE LOGIC ---
  useEffect(() => {
    if (bootState === 'BOOTING') {
      const logSequence = [
        "INITIALIZING KERNEL...",
        "LOADING NEURAL INTERFACE...",
        "CONNECTING TO ALCOR DATABASE...",
        "CALIBRATING SENSORS...",
        "SYSTEM READY."
      ];
      let delay = 0;
      logSequence.forEach((text, index) => {
        setTimeout(() => {
          setLogs(prev => [...prev, text]);
          if (index === logSequence.length - 1) {
            setTimeout(() => setBootState('HERO'), 800);
          }
        }, delay);
        delay += 600;
      });
    }
  }, [bootState]);

  const handleDreamGen = async () => {
    if (!dreamSeed) return;
    setAiLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });
      const prompt = `Futuristic dream sequence (Cyberpunk style, year 2185) based on: "${dreamSeed}". Short, poetic, vivid.`;
      const result = await model.generateContent(prompt);
      setDreamOutput(result.response.text());
    } catch (e) {
      setTimeout(() => setDreamOutput("Simulating: Neon rain falls on chrome streets. You remember the ocean before it rose."), 1500);
      setDreamOutput(`ERROR: ${e?.message || String(e)}`);
    } finally { setAiLoading(false); }
  };

  // 包装整个应用，添加背景
  const AppWithBackground = ({ children }) => (
    <div className="fixed inset-0 overflow-hidden">
      {/* 背景层 - 只有一个全局背景 */}
      <div className="background-container">
        <SciFiInteractiveBackground />
      </div>
      
      {/* 内容层 */}
      <div className="content-container">
        {children}
      </div>
      
      {/* 扫描线效果 */}
      <div className="scanlines" />
    </div>
  );

  // --- BOOT SCREEN (Terminal) ---
  if (bootState === 'BOOTING') {
    return (
      <AppWithBackground>
        <div className="w-full h-full flex items-center justify-center flex-col">
          <GlobalStyles />
          <div className="w-[400px] relative z-10">
            <div className="flex justify-between items-end mb-4 border-b border-slate-800 pb-2">
              <span className="text-xs font-mono text-cyan-500">CHRONO_BIOS_v4.0</span>
              <span className="text-xs font-mono text-slate-500 animate-pulse">LOADING...</span>
            </div>
            <div className="font-mono text-[12px] text-slate-400 space-y-2 h-32">
              {logs.map((l, i) => <div key={i} className="animate-in slide-in-from-left-2 duration-300"> <span className="text-blue-500 mr-2">&gt;</span>{l}</div>)}
            </div>
          </div>
        </div>
      </AppWithBackground>
    );
  }

  // --- HERO SCREEN (The Animation you wanted) ---
  if (bootState === 'HERO') {
    return (
      <AppWithBackground>
        <GlobalStyles />
        <div className="w-full h-full flex flex-col items-center justify-center animate-in fade-in duration-1000">
          {/* Animated Helmet */}
          <div className="scale-125 animate-in zoom-in-95 duration-[2000ms]">
            <HeroUnit activePart={1} setActivePart={() => { }} />
          </div>

          {/* Title Sequence */}
          <div className="mt-16 text-center space-y-8 animate-in slide-in-from-bottom-12 duration-1000 delay-500 fill-mode-backwards z-20">
            <h1 className="text-6xl font-thin text-white tracking-[0.3em] uppercase drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              Chrono<span className="font-bold text-cyan-400">Bridge</span>
            </h1>
            <p className="text-slate-500 tracking-[0.5em] text-xs uppercase font-mono">
              Intertemporal Memory Recovery System
            </p>

            <button
              onClick={() => setBootState('DASHBOARD')}
              className="mt-12 group relative px-12 py-5 bg-transparent overflow-hidden border border-slate-700 rounded-full hover:border-cyan-400/50 hover:bg-cyan-900/10 transition-all duration-500"
            >
              <span className="relative z-10 text-xs font-bold text-slate-300 tracking-[0.2em] group-hover:text-white transition-colors flex items-center gap-3">
                INITIALIZE SYSTEM <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </AppWithBackground>
    );
  }

  // --- MAIN DASHBOARD (Spacious Layout) ---
  return (
    <AppWithBackground>
      <GlobalStyles />
      <div className="bg-[#020408] flex h-screen text-slate-200 overflow-hidden selection:bg-cyan-500/30 selection:text-white font-sans">
        {/* Sidebar */}
        <aside className="w-72 bg-[#05080f]/95 backdrop-blur-2xl border-r border-slate-800/50 flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.4)]">
          <div className="p-10 bg-[#020408] border-b border-slate-800/50">
            <div className="flex items-center gap-4">
              <Hexagon className="text-cyan-500 fill-cyan-900/20" size={36} />
              <div>
                <h1 className="text-xl font-bold tracking-widest text-white">CHRONO</h1>
                <div className="text-[10px] font-mono text-cyan-500 tracking-[0.4em]">BRIDGE</div>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-6 overflow-y-auto space-y-2 bg-[#020408]">
            {[
              { id: 'DASHBOARD', icon: Activity, label: 'Market & Trends' },
              { id: 'NEURAL', icon: Brain, label: 'Neural Mapping' },
              { id: 'DREAM', icon: Sparkles, label: 'Dream Lab', ai: true },
              { id: 'HARDWARE', icon: Cpu, label: 'Hardware Specs' },
              { id: 'ARCHIVE', icon: Dna, label: 'Neural Data Storage' },
            ].map((item) => (
              <CyberButton key={item.id} active={activeTab === item.id} onClick={() => setActiveTab(item.id)} icon={item.icon} isAi={item.ai}>{item.label}</CyberButton>
            ))}
          </nav>
          <SciFiInteractiveBackground />
          <div className="p-6 border-t border-slate-800/50 bg-[#020408] text-[10px] text-slate-600 font-mono text-center">
            <SciFiInteractiveBackground />
            POWERED BY ALCOR • 2185
          </div>         
        </aside>

        {/* Content */}
        <main className="flex-1 relative flex flex-col overflow-hidden">
          <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-10 z-10">
            <div className="flex items-center gap-4">
              <Command size={18} className="text-slate-500" />
              <div className="h-5 w-[1px] bg-slate-700" />
              <span className="text-sm font-mono text-cyan-500 uppercase tracking-widest animate-pulse">{activeTab} MODULE</span>
            </div>
            <div className="flex gap-8 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-2"><Globe size={14} className="text-blue-500" /> GLOBAL NETWORK</span>
              <span className="flex items-center gap-2"><Wifi size={14} className="text-green-500" /> ONLINE</span>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-10 relative scroll-smooth">
            <div className="max-w-[1600px] mx-auto space-y-10 pb-20"> {/* Increased Max Width & Spacing */}

              {/* === DASHBOARD === */}
              {activeTab === 'DASHBOARD' && (
                <div className="grid grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="col-span-12 mb-6">
                    <ProcessPipeline />
                    <h2 className="text-4xl font-light text-white mb-3 mt-10"><ScrambleText text="Market Analysis & User Sentiment" delay={200} /></h2>
                    <p className="text-slate-400 text-base max-w-3xl leading-relaxed">Data projection for Cryonics Market (2185) and user acceptance rates for Dream Intervention Technology. Data sourced from Alcor & Research Interviews.</p>
                  </div>

                  <div className="col-span-12 grid grid-cols-4 gap-8">
                    <DataCard title="USER APPROVAL" value="92%" label="POSITIVE" delay={100} variant="blue" />
                    <DataCard title="FUTURE SIM" value="83%" label="PREFERRED" delay={200} variant="blue" />
                    <DataCard title="ALCOR SHARE" value="50%" label="DOMINANT" delay={300} variant="blue" />
                    <DataCard title="THREAT LEVEL" value="LOW" label="STABLE" delay={400} variant="red" />
                  </div>

                  <HoloCard className="col-span-4 p-8 flex flex-col justify-between" delay={100}>
                    <h3 className="text-sm font-bold text-cyan-400 tracking-widest uppercase flex items-center gap-2 mb-6"><PieChart size={16} /> Cryonics Market Share</h3>
                    <MarketShareChart />
                    <div className="mt-6 text-[10px] text-slate-500 text-center font-mono tracking-widest">DOMINANT PLAYER: ALCOR (50%)</div>
                  </HoloCard>

                  <HoloCard className="col-span-4 p-8 flex flex-col justify-center" delay={200}>
                    <h3 className="text-sm font-bold text-green-400 tracking-widest uppercase mb-8 flex items-center gap-2"><User size={16} /> User Acceptance</h3>
                    <div className="space-y-8">
                      <div>
                        <div className="flex justify-between text-xs font-mono mb-3 text-slate-300">
                          <span>SUPPORT INTERVENTION</span>
                          <span className="text-green-400 font-bold">92%</span>
                        </div>
                        <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div className="h-full bg-green-500 w-[92%] animate-[loading_2s_ease-out_forwards]" />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-mono mb-3 text-slate-300">
                          <span>PREFER FUTURE SIMULATION</span>
                          <span className="text-blue-400 font-bold">83%</span>
                        </div>
                        <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div className="h-full bg-blue-500 w-[83%] animate-[loading_2s_ease-out_forwards_0.5s]" />
                        </div>
                      </div>
                    </div>
                  </HoloCard>

                  <HoloCard className="col-span-4 p-8" delay={300}>
                    <h3 className="text-sm font-bold text-purple-400 tracking-widest uppercase mb-6 flex items-center gap-2"><Crosshair size={16} /> Competitive Landscape</h3>
                    <div className="h-64">
                      <CompetitorRadar />
                    </div>
                  </HoloCard>

                  <div className="col-span-12 grid grid-cols-3 gap-8">
                    {[
                      { title: 'Mental Adjustment', sol: 'VR Therapy / AI Counseling', icon: Brain, color: 'text-pink-400' },
                      { title: 'Tech Adaptation', sol: 'Rapid Re-education Programs', icon: Terminal, color: 'text-yellow-400' },
                      { title: 'Physical Risks', sol: 'Nanotech Regeneration', icon: ShieldAlert, color: 'text-red-400' }
                    ].map((item, i) => (
                      <HoloCard key={i} className="p-6 flex items-start gap-5" delay={400 + (i * 100)}>
                        <div className={`p-4 rounded-xl bg-slate-900 border border-slate-800 ${item.color} shadow-lg`}>
                          <item.icon size={24} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">{item.title}</div>
                          <div className="text-xs font-mono text-cyan-500/80">SOLUTION: {item.sol}</div>
                        </div>
                      </HoloCard>
                    ))}
                  </div>
                </div>
              )}

              {/* === NEURAL === */}
              {activeTab === 'NEURAL' && (
                <div className="grid grid-cols-12 gap-8 animate-in zoom-in-95 duration-500 h-[calc(100vh-240px)]">
                  <div className="col-span-4 flex flex-col gap-8">
                    <HoloCard className="p-8">
                      <h3 className="text-sm font-bold text-slate-400 tracking-widest mb-8">WAVEFORM CONTROL</h3>
                      <div className="space-y-8">
                        <div>
                          <div className="flex justify-between text-xs font-mono mb-3">
                            <span className="text-cyan-400">THETA (4-8Hz)</span>
                            <span>{theta}Hz</span>
                          </div>
                          <input type="range" min="4" max="8" step="0.1" value={theta} onChange={(e) => setTheta(Number(e.target.value))} className="w-full h-2 bg-slate-800 appearance-none rounded-lg cursor-pointer accent-cyan-500" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-mono mb-3">
                            <span className="text-purple-400">GAMMA (31-100Hz)</span>
                            <span>{gamma}Hz</span>
                          </div>
                          <input type="range" min="31" max="100" value={gamma} onChange={(e) => setGamma(Number(e.target.value))} className="w-full h-2 bg-slate-800 appearance-none rounded-lg cursor-pointer accent-purple-500" />
                        </div>
                      </div>
                    </HoloCard>

                    <HoloCard className="p-8 flex-1">
                      <h3 className="text-sm font-bold text-slate-400 tracking-widest mb-6">ACTIVE REGION DATA</h3>
                      <div className="p-6 bg-slate-950/50 rounded-xl border border-slate-800 mb-6">
                        <div className="text-[10px] font-mono text-slate-500 mb-2">SELECTED ZONE</div>
                        <div className="text-2xl text-white font-bold">{activeBrainRegion}</div>
                      </div>
                      <div className="text-sm text-slate-400 leading-relaxed font-mono">
                        {hoveredBrainRegion ? (
                          <>
                            <span className="text-cyan-400 font-bold block mb-2">{hoveredBrainRegion.name}</span>
                            {hoveredBrainRegion.info}
                          </>
                        ) : "Hover over map..."}
                      </div>
                    </HoloCard>
                  </div>

                  <div className="col-span-4 relative">
                    <HoloCard className="h-full p-6 flex items-center justify-center">
                      <BrainRegionMap activeRegion={activeBrainRegion} setActiveRegion={setActiveBrainRegion} setHoveredRegion={setHoveredBrainRegion} />
                    </HoloCard>
                  </div>

                  <div className="col-span-4">
                    <HoloCard className="h-full p-0 relative">
                      <div className="absolute top-6 left-6 z-10 text-[10px] font-mono text-cyan-500 tracking-widest">REAL-TIME SIGNAL</div>
                      <BrainVisualizer theta={theta} gamma={gamma} />
                    </HoloCard>
                  </div>
                </div>
              )}

              {/* === HARDWARE === */}
              {activeTab === 'HARDWARE' && (
                <div className="grid grid-cols-12 gap-8 animate-in zoom-in-95 duration-500">
                  <div className="col-span-8">
                    <HoloCard className="p-16 flex items-center justify-center bg-gradient-to-b from-[#0a101f] to-[#020408] min-h-[600px]">
                      <HeroUnit activePart={activeHardware} setActivePart={setActiveHardware} scale={1.2} />
                    </HoloCard>
                  </div>
                  <div className="col-span-4 flex flex-col gap-8">
                    <HoloCard className="p-8">
                      <h3 className="text-sm font-bold text-slate-400 tracking-widest mb-6">COMPONENT DETAILS</h3>
                      <div className="text-3xl font-light text-white mb-4">
                        {activeHardware === 1 && "AI Agent Chip"}
                        {activeHardware === 0 && "Memory Foam"}
                        {activeHardware === 2 && "EEG Detector"}
                        {activeHardware === 3 && "Micro-Response Sensor"}
                        {activeHardware === 4 && "Eye Muscle Tracker"}
                      </div>
                      <div className="h-px w-full bg-slate-800 mb-6" />
                      <p className="text-sm text-slate-400 leading-loose font-mono">
                        {activeHardware === 1 && "Customizes dreams for memory recall and future adaptation using generative algorithms."}
                        {activeHardware === 0 && "Ensures stability and comfort during long-term cryogenic sleep integration."}
                        {activeHardware === 2 && "Monitors REM sleep cycles for precise dream intervention timing."}
                        {activeHardware === 3 && "Detects subtle physical reactions to adjust dream intensity in real-time."}
                        {activeHardware === 4 && "Tracks rapid eye movement to correlate visual dream stimuli."}
                      </p>
                    </HoloCard>
                    <HoloCard className="p-8 flex-1">
                      <h3 className="text-sm font-bold text-slate-400 tracking-widest mb-6">TECH SPECS</h3>
                      <ul className="space-y-4 text-xs font-mono text-slate-500">
                        <li className="flex justify-between border-b border-slate-800 pb-2"><span>CONNECTION</span> <span className="text-cyan-400">BLUETOOTH 8.0</span></li>
                        <li className="flex justify-between border-b border-slate-800 pb-2"><span>BATTERY</span> <span className="text-cyan-400">WIRELESS / POD POWER</span></li>
                        <li className="flex justify-between border-b border-slate-800 pb-2"><span>MATERIAL</span> <span className="text-cyan-400">SILICONE / GRAPHENE</span></li>
                        <li className="flex justify-between"><span>LATENCY</span> <span className="text-cyan-400">&lt; 1MS</span></li>
                      </ul>
                    </HoloCard>
                  </div>
                </div>
              )}

              {/* === DREAM LAB === */}
              {activeTab === 'DREAM' && (
                <div className="grid grid-cols-12 gap-8 h-[calc(100vh-240px)] animate-in slide-in-from-bottom-8">
                  <div className="col-span-5 flex flex-col gap-8">
                    <HoloCard className="p-10 flex-1 flex flex-col">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-purple-900/30 rounded-xl border border-purple-500/30">
                          <Sparkles size={24} className="text-purple-400" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">Dream Synthesis</h2>
                          <p className="text-sm text-slate-500">Powered by Gemini Neural Engine</p>
                        </div>
                      </div>
                      <textarea value={dreamSeed} onChange={(e) => setDreamSeed(e.target.value)} placeholder="Enter dream parameters..." className="flex-1 bg-[#05080f] border border-slate-700 rounded-xl p-6 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 placeholder-slate-700 resize-none font-mono mb-6 leading-relaxed" />
                      <CyberButton onClick={handleDreamGen} active={aiLoading} icon={Zap} isAi>{aiLoading ? 'SYNTHESIZING...' : 'GENERATE SCENARIO'}</CyberButton>
                    </HoloCard>
                  </div>
                  <div className="col-span-7">
                    <HoloCard className="h-full p-12 flex items-center justify-center text-center relative">
                      {!dreamOutput && !aiLoading && <div className="text-slate-600 font-mono text-base">AWAITING INPUT...</div>}
                      {dreamOutput && <div className="text-xl font-light leading-loose text-slate-200 max-w-2xl text-left"><Typewriter text={dreamOutput} /></div>}
                    </HoloCard>
                  </div>
                </div>
              )}
              {/* === ARCHIVE === */}
              {activeTab === 'ARCHIVE' && (
                <div className="grid grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="col-span-12">
                    <MemoryDNA />
                  </div>
                </div>
              )}


            </div>
          </div>
        </main>
      </div>
    </AppWithBackground>
  );
}

const Typewriter = ({ text }) => {
  const [d, setD] = useState('');
  useEffect(() => {
    let i = 0; setD('');
    const t = setInterval(() => { setD(p => p + text.charAt(i)); i++; if (i >= text.length) clearInterval(t); }, 20);
    return () => clearInterval(t);
  }, [text]);
  return <span>{d}<span className="animate-pulse text-cyan-500">|</span></span>;
};