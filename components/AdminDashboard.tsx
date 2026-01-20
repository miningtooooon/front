import React, { useEffect, useState } from 'react';
import { AppConfig, Task } from '../types';
import { X, DollarSign, List, BarChart3, Plus, Trash2, Save, Clock, Zap, Shield } from 'lucide-react';

interface Props {
  config: AppConfig;
  tasks: Task[];
  onUpdateConfig: (config: AppConfig) => void;
  onUpdateTasks: (tasks: Task[]) => void;
  onClose: () => void;
}

const AdminDashboard: React.FC<Props> = ({ config, tasks, onUpdateConfig, onUpdateTasks, onClose }) => {
  const [activeTab, setActiveTab] = useState<'finance' | 'tasks' | 'stats' | 'security'>('finance');
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  // ✅ NEW: miningRate = GP/MIN
  const [gpPerMin, setGpPerMin] = useState(String(config.miningRate ?? 0));

  // ✅ NEW: miningDuration in backend/storage is still SECONDS
  // but in UI we show MINUTES
  const [sessionMinutes, setSessionMinutes] = useState(
    String(Math.max(1, Math.round(Number(config.miningDuration ?? 60) / 60)))
  );

  // keep local state in sync if props change
  useEffect(() => {
    setLocalConfig(config);
    setLocalTasks(tasks);

    const rate = Number(config.miningRate ?? 0);
    setGpPerMin(String(isFinite(rate) ? rate : 0));

    const mins = Math.max(1, Math.round(Number(config.miningDuration ?? 60) / 60));
    setSessionMinutes(String(isFinite(mins) ? mins : 1));
  }, [config, tasks]);

  const handleGpPerMinChange = (val: string) => {
    setGpPerMin(val);
    const n = parseFloat(val);
    if (!isNaN(n) && isFinite(n)) {
      // ✅ store directly as GP/MIN
      setLocalConfig((prev) => ({ ...prev, miningRate: n }));
    }
  };

  const handleSessionMinutesChange = (val: string) => {
    setSessionMinutes(val);
    const mins = parseInt(val);
    if (!isNaN(mins) && isFinite(mins)) {
      // ✅ convert minutes -> seconds for storage
      setLocalConfig((prev) => ({ ...prev, miningDuration: Math.max(1, mins) * 60 }));
    }
  };

  const saveConfig = () => {
    onUpdateConfig(localConfig);
    alert('System settings updated successfully!');
  };

  const saveTasks = () => {
    onUpdateTasks(localTasks);
    alert('Task database updated!');
  };

  const addNewTask = () => {
    const newTask: Task = {
      id: 'task_' + Date.now(),
      title: 'New Community Task',
      reward: 1000,
      type: 'link',
      isCompleted: false,
      timer: 30,
      link: '',
    };
    setLocalTasks([...localTasks, newTask]);
  };

  const deleteTask = (id: string) => {
    if (confirm('Delete this task?')) {
      setLocalTasks(localTasks.filter((t) => t.id !== id));
    }
  };

  const updateTaskField = (id: string, field: keyof Task, value: any) => {
    setLocalTasks(localTasks.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in zoom-in duration-300">
      <div className="w-full max-w-lg h-[85vh] glass border-white/20 rounded-[40px] flex flex-col overflow-hidden shadow-2xl shadow-purple-500/20">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-purple-900/20 to-transparent">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <h2 className="text-xl font-black uppercase tracking-tighter text-white">Main Controller</h2>
            </div>
            <p className="text-[10px] text-purple-400 uppercase font-black tracking-widest mt-0.5">Control Center v3.0</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} className="text-white/60" />
          </button>
        </div>

        <div className="flex border-b border-white/10 bg-white/5 overflow-x-auto no-scrollbar">
          <TabButton active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={<DollarSign size={16} />} label="Economy" />
          <TabButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={<List size={16} />} label="Bounties" />
          <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<Shield size={16} />} label="Security" />
          <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 size={16} />} label="Telemetry" />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {activeTab === 'finance' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-4">
                {/* ✅ GP/MIN */}
                <AdminInput
                  label="Mining Speed (GP/Min)"
                  value={gpPerMin}
                  onChange={handleGpPerMinChange}
                  icon={<Zap size={14} className="text-yellow-400" />}
                  placeholder="مثال: 10"
                />

                {/* ✅ Minutes */}
                <AdminInput
                  label="Mining Time (Minutes)"
                  value={sessionMinutes}
                  onChange={handleSessionMinutesChange}
                  icon={<Clock size={14} className="text-blue-400" />}
                  placeholder="مثال: 1"
                />
              </div>

              <div className="glass p-4 rounded-2xl border-white/10 bg-white/[0.02]">
                <p className="text-[11px] text-white/60 leading-relaxed">
                  ✅ الربح في الجلسة = <b>GP/Min</b> × <b>Minutes</b>
                  <br />
                  مثال: 10 GP/Min لمدة 1 دقيقة = 10 GP
                </p>
              </div>

              <AdminInput label="Referral Bonus (GP)" value={localConfig.referralReward} onChange={(val: any) => setLocalConfig({ ...localConfig, referralReward: parseInt(val) || 0 })} />
              <AdminInput label="Min Payout (GP)" value={localConfig.minWithdraw} onChange={(val: any) => setLocalConfig({ ...localConfig, minWithdraw: parseInt(val) || 0 })} />
              <AdminInput label="Exchange Rate (GP/$)" value={localConfig.exchangeRate} onChange={(val: any) => setLocalConfig({ ...localConfig, exchangeRate: parseInt(val) || 0 })} />

              <button
                onClick={saveConfig}
                className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <Save size={20} /> Deploy Finance Update
              </button>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center mb-2 px-1">
                <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Active Task Modules ({localTasks.length})</p>
                <button onClick={addNewTask} className="flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300">
                  <Plus size={14} /> New Task
                </button>
              </div>

              {localTasks.map((task) => (
                <div key={task.id} className="glass p-5 rounded-3xl border-white/10 space-y-4">
                  <div className="flex justify-between items-start">
                    <input
                      value={task.title}
                      onChange={(e) => updateTaskField(task.id, 'title', e.target.value)}
                      className="bg-transparent font-bold text-sm w-full outline-none text-white focus:text-purple-400"
                    />
                    <button onClick={() => deleteTask(task.id)} className="text-red-500/40 hover:text-red-500 p-2">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <input
                    value={task.link || ''}
                    onChange={(e) => updateTaskField(task.id, 'link', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-mono text-blue-300 outline-none"
                    placeholder="Task URL or Ad Code"
                  />

                  <div className="grid grid-cols-3 gap-3">
                    <AdminInput label="Reward" value={task.reward} onChange={(val: any) => updateTaskField(task.id, 'reward', parseInt(val) || 0)} />
                    <AdminInput label="Timer" value={task.timer || 0} onChange={(val: any) => updateTaskField(task.id, 'timer', parseInt(val) || 0)} />
                    <div className="space-y-1">
                      <label className="text-[8px] text-white/30 uppercase font-black ml-1">Type</label>
                      <select
                        value={task.type}
                        onChange={(e) => updateTaskField(task.id, 'type', e.target.value)}
                        className="w-full bg-[#1a162e] border border-white/10 rounded-xl p-2.5 text-[10px] text-white uppercase font-bold outline-none"
                      >
                        <option value="video">AD Video</option>
                        <option value="link">Website</option>
                        <option value="telegram">Telegram</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={saveTasks}
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <Save size={20} /> Synchronize All Tasks
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 mb-4">
                <p className="text-[11px] text-purple-300 leading-relaxed font-medium">
                  Configuring these fields allows you to receive instant Telegram notifications for every withdrawal request.
                </p>
              </div>
              <AdminInput label="Telegram Bot Token" value={localConfig.telegramBotToken || ''} onChange={(val: string) => setLocalConfig({ ...localConfig, telegramBotToken: val })} placeholder="58212...:AAH..." />
              <AdminInput label="Admin Chat ID" value={localConfig.adminChatId || ''} onChange={(val: string) => setLocalConfig({ ...localConfig, adminChatId: val })} placeholder="12345678" />
              <button
                onClick={saveConfig}
                className="w-full py-5 bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-red-500/20"
              >
                <Shield size={20} /> Save API Credentials
              </button>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <AdminInput label="Total Members" value={localConfig.totalMembers} onChange={(val: any) => setLocalConfig({ ...localConfig, totalMembers: parseInt(val) || 0 })} />
              <AdminInput label="Active Now" value={localConfig.activeNow} onChange={(val: any) => setLocalConfig({ ...localConfig, activeNow: parseInt(val) || 0 })} />

              <div className="p-8 glass rounded-[32px] border-white/10 bg-gradient-to-br from-purple-500/5 to-transparent h-32 flex items-end gap-1.5 px-2">
                {[45, 80, 50, 95, 70, 85, 60, 100, 35, 65, 85, 45].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-purple-600 to-blue-400 rounded-t-lg animate-pulse"
                    style={{ height: `${h}%`, animationDelay: `${i * 0.1}s`, opacity: 0.5 }}
                  ></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex-shrink-0 px-6 py-5 flex flex-col items-center gap-1.5 transition-all relative ${
      active ? 'text-white' : 'text-white/30 hover:text-white/50'
    }`}
  >
    {icon}
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 animate-in slide-in-from-bottom-1"></div>}
  </button>
);

const AdminInput = ({ label, value, onChange, icon, placeholder }: any) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-1.5 ml-1">
      {icon}
      <label className="text-[9px] text-white/40 uppercase font-black tracking-widest">{label}</label>
    </div>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 font-mono text-xs text-white focus:border-purple-500/60 outline-none transition-all"
    />
  </div>
);

export default AdminDashboard;
