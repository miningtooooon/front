import React, { useEffect, useRef, useState } from 'react';
import { View, UserState, Task, AppConfig } from './types';
import MiningView from './components/MiningView';
import TasksView from './components/TasksView';
import ReferralView from './components/ReferralView';
import Navbar from './components/Navbar';
import WithdrawModal from './components/WithdrawModal';
import AdminDashboard from './components/AdminDashboard';
import { Coins, Wallet, Lock } from 'lucide-react';

const BACKEND_URL = (
  (window as any)._ENV_?.BACKEND_URL ||
  (import.meta as any).env?.VITE_BACKEND_URL ||
  ''
).replace(/\/$/, '');

const BOT_USERNAME =
  (import.meta as any).env?.VITE_BOT_USERNAME ||
  (window as any)._ENV_?.BOT_USERNAME ||
  'VcolletFree_bot';

const DEFAULT_CONFIG: AppConfig = {
  // ✅ NEW SYSTEM:
  // miningRate = GP PER MINUTE (GP/MIN)
  // miningDuration = MINUTES
  miningRate: 10,        // 10 GP / Minute
  miningDuration: 60,    // 60 Minutes
  referralReward: 500,
  minWithdraw: 10000,
  exchangeRate: 1000,
  totalMembers: 14502,
  activeNow: 842,
  telegramBotToken: '',
  adminChatId: '',
};

const DEFAULT_TASKS: Task[] = [
  { id: 'v1', title: 'Watch Crypto News Ad', reward: 500, type: 'video', isCompleted: false, timer: 20, link: 'AD_CODE_123' },
  { id: 't1', title: 'Join GlowMine Official', reward: 1000, type: 'telegram', isCompleted: false, link: 'https://t.me/GlowMine' },
  { id: 'l1', title: 'Visit Partner Site', reward: 300, type: 'link', isCompleted: false, timer: 20, link: 'https://google.com' },
];

const INITIAL_STATE: UserState = {
  username: 'Loading...',
  points: 0,
  referrals: [],
  tasks: DEFAULT_TASKS,
  miningSession: { isActive: false, startTime: null },
};

function getTelegramUser() {
  const tg = (window as any)?.Telegram?.WebApp;
  const tgUser = tg?.initDataUnsafe?.user;
  const tgId = tgUser?.id;
  const username =
    tgUser?.username ||
    `${tgUser?.first_name || 'User'}${tgUser?.last_name ? ` ${tgUser?.last_name}` : ''}`;
  return { tgId, username, tg };
}

async function api(path: string, init?: RequestInit) {
  if (!BACKEND_URL) throw new Error('Missing BACKEND_URL');
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  const text = await res.text().catch(() => '');
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  return data;
}

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.MINING);

  // ✅ SAFE load config
  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const saved = localStorage.getItem('glowmine_config');
      const parsed = saved ? JSON.parse(saved) : {};
      const merged = { ...DEFAULT_CONFIG, ...(parsed || {}) };

      // ✅ Optional: tiny safety normalize
      merged.miningRate = Number(merged.miningRate) || DEFAULT_CONFIG.miningRate;
      merged.miningDuration = Number(merged.miningDuration) || DEFAULT_CONFIG.miningDuration;

      return merged;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  // ✅ SAFE load user
  const [user, setUser] = useState<UserState>(() => {
    try {
      const saved = localStorage.getItem('glowmine_user');
      return saved ? JSON.parse(saved) : INITIAL_STATE;
    } catch {
      return INITIAL_STATE;
    }
  });

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');

  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // load config from backend
  useEffect(() => {
    if (!BACKEND_URL) return;
    (async () => {
      try {
        const res = await api('/api/config');
        if (res?.ok && res?.config) {
          setConfig((prev) => {
            const next = { ...prev, ...res.config };
            next.miningRate = Number(next.miningRate) || DEFAULT_CONFIG.miningRate;
            next.miningDuration = Number(next.miningDuration) || DEFAULT_CONFIG.miningDuration;
            return next;
          });
        }
      } catch {}
    })();
  }, []);

  // load user
  useEffect(() => {
    const { tgId, username, tg } = getTelegramUser();

    if (!tgId) {
      setUser((prev) => ({ ...prev, username: 'Open from Telegram' }));
      return;
    }

    tg?.ready?.();

    (async () => {
      try {
        await api('/api/register', { method: 'POST', body: JSON.stringify({ tgId, username }) });
        const meRes = await api(`/api/me?tgId=${encodeURIComponent(String(tgId))}`);
        const me = meRes?.me;

        setUser((prev) => ({
          ...prev,
          username,
          points: Number(me?.points || 0),
          referrals: Array.isArray(me?.referrals) ? me.referrals : [],
        }));

        if (me?.config) {
          setConfig((prev) => {
            const next = { ...prev, ...me.config };
            next.miningRate = Number(next.miningRate) || DEFAULT_CONFIG.miningRate;
            next.miningDuration = Number(next.miningDuration) || DEFAULT_CONFIG.miningDuration;
            return next;
          });
        }
      } catch {
        setUser((prev) => ({ ...prev, username }));
      }
    })();
  }, []);

  useEffect(() => localStorage.setItem('glowmine_user', JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem('glowmine_config', JSON.stringify(config)), [config]);

  const handleAdminTrigger = () => {
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickCountRef.current += 1;

    if (clickCountRef.current >= 8) {
      setIsPinModalOpen(true);
      clickCountRef.current = 0;
    } else {
      clickTimerRef.current = setTimeout(() => (clickCountRef.current = 0), 2000);
    }
  };

  const handlePinSubmit = () => {
    if (pinInput === '2025') {
      setIsAdminOpen(true);
      setIsPinModalOpen(false);
      setPinInput('');
    } else {
      alert('Invalid Access Key');
      setPinInput('');
    }
  };

  const updateConfig = async (next: AppConfig) => {
    // ✅ ensure numbers
    const safeNext = {
      ...next,
      miningRate: Number(next.miningRate) || DEFAULT_CONFIG.miningRate,
      miningDuration: Number(next.miningDuration) || DEFAULT_CONFIG.miningDuration,
    };

    setConfig(safeNext);
    if (!BACKEND_URL) return;
    try {
      await api('/api/admin/config', { method: 'POST', body: JSON.stringify(safeNext) });
    } catch {}
  };

  // ✅ Mining Engine (NEW):
  // miningRate = GP/MIN
  // miningDuration = MINUTES
  // total = rate * duration
  useEffect(() => {
    if (!user.miningSession.isActive || !user.miningSession.startTime) return;

    const interval = setInterval(() => {
      const elapsedMinutes = (Date.now() - user.miningSession.startTime!) / 60000;

      if (elapsedMinutes >= config.miningDuration) {
        const totalSessionPoints = config.miningRate * config.miningDuration;

        setUser((prev) => ({
          ...prev,
          points: prev.points + totalSessionPoints,
          miningSession: { isActive: false, startTime: null },
        }));

        const { tgId } = getTelegramUser();
        if (tgId && BACKEND_URL) {
          api('/api/earn', {
            method: 'POST',
            body: JSON.stringify({ tgId, amount: totalSessionPoints, reason: 'mining' }),
          }).catch(() => {});
        }

        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user.miningSession.isActive, user.miningSession.startTime, config.miningRate, config.miningDuration]);

  const handleStartMining = () => {
    setUser((prev) => ({ ...prev, miningSession: { isActive: true, startTime: Date.now() } }));
  };

  const handleUpdatePoints = (amount: number) => {
    setUser((prev) => ({ ...prev, points: prev.points + amount }));
  };

  const handleCompleteTask = (taskId: string) => {
    const task = user.tasks.find((t) => t.id === taskId);
    if (!task) return;

    setUser((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, isCompleted: true } : t)),
      points: prev.points + task.reward,
    }));

    const { tgId } = getTelegramUser();
    if (tgId && BACKEND_URL) {
      api('/api/earn', {
        method: 'POST',
        body: JSON.stringify({ tgId, amount: task.reward, reason: `task:${taskId}` }),
      }).catch(() => {});
    }
  };

  const handleAddReferral = () => {
    const { tgId } = getTelegramUser();
    const myId = tgId || '0';
    const refLink = `https://t.me/${BOT_USERNAME}?start=ref${myId}`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(
      'Join VcolletFree and start earning!'
    )}`;

    if ((window as any).Telegram?.WebApp) (window as any).Telegram.WebApp.openTelegramLink(shareUrl);
    else window.open(shareUrl, '_blank');
  };

  const usdtValue = (user.points / config.exchangeRate).toFixed(2);

  // ✅ MiningView countdown expects seconds => convert minutes to seconds here
  const miningDurationSeconds = Math.max(0, Math.floor(config.miningDuration * 60));

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden bg-[#030014]">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <header className="p-4 pt-6 flex justify-between items-center z-20 sticky top-0 bg-[#030014]/80 backdrop-blur-md border-b border-white/5">
        <div
          onClick={handleAdminTrigger}
          className="flex items-center gap-2 glass px-4 py-2 rounded-2xl border-purple-500/30 cursor-pointer active:scale-95 transition-transform select-none"
        >
          <div className="bg-purple-500/20 p-1.5 rounded-lg">
            <Coins className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Balance</p>
            <p className="text-sm font-bold font-mono">{user.points.toFixed(2)} GP</p>
          </div>
        </div>

        <button
          onClick={() => setIsWithdrawOpen(true)}
          className="flex items-center gap-2 glass px-4 py-2 rounded-2xl border-blue-500/30 hover:bg-white/10 transition-colors"
        >
          <div className="bg-blue-500/20 p-1.5 rounded-lg">
            <Wallet className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-left">
            <p className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Value</p>
            <p className="text-sm font-bold font-mono">${usdtValue} USDT</p>
          </div>
        </button>
      </header>

      <main className="px-4 mt-4 animate-in fade-in duration-500 relative z-10">
        {activeView === View.MINING && (
          <MiningView
            points={user.points}
            miningRate={config.miningRate} // ✅ now GP/MIN (you will just relabel in MiningView later)
            session={{ ...user.miningSession, duration: miningDurationSeconds }} // ✅ seconds for countdown
            onStartMining={handleStartMining}
            onClaim={(reward) => handleUpdatePoints(reward)}
          />
        )}

        {activeView === View.TASKS && <TasksView tasks={user.tasks} onComplete={handleCompleteTask} />}

        {activeView === View.REFERRALS && (
          <ReferralView
            referrals={user.referrals}
            totalEarned={user.referrals.reduce((acc, curr) => acc + curr.earned, 0)}
            rewardAmount={config.referralReward}
            onInvite={handleAddReferral}
          />
        )}
      </main>

      <Navbar activeView={activeView} onViewChange={setActiveView} />

      {isPinModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in zoom-in duration-300">
          <div className="w-full max-w-xs glass border-purple-500/30 rounded-[32px] p-8 flex flex-col items-center gap-6 shadow-2xl shadow-purple-500/20">
            <div className="p-4 bg-purple-500/10 rounded-full text-purple-400">
              <Lock size={32} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black uppercase tracking-tighter text-white">Admin Access</h3>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Enter Security Key</p>
            </div>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="****"
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-center font-mono text-xl tracking-[1em] text-white focus:outline-none focus:border-purple-500/50 transition-colors"
            />
            <div className="flex gap-2 w-full">
              <button
                onClick={() => {
                  setIsPinModalOpen(false);
                  setPinInput('');
                }}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-xs uppercase transition-colors text-white"
              >
                Cancel
              </button>
              <button
                onClick={handlePinSubmit}
                className="flex-[2] py-4 bg-purple-600 hover:bg-purple-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-white"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {isWithdrawOpen && (
        <WithdrawModal
          username={user.username}
          balance={user.points}
          minWithdraw={config.minWithdraw}
          exchangeRate={config.exchangeRate}
          config={config}
          onClose={() => setIsWithdrawOpen(false)}
        />
      )}

      {isAdminOpen && (
        <AdminDashboard
          config={config}
          tasks={user.tasks}
          onUpdateConfig={updateConfig}
          onUpdateTasks={(newTasks) => setUser((prev) => ({ ...prev, tasks: newTasks }))}
          onClose={() => setIsAdminOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
