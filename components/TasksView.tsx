
import React, { useState } from 'react';
import { Task } from '../types';
import { PlayCircle, Link2, Users, CheckCircle, Clock } from 'lucide-react';

interface Props {
  tasks: Task[];
  onComplete: (id: string) => void;
}

const TasksView: React.FC<Props> = ({ tasks, onComplete }) => {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const startTask = (task: Task) => {
    if (task.isCompleted) return;
    
    // Check if task has a link and open it
    if (task.link) {
      if (task.type === 'video') {
        // Here you would normally trigger Adsgram code
        // For simulation, we just console log the code and open a fallback
        console.log("Triggering Ad Code:", task.link);
        window.open('https://adsgram.ai/demo', '_blank'); 
      } else {
        window.open(task.link, '_blank');
      }
    } else {
      // Fallback if no link is provided
      window.open('#', '_blank');
    }
    
    if (task.timer) {
      setActiveTaskId(task.id);
      setCountdown(task.timer);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Immediate complete for channel joins (simulated)
      onComplete(task.id);
    }
  };

  const handleClaimReward = (id: string) => {
    onComplete(id);
    setActiveTaskId(null);
    setCountdown(0);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative glass p-6 rounded-3xl border-blue-500/40 glow-blue overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
            <Clock className="text-blue-400" />
            Bounty Hub
          </h2>
          <p className="text-blue-200/60 text-xs font-medium mt-1">Complete daily activities to earn massive GP.</p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
      </div>

      <div className="flex flex-col gap-3">
        {tasks.map((task) => {
          const isVerifying = activeTaskId === task.id;
          const canClaim = isVerifying && countdown === 0;

          return (
            <div 
              key={task.id}
              className={`glass p-4 rounded-2xl border-white/10 flex items-center justify-between transition-all ${task.isCompleted ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                  {task.type === 'video' && <PlayCircle size={24} />}
                  {task.type === 'link' && <Link2 size={24} />}
                  {task.type === 'telegram' && <Users size={24} />}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{task.title}</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-blue-400 font-bold text-xs">+{task.reward} GP</span>
                    {task.timer && <span className="text-white/30 text-[10px]">• {task.timer}s</span>}
                  </div>
                </div>
              </div>

              {task.isCompleted ? (
                <CheckCircle className="text-green-500" />
              ) : isVerifying ? (
                <button
                  disabled={!canClaim}
                  onClick={() => handleClaimReward(task.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                    canClaim 
                    ? 'bg-green-500 text-white animate-pulse' 
                    : 'bg-white/10 text-white/40'
                  }`}
                >
                  {canClaim ? 'Claim' : `${countdown}s`}
                </button>
              ) : (
                <button
                  onClick={() => startTask(task)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  Start
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TasksView;
