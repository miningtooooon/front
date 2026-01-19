
import React from 'react';
import { Referral } from '../types';
import { Share2, Users, Trophy, Gift, Copy } from 'lucide-react';

interface Props {
  referrals: Referral[];
  totalEarned: number;
  rewardAmount: number;
  onInvite: () => void;
}

const ReferralView: React.FC<Props> = ({ referrals, totalEarned, rewardAmount, onInvite }) => {
  const refLink = `https://t.me/VcolletFree_bot?start=ref12345`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(refLink);
    alert('Referral link copied!');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative glass p-6 rounded-3xl border-yellow-500/40 glow-gold overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                <Gift className="text-yellow-400" />
                Invite Friends
              </h2>
              <p className="text-yellow-200/60 text-xs font-medium mt-1">Earn 10% lifetime commissions + {rewardAmount} GP instant bonus.</p>
            </div>
            <Trophy className="text-yellow-400/20 w-12 h-12" />
          </div>
          
          <div className="mt-6 flex gap-2">
            <div className="flex-1 bg-black/40 border border-yellow-500/30 rounded-xl px-4 py-3 text-xs font-mono text-yellow-100 truncate flex items-center">
              {refLink}
            </div>
            <button 
              onClick={copyToClipboard}
              className="bg-yellow-500 text-black p-3 rounded-xl hover:bg-yellow-400 transition-colors"
            >
              <Copy size={18} />
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass p-4 rounded-2xl border-yellow-500/10">
          <Users className="text-yellow-400 mb-2" size={20} />
          <p className="text-xs font-bold text-white/40 uppercase">Total Referrals</p>
          <p className="text-xl font-black font-mono">{referrals.length}</p>
        </div>
        <div className="glass p-4 rounded-2xl border-yellow-500/10">
          <Coins className="text-yellow-400 mb-2" size={20} />
          <p className="text-xs font-bold text-white/40 uppercase">Commission Earned</p>
          <p className="text-xl font-black font-mono">{totalEarned.toFixed(0)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-black uppercase text-white/40 ml-1">Referral History</h3>
        {referrals.length > 0 ? (
          <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-4 duration-500">
            {referrals.map(ref => (
              <div key={ref.id} className="glass p-4 rounded-2xl border-white/5 flex items-center justify-between animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center font-bold text-black uppercase">
                    {ref.username.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold">@{ref.username}</p>
                    <p className="text-[10px] text-white/40">{ref.date}</p>
                  </div>
                </div>
                <p className="text-yellow-400 font-bold font-mono">+{ref.earned} GP</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass p-8 rounded-2xl border-white/5 text-center">
            <p className="text-white/20 text-sm italic">No referrals yet. Start sharing!</p>
          </div>
        )}
      </div>

      <button 
        onClick={onInvite}
        className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform mt-2 hover:bg-yellow-400 transition-colors"
      >
        <Share2 size={20} />
        Invite Friend
      </button>
    </div>
  );
};

const Coins = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} height={size || 24} 
    viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" 
    strokeLinecap="round" strokeLinejoin="round" 
    className={className}
  >
    <path d="M8 6h8"/><path d="M8 10h8"/><path d="M8 14h8"/><path d="M8 18h8"/><rect width="16" height="20" x="4" y="2" rx="2"/>
  </svg>
);

export default ReferralView;
