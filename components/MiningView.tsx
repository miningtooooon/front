
import React, { useState, useEffect, useRef } from 'react';
import { Package, Pickaxe, Zap, Timer, Play, Cpu, Activity } from 'lucide-react';

interface Props {
  points: number;
  miningRate: number;
  session: {
    isActive: boolean;
    startTime: number | null;
    duration: number;
  };
  onStartMining: () => void;
  onClaim: (reward: number) => void;
}

const MiningView: React.FC<Props> = ({ points, miningRate, session, onStartMining, onClaim }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [particles, setParticles] = useState<{ id: number; left: number }[]>([]);
  const particleId = useRef(0);

  // Sync internal countdown with global session state
  useEffect(() => {
    if (session.isActive && session.startTime) {
      const updateTimer = () => {
        const now = Date.now();
        const elapsed = Math.floor((now - session.startTime!) / 1000);
        const remaining = Math.max(0, session.duration - elapsed);
        setTimeLeft(remaining);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(0);
    }
  }, [session.isActive, session.startTime, session.duration]);

  const handleStart = () => {
    // Simulation of Adsgram
    console.log("Loading Adsgram...");
    
    // Trigger the start logic in App.tsx
    onStartMining();
    
    // Aesthetic particles launch
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const id = ++particleId.current;
        setParticles(prev => [...prev, { id, left: Math.random() * 80 + 10 }]);
        setTimeout(() => {
          setParticles(prev => prev.filter(p => p.id !== id));
        }, 2000);
      }, i * 80);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 && h > 0 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Visual Mining Machine Container */}
      <div className="relative w-full aspect-square max-w-[320px] flex items-center justify-center">
        {/* Intense Cyber Background Glow */}
        <div className={`absolute inset-0 bg-purple-600/20 rounded-full blur-[80px] transition-all duration-1000 ${session.isActive ? 'opacity-100 scale-110 animate-pulse' : 'opacity-20 scale-90'}`}></div>
        
        {/* Energy Rings (Decor) */}
        {session.isActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[85%] h-[85%] border border-purple-500/20 rounded-full animate-spin-slow"></div>
            <div className="absolute w-[95%] h-[95%] border border-blue-500/10 rounded-full animate-reverse-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '12s' }}></div>
          </div>
        )}

        {/* Floating Particles */}
        {particles.map(p => (
          <div 
            key={p.id} 
            className="coin-particle text-2xl z-30"
            style={{ left: `${p.left}%`, bottom: '45%' }}
          >
            💎
          </div>
        ))}

        {/* The Main Machine Unit */}
        <div className={`relative z-10 p-8 glass rounded-[40px] border-purple-500/40 glow-purple flex flex-col items-center justify-center transition-all duration-700 overflow-hidden ${session.isActive ? 'scale-105 shadow-[0_0_50px_rgba(168,85,247,0.5)] border-purple-400' : 'scale-100'}`}>
          
          {/* Internal Scanner Effect when Active */}
          {session.isActive && <div className="scanner-line"></div>}

          {/* Machine Status Indicators */}
          <div className="absolute top-4 left-0 right-0 px-6 flex justify-between items-center opacity-40">
            <Cpu size={14} className={session.isActive ? 'text-purple-400 animate-pulse' : 'text-gray-500'} />
            <Activity size={14} className={session.isActive ? 'text-blue-400 animate-bounce' : 'text-gray-500'} />
          </div>

          <div className={`relative transition-all duration-500 ${session.isActive ? 'animate-bounce' : 'opacity-80'}`}>
             <Package size={110} className={`${session.isActive ? 'text-purple-400' : 'text-gray-500'} drop-shadow-[0_0_20px_rgba(168,85,247,0.9)]`} />
             
             {/* Energy Aura around the package */}
             {session.isActive && (
               <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse"></div>
             )}
          </div>
          
          <div className="mt-6 text-center relative z-20">
            <p className="text-4xl font-black text-white font-mono tracking-tighter drop-shadow-md">
              {points.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-purple-300 font-bold uppercase tracking-[0.2em] mt-2 opacity-80">
              {session.isActive ? 'Cloud Mining Active' : 'System Standby'}
            </p>
          </div>

          {/* Machine Detail Overlay */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 opacity-20">
            <div className={`h-1 w-8 rounded-full ${session.isActive ? 'bg-purple-500 animate-pulse' : 'bg-gray-600'}`}></div>
            <div className={`h-1 w-8 rounded-full ${session.isActive ? 'bg-blue-500 animate-pulse' : 'bg-gray-600'}`} style={{ animationDelay: '0.2s' }}></div>
            <div className={`h-1 w-8 rounded-full ${session.isActive ? 'bg-purple-500 animate-pulse' : 'bg-gray-600'}`} style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>

        {/* Floating Decoration Icons */}
        <Pickaxe className={`absolute top-10 right-0 text-purple-400/40 transition-all duration-1000 ${session.isActive ? 'animate-spin-slow opacity-100 scale-125' : 'opacity-20 scale-100'}`} />
        <Zap className={`absolute bottom-10 left-0 text-blue-400/40 transition-all duration-1000 ${session.isActive ? 'animate-pulse opacity-100 scale-125' : 'opacity-20 scale-100'}`} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <div className={`glass p-4 rounded-2xl border-purple-500/20 transition-all duration-500 ${session.isActive ? 'bg-purple-500/5 border-purple-500/40' : ''}`}>
          <p className="text-purple-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
            <Cpu size={10} />
            Hash Rate
          </p>
          <div className="flex items-baseline gap-1 mt-1">
            <p className="text-lg font-bold font-mono">{miningRate.toFixed(2)}</p>
            <span className="text-[10px] opacity-40 uppercase">GP/Sec</span>
          </div>
        </div>
        <div className={`glass p-4 rounded-2xl border-purple-500/20 transition-all duration-500 ${session.isActive ? 'bg-blue-500/5 border-blue-500/40' : ''}`}>
          <p className="text-purple-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
            <Timer size={10} />
            Session
          </p>
          <div className="flex items-center gap-2 mt-1 text-lg font-bold font-mono">
            <p className={session.isActive ? 'text-white' : 'text-white/20'}>
              {session.isActive ? formatTime(timeLeft) : 'OFFLINE'}
            </p>
          </div>
        </div>
      </div>

      {/* High-Attention Action Button */}
      <div className="w-full relative group">
        {!session.isActive && (
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 rounded-2xl blur opacity-40 animate-pulse"></div>
        )}
        <button
          onClick={handleStart}
          disabled={session.isActive}
          className={`relative w-full py-5 rounded-2xl font-black text-xl uppercase tracking-[0.15em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 overflow-hidden ${
            session.isActive 
            ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5 shadow-none' 
            : 'bg-[#0a061e] text-white border-2 border-purple-500/60 hover:border-purple-400 pulse-attention shadow-purple-500/40'
          }`}
        >
          {session.isActive ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent animate-scan-slow" style={{ width: '200%', left: '-50%' }}></div>
              <Activity className="animate-pulse text-purple-400" size={24} />
              Mining Live...
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Play className="fill-current text-purple-400" />
              Initialize Mining
            </>
          )}
        </button>
      </div>

      {/* Information Panel */}
      <div className="glass p-4 rounded-2xl border-white/5 w-full bg-white/[0.02] border-l-2 border-l-purple-500/50">
        <p className="text-[11px] text-white/50 text-center leading-relaxed italic">
          "Each high-performance mining session runs for <span className="text-purple-400 font-bold">60 minutes</span>. Initialize the cloud gateway via ad verification to resume earning GP."
        </p>
      </div>
    </div>
  );
};

export default MiningView;
