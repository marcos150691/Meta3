import React, { useState, useEffect, useMemo, useRef } from 'react';
import MotoHeaderImg from './assets/images/moto_header_1783271006845.jpg';
import { 
  Bike, 
  TrendingUp, 
  History, 
  Settings, 
  Plus, 
  DollarSign, 
  CheckCircle2, 
  Calendar,
  Trash2,
  ChevronRight,
  Target,
  RotateCcw,
  Edit2,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Filter,
  Type,
  Play,
  Pause,
  Clock,
  Square,
  Zap,
  Fuel,
  X,
  Check,
  Vault,
  Trophy,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Toaster, toast } from 'sonner';
import { Ride, DailyGoal, AppState, AppStateSnapshot, Activity, Platform, ActivityType, HourlyReport } from './types';

const STORAGE_KEY = 'asfalto_meta_state';
const PRESET_SOUNDS = [
  { name: 'Caixa Registradora 1', value: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3' },
  { name: 'Caixa Registradora 2', value: 'https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3' },
  { name: 'Caixa Registradora 3', value: 'https://assets.mixkit.co/active_storage/sfx/2015/2015-preview.mp3' },
  { name: 'Moedas Caindo', value: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3' },
  { name: 'Sucesso Digital', value: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3' },
  { name: 'Sino de Vitória', value: 'https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3' },
  { name: 'Chime Brilhante', value: 'https://assets.mixkit.co/active_storage/sfx/2002/2002-preview.mp3' },
  { name: 'Conquista Game', value: 'https://assets.mixkit.co/active_storage/sfx/2006/2006-preview.mp3' },
  { name: 'Fanfarra Curta', value: 'https://assets.mixkit.co/active_storage/sfx/2009/2009-preview.mp3' },
  { name: 'Level Up', value: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3' },
  { name: 'Tada!', value: 'https://assets.mixkit.co/active_storage/sfx/2021/2021-preview.mp3' },
  { name: 'Pop Suave', value: 'https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3' },
  { name: 'Brilho Mágico', value: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3' },
  { name: 'Notificação VIP', value: 'https://assets.mixkit.co/active_storage/sfx/2005/2005-preview.mp3' },
  { name: 'Vitória Retrô', value: 'https://assets.mixkit.co/active_storage/sfx/2007/2007-preview.mp3' },
  { name: 'Chime Feliz', value: 'https://assets.mixkit.co/active_storage/sfx/2008/2008-preview.mp3' },
];

const MOTORCYCLE_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2536/2536-preview.mp3';

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const INITIAL_STATE: AppState = {
  rides: [],
  activities: [],
  goals: [],
  workTimer: {
    isRunning: false,
    startTime: null,
    accumulatedTime: 0,
    lastUpdateDate: getTodayString(),
    currentShift: 'dia inteiro',
    lastRecordedHour: 0,
    startedAt: null,
    pausedAt: null,
    stoppedAt: null
  },
  settings: {
    defaultCountGoal: 10,
    defaultValueGoal: 150,
    defaultMonthlyGoal: 3000,
    goalTargetDate: '',
    enableShiftTracking: true,
    enableMonthlyGoal: true,
    defaultShifts: {
      manhã: { countGoal: 3, valueGoal: 50 },
      tarde: { countGoal: 4, valueGoal: 60 },
      noite: { countGoal: 3, valueGoal: 40 },
    },
    enableSound: true,
    enableAnimation: true,
    selectedRideSound: PRESET_SOUNDS[0].value,
    theme: {
      headerColor: '#FF6321', // Neon Orange
      countBarColor: '#FF6321',
      valueBarColor: '#FFD700', // Neon Yellow
      cardBgColor: '',
      backgroundColor: 'dark',
      fontSize: 20,
      fontFamily: '"Inter", sans-serif',
      numberSize: 'normal'
    }
  },
  history: [],
  dailyJourneys: {},
  finalizedDays: [],
  hourlyPerformance: [],
  lastStoppedJourney: null
};

const PRESET_COLORS = [
  { name: 'Preto', value: '#000000' },
  { name: 'Laranja Neon', value: '#FF6321' },
  { name: 'Amarelo Neon', value: '#FFD700' },
  { name: 'Verde Neon', value: '#00FF41' },
  { name: 'Azul Elétrico', value: '#00D4FF' },
  { name: 'Azul Neon', value: '#00FFFF' },
  { name: 'Vermelho Neon', value: '#FF0000' },
  { name: 'Rosa Choque', value: '#FF007F' },
  { name: 'Roxo Ultravioleta', value: '#9D00FF' },
  { name: 'Branco Asfalto', value: '#FFFFFF' },
  { name: 'Degradê Fogo', value: 'linear-gradient(135deg, #FF6321 0%, #FFD700 100%)' },
  { name: 'Degradê Oceano', value: 'linear-gradient(135deg, #00D4FF 0%, #00FFFF 100%)' },
  { name: 'Degradê Floresta', value: 'linear-gradient(135deg, #00FF41 0%, #008F11 100%)' },
  { name: 'Degradê Galáxia', value: 'linear-gradient(135deg, #9D00FF 0%, #FF007F 100%)' },
];

const PRESET_FONTS = [
  { name: 'Padrão (Inter)', value: '"Inter", sans-serif' },
  { name: 'Moderno (Outfit)', value: '"Outfit", sans-serif' },
  { name: 'Técnico (JetBrains Mono)', value: '"JetBrains Mono", monospace' },
  { name: 'Elegante (Playfair Display)', value: '"Playfair Display", serif' },
  { name: 'Brutalista (Space Grotesk)', value: '"Space Grotesk", sans-serif' },
  { name: 'Clássico (Georgia)', value: 'Georgia, serif' },
  { name: 'Sistema', value: 'system-ui, sans-serif' },
];

const PRESET_BG_IMAGES = [
  { name: 'Nenhum', value: '' },
  { name: 'Uber Logo', value: 'https://images.unsplash.com/photo-1591628001888-76cc02e0c276?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Uber Noite', value: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Crosser Vermelha', value: 'https://images.unsplash.com/photo-1558981285-e53bc946b484?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Crosser Trilha', value: 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Cidade Noite', value: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Estrada Aberta', value: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Moto Detalhe', value: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Esportiva', value: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Clássica', value: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Chopper', value: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Aventura', value: 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Noite Urbana', value: 'https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Montanha', value: 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Neon Futurista', value: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Asfalto Textura', value: 'https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Velocidade', value: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=1000' },
];

const PRESET_BG_COLORS = [
  { name: 'Padrão', value: '' },
  { name: 'Branco Puro', value: '#FFFFFF' },
  { name: 'Cinza Claro', value: '#F1F5F9' },
  { name: 'Azul Profundo', value: '#0A192F' },
  { name: 'Azul Marinho', value: '#001F3F' },
  { name: 'Verde Musgo', value: '#0B1A0E' },
  { name: 'Roxo Noite', value: '#1A0B2E' },
  { name: 'Cinza', value: '#333333' },
  { name: 'Cinza Chumbo', value: '#121212' },
  { name: 'Metal', value: '#4A4E52' },
  { name: 'Vinho Escuro', value: '#1A0505' },
];

const PRESET_PLATFORMS: Platform[] = ['Uber', '99', 'Outros'];

const WheelieBike = () => (
  <div 
    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 pointer-events-none"
    style={{ transform: 'translate(40%, -60%) rotate(-35deg)' }}
  >
    <Bike size={22} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
  </div>
);

export default function App() {
  const [today, setToday] = useState(getTodayString);

  // Update today periodically
  useEffect(() => {
    const timer = setInterval(() => {
      const newToday = getTodayString();
      if (newToday !== today) setToday(newToday);
    }, 60000);
    return () => clearInterval(timer);
  }, [today]);

  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved.startsWith('{')) {
        const parsed = JSON.parse(saved);
        // Migration for old state without theme
        if (!parsed.settings) parsed.settings = INITIAL_STATE.settings;
        if (!parsed.settings.theme) {
          parsed.settings.theme = INITIAL_STATE.settings.theme;
        }
        if (parsed.settings.theme.cardBgColor === undefined) {
          parsed.settings.theme.cardBgColor = '';
        }
      // Migration for background color
      if (!parsed.settings.theme.backgroundColor) {
        parsed.settings.theme.backgroundColor = 'dark';
      }
      if (!parsed.settings.theme.fontSize || parsed.settings.theme.fontSize === 16) {
        parsed.settings.theme.fontSize = 20; // Defaulting to 20 for larger text
      }
      if (!parsed.settings.theme.fontFamily) {
        parsed.settings.theme.fontFamily = '"Inter", sans-serif';
      }
      // Migration for history
      if (!parsed.history) {
        parsed.history = [];
      }
      if (!parsed.activities) {
        parsed.activities = [];
      }
      if (!parsed.dailyJourneys) {
        parsed.dailyJourneys = {};
      } else {
        // Migrate dailyJourneys from number to object if necessary
        Object.keys(parsed.dailyJourneys).forEach(date => {
          if (typeof parsed.dailyJourneys[date] === 'number') {
            parsed.dailyJourneys[date] = { 'dia inteiro': parsed.dailyJourneys[date] };
          }
        });

      }
      if (parsed.hourlyPerformance === undefined) {
        parsed.hourlyPerformance = [];
      }
      if (parsed.finalizedDays === undefined) {
        parsed.finalizedDays = [];
      }
      // Migration for hourly saving in workTimer
      if (parsed.workTimer && parsed.workTimer.lastRecordedHour === undefined) {
        parsed.workTimer.lastRecordedHour = 0;
      }
      // Migration for sound and animation
      if (parsed.settings.enableSound === undefined) {
        parsed.settings.enableSound = true;
      }
      if (parsed.settings.enableAnimation === undefined) {
        parsed.settings.enableAnimation = true;
      }
      if (parsed.settings.enableShiftTracking === undefined) {
        parsed.settings.enableShiftTracking = true;
      }
      if (parsed.settings.selectedRideSound === undefined) {
        parsed.settings.selectedRideSound = PRESET_SOUNDS[0].value;
      }
      if (parsed.settings.defaultMonthlyGoal === undefined) {
        parsed.settings.defaultMonthlyGoal = 3000;
      }
      if (parsed.settings.enableMonthlyGoal === undefined) {
        parsed.settings.enableMonthlyGoal = true;
      }
      if (parsed.settings.goalTargetDate === undefined) {
        parsed.settings.goalTargetDate = '';
      }
      // Migration for shift goals
      if (!parsed.settings.defaultShifts) {
        parsed.settings.defaultShifts = INITIAL_STATE.settings.defaultShifts;
      }
      if (parsed.goals) {
        parsed.goals = parsed.goals.map((goal: any) => {
          if (!goal.shifts) {
            return {
              ...goal,
              shifts: INITIAL_STATE.settings.defaultShifts
            };
          }
          return goal;
        });

      }
      // Migration for shift
      if (parsed.rides) {
        parsed.rides = parsed.rides.map((ride: any) => ({
          ...ride,
          shift: ride.shift || 'manhã'
        }));

      }
      // Migration for workTimer
      if (!parsed.workTimer) {
        parsed.workTimer = INITIAL_STATE.workTimer;
      } else {
        if (!parsed.workTimer.currentShift) {
          parsed.workTimer.currentShift = 'dia inteiro';
        }
        
        if (parsed.workTimer.lastUpdateDate !== today) {
          // Automatically reset timer if it's a new day
          const oldDate = parsed.workTimer.lastUpdateDate;
          const timeToSave = parsed.workTimer.accumulatedTime;
          const shiftToSave = parsed.workTimer.currentShift || 'dia inteiro';
          
          // Save previous day journey if there was time
          if (timeToSave > 0) {
            if (!parsed.dailyJourneys) parsed.dailyJourneys = {};
            if (!parsed.dailyJourneys[oldDate]) parsed.dailyJourneys[oldDate] = {};
            parsed.dailyJourneys[oldDate][shiftToSave] = (parsed.dailyJourneys[oldDate][shiftToSave] || 0) + timeToSave;
          }

          parsed.workTimer = {
            ...INITIAL_STATE.workTimer,
            lastUpdateDate: today
          };
        }
      }
      return parsed;
    }
    return INITIAL_STATE;
  } catch (e) {
    console.error('Error loading state:', e);
    return INITIAL_STATE;
  }
});

  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'finance' | 'productivity' | 'settings' | 'fuel' | 'missing_goals'>('dashboard');
  const [dashboardShift, setDashboardShift] = useState<'manhã' | 'tarde' | 'noite' | 'dia'>(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'manhã';
    if (hour >= 12 && hour < 19) return 'tarde';
    return 'noite';
  });
  const [registrationShift, setRegistrationShift] = useState<'manhã' | 'tarde' | 'noite'>(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'manhã';
    if (hour >= 12 && hour < 19) return 'tarde';
    return 'noite';
  });
  const [historyShift, setHistoryShift] = useState<'all' | 'manhã' | 'tarde' | 'noite'>('all');

  // Sync history shift with dashboard shift
  useEffect(() => {
    if (state.settings.enableShiftTracking) {
      if (dashboardShift === 'dia') {
        setHistoryShift('all');
      } else {
        setHistoryShift(dashboardShift as any);
      }
    }
  }, [dashboardShift, state.settings.enableShiftTracking]);

  const [isAddingRide, setIsAddingRide] = useState(false);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [isEditingMonthlyGoal, setIsEditingMonthlyGoal] = useState(false);
  const [tempMonthlyGoal, setTempMonthlyGoal] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(today.substring(0, 7));
  const [editingRide, setEditingRide] = useState<Ride | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  
  const [newRideValue, setNewRideValue] = useState('');
  const [newRideDesc, setNewRideDesc] = useState('');
  const [newRideShift, setNewRideShift] = useState<'manhã' | 'tarde' | 'noite'>('manhã');
  const [newRideDate, setNewRideDate] = useState(today);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showTimerResetConfirm, setShowTimerResetConfirm] = useState(false);
  const [showTimerStopConfirm, setShowTimerStopConfirm] = useState(false);

  const [newActivityType, setNewActivityType] = useState<ActivityType>('recebimento');
  const [newActivityPlatform, setNewActivityPlatform] = useState<Platform>('Uber');
  const [newActivityValue, setNewActivityValue] = useState('');
  const [newActivityDesc, setNewActivityDesc] = useState('');
  const [newActivityDate, setNewActivityDate] = useState(today);
  const [newActivityShift, setNewActivityShift] = useState<'manhã' | 'tarde' | 'noite'>('manhã');

  const [quickValue, setQuickValue] = useState('');
  const [lastAddedValue, setLastAddedValue] = useState<number | null>(null);
  const [customFuelInput, setCustomFuelInput] = useState<string>('');
  const [editingFuelId, setEditingFuelId] = useState<number | null>(null);
  const [editFuelValue, setEditFuelValue] = useState<string>('');
  const [editFuelGoal, setEditFuelGoal] = useState<string>('');
  const [showFloatingValue, setShowFloatingValue] = useState(false);
  const [showVaultFloatingValue, setShowVaultFloatingValue] = useState(false);
  const [lastVaultAddedValue, setLastVaultAddedValue] = useState<number | null>(null);
  
  const [levelUpData, setLevelUpData] = useState<{ type: 'weekly' | 'monthly', amount: number } | null>(null);
  const prevFinanceRef = useRef({ week: 0, month: 0 });
  const isFinanceInitialRender = useRef(true);

  const coinPaths = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const startX = 20 + Math.random() * 8;
      const startY = 45 + Math.random() * 8;
      const peakY = 5 - (Math.random() * 12);
      const peakX = startX + (88 - startX) * 0.4 + (Math.random() * 10 - 5);
      return {
        delay: i * 0.12,
        duration: 0.6 + Math.random() * 0.15,
        x: [ `${startX}%`, `${peakX}%`, `88%` ],
        y: [ `${startY}%`, `${peakY}%`, `15%` ],
        rotate: [ 0, 180, 360 + Math.random() * 180 ],
        scale: [ 0.5, 1.2, 0.4 ]
      };
    });
  }, [showFloatingValue]);

  const vaultCoinPaths = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => {
      const startX = 10 + Math.random() * 15;
      const startY = 60 + Math.random() * 10;
      const peakY = 10 + (Math.random() * 15);
      const peakX = startX + (85 - startX) * 0.5 + (Math.random() * 10 - 5);
      return {
        delay: i * 0.1,
        duration: 0.7 + Math.random() * 0.2,
        x: [ `${startX}%`, `${peakX}%`, `85%` ],
        y: [ `${startY}%`, `${peakY}%`, `60%` ], // 60% is roughly center of the right vault container
        rotate: [ 0, 180, 360 + Math.random() * 180 ],
        scale: [ 0.5, 1.2, 0.6 ]
      };
    });
  }, [showVaultFloatingValue]);

  const fuelBubbles = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: Math.random() * 92 + 4, // keep inside borders
      size: Math.random() * 6 + 3, // 3px to 9px
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 2, // 2s to 5s
      opacity: Math.random() * 0.3 + 0.7, // 0.7 to 1.0 (brighter!)
      swayDuration: Math.random() * 2 + 1.5 // 1.5s to 3.5s
    }));
  }, []);

  const fuelProgress = Math.min(100, Math.max(0, ((state.fuelState?.date === today ? state.fuelState.currentValue : 0) / (state.fuelState?.goal || 50)) * 100));

  const vaultMoney = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 80 + 10,
      size: Math.random() * 8 + 8, // 8px to 16px
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 2,
      swayDuration: Math.random() * 2 + 1.5
    }));
  }, []);
  
  const todayVaultValue = useMemo(() => {
    return (state.vaultState?.history || [])
      .filter(h => h.date === today)
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [state.vaultState?.history, today]);

  const vaultProgress = Math.min(100, Math.max(0, (todayVaultValue / (state.vaultState?.goal || 100)) * 100));

  // Timer Tick
  const [elapsedTime, setElapsedTime] = useState(0);
  const [quickVaultValue, setQuickVaultValue] = useState('');
  
  const playBeep = async () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioCtx = new AudioContextClass();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error('Audio beep failed', e);
    }
  };

  useEffect(() => {
    let interval: any;
    if (state.workTimer?.isRunning && state.workTimer.startTime) {
      const update = () => {
        const now = Date.now();
        const diff = now - state.workTimer!.startTime!;
        setElapsedTime((state.workTimer?.accumulatedTime || 0) + diff);
      };
      update(); // Update immediately
      interval = setInterval(update, 1000);
    } else {
      setElapsedTime(state.workTimer?.accumulatedTime || 0);
    }
    return () => clearInterval(interval);
  }, [state.workTimer?.isRunning, state.workTimer?.startTime, state.workTimer?.accumulatedTime]);

  const toggleTimer = () => {
    setState(prev => {
      const now = Date.now();
      const isRunning = !prev.workTimer?.isRunning;
      const currentTimeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      let startedAt = prev.workTimer?.startedAt || null;
      let pausedAt = prev.workTimer?.pausedAt || null;
      let stoppedAt = prev.workTimer?.stoppedAt || null;

      if (isRunning) {
        if ((prev.workTimer?.accumulatedTime || 0) === 0) {
          startedAt = currentTimeStr;
          pausedAt = null;
          stoppedAt = null;
        } else if (!startedAt) {
          startedAt = currentTimeStr;
        }
      } else {
        pausedAt = currentTimeStr;
      }
      
      return {
        ...prev,
        workTimer: {
          ...prev.workTimer,
          isRunning,
          startTime: isRunning ? now : null,
          accumulatedTime: isRunning 
            ? (prev.workTimer?.accumulatedTime || 0) 
            : (prev.workTimer?.accumulatedTime || 0) + (prev.workTimer?.startTime ? (now - prev.workTimer.startTime) : 0),
          lastUpdateDate: today,
          currentShift: prev.workTimer?.currentShift || 'dia inteiro',
          startedAt,
          pausedAt,
          stoppedAt
        }
      };
    });
  };

  const setTimerShift = (shift: 'dia inteiro' | 'manhã' | 'tarde' | 'noite') => {
    setState(prev => ({
      ...prev,
      workTimer: {
        ...(prev.workTimer || { isRunning: false, startTime: null, accumulatedTime: 0, lastUpdateDate: today }),
        currentShift: shift
      }
    }));
  };

  const resetTimer = () => {
    setShowTimerResetConfirm(true);
  };

  const confirmResetTimer = () => {
    setState(prev => ({
      ...prev,
      workTimer: {
        isRunning: false,
        startTime: null,
        accumulatedTime: 0,
        lastUpdateDate: today,
        currentShift: prev.workTimer?.currentShift || 'dia inteiro',
        startedAt: null,
        pausedAt: null,
        stoppedAt: null
      }
    }));
    setShowTimerResetConfirm(false);
    toast.success("Cronômetro zerado!");
  };

  const stopTimer = () => {
    setShowTimerStopConfirm(true);
  };

  const confirmStopTimer = () => {
    let savedPhrase = '';
    let workedTime = 0;
    let savedShift = '';

    setState(prev => {
      const now = Date.now();
      const currentTimeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const timeToSave = (prev.workTimer?.accumulatedTime || 0) + 
        (prev.workTimer?.isRunning && prev.workTimer?.startTime ? (now - prev.workTimer.startTime) : 0);
      const shiftToSave = prev.workTimer?.currentShift || 'dia inteiro';
      const newDailyJourneys = { ...(prev.dailyJourneys || {}) };
      
      workedTime = timeToSave;
      savedShift = shiftToSave;

      if (timeToSave > 0) {
        if (!newDailyJourneys[today]) newDailyJourneys[today] = {};
        newDailyJourneys[today][shiftToSave] = (newDailyJourneys[today][shiftToSave] || 0) + timeToSave;
      }

      const totalShiftTime = (newDailyJourneys[today]?.[shiftToSave]) || timeToSave;
      savedPhrase = `Parabéns! Você trabalhou ${formatFriendlyDuration(totalShiftTime)} no turno ${shiftToSave}!`;

      return {
        ...prev,
        dailyJourneys: newDailyJourneys,
        lastStoppedJourney: timeToSave > 0 ? {
          date: today,
          shift: shiftToSave,
          durationMs: totalShiftTime,
          phrase: savedPhrase
        } : prev.lastStoppedJourney,
        workTimer: {
          isRunning: false,
          startTime: null,
          accumulatedTime: 0, // Reset after saving
          lastUpdateDate: today,
          currentShift: prev.workTimer?.currentShift || 'dia inteiro',
          startedAt: prev.workTimer?.startedAt,
          pausedAt: prev.workTimer?.pausedAt,
          stoppedAt: currentTimeStr
        }
      };
    });
    
    setShowTimerStopConfirm(false);
    
    if (workedTime > 0) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      toast.success(
        <div className="flex flex-col gap-1 text-left">
          <span className="font-bold text-base text-emerald-600">🎉 Parabéns!</span>
          <span className="text-sm">Você trabalhou {formatFriendlyDuration(workedTime)} no turno de {savedShift === 'dia inteiro' ? 'Dia Inteiro' : savedShift}!</span>
        </div>,
        { duration: 8000 }
      );
    } else {
      toast.success("Jornada finalizada!");
    }
  };

  const deleteJourneyTime = (date: string, shift: string) => {
    setState(prev => {
      const newDailyJourneys = { ...(prev.dailyJourneys || {}) };
      if (newDailyJourneys[date]) {
        const dateJourneys = { ...newDailyJourneys[date] };
        delete dateJourneys[shift];
        
        if (Object.keys(dateJourneys).length === 0) {
          delete newDailyJourneys[date];
        } else {
          newDailyJourneys[date] = dateJourneys;
        }
      }
      
      return {
        ...prev,
        dailyJourneys: newDailyJourneys
      };
    });
    toast.success("Tempo de trabalho removido!");
  };

  const deleteHourlyReport = (timestamp: number) => {
    setState(prev => ({
      ...prev,
      hourlyPerformance: (prev.hourlyPerformance || []).filter(p => p.timestamp !== timestamp)
    }));
    toast.success("Registro horário removido!");
  };

  const formatElapsedTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatFriendlyDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const parts: string[] = [];
    if (hours > 0) {
      parts.push(`${hours} ${hours === 1 ? 'hora' : 'horas'}`);
    }
    if (minutes > 0) {
      parts.push(`${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`);
    }
    if (seconds > 0 || parts.length === 0) {
      parts.push(`${seconds} ${seconds === 1 ? 'segundo' : 'segundos'}`);
    }
    
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return `${parts[0]} e ${parts[1]}`;
    return `${parts[0]}, ${parts[1]} e ${parts[2]}`;
  };

  // Refs to track goal completion state
  const countGoalReachedRef = useRef(false);
  const valueGoalReachedRef = useRef(false);
  const nearGoalReachedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const motorcycleAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(state.settings.selectedRideSound || PRESET_SOUNDS[0].value);
    motorcycleAudioRef.current = new Audio(MOTORCYCLE_SOUND);
  }, []);

  // Update ride sound when setting changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = state.settings.selectedRideSound || PRESET_SOUNDS[0].value;
    }
  }, [state.settings.selectedRideSound]);

  // Persist state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Apply font size to document root so Tailwind rem classes scale properly
  useEffect(() => {
    const applyFontSize = () => {
      let size = state.settings.theme.fontSize ?? 20;
      
      // Make root font size responsive on small screens to prevent layout breakage
      const w = window.innerWidth;
      if (w < 380 && size > 16) {
        size = Math.min(size, 16); // Cap on very small phones
      } else if (w < 450 && size > 18) {
        size = Math.min(size, 18); // Cap on average phones
      }

      document.documentElement.style.fontSize = `${size}px`;
    };

    applyFontSize();
    window.addEventListener('resize', applyFontSize);
    return () => window.removeEventListener('resize', applyFontSize);
  }, [state.settings.theme.fontSize]);

  const getCurrentShift = (): 'manhã' | 'tarde' | 'noite' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'manhã';
    if (hour >= 12 && hour < 19) return 'tarde';
    return 'noite';
  };

  const currentGoal = useMemo(() => {
    const goal = state.goals.find(g => g.date === today);
    return goal || { 
      date: today, 
      countGoal: state.settings.defaultCountGoal, 
      valueGoal: state.settings.defaultValueGoal,
      shifts: state.settings.defaultShifts || INITIAL_STATE.settings.defaultShifts
    };
  }, [state.goals, state.settings, today]);

  const todayRides = useMemo(() => {
    const isFinalized = state.finalizedDays?.includes(today);
    return isFinalized ? [] : state.rides.filter(r => r.date === today);
  }, [state.rides, today, state.finalizedDays]);

  const totalJourneyTime = useMemo(() => {
    const dailyJourneysObj = state.dailyJourneys?.[today] || {};
    return (Object.values(dailyJourneysObj) as number[]).reduce((acc: number, curr: number) => acc + curr, 0) + elapsedTime;
  }, [state.dailyJourneys, today, elapsedTime]);

  const todayStats = useMemo(() => {
    const count = todayRides.length;
    
    // Revenue (Faturamento) comes strictly from rides
    const value = todayRides.reduce((acc, curr) => acc + curr.value, 0);
    
    const todayActivities = state.activities.filter(a => a.date === today && a.type === 'recebimento');
    
    const shifts = {
      manhã: { count: 0, value: 0 },
      tarde: { count: 0, value: 0 },
      noite: { count: 0, value: 0 }
    };

    todayRides.forEach(ride => {
      const s = ride.shift || 'manhã';
      shifts[s].count++;
      shifts[s].value += ride.value;
    });

    // Manual activities (recebimentos) are tracked but don't affect Faturamento metrics
    const totalActivitiesValue = todayActivities.reduce((acc, curr) => acc + curr.value, 0);

    // Total value for daily goal (Unified: Rides + Manual Receipts)
    const totalDayValue = value + totalActivitiesValue;

    const isDayView = dashboardShift === 'dia' || !state.settings.enableShiftTracking;
    const currentShift = isDayView ? registrationShift : dashboardShift;
    
    // Journey Time Calculation
    const journeyTime = isDayView ? totalJourneyTime : (((state.dailyJourneys?.[today] || {}) as Record<string, number>)[currentShift] || 0) + 
      (state.workTimer?.currentShift === currentShift ? elapsedTime : 0);
    
    // For shift view, we still use shift-specific values
    // For day view, we use the unified total
    const currentShiftStats = isDayView 
      ? { count, value: totalDayValue } 
      : shifts[currentShift as 'manhã' | 'tarde' | 'noite'];
      
    const currentShiftGoal = isDayView
      ? { countGoal: currentGoal.countGoal, valueGoal: currentGoal.valueGoal }
      : (currentGoal.shifts || INITIAL_STATE.settings.defaultShifts!)[currentShift as 'manhã' | 'tarde' | 'noite'];

    return { count, value, shifts, currentShift, currentShiftStats, currentShiftGoal, isDayView, journeyTime, totalDayValue };
  }, [todayRides, state.activities, state.dailyJourneys, state.workTimer, elapsedTime, currentGoal, dashboardShift, today, registrationShift, totalJourneyTime, state.settings.enableShiftTracking]);

  // Hourly performance tracking effect
  useEffect(() => {
    if (!state.workTimer?.isRunning) return;

    const currentHour = Math.floor(totalJourneyTime / 3600000); 
    const lastRecorded = state.workTimer?.lastRecordedHour || 0;

    if (currentHour > lastRecorded && currentHour > 0) {
      // A new hour has passed!
      const currentValue = todayRides.reduce((acc, curr) => acc + curr.value, 0);
      
      const todayReports = (state.hourlyPerformance || []).filter(p => p.date === today);
      const lastSnapshot = todayReports.sort((a, b) => b.hourMark - a.hourMark)[0];
      const incremental = lastSnapshot ? currentValue - lastSnapshot.valueAtMark : currentValue;
      
      const newReport: HourlyReport = {
        timestamp: Date.now(),
        date: today,
        hourMark: currentHour,
        valueAtMark: currentValue,
        incrementalValue: incremental
      };

      setState(prev => ({
        ...prev,
        workTimer: {
          ...prev.workTimer!,
          lastRecordedHour: currentHour
        },
        hourlyPerformance: [newReport, ...(prev.hourlyPerformance || [])]
      }));

      if (state.settings.enableSound) {
        playBeep();
      }
      toast.success(`Hora ${currentHour} registrada! +R$ ${incremental.toFixed(2)}`, {
        icon: <TrendingUp className="text-green-500" size={16} />
      });
    }
  }, [totalJourneyTime, state.workTimer?.isRunning, state.workTimer?.lastRecordedHour, todayRides, state.hourlyPerformance, state.settings.enableSound, today]);


  const monthlyStats = useMemo(() => {
    const monthActivities = state.activities.filter(a => a.date.startsWith(selectedMonth) && a.type === 'recebimento');
    const activitiesValue = monthActivities.reduce((acc, curr) => acc + curr.value, 0);
    
    const monthRides = state.rides.filter(r => r.date.startsWith(selectedMonth));
    const ridesValue = monthRides.reduce((acc, curr) => acc + curr.value, 0);

    const totalValue = activitiesValue + ridesValue;
    
    const goal = state.settings.defaultMonthlyGoal || 3000;
    const remaining = Math.max(0, goal - totalValue);
    
    const [year, month] = selectedMonth.split('-').map(Number);
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    
    const currentMonthStr = today.substring(0, 7);
    let daysRemaining = lastDayOfMonth;
    
    if (selectedMonth === currentMonthStr) {
      if (state.settings.goalTargetDate) {
        const targetDateObj = new Date(state.settings.goalTargetDate + 'T23:59:59');
        const todayDateObj = new Date(today + 'T00:00:00');
        const diffTime = targetDateObj.getTime() - todayDateObj.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysRemaining = Math.max(1, diffDays);
      } else {
        const currentDay = new Date().getDate();
        daysRemaining = Math.max(1, lastDayOfMonth - currentDay + 1);
      }
    } else if (selectedMonth < currentMonthStr) {
      daysRemaining = 1; // Month passed, show stats as final
    }
    
    const weeksRemaining = Math.max(1, Math.ceil(daysRemaining / 7));
    
    const dailyNeeded = remaining / daysRemaining;
    const weeklyNeeded = remaining / weeksRemaining;
    
    const progress = Math.min(100, (totalValue / goal) * 100);
    
    return { totalValue, goal, remaining, dailyNeeded, weeklyNeeded, progress, daysRemaining, weeksRemaining, selectedMonth };
  }, [state.activities, state.rides, state.settings.defaultMonthlyGoal, state.settings.goalTargetDate, today, selectedMonth]);

  const financeStats = useMemo(() => {
    const now = new Date();
    const currentDay = today;
    
    // Helper to get start of week (Sunday)
    const getStartOfWeek = (d: Date) => {
      const day = d.getDay();
      const diff = d.getDate() - day;
      return new Date(d.setDate(diff)).toISOString().split('T')[0];
    };
    const startOfWeek = getStartOfWeek(new Date(now));
    const currentMonth = today.substring(0, 7);

    const filterByDate = (activities: Activity[], start: string, end?: string) => {
      if (end) {
        return activities.filter(a => a.date >= start && a.date <= end);
      }
      return activities.filter(a => a.date.startsWith(start));
    };

    const calculateTotals = (activities: Activity[], rides: Ride[]) => {
      const totals = {
        faturamento: 0, // Only rides
        recebimentoManual: { total: 0, Uber: 0, 99: 0, Outros: 0 },
        despesa: { total: 0, Uber: 0, 99: 0, Outros: 0 },
        totalRecebido: 0 // Rides + Manual
      };

      activities.forEach(a => {
        if (a.type === 'recebimento') {
          totals.recebimentoManual.total += a.value;
          totals.recebimentoManual[a.platform] += a.value;
          totals.totalRecebido += a.value;
        } else {
          totals.despesa.total += a.value;
          totals.despesa[a.platform] += a.value;
        }
      });

      // Ride values are strictly for Faturamento
      rides.forEach(r => {
        totals.faturamento += r.value;
        totals.totalRecebido += r.value;
      });

      return totals;
    };

    const dayActivities = state.activities.filter(a => a.date === currentDay);
    const weekActivities = state.activities.filter(a => a.date >= startOfWeek);
    const monthActivities = state.activities.filter(a => a.date.startsWith(currentMonth));

    const dayRides = state.rides.filter(r => r.date === currentDay);
    const weekRides = state.rides.filter(r => r.date >= startOfWeek);
    const monthRides = state.rides.filter(r => r.date.startsWith(currentMonth));

    return {
      day: calculateTotals(dayActivities, dayRides),
      week: calculateTotals(weekActivities, weekRides),
      month: calculateTotals(monthActivities, monthRides)
    };
  }, [state.activities, state.rides, today]);

  // Weekly & Monthly Level Up logic
  useEffect(() => {
    const currentWeekValue = financeStats.week.totalRecebido;
    const currentMonthValue = financeStats.month.totalRecebido;
    
    if (isFinanceInitialRender.current) {
      isFinanceInitialRender.current = false;
      prevFinanceRef.current = { week: currentWeekValue, month: currentMonthValue };
      return;
    }

    const weeklyGoal = monthlyStats.weeklyNeeded;
    const monthlyGoal = monthlyStats.goal;

    const prevWeek = prevFinanceRef.current.week;
    const prevMonth = prevFinanceRef.current.month;

    let triggered = false;

    if (monthlyGoal > 0 && prevMonth < monthlyGoal && currentMonthValue >= monthlyGoal) {
      setLevelUpData({ type: 'monthly', amount: monthlyGoal });
      triggered = true;
      confetti({ particleCount: 300, spread: 120, origin: { y: 0.4 }, colors: ['#fbbf24', '#f59e0b', '#d97706'] });
    } else if (weeklyGoal > 0 && prevWeek < weeklyGoal && currentWeekValue >= weeklyGoal) {
      setLevelUpData({ type: 'weekly', amount: weeklyGoal });
      triggered = true;
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.5 }, colors: ['#4ade80', '#22c55e', '#16a34a'] });
    }

    if (triggered) {
      if (state.settings.enableSound && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      setTimeout(() => setLevelUpData(null), 5000);
    }

    prevFinanceRef.current = { week: currentWeekValue, month: currentMonthValue };
  }, [financeStats.week.totalRecebido, financeStats.month.totalRecebido, monthlyStats.weeklyNeeded, monthlyStats.goal, state.settings.enableSound]);

  // Celebration and Near-Goal logic
  useEffect(() => {
    const isShiftMode = state.settings.enableShiftTracking;
    
    const countReached = isShiftMode 
      ? todayStats.currentShiftStats.count >= todayStats.currentShiftGoal.countGoal && todayStats.currentShiftGoal.countGoal > 0
      : todayStats.count >= currentGoal.countGoal && currentGoal.countGoal > 0;
      
    const valueReached = isShiftMode
      ? todayStats.currentShiftStats.value >= todayStats.currentShiftGoal.valueGoal && todayStats.currentShiftGoal.valueGoal > 0
      : todayStats.value >= currentGoal.valueGoal && currentGoal.valueGoal > 0;

    // Near goal logic: 1 ride left OR 90% of value reached
    const targetCountGoal = isShiftMode ? todayStats.currentShiftGoal.countGoal : currentGoal.countGoal;
    const targetValueGoal = isShiftMode ? todayStats.currentShiftGoal.valueGoal : currentGoal.valueGoal;
    const targetCount = isShiftMode ? todayStats.currentShiftStats.count : todayStats.count;
    const targetValue = isShiftMode ? todayStats.currentShiftStats.value : todayStats.value;

    const isNearCountGoal = targetCount === targetCountGoal - 1 && targetCountGoal > 1;
    const isNearValueGoal = targetValue >= targetValueGoal * 0.9 && targetValue < targetValueGoal && targetValueGoal > 0;

    if ((isNearCountGoal || isNearValueGoal) && !nearGoalReachedRef.current && !countReached && !valueReached) {
      notifyNearGoal();
      nearGoalReachedRef.current = true;
    }

    // Reset near goal ref if we move away from the near state (e.g. undo)
    if (!isNearCountGoal && !isNearValueGoal && !countReached && !valueReached) {
      nearGoalReachedRef.current = false;
    }

    if (countReached && !countGoalReachedRef.current) {
      triggerCelebration(isShiftMode ? `Meta de Corridas do Turno (${todayStats.currentShift}) Batida!` : 'Meta de Corridas Diária Batida!');
      countGoalReachedRef.current = true;
    } else if (!countReached) {
      countGoalReachedRef.current = false;
    }

    if (valueReached && !valueGoalReachedRef.current) {
      triggerCelebration(isShiftMode ? `Meta de Faturamento do Turno (${todayStats.currentShift}) Batida!` : 'Meta de Faturamento Diário Batida!');
      valueGoalReachedRef.current = true;
    } else if (!valueReached) {
      valueGoalReachedRef.current = false;
    }
  }, [todayStats, currentGoal, state.settings.enableShiftTracking]);

  // Reminders and Notifications
  useEffect(() => {
    if (!state.settings.notifications?.enabled) return;
    
    let lastWaterReminder = Date.now();
    let dailyReminderSent = false;

    const interval = setInterval(() => {
      const now = new Date();
      
      // Daily start reminder
      if (state.settings.notifications?.dailyReminderTime && !dailyReminderSent) {
        const [hours, minutes] = state.settings.notifications.dailyReminderTime.split(':').map(Number);
        if (now.getHours() === hours && now.getMinutes() === minutes) {
          dailyReminderSent = true;
          if (Notification.permission === 'granted') {
            new Notification('Asfalto Meta', {
              body: 'Hora de ir pra pista! Como está a energia para hoje?',
              icon: '/favicon.ico'
            });
          }
          toast.info('Hora de ir pra pista! Como está a energia para hoje?');
        }
      }

      // Reset daily reminder flag at midnight
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        dailyReminderSent = false;
      }

      // Drink water reminder (every 2 hours while working)
      if (state.settings.notifications?.drinkWaterReminder && state.workTimer?.isRunning) {
        if (Date.now() - lastWaterReminder >= 2 * 60 * 60 * 1000) {
          lastWaterReminder = Date.now();
          if (Notification.permission === 'granted') {
            new Notification('Lembrete', {
              body: 'Beba água! Mantenha-se hidratado durante o turno.',
              icon: '/favicon.ico'
            });
          }
          toast.info('Beba água! Mantenha-se hidratado durante o turno.');
        }
      }
    }, 60000); // check every minute

    return () => clearInterval(interval);
  }, [state.settings.notifications, state.workTimer?.isRunning]);

  const notifyNearGoal = () => {
    if (state.settings.notifications?.enabled && !state.settings.notifications?.goalReminder) {
      return;
    }
    
    const message = "Falta pouco para você largar!";
    
    // Written notification
    toast.info(message, {
      description: "Você está quase batendo sua meta de hoje!",
      duration: 5000,
      icon: <Bike className="text-blue-500" size={18} />
    });

    if (state.settings.notifications?.enabled && Notification.permission === 'granted') {
      new Notification('Quase lá!', {
        body: 'Falta pouco para você bater a meta. Continue focado!',
        icon: '/favicon.ico'
      });
    }

    // Sound notification (TTS)
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const triggerCelebration = (text: string) => {
    // Play motorcycle sound
    if (state.settings.enableSound && motorcycleAudioRef.current) {
      motorcycleAudioRef.current.currentTime = 0;
      motorcycleAudioRef.current.play().catch(e => console.log('Motorcycle audio play failed:', e));
    }

    // Voice message
    if (state.settings.enableSound && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance("Parabéns, meta concluída com sucesso");
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }

    // Play chaching sound too
    if (state.settings.enableSound && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }

    if (state.settings.enableAnimation) {
      // Confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  };

  const saveHistory = (prevState: AppState) => {
    const snapshot: AppStateSnapshot = {
      rides: prevState.rides,
      activities: prevState.activities,
      goals: prevState.goals,
      fuelState: prevState.fuelState,
      vaultState: prevState.vaultState
    };
    return [snapshot, ...prevState.history].slice(0, 10); // Keep last 10 actions
  };

  const addActivity = () => {
    if (!newActivityValue) return;
    const val = parseFloat(newActivityValue.replace(',', '.'));
    if (isNaN(val)) return;

    const activity: Activity = {
      id: crypto.randomUUID(),
      date: newActivityDate,
      type: newActivityType,
      platform: newActivityPlatform,
      value: val,
      description: newActivityDesc || (newActivityType === 'recebimento' ? 'Recebimento' : 'Despesa'),
      shift: newActivityShift
    };

    setState(prev => ({
      ...prev,
      history: saveHistory(prev),
      activities: [activity, ...prev.activities]
    }));

    setNewActivityValue('');
    setNewActivityDesc('');
    setNewActivityShift(registrationShift);
    setIsAddingActivity(false);
    setEditingActivity(null);
  };

  const updateActivity = () => {
    if (!editingActivity || !newActivityValue) return;
    const val = parseFloat(newActivityValue.replace(',', '.'));
    if (isNaN(val)) return;

    setState(prev => ({
      ...prev,
      history: saveHistory(prev),
      activities: prev.activities.map(a => a.id === editingActivity.id ? {
        ...a,
        date: newActivityDate,
        type: newActivityType,
        platform: newActivityPlatform,
        value: val,
        description: newActivityDesc,
        shift: newActivityShift
      } : a)
    }));

    setNewActivityValue('');
    setNewActivityDesc('');
    setNewActivityShift(registrationShift);
    setIsAddingActivity(false);
    setEditingActivity(null);
  };

  const deleteActivity = (id: string) => {
    setState(prev => ({
      ...prev,
      history: saveHistory(prev),
      activities: prev.activities.filter(a => a.id !== id)
    }));
  };

  const startEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setNewActivityType(activity.type);
    setNewActivityPlatform(activity.platform);
    setNewActivityValue(activity.value.toString());
    setNewActivityDesc(activity.description);
    setNewActivityDate(activity.date);
    setNewActivityShift(activity.shift || 'manhã');
    setIsAddingActivity(true);
  };

  const undoVault = () => {
    setState(prev => {
      if (!prev.vaultState?.history || prev.vaultState.history.length === 0) return prev;
      
      const newHistory = [...prev.vaultState.history];
      const lastAction = newHistory.pop();
      
      if (!lastAction) return prev;

      return {
        ...prev,
        vaultState: {
          ...prev.vaultState,
          currentValue: Math.max(0, (prev.vaultState.currentValue || 0) - lastAction.amount),
          history: newHistory
        }
      };
    });
  };

  const addToVault = (amount: number) => {
    setState(prev => ({
      ...prev,
      vaultState: {
        ...prev.vaultState,
        currentValue: (prev.vaultState?.currentValue || 0) + amount,
        history: [
          ...(prev.vaultState?.history || []),
          { id: crypto.randomUUID(), date: today, amount, timestamp: Date.now() }
        ]
      }
    }));
    
    setLastVaultAddedValue(amount);
    
    // Play cash register sound if enabled
    if (state.settings.enableSound && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
    
    // Coin effect
    if (state.settings.enableAnimation) {
      setShowVaultFloatingValue(true);
      setTimeout(() => setShowVaultFloatingValue(false), 2000);
    }
  };

  const quickAddRide = (value: number, description: string = 'Corrida', date: string = today) => {
    const ride: Ride = {
      id: crypto.randomUUID(),
      date: date,
      timestamp: Date.now(),
      value: value,
      description: description,
      shift: date === today ? registrationShift : 'manhã'
    };

    if (value > 0) {
      setLastAddedValue(value);
      if (state.settings.enableAnimation) {
        setShowFloatingValue(true);
        setTimeout(() => setShowFloatingValue(false), 2000);
      }
      
      // Play cash register sound
      if (state.settings.enableSound && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
    }

    setState(prev => ({
      ...prev,
      history: saveHistory(prev),
      rides: [ride, ...prev.rides]
    }));
  };

  const handleQuickValueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(quickValue.replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      quickAddRide(val, `Entrada Rápida R$ ${val}`);
      setQuickValue('');
      toast.success(`Adicionado R$ ${val.toFixed(2)}`);
    }
  };

  const addRide = () => {
    if (!newRideValue) return;
    
    const val = parseFloat(newRideValue);
    const ride: Ride = {
      id: crypto.randomUUID(),
      date: newRideDate,
      timestamp: Date.now(),
      value: val,
      description: newRideDesc || 'Corrida',
      shift: newRideShift
    };

    if (val > 0) {
      setLastAddedValue(val);
      if (state.settings.enableAnimation) {
        setShowFloatingValue(true);
        setTimeout(() => setShowFloatingValue(false), 2000);
      }
      
      // Play cash register sound
      if (state.settings.enableSound && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
    }

    setState(prev => ({
      ...prev,
      history: saveHistory(prev),
      rides: [ride, ...prev.rides]
    }));

    setNewRideValue('');
    setNewRideDesc('');
    setNewRideDate(today);
    setIsAddingRide(false);
  };

  const updateRide = () => {
    if (!editingRide || !newRideValue) return;

    const val = parseFloat(newRideValue);
    
    if (val > 0 && val !== editingRide.value) {
      // Play cash register sound
      if (state.settings.enableSound && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
    }

    setState(prev => ({
      ...prev,
      history: saveHistory(prev),
      rides: prev.rides.map(r => r.id === editingRide.id ? {
        ...r,
        value: val,
        description: newRideDesc || 'Corrida',
        shift: newRideShift,
        date: newRideDate,
        timestamp: r.timestamp || Date.now()
      } : r)
    }));

    setNewRideValue('');
    setNewRideDesc('');
    setNewRideDate(today);
    setEditingRide(null);
  };

  const finalizeDay = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    const isReady = (hours === 23 && minutes >= 50);
    const isSpecial = state.workTimer?.currentShift === 'dia inteiro' || state.workTimer?.currentShift === 'noite';
    
    if (isSpecial && !isReady) {
      toast.error("Turnos 'Dia Inteiro' e 'Noite' só podem ser finalizados após as 23:50.");
      return;
    }

    setState(prev => ({
      ...prev,
      finalizedDays: [...(prev.finalizedDays || []), today]
    }));
    toast.success("Dia finalizado e enviado para o histórico!");
  };

  const undoFinalizeDay = (date: string) => {
    setState(prev => ({
      ...prev,
      finalizedDays: (prev.finalizedDays || []).filter(d => d !== date)
    }));
    toast.success("Finalização desfeita!");
  };

  const deleteRide = (id: string) => {
    setState(prev => ({
      ...prev,
      history: saveHistory(prev),
      rides: prev.rides.filter(r => r.id !== id)
    }));
  };

  const undo = () => {
    if (state.history.length === 0) return;

    const [lastSnapshot, ...remainingHistory] = state.history;
    
    // Determine the last added value from the snapshot's rides
    if (lastSnapshot.rides && lastSnapshot.rides.length > 0) {
      // Find the most recently added ride in the snapshot
      const latestRide = [...lastSnapshot.rides].sort((a, b) => b.timestamp - a.timestamp)[0];
      setLastAddedValue(latestRide.value);
    } else {
      setLastAddedValue(null);
    }

    setState(prev => ({
      ...prev,
      rides: lastSnapshot.rides,
      activities: lastSnapshot.activities || [],
      goals: lastSnapshot.goals,
      fuelState: lastSnapshot.fuelState,
      history: remainingHistory
    }));
  };

  const startEdit = (ride: Ride) => {
    setEditingRide(ride);
    setNewRideValue(ride.value.toString());
    setNewRideDesc(ride.description || '');
    setNewRideShift(ride.shift || 'manhã');
    setNewRideDate(ride.date);
    setIsAddingRide(true);
  };

  const updateSettings = (count: number, value: number) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        defaultCountGoal: count,
        defaultValueGoal: value
      }
    }));
  };

  const updateShiftGoal = (shift: 'manhã' | 'tarde' | 'noite', key: 'countGoal' | 'valueGoal', value: number) => {
    setState(prev => {
      const currentShifts = prev.settings.defaultShifts || INITIAL_STATE.settings.defaultShifts!;
      const newShifts = {
        ...currentShifts,
        [shift]: {
          ...currentShifts[shift],
          [key]: value
        }
      };
      
      return {
        ...prev,
        settings: {
          ...prev.settings,
          defaultShifts: newShifts
        }
      };
    });
  };

  const updatePreference = (key: 'enableSound' | 'enableAnimation' | 'enableShiftTracking' | 'enableMonthlyGoal' | 'defaultMonthlyGoal' | 'defaultCountGoal' | 'defaultValueGoal' | 'goalTargetDate', value: any) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  };

  const updateTheme = (key: keyof AppState['settings']['theme'], value: string | number) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        theme: {
          ...prev.settings.theme,
          [key]: value
        }
      }
    }));
  };

  const addFuelValue = (val: number) => {
    setState(prev => {
      const fuelState = prev.fuelState || { goal: 50, currentValue: 0, date: today, history: [] };
      const isNewDay = fuelState.date !== today;
      const newValue = isNewDay ? val : fuelState.currentValue + val;
      
      return {
        ...prev,
        history: saveHistory(prev),
        fuelState: {
          ...fuelState,
          currentValue: newValue,
          date: today
        }
      };
    });
  };

  const updateFuelGoal = (val: number) => {
    setState(prev => ({
      ...prev,
      fuelState: {
        ...(prev.fuelState || { currentValue: 0, date: today, history: [] }),
        goal: val
      }
    }));
  };

  const resetFuelTracker = () => {
    setState(prev => ({
      ...prev,
      history: saveHistory(prev),
      fuelState: {
        ...(prev.fuelState || { goal: 50, history: [] }),
        currentValue: 0,
        date: today
      }
    }));
  };

  const finishFuelTank = () => {
    setState(prev => {
      const fuelState = prev.fuelState;
      if (!fuelState) return prev;
      
      const newHistory = [{
        timestamp: Date.now(),
        value: fuelState.currentValue,
        goal: fuelState.goal
      }, ...(fuelState.history || [])];

      return {
        ...prev,
        history: saveHistory(prev),
        fuelState: {
          ...fuelState,
          currentValue: 0,
          history: newHistory
        }
      };
    });
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    if (state.settings.enableSound) playBeep();
    toast.success("Meta de combustível atingida e salva no histórico!");
  };

  const saveEditedFuelHistoryItem = (timestamp: number) => {
    const val = parseFloat(editFuelValue.replace(',', '.'));
    const goal = parseFloat(editFuelGoal.replace(',', '.'));
    if (isNaN(val) || isNaN(goal)) return;
    
    setState(prev => {
      if (!prev.fuelState || !prev.fuelState.history) return prev;
      return {
        ...prev,
        fuelState: {
          ...prev.fuelState,
          history: prev.fuelState.history.map(h => 
            h.timestamp === timestamp ? { ...h, value: val, goal: goal } : h
          )
        }
      };
    });
    setEditingFuelId(null);
  };

  const deleteFuelHistoryItem = (timestamp: number) => {
    setState(prev => {
      if (!prev.fuelState || !prev.fuelState.history) return prev;
      return {
        ...prev,
        fuelState: {
          ...prev.fuelState,
          history: prev.fuelState.history.filter(h => h.timestamp !== timestamp)
        }
      };
    });
  };

  const dismissMissingGoalBanner = () => {
    setState(prev => ({
      ...prev,
      fuelState: {
        ...(prev.fuelState || { goal: 50, currentValue: 0, date: today, history: [] }),
        dismissedMissingGoalDate: today
      }
    }));
  };

  const motionProps = (initial: any, animate: any, exit?: any) => {
    if (!state.settings.enableAnimation) return {};
    return { initial, animate, exit };
  };

  const countProgress = state.settings.enableShiftTracking
    ? Math.min((todayStats.currentShiftStats.count / todayStats.currentShiftGoal.countGoal) * 100, 100)
    : Math.min((todayStats.count / currentGoal.countGoal) * 100, 100);
    
  const valueProgress = state.settings.enableShiftTracking
    ? Math.min((todayStats.currentShiftStats.value / todayStats.currentShiftGoal.valueGoal) * 100, 100)
    : Math.min((todayStats.value / currentGoal.valueGoal) * 100, 100);

  const isDark = state.settings.theme.backgroundColor === 'dark';
  
  const targetCount = state.settings.enableShiftTracking ? todayStats.currentShiftStats.count : todayStats.count;
  const targetCountGoal = state.settings.enableShiftTracking ? todayStats.currentShiftGoal.countGoal : currentGoal.countGoal;
  const targetValue = state.settings.enableShiftTracking ? todayStats.currentShiftStats.value : todayStats.value;
  const targetValueGoal = state.settings.enableShiftTracking ? todayStats.currentShiftGoal.valueGoal : currentGoal.valueGoal;

  const bgColor = state.settings.theme.customBgColor || (isDark ? '#0F1115' : '#F8FAFC');
  const textColor = isDark ? 'text-white' : 'text-black font-bold';
  const mutedTextColor = isDark ? 'text-white/70' : 'text-black font-extrabold';
  const subMutedTextColor = isDark ? 'text-white/50' : 'text-black/90 font-bold';
  const cardClass = state.settings.theme.cardBgColor
    ? 'custom-card'
    : isDark 
      ? 'glass-card glass-card-dark' 
      : bgColor.toUpperCase() === '#FFFFFF' 
        ? 'bg-slate-50/95 border-2 border-slate-200/90 shadow-md shadow-slate-200/30 p-4 sm:p-5 rounded-2xl'
        : 'bg-white border-2 border-slate-200/90 shadow-md shadow-slate-200/20 p-4 sm:p-5 rounded-2xl';

  const customCardVariables = state.settings.theme.cardBgColor
    ? {
        '--card-bg': state.settings.theme.cardBgColor,
        '--card-border': state.settings.theme.cardBgColor.startsWith('linear-gradient') ? 'transparent' : isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(148, 163, 184, 0.35)',
        '--card-border-width': state.settings.theme.cardBgColor.startsWith('linear-gradient') ? '0px' : isDark ? '1px' : '2px',
        '--card-shadow': isDark 
          ? '0 4px 10px rgba(0,0,0,0.3)'
          : '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
      }
    : {};

  const mainBgStyle = {
    backgroundColor: bgColor,
    fontSize: state.settings.theme.fontSize ? `${state.settings.theme.fontSize}px` : '20px',
    fontFamily: state.settings.theme.fontFamily || '"Inter", sans-serif',
    ...customCardVariables
  };

  const getStyle = (color: string, isText = false) => {
    let finalColor = color;
    if (isText && !isDark) {
      if (color.startsWith('linear-gradient')) {
        // Text gradients are extremely hard to read on a light mobile screen; default to solid black
        finalColor = '#000000';
      } else {
        const upperColor = color.toUpperCase().trim();
        if (upperColor === '#FFD700') finalColor = '#854D00'; // Highly readable Dark Gold-Brown
        else if (upperColor === '#00FF41') finalColor = '#14532D'; // High contrast Dark Forest Green
        else if (upperColor === '#00D4FF' || upperColor === '#00FFFF') finalColor = '#1E3A8A'; // High contrast Dark Blue
        else if (upperColor === '#FF6321') finalColor = '#9A3412'; // High contrast Dark Orange
        else if (upperColor === '#FF0000') finalColor = '#991B1B'; // High contrast Dark Red
        else if (upperColor === '#FF007F') finalColor = '#9D174D'; // High contrast Dark Hot Pink
        else if (upperColor === '#9D00FF') finalColor = '#581C87'; // High contrast Dark Purple
        else if (upperColor === '#FFFFFF' || upperColor === '#FFF') finalColor = '#000000'; // White text to Black
      }
    }

    if (finalColor.startsWith('linear-gradient')) {
      if (isText) {
        return {
          background: finalColor,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        };
      }
      return { background: finalColor };
    }
    return isText ? { color: finalColor } : { backgroundColor: finalColor };
  };

  const getQuickAddNumberSizeClass = () => {
    const size = state.settings.theme.numberSize || 'normal';
    
    switch (size) {
      case '1':
      case 'large':
        return 'text-2xl';
      case '2':
      case 'xlarge':
        return 'text-3xl';
      case '3':
      case 'giant':
        return 'text-4xl';
      case '4':
        return 'text-5xl';
      case '5':
        return 'text-6xl';
      case '6':
        return 'text-7xl';
      case '7':
        return 'text-8xl';
      case '8':
        return 'text-[5.5rem] md:text-[6rem]';
      case '9':
        return 'text-[6.5rem] md:text-[7rem]';
      case '10':
        return 'text-[7.5rem] md:text-[8rem]';
      case 'normal':
      default:
        return 'text-xl';
    }
  };

  const getSolidColor = (color: string) => {
    if (color.startsWith('linear-gradient')) {
      // Extract first color from gradient for things that don't support gradients well (like accentColor)
      const match = color.match(/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}/);
      return match ? match[0] : '#FF6321';
    }
    return color;
  };

  // Vault Calculations
  const vaultStartOfWeekDate = new Date(new Date().setDate(new Date().getDate() - new Date().getDay()));
  const vaultStartOfWeekString = vaultStartOfWeekDate.toISOString().split('T')[0];
  
  const vaultHistoryMonth = state.vaultState?.history?.filter(h => h.date.startsWith(selectedMonth)) || [];
  const vaultTotalMonth = vaultHistoryMonth.reduce((acc, curr) => acc + curr.amount, 0);

  const vaultHistoryWeek = state.vaultState?.history?.filter(h => h.date >= vaultStartOfWeekString) || [];
  const vaultTotalWeek = vaultHistoryWeek.reduce((acc, curr) => acc + curr.amount, 0);

  const vaultHistoryGroupedByDay = useMemo(() => {
    const grouped = vaultHistoryMonth.reduce((acc, curr) => {
      if (!acc[curr.date]) acc[curr.date] = 0;
      acc[curr.date] += curr.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [vaultHistoryMonth]);

  return (
    <div className={`min-h-screen w-full overflow-x-hidden ${textColor} transition-colors duration-500 pb-24 relative`} style={mainBgStyle}>
      <Toaster position="top-center" theme={isDark ? 'dark' : 'light'} richColors />
      {/* Header */}
      <header className={`p-4 sm:p-6 pt-12 pb-8 relative overflow-hidden ${activeTab === 'dashboard' ? 'rounded-b-[2.5rem] shadow-2xl mb-2' : ''}`}>
        {activeTab === 'dashboard' && (
          <div className="absolute inset-0 z-0">
            <img 
              src={MotoHeaderImg} 
              alt="Motorcycle Background" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className={`absolute inset-0 ${isDark ? 'bg-black/60' : 'bg-black/50'} backdrop-blur-[2px]`}></div>
          </div>
        )}
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="p-2 rounded-lg neon-glow transition-colors duration-500"
              style={getStyle(state.settings.theme.headerColor)}
            >
              <Bike className="text-white" size={24} />
            </div>
            <h1 className={`text-5xl font-bold tracking-tighter uppercase italic ${activeTab === 'dashboard' ? 'text-white drop-shadow-md' : ''}`}>
              Asfalto <span style={getStyle(state.settings.theme.headerColor, true)}>Meta</span>
            </h1>
          </div>
          <p className={`${activeTab === 'dashboard' ? 'text-white/80 drop-shadow' : mutedTextColor} text-sm font-mono`}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 space-y-6 pb-32">
        {activeTab === 'dashboard' && (
          <motion.div 
            {...motionProps({ opacity: 0, y: 20 }, { opacity: 1, y: 0 })}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2"
          >
            {/* Work Timer Section */}
            <div className={`${cardClass} col-span-2 lg:col-span-4 p-3 sm:p-4 flex flex-col gap-2 relative overflow-hidden ring-1 ring-white/5`}>
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${state.workTimer?.isRunning ? 'bg-green-500/20 text-green-500' : isDark ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-500'}`}>
                    <Clock size={16} className={state.workTimer?.isRunning ? 'animate-pulse' : ''} />
                  </div>
                  <div>
                    <p className={`${mutedTextColor} text-[9px] uppercase font-mono tracking-widest`}>Controle de Jornada</p>
                    <p className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tighter">
                      {formatElapsedTime(elapsedTime)}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-1.5">
                  <button 
                    onClick={resetTimer}
                    className={`p-2 rounded-xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200 border border-slate-300'} ${subMutedTextColor} transition-colors`}
                    title="Reiniciar (Limpa sem salvar)"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button 
                    onClick={stopTimer}
                    className={`p-2 rounded-xl ${isDark ? 'bg-red-500/10 hover:bg-red-500/20 text-red-500' : 'bg-red-50 hover:bg-red-100 text-red-600'} transition-colors`}
                    title="Parar e Salvar"
                  >
                    <Square size={16} fill="currentColor" />
                  </button>
                  <button 
                    onClick={toggleTimer}
                    className={`p-2.5 rounded-xl transition-all shadow-lg active:scale-95 ${state.workTimer?.isRunning ? 'bg-orange-500 text-white shadow-orange-500/20' : 'bg-green-500 text-white shadow-green-500/20'}`}
                    title={state.workTimer?.isRunning ? 'Pausar' : 'Iniciar'}
                  >
                    {state.workTimer?.isRunning ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                </div>
              </div>

              {/* Shift Selector for Timer */}
              {(!state.workTimer || !state.workTimer.isRunning) && state.settings.enableShiftTracking && (
                <div className="flex gap-2 mt-2 pt-2 border-t border-white/5">
                  {(['manhã', 'tarde', 'noite'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setDashboardShift(s)}
                      className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${dashboardShift === s ? 'text-white' : isDark ? 'text-white/40 hover:bg-white/5' : 'text-slate-400 hover:bg-slate-50'}`}
                      style={dashboardShift === s ? getStyle(state.settings.theme.headerColor, true) : undefined}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Count Goal */}
            <div className={`${cardClass} col-span-2 lg:col-span-2 p-4 sm:p-6 space-y-4`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`${mutedTextColor} text-lg uppercase font-mono tracking-widest`}>
                      {state.settings.enableShiftTracking ? `Corridas - ${todayStats.currentShift}` : 'Total de Corridas'}
                    </p>
                    {state.history.length > 0 && (
                      <button 
                        onClick={undo}
                        className={`${subMutedTextColor} hover:text-white transition-colors`}
                        title="Desfazer última ação"
                      >
                        <RotateCcw size={12} />
                      </button>
                    )}
                  </div>
                  <h2 className="text-5xl sm:text-7xl font-bold font-mono tracking-tight">
                    {targetCount}
                    <span className={`${subMutedTextColor} text-2xl sm:text-3xl`}>
                      /{targetCountGoal}
                    </span>
                  </h2>
                  {state.settings.enableShiftTracking && (
                    <p className={`${subMutedTextColor} text-[10px] font-mono mt-1 uppercase tracking-widest`}>
                      Total do dia: <span className="font-bold" style={getStyle(state.settings.theme.headerColor, true)}>{todayStats.count}</span>
                    </p>
                  )}
                </div>
                <div className={`p-2 rounded-full ${countProgress >= 100 ? 'bg-green-500/20 text-green-500' : isDark ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                  {countProgress >= 100 ? <CheckCircle2 size={24} className={state.settings.enableAnimation ? "animate-bounce" : ""} /> : <CheckCircle2 size={24} />}
                </div>
              </div>
              
              {countProgress >= 100 && (
                state.settings.enableAnimation ? (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-green-500/20 text-green-400 p-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Target size={16} />
                    Meta Atingida!
                  </motion.div>
                ) : (
                  <div className="bg-green-500/20 text-green-400 p-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                    <Target size={16} />
                    Meta Atingida!
                  </div>
                )
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className={`${subMutedTextColor} uppercase tracking-widest text-[10px]`}>Progresso</span>
                  <span className={`${countProgress >= 100 ? 'text-green-500' : ''} font-mono`}>{countProgress.toFixed(0)}%</span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${countProgress}%`, 
                      ...getStyle(state.settings.theme.countBarColor, true)
                    }}
                  >
                    {countProgress > 0 && <WheelieBike />}
                  </div>
                </div>
              </div>
            </div>

            {/* Value Goal */}
            <div className={`${cardClass} col-span-2 lg:col-span-2 p-4 sm:p-6 space-y-4`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`${mutedTextColor} text-lg uppercase font-mono tracking-widest`}>
                      {state.settings.enableShiftTracking ? `Faturamento - ${todayStats.currentShift}` : 'Faturamento Diário'}
                    </p>
                    {state.history.length > 0 && (
                      <button 
                        onClick={undo}
                        className={`${subMutedTextColor} hover:text-white transition-colors`}
                        title="Desfazer última ação"
                      >
                        <RotateCcw size={12} />
                      </button>
                    )}
                  </div>
                  <h2 className="text-5xl sm:text-7xl font-bold font-mono tracking-tight flex items-start gap-1">
                    <span className={`${subMutedTextColor} text-xl sm:text-2xl mt-2`}>R$</span>
                    {targetValue.toFixed(2)}
                  </h2>
                  {state.settings.enableShiftTracking && (
                    <p className={`${subMutedTextColor} text-[10px] font-mono mt-1 uppercase tracking-widest`}>
                      Total do dia: <span className="font-bold" style={getStyle(state.settings.theme.headerColor, true)}>R$ {todayStats.value.toFixed(2)}</span>
                    </p>
                  )}
                </div>
                <div className={`p-2 rounded-full ${valueProgress >= 100 ? 'bg-green-500/20 text-green-500' : isDark ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                  {valueProgress >= 100 ? <DollarSign size={24} className={state.settings.enableAnimation ? "animate-pulse" : ""} /> : <DollarSign size={24} />}
                </div>
              </div>

              {/* Dropping Coins Overlay */}
              <div className="relative">
                <AnimatePresence>
                  {showFloatingValue && lastAddedValue && (
                    <>
                      {coinPaths.map((path, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ 
                            left: path.x[0], 
                            top: path.y[0], 
                            opacity: 0, 
                            scale: path.scale[0],
                            rotate: 0 
                          }}
                          animate={{ 
                            left: path.x, 
                            top: path.y, 
                            opacity: [0, 1, 1, 0],
                            scale: path.scale,
                            rotate: path.rotate 
                          }}
                          transition={{ 
                            duration: path.duration, 
                            delay: path.delay,
                            ease: "easeInOut"
                          }}
                          className="absolute z-20 text-yellow-500 font-extrabold font-mono flex items-center justify-center bg-yellow-300 rounded-full w-6 h-6 border-2 border-yellow-600 shadow-md"
                        >
                          $
                        </motion.div>
                      ))}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 0 }}
                        animate={{ opacity: [0, 1, 1, 0], scale: [1, 1.2, 1], y: -40 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="absolute right-0 top-[-20px] font-bold text-xl text-green-400 pointer-events-none z-50 font-mono"
                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                      >
                        +R$ {lastAddedValue.toFixed(2)}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

                <div className="progress-bar-container mb-2">
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${valueProgress}%`, 
                      ...getStyle(state.settings.theme.valueBarColor, true)
                    }}
                  >
                    {valueProgress > 0 && <WheelieBike />}
                  </div>
                </div>
                <div className={`flex justify-between text-sm font-mono ${subMutedTextColor} uppercase tracking-tighter`}>
                  <span>R$ 0</span>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                      <span>{valueProgress.toFixed(0)}% Concluído</span>
                      {state.history.length > 0 && (
                        <button 
                          onClick={undo}
                          className={`underline ${isDark ? 'hover:text-white' : 'hover:text-black'} transition-colors`}
                        >
                          Desfazer
                        </button>
                      )}
                    </div>
                    <div className="mt-1 flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
                      {targetValue < targetValueGoal ? (
                        <span className={`${isDark ? 'text-white' : 'text-slate-900'} font-bold text-xl`}>
                          Faltam R$ {(targetValueGoal - targetValue).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-green-500 font-bold">Meta Batida! (+R$ {(targetValue - targetValueGoal).toFixed(2)})</span>
                      )}
                      <span className={`${isDark ? 'text-white/20' : 'text-slate-300'} hidden sm:inline`}>•</span>
                      <div className="text-xs sm:text-sm font-sans flex items-center gap-2">
                        {targetCount < targetCountGoal ? (
                          <span className={isDark ? 'text-white/70' : 'text-slate-700 font-bold'}>
                            (Faltam <span className={`${isDark ? 'text-white' : 'text-slate-900'} font-bold`}>{targetCountGoal - targetCount}</span> corridas)
                          </span>
                        ) : (
                          <span className="text-green-500/80 font-bold">(Meta de corridas batida!)</span>
                        )}
                        
                        {lastAddedValue !== null && (
                          <>
                            <span className={`${isDark ? 'text-white/20' : 'text-slate-300'} hidden sm:inline`}>•</span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${subMutedTextColor}`}>
                              Último: <span className="font-mono text-emerald-500 text-sm">R$ {lastAddedValue}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span>R$ {state.settings.enableShiftTracking ? todayStats.currentShiftGoal.valueGoal : currentGoal.valueGoal}</span>
                </div>

                {/* Quick Buttons for Revenue */}
                <div className="grid grid-cols-5 gap-2 pt-2">
                  <form 
                    onSubmit={handleQuickValueSubmit}
                    className="col-span-1 flex"
                  >
                    <input 
                      type="number" 
                      inputMode="decimal"
                      placeholder="R$"
                      value={quickValue}
                      onChange={(e) => setQuickValue(e.target.value)}
                      className={`w-full py-3 px-2 text-lg font-mono font-bold rounded-lg border ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-white/30' : 'bg-slate-100 border-slate-300 text-slate-900 focus:bg-white focus:border-slate-500'} focus:outline-none transition-colors placeholder:text-[10px]`}
                    />
                  </form>
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                    <button 
                      key={val}
                      onClick={() => quickAddRide(val, `Corrida R$ ${val}`)}
                      className={`py-3 px-1 rounded-lg border font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-0.5 ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-300 hover:bg-slate-100 active:bg-slate-200 text-slate-800 shadow-sm'}`}
                      style={getStyle(state.settings.theme.valueBarColor, true)}
                    >
                      <span className="text-[10px] opacity-65 leading-none">+R$</span>
                      <span className={`${getQuickAddNumberSizeClass()} leading-none`}>{val}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Vault Card */}
            <div className={`${cardClass} col-span-2 lg:col-span-2 p-4 sm:p-6 border-l-4 border-green-500 overflow-hidden relative flex flex-col justify-between`}>
              <div className="flex justify-between items-center z-10 relative">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <p className={`${mutedTextColor} text-lg uppercase font-mono tracking-widest flex flex-col`}>
                      <span className="text-xs opacity-70">Dinheiro Guardado</span>
                      <span>O Cofre</span>
                    </p>
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-bold font-mono tracking-tight flex items-start gap-1">
                    <span className={`${subMutedTextColor} text-xl mt-1`}>R$</span>
                    {(state.vaultState?.currentValue || 0).toFixed(2)}
                  </h2>
                  <div className="flex gap-2">
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const val = parseFloat(quickVaultValue);
                        if (!isNaN(val) && val > 0) {
                          addToVault(val);
                          setQuickVaultValue('');
                        }
                      }}
                      className="flex gap-2"
                    >
                      <input 
                        type="number" 
                        inputMode="decimal"
                        placeholder="R$ para o cofre"
                        value={quickVaultValue}
                        onChange={(e) => setQuickVaultValue(e.target.value)}
                        className={`w-32 py-2 px-3 text-sm font-mono font-bold rounded-lg border ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-white/30' : 'bg-slate-100 border-slate-300 text-slate-900 focus:bg-white focus:border-slate-500'} focus:outline-none transition-colors`}
                      />
                      <button 
                        type="submit"
                        disabled={!quickVaultValue}
                        className={`px-4 rounded-lg font-bold uppercase tracking-widest transition-all active:scale-95 ${!quickVaultValue ? 'opacity-50 cursor-not-allowed' : ''} ${isDark ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                      >
                        Guardar
                      </button>
                    </form>
                  </div>
                </div>

                {/* Vault Animation Container */}
                <div className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 ${isDark ? 'bg-black/40 border-white/10' : 'bg-slate-200 border-slate-300'} shadow-inner flex-shrink-0`}>
                  
                  <AnimatePresence>
                    {showVaultFloatingValue && lastVaultAddedValue && (
                      <>
                        {vaultCoinPaths.map((path, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ 
                              left: path.x[0], 
                              top: path.y[0], 
                              opacity: 0, 
                              scale: path.scale[0],
                              rotate: 0 
                            }}
                            animate={{ 
                              left: path.x, 
                              top: path.y, 
                              opacity: [0, 1, 1, 0],
                              scale: path.scale,
                              rotate: path.rotate 
                            }}
                            transition={{ 
                              duration: path.duration, 
                              delay: path.delay,
                              ease: "easeInOut"
                            }}
                            className="absolute z-20 text-yellow-500 font-extrabold font-mono flex items-center justify-center bg-yellow-300 rounded-full w-8 h-8 border-2 border-yellow-600 shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                          >
                            $
                          </motion.div>
                        ))}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, y: 0 }}
                          animate={{ opacity: [0, 1, 1, 0], scale: [1, 1.3, 1], y: -45 }}
                          transition={{ duration: 1.2, delay: 0.6 }}
                          className="absolute top-[20%] right-[10%] font-bold text-xl sm:text-2xl text-green-400 pointer-events-none z-50 font-mono"
                          style={{ textShadow: '0 0 15px rgba(74, 222, 128, 0.6)' }}
                        >
                          +R$ {lastVaultAddedValue.toFixed(2)}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>

                  <div 
                    className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out bg-green-500"
                    style={{ 
                      height: `${vaultProgress}%`,
                      opacity: 0.85
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      {vaultMoney.map(money => (
                        <div
                          key={money.id}
                          className="absolute text-green-100 font-bold font-mono drop-shadow-md"
                          style={{
                            left: `${money.left}%`,
                            fontSize: `${money.size}px`,
                            animation: `float-bubble ${money.duration}s infinite linear, bubble-sway ${money.swayDuration}s infinite ease-in-out`,
                            animationDelay: `${money.delay}s`,
                          }}
                        >
                          $
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center mix-blend-overlay opacity-30">
                    <Vault size={60} />
                  </div>
                </div>
              </div>
            </div>

            {/* Shift Breakdown */}
            <div className="col-span-2 lg:col-span-2 grid grid-cols-3 gap-2 sm:gap-3">
              {(['manhã', 'tarde', 'noite'] as const).map((s) => (
                <div key={s} className={`${cardClass} p-3 sm:p-4 flex flex-col items-center justify-center text-center space-y-1`}>
                  <p className={`${subMutedTextColor} text-[8px] sm:text-[10px] uppercase font-mono tracking-tighter`}>{s}</p>
                  <p className="text-lg sm:text-xl font-bold font-mono">{todayStats.shifts[s].count}</p>
                  <p className={`${mutedTextColor} text-[8px] sm:text-[10px] font-mono`}>R$ {todayStats.shifts[s].value.toFixed(0)}</p>
                </div>
              ))}
            </div>

            {/* Recent Rides */}
            <div className="col-span-2 lg:col-span-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className={`text-sm font-bold uppercase tracking-widest ${mutedTextColor}`}>Corridas de Hoje</h3>
                {!state.finalizedDays?.includes(today) && (
                  <div className="flex items-center gap-2">
                    <form onSubmit={handleQuickValueSubmit} className="flex items-center gap-1">
                      <input 
                        type="number" 
                        inputMode="decimal"
                        placeholder="R$ Rápido"
                        value={quickValue}
                        onChange={(e) => setQuickValue(e.target.value)}
                        className={`w-24 h-8 px-2 text-xs font-mono font-bold rounded-lg border ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-white/30' : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-slate-500'} focus:outline-none transition-colors`}
                      />
                      <button 
                        type="submit"
                        className={`p-1.5 rounded-lg transition-colors border ${isDark ? 'bg-white/10 hover:bg-white/20 border-white/5' : 'bg-slate-100 hover:bg-slate-200 border-slate-300'}`}
                        title="Adicionar rápido"
                      >
                        <Plus size={16} />
                      </button>
                    </form>
                    <div className={`w-px h-4 mx-1 ${isDark ? 'bg-white/10' : 'bg-slate-350'}`} />
                    {state.history.length > 0 && (
                      <button 
                        onClick={undo}
                        className={`flex items-center gap-1 text-xs font-bold uppercase tracking-tighter ${subMutedTextColor} ${isDark ? 'hover:text-white' : 'hover:text-slate-900'} transition-colors`}
                        title="Desfazer última ação"
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setNewRideShift(registrationShift);
                        setIsAddingRide(true);
                      }}
                      className="p-1.5 rounded-lg transition-colors"
                      style={getStyle(state.settings.theme.headerColor)}
                      title="Adicionar detalhado"
                    >
                      <Plus size={16} className="text-white" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {todayRides.filter(r => !state.settings.enableShiftTracking || dashboardShift === 'dia' || r.shift === dashboardShift).length === 0 ? (
                  <div className={`${cardClass} p-8 text-center border-dashed border-2 ${isDark ? 'border-white/5' : 'border-slate-300'}`}>
                    <p className={`${subMutedTextColor} text-sm italic`}>Nenhuma corrida registrada {dashboardShift !== 'dia' ? `no turno ${dashboardShift}` : 'hoje'}.</p>
                  </div>
                ) : (
                  todayRides.filter(r => !state.settings.enableShiftTracking || dashboardShift === 'dia' || r.shift === dashboardShift).map(ride => (
                    <motion.div 
                      key={ride.id}
                      layout={state.settings.enableAnimation}
                      initial={state.settings.enableAnimation ? { opacity: 0, x: -20 } : false}
                      animate={state.settings.enableAnimation ? { opacity: 1, x: 0 } : false}
                      className={`${cardClass} p-4 flex justify-between items-center`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                          <Bike size={20} className={mutedTextColor} />
                        </div>
                        <div>
                          <p className="font-bold text-lg font-mono">R$ {ride.value.toFixed(2)}</p>
                          <div className="flex items-center gap-2">
                            <p className={`${subMutedTextColor} text-xs uppercase tracking-widest`}>
                              {new Date(ride.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {state.settings.enableShiftTracking && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-widest font-bold ${isDark ? 'bg-white/10 border-white/20 text-white/70' : 'bg-slate-200 border-slate-300 text-slate-700'}`}>
                                {ride.shift}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {ride.description && (
                          <span className={`text-[10px] px-2 py-1 rounded-full ${isDark ? 'bg-white/5' : 'bg-slate-100'} ${subMutedTextColor} uppercase tracking-tighter truncate max-w-[100px] sm:max-w-[150px]`}>
                            {ride.description}
                          </span>
                        )}
                        <button 
                          onClick={() => {
                            if (confirm('Excluir esta corrida?')) {
                              deleteRide(ride.id);
                            }
                          }}
                          className={`p-2 rounded-lg ${isDark ? 'hover:bg-red-500/20 text-red-500/50 hover:text-red-500' : 'hover:bg-red-50 text-red-400 hover:text-red-600'} transition-colors`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
            
            <div className="pb-10"></div>
          </motion.div>
        )}

        {activeTab !== 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-6 flex flex-col items-center justify-center space-y-4 mt-10"
          >
            <div className="p-4 rounded-full bg-white/5 border border-white/10 mb-4">
              <Bike className={mutedTextColor} size={48} />
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-widest text-center font-mono">
              Em Construção
            </h2>
            <p className="text-center opacity-70 text-sm max-w-xs">
              Esta aba está sendo reconstruída devido a uma atualização no sistema. Por favor, utilize o painel principal.
            </p>
          </motion.div>
        )}

        {/* Navigation Bar */}
        <div className={`fixed bottom-0 left-0 right-0 p-2 sm:p-4 z-40`}>
          <div className={`${isDark ? 'bg-black/80 border-white/10' : 'bg-white/80 border-slate-200'} backdrop-blur-xl border rounded-3xl flex justify-around items-center p-2 shadow-2xl`}>
            {[
              { id: 'dashboard', icon: Bike, label: 'Painel' },
              { id: 'history', icon: History, label: 'Histórico' },
              { id: 'finance', icon: Wallet, label: 'Finanças' },
              { id: 'productivity', icon: TrendingUp, label: 'Resumo' },
              { id: 'settings', icon: Settings, label: 'Config' }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all ${isActive ? (isDark ? 'bg-white/10' : 'bg-slate-100') : 'hover:bg-black/5'}`}
                  style={isActive ? getStyle(state.settings.theme.headerColor) : undefined}
                >
                  <tab.icon size={24} className={isActive ? 'text-white' : subMutedTextColor} />
                  <span className={`text-[9px] uppercase tracking-tighter mt-1 font-bold ${isActive ? 'text-white' : subMutedTextColor}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {isAddingRide && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            >
              <motion.div 
                initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                className={`w-full max-w-md ${cardClass} p-6 space-y-4 shadow-2xl`}
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold font-mono uppercase tracking-widest">Nova Corrida</h2>
                  <button onClick={() => setIsAddingRide(false)} className={`p-2 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
                    ✕
                  </button>
                </div>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const val = parseFloat(newRideValue.replace(',', '.'));
                  if (!isNaN(val) && val > 0) {
                    addRide();
                    setIsAddingRide(false);
                    setNewRideValue('');
                    setNewRideDesc('');
                  }
                }} className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest opacity-70 block mb-1">Valor (R$)</label>
                    <input 
                      type="number" step="0.01" required autoFocus
                      value={newRideValue} onChange={e => setNewRideValue(e.target.value)}
                      className={`w-full p-4 rounded-xl border font-mono text-2xl ${isDark ? 'bg-black/40 border-white/20 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-white/50`}
                      placeholder="0.00"
                    />
                  </div>
                  {state.settings.enableShiftTracking && (
                    <div>
                      <label className="text-xs uppercase tracking-widest opacity-70 block mb-1">Turno</label>
                      <div className="flex gap-2">
                        {(['manhã', 'tarde', 'noite'] as const).map(s => (
                          <button
                            key={s} type="button" onClick={() => setNewRideShift(s)}
                            className={`flex-1 py-3 text-xs uppercase tracking-widest rounded-xl border transition-all ${newRideShift === s ? 'border-transparent text-white' : isDark ? 'border-white/20 hover:bg-white/5' : 'border-slate-300 hover:bg-slate-50'}`}
                            style={newRideShift === s ? getStyle(state.settings.theme.headerColor, true) : undefined}
                          >{s}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-xs uppercase tracking-widest opacity-70 block mb-1">Nota (Opcional)</label>
                    <input 
                      type="text" 
                      value={newRideDesc} onChange={e => setNewRideDesc(e.target.value)}
                      className={`w-full p-4 rounded-xl border font-mono ${isDark ? 'bg-black/40 border-white/20 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none`}
                      placeholder="Ex: Uber, 99, Particular..."
                    />
                  </div>
                  <button type="submit" className="w-full p-4 rounded-xl font-bold uppercase tracking-widest text-white transition-all active:scale-95 text-lg" style={getStyle(state.settings.theme.headerColor, true)}>
                    Salvar
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}

          {isAddingActivity && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            >
              <motion.div 
                initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                className={`w-full max-w-md ${cardClass} p-6 space-y-4 shadow-2xl`}
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold font-mono uppercase tracking-widest text-red-500">Nova Despesa</h2>
                  <button onClick={() => setIsAddingActivity(false)} className={`p-2 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
                    ✕
                  </button>
                </div>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const val = parseFloat(newActivityValue.replace(',', '.'));
                  if (!isNaN(val) && val > 0) {
                    addActivity();
                    setIsAddingActivity(false);
                    setNewActivityValue('');
                    setNewActivityDesc('');
                  }
                }} className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest opacity-70 block mb-1">Valor (R$)</label>
                    <input 
                      type="number" step="0.01" required autoFocus
                      value={newActivityValue} onChange={e => setNewActivityValue(e.target.value)}
                      className={`w-full p-4 rounded-xl border font-mono text-2xl ${isDark ? 'bg-black/40 border-white/20 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-red-500/50`}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest opacity-70 block mb-1">Descrição</label>
                    <input 
                      type="text" required
                      value={newActivityDesc} onChange={e => setNewActivityDesc(e.target.value)}
                      className={`w-full p-4 rounded-xl border font-mono ${isDark ? 'bg-black/40 border-white/20 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-red-500/50`}
                      placeholder="Ex: Gasolina, Lanche, Manutenção..."
                    />
                  </div>
                  <button type="submit" className="w-full p-4 rounded-xl font-bold uppercase tracking-widest text-white transition-all active:scale-95 bg-red-600 hover:bg-red-500 text-lg shadow-lg shadow-red-500/20">
                    Registrar Despesa
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
