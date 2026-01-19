
export enum View {
  MINING = 'MINING',
  TASKS = 'TASKS',
  REFERRALS = 'REFERRALS'
}

export interface Task {
  id: string;
  title: string;
  reward: number;
  type: 'video' | 'link' | 'telegram';
  isCompleted: boolean;
  timer?: number;
  link?: string;
}

export interface Referral {
  id: string;
  username: string;
  earned: number;
  date: string;
}

export interface AppConfig {
  miningRate: number;
  miningDuration: number;
  referralReward: number;
  minWithdraw: number;
  exchangeRate: number;
  totalMembers: number;
  activeNow: number;
  telegramBotToken?: string; // For withdrawal notifications
  adminChatId?: string;      // Your Telegram ID
}

export interface UserState {
  username: string; // User's identity
  points: number;
  referrals: Referral[];
  tasks: Task[];
  miningSession: {
    isActive: boolean;
    startTime: number | null;
  };
}
