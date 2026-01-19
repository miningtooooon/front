
import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, Wallet, Timer, Zap, Loader2 } from 'lucide-react';
import { AppConfig } from '../types';

const BACKEND_URL = ((window as any)._ENV_?.BACKEND_URL || '').replace(/\/$/, '');

interface Props {
  username: string;
  balance: number;
  minWithdraw: number;
  exchangeRate: number;
  config: AppConfig;
  onClose: () => void;
}

const WithdrawModal: React.FC<Props> = ({ username, balance, minWithdraw, exchangeRate, config, onClose }) => {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'form' | 'success' | 'error'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = parseFloat(amount) >= minWithdraw && address.trim().length > 10 && parseFloat(amount) <= balance;

  const sendWithdrawRequest = async (reqAmount: string, reqAddress: string) => {
    const tgId = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    if (!tgId) return false;
    if (!BACKEND_URL) return false;

    try {
      const r = await fetch(`${BACKEND_URL}/api/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tgId, amount: parseFloat(reqAmount), address: reqAddress })
      });
      return r.ok;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsSubmitting(true);

    const ok = await sendWithdrawRequest(amount, address);
    setTimeout(() => {
      setStep(ok ? 'success' : 'error');
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className={`w-full max-w-sm glass border-white/20 rounded-[40px] p-8 relative overflow-hidden transition-all duration-700 ${step === 'success' ? 'border-green-500/50 shadow-[0_0_80px_rgba(34,197,94,0.15)]' : 'shadow-2xl'}`}>
        
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none"></div>

        {step !== 'success' && (
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors z-30">
            <X size={20} className="text-white/40" />
          </button>
        )}

        {step === 'form' ? (
          <div className="flex flex-col gap-6 relative z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="p-4 bg-blue-500/10 rounded-[28px] text-blue-400 shadow-[inset_0_0_20px_rgba(59,130,246,0.2)]">
                <ShieldCheck size={42} />
              </div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Cloud Payout</h2>
              <p className="text-white/40 text-[9px] text-center font-black uppercase tracking-[0.25em]">Verified Secure Protocol</p>
            </div>

            <div className="flex flex-col gap-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 ml-1">
                  <Wallet size={12} className="text-blue-400" />
                  <label className="text-[9px] font-black uppercase text-white/40 tracking-widest">Wallet Address (BEP20)</label>
                </div>
                <input 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-mono text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-white/10"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <div className="flex items-center gap-2">
                    <Zap size={12} className="text-blue-400" />
                    <label className="text-[9px] font-black uppercase text-white/40 tracking-widest">Amount to Withdraw</label>
                  </div>
                  <span className="text-[9px] font-black text-blue-400 uppercase bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">Min: {minWithdraw}</span>
                </div>
                <div className="relative">
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={minWithdraw.toString()}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xl font-black font-mono text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                  />
                  <button onClick={() => setAmount(balance.toString())} className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-400 uppercase hover:text-blue-300 transition-colors">Max</button>
                </div>
                <div className="flex justify-between mt-1 px-1">
                  <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">Fiat Estimate</p>
                  <p className="text-[10px] font-black text-white/80 tracking-widest">${(parseFloat(amount) / exchangeRate || 0).toFixed(2)} USDT</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 relative overflow-hidden group ${
                isValid && !isSubmitting
                ? 'bg-blue-600 text-white shadow-[0_0_40px_rgba(37,99,235,0.4)] active:scale-95' 
                : 'bg-white/5 text-white/10 cursor-not-allowed border border-white/5 shadow-none'
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Verify & Payout
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        ) : step === 'success' ? (
          <div className="flex flex-col items-center gap-8 py-4 animate-in zoom-in duration-500 text-center relative z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/30 rounded-full blur-[50px] animate-pulse scale-150"></div>
              <div className="relative p-8 bg-green-500/10 rounded-full text-green-400 border border-green-500/40 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                <CheckCircle2 size={85} className="animate-bounce" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-tight">Payout<br/>Confirmed</h2>
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 bg-green-500/10 px-5 py-2 rounded-full border border-green-500/30">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                  <p className="text-green-400 text-[11px] font-black uppercase tracking-[0.25em]">Processing</p>
                </div>
                <p className="text-white/60 text-[14px] leading-relaxed max-w-[260px] font-medium">
                  Verification complete. Your GP tokens will be converted and arrive in your wallet:
                  <span className="text-green-400 font-black block text-2xl mt-3 italic tracking-tighter drop-shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse uppercase">Within 24 Hours</span>
                </p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-500 text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] transition-all shadow-[0_0_50px_rgba(34,197,94,0.4)] active:scale-95"
            >
              Continue Mining
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 py-10 text-center animate-in zoom-in duration-300">
             <div className="p-7 bg-red-500/10 rounded-full text-red-500 border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <AlertTriangle size={65} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-red-500">Security Alert</h2>
              <p className="text-white/60 text-[11px] font-bold leading-relaxed uppercase tracking-widest px-4">Network handshake failed. Please check your internet or contact the system administrator.</p>
            </div>
            <button onClick={() => setStep('form')} className="w-full bg-white/5 border border-white/10 hover:bg-white/10 py-5 rounded-2xl font-black uppercase tracking-widest transition-all text-white">Retry Handshake</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawModal;
