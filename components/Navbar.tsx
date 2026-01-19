
import React from 'react';
import { View } from '../types';
import { Pickaxe, Target, Users2 } from 'lucide-react';

interface Props {
  activeView: View;
  onViewChange: (view: View) => void;
}

const Navbar: React.FC<Props> = ({ activeView, onViewChange }) => {
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm glass rounded-3xl border-white/20 p-2 z-50 flex gap-2 overflow-hidden">
      <NavItem 
        label="Mining" 
        icon={<Pickaxe size={20} />} 
        active={activeView === View.MINING} 
        onClick={() => onViewChange(View.MINING)}
        activeColor="bg-purple-600 shadow-purple-500/40"
      />
      <NavItem 
        label="Tasks" 
        icon={<Target size={20} />} 
        active={activeView === View.TASKS} 
        onClick={() => onViewChange(View.TASKS)}
        activeColor="bg-blue-600 shadow-blue-500/40"
      />
      <NavItem 
        label="Network" 
        icon={<Users2 size={20} />} 
        active={activeView === View.REFERRALS} 
        onClick={() => onViewChange(View.REFERRALS)}
        activeColor="bg-yellow-600 shadow-yellow-500/40"
      />
    </nav>
  );
};

const NavItem = ({ label, icon, active, onClick, activeColor }: any) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all duration-300 ${
      active 
      ? `${activeColor} text-white shadow-lg` 
      : 'text-white/40 hover:text-white/60'
    }`}
  >
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
  </button>
);

export default Navbar;
