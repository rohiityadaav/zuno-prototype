import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  TrendingUp, 
  History, 
  Package, 
  AlertCircle, 
  ChevronRight, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  User,
  ShieldCheck,
  Wallet,
  ScanFace,
  Fingerprint,
  Cpu,
  Network,
  CreditCard,
  ArrowRightLeft,
  Banknote
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSpring, animated, config } from '@react-spring/web';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Moon, Sun, Battery, Zap } from 'lucide-react';
import { parseHinglishIntent } from './services/geminiService';
import { theme as themeTokens } from './theme';

// --- Types ---
interface Transaction {
  id: number;
  item: string;
  qty: number;
  price: number;
  type: 'Sale' | 'Purchase' | 'Credit';
  category: 'Inventory' | 'Udhaar';
  status: 'Paid' | 'Pending';
  customer: string;
  timestamp: string;
  rawAudioRef?: string;
  intentProof?: string;
}

interface InventoryItem {
  id: number;
  item: string;
  stock: number;
  min_stock: number;
}

interface Financials {
  score: number;
  totalRevenue: number;
  cogs: number;
  netProfit: number;
  trappedCapital: number;
  inventoryValue: number;
  disposableIncome: number;
  growth: number;
}

// --- Components ---

const ZunoLogo = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) => {
  const sizes = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-24 h-24 text-2xl'
  };
  
  return (
    <div className={`${sizes[size]} bg-black rounded-2xl flex items-center justify-center text-white font-medium tracking-tight leading-none ${className}`}>
      zuno
    </div>
  );
};

const ScoreGauge = ({ score, theme }: { score: number, theme: string }) => {
  // Combined spring for number, wiggle and scale
  const [props, api] = useSpring(() => ({
    number: 300,
    x: 0,
    scale: 1,
    config: config.molasses,
  }));

  useEffect(() => {
    // Animate number smoothly
    api.start({
      number: score,
      config: config.molasses,
    });

    // Trigger a tactile wiggle and scale "pop" when score changes
    api.start({
      from: { x: -6, scale: 0.95 },
      to: [
        { x: 6, scale: 1.05 },
        { x: -3, scale: 0.98 },
        { x: 3, scale: 1.02 },
        { x: 0, scale: 1 },
      ],
      config: { mass: 1, tension: 600, friction: 12 },
    });
  }, [score, api]);

  const data = [
    { value: score },
    { value: 900 - score },
  ];
  const COLORS = theme === 'light' ? ['#10b981', '#e5e7eb'] : ['#10b981', '#334155'];

  return (
    <animated.div 
      style={{
        transform: props.x.to(x => `translateX(${x}px) scale(${props.scale.get()})`),
      }}
      className="relative w-full h-48 flex flex-col items-center justify-center origin-bottom"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
            isAnimationActive={false} // Disable Recharts animation to favor react-spring feel
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-4 flex flex-col items-center">
        <animated.span className="text-4xl font-bold text-slate-900 dark:text-white">
          {props.number.to(n => n.toFixed(0))}
        </animated.span>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Zuno Score</span>
      </div>
    </animated.div>
  );
};

const FaceLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      onLogin();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-emerald-600 flex flex-col items-center justify-center p-8 text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8 max-w-xs"
      >
        <div className="w-24 h-24 bg-white rounded-[2rem] mx-auto flex items-center justify-center text-emerald-600 font-black text-5xl shadow-2xl">Z</div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter">Zuno</h1>
          <p className="text-emerald-100 text-sm font-medium">Zero-Touch Financial Identity for Bharat</p>
        </div>

        <div className="relative w-48 h-48 mx-auto">
          <div className="absolute inset-0 border-4 border-emerald-400/30 rounded-full animate-pulse" />
          <button 
            onClick={handleScan}
            disabled={scanning}
            className="absolute inset-4 bg-white/10 backdrop-blur-md rounded-full flex flex-col items-center justify-center space-y-2 border border-white/20 hover:bg-white/20 transition-all active:scale-95 overflow-hidden"
          >
            {scanning ? (
              <motion.div 
                animate={{ y: [-40, 40, -40] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 bg-emerald-400/20 w-full h-1"
              />
            ) : null}
            <ScanFace size={48} className={scanning ? 'text-emerald-300' : 'text-white'} />
            <span className="text-xs font-bold uppercase tracking-widest">{scanning ? 'Scanning...' : 'Face ID Login'}</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 pt-8">
          <div className="flex flex-col items-center gap-1 opacity-60">
            <Fingerprint size={20} />
            <span className="text-[10px] font-bold uppercase">Touch</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex flex-col items-center gap-1 opacity-60">
            <Mic size={20} />
            <span className="text-[10px] font-bold uppercase">Voice</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'ledger' | 'stock' | 'profile' | 'architecture'>('home');
  const [theme, setTheme] = useState<'light' | 'dark' | 'ultra'>('light');
  const [showThemeSuggestion, setShowThemeSuggestion] = useState(false);
  const [inputMode, setInputMode] = useState<'ambient' | 'manual'>('ambient');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [financials, setFinancials] = useState<Financials>({
    score: 300,
    totalRevenue: 0,
    cogs: 0,
    netProfit: 0,
    trappedCapital: 0,
    inventoryValue: 0,
    disposableIncome: 0,
    growth: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Sale' | 'Purchase' | 'Credit'>('All');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
      setupSpeechRecognition();
      
      // System Theme Sync
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.matches) setTheme('dark');
      
      // Late-Night Suggestion (After 7 PM)
      const hour = new Date().getHours();
      if (hour >= 19 || hour < 6) {
        setShowThemeSuggestion(true);
      }
    }
  }, [isLoggedIn]);

  const fetchData = async () => {
    try {
      const [txRes, invRes, finRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/inventory'),
        fetch('/api/financials')
      ]);
      setTransactions(await txRes.json());
      setInventory(await invRes.json());
      setFinancials(await finRes.json());
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  const setupSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'hi-IN';

      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        handleVoiceInput(text);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const downloadCSV = () => {
    if (transactions.length === 0) return;
    
    const headers = ['ID', 'Item', 'Qty', 'Price', 'Total', 'Type', 'Category', 'Status', 'Customer', 'Timestamp', 'Intent Proof'];
    const rows = transactions.map(tx => [
      tx.id,
      tx.item,
      tx.qty,
      tx.price,
      tx.qty * tx.price,
      tx.type,
      tx.category,
      tx.status,
      tx.customer,
      new Date(tx.timestamp || Date.now()).toLocaleString(),
      tx.intentProof || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `zuno_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVoiceInput = async (text: string) => {
    setIsProcessing(true);
    const result = await parseHinglishIntent(text);
    if (result) {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      });
      fetchData();
    }
    setIsProcessing(false);
  };

  if (!isLoggedIn) {
    return <FaceLogin onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' || theme === 'ultra' ? 'dark' : ''} ${
      theme === 'ultra' ? 'bg-black text-white' : 'bg-[#F8F9FA] dark:bg-[#121212] text-slate-900 dark:text-slate-100'
    } font-sans pb-24`}>
      {/* Theme Suggestion Toast */}
      <AnimatePresence>
        {showThemeSuggestion && theme === 'light' && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-20 left-6 right-6 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10"
          >
            <div className="flex items-center gap-3">
              <Moon size={20} className="text-emerald-400" />
              <p className="text-xs font-bold">Late night? Switch to Dark Mode for eye comfort.</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => { setTheme('dark'); setShowThemeSuggestion(false); }}
                className="bg-emerald-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase"
              >
                Switch
              </button>
              <button 
                onClick={() => setShowThemeSuggestion(false)}
                className="text-slate-400 p-1"
              >
                <Plus className="rotate-45" size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white dark:bg-[#1E1E1E] border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30 transition-colors">
        <div className="flex items-center gap-3">
          <ZunoLogo size="md" />
          <div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
              <Cpu size={10} />
              <span>Agentic AI Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold border uppercase tracking-wider transition-colors ${
              activeTab === 'architecture' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <Network size={14} />
            <span>System Arch</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
            <User size={20} className="text-slate-500" />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8 space-y-8">
        {activeTab === 'architecture' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Cpu size={24} className="text-slate-400" />
                Agentic Architecture
              </h2>
            </div>
            <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Data Flow (Mermaid)</p>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl font-mono text-[10px] text-slate-600 dark:text-slate-400 overflow-x-auto">
                  <pre>
{`graph TD
  A[Ambient Audio] -->|Amazon Transcribe| B(Hi-En Stream)
  B -->|Bedrock Agent| C{Intent Extraction}
  C -->|Casual Gossip| D[Discard Log]
  C -->|Transaction| E[DynamoDB Ledger]
  E -->|Reporting Engine| J[Bank-Ready Reports]
  J -->|Audit Trail| K[Bank System]
  E -->|Zuno Score Engine| F[Credit Identity]
  F -->|OCEN 4.0| G[Sachet Loan]
  E -->|SageMaker| H[Stock Prediction]
  H -->|ONDC| I[Supplier Bidding]
  K -->|Loan Approval| G`}
                  </pre>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Core Agents</h3>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { name: 'Voice-to-Ledger', desc: 'Bedrock-powered semantic extraction' },
                    { name: 'Udhaar Recovery', desc: 'SNS-based automated WhatsApp reminders' },
                    { name: 'Stock Negotiator', desc: 'ONDC-integrated price bidding' },
                    { name: 'Credit Certifier', desc: 'Bank-ready proxy for ITR/Income' }
                  ].map((agent, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center shrink-0">
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{agent.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{agent.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
        {activeTab === 'home' && (
          <>
            {/* Input Mode Toggle */}
            <div className="flex justify-center mb-4">
              <div className="bg-white dark:bg-[#1E1E1E] p-1 rounded-2xl border border-slate-200 dark:border-slate-800 flex gap-1 shadow-sm transition-colors">
                <button 
                  onClick={() => setInputMode('ambient')}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    inputMode === 'ambient' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  Ambient
                </button>
                <button 
                  onClick={() => setInputMode('manual')}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    inputMode === 'manual' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  Manual
                </button>
              </div>
            </div>

            {/* Ambient Command Center */}
            <section className="flex flex-col items-center justify-center space-y-6 min-h-[240px]">
              {inputMode === 'ambient' ? (
                <div className="relative">
                  <AnimatePresence>
                    {inputMode === 'ambient' && (
                      <>
                        {/* Base Pulse (Subtle when idle, prominent when listening) */}
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ 
                            scale: isListening ? [1, 2.2, 1] : [1, 1.3, 1], 
                            opacity: isListening ? [0.1, 0.3, 0.1] : [0.05, 0.1, 0.05] 
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: isListening ? 1.2 : 3,
                            ease: "easeInOut"
                          }}
                          className="absolute inset-0 bg-emerald-500 rounded-full"
                        />
                        
                        {/* Secondary Rapid Pulse (Only when actively listening) */}
                        {isListening && (
                          <motion.div
                            initial={{ scale: 1, opacity: 0 }}
                            animate={{ 
                              scale: [1, 1.8, 1], 
                              opacity: [0, 0.4, 0] 
                            }}
                            transition={{ 
                              repeat: Infinity, 
                              duration: 0.8,
                              ease: "easeOut"
                            }}
                            className="absolute inset-0 bg-red-500 rounded-full"
                          />
                        )}

                        {/* Outer Glow (Only when actively listening) */}
                        {isListening && (
                          <motion.div
                            animate={{ 
                              boxShadow: [
                                "0 0 0px 0px rgba(239, 68, 68, 0)",
                                "0 0 40px 20px rgba(239, 68, 68, 0.2)",
                                "0 0 0px 0px rgba(239, 68, 68, 0)"
                              ]
                            }}
                            transition={{ 
                              repeat: Infinity, 
                              duration: 1.5
                            }}
                            className="absolute inset-0 rounded-full"
                          />
                        )}
                      </>
                    )}
                  </AnimatePresence>
                  <button
                    onClick={toggleListening}
                    className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95 ${
                      isListening ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {isListening ? <MicOff size={40} /> : <Mic size={40} />}
                  </button>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full space-y-4"
                >
                  <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                    <div className="flex items-center gap-3 mb-4 text-emerald-600 dark:text-emerald-400">
                      <Plus size={20} />
                      <span className="text-xs font-black uppercase tracking-widest">Manual Entry</span>
                    </div>
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Type Hinglish (e.g. 2 kilo chini bechi)"
                      className="w-full bg-transparent text-lg font-medium text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value;
                          setTranscript(val);
                          handleVoiceInput(val);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                  </div>
                </motion.div>
              )}

              <div className="text-center w-full">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                  {inputMode === 'ambient' 
                    ? (isListening ? 'Listening to shop floor...' : 'Tap to record transaction')
                    : 'Type transaction details'}
                </p>
                {inputMode === 'ambient' && !(window as any).SpeechRecognition && !(window as any).webkitSpeechRecognition && (
                  <p className="text-[10px] text-red-500 font-bold mt-1">
                    Voice not supported. Switch to Manual mode.
                  </p>
                )}
                
                {transcript && (
                  <p className="mt-3 text-xs italic text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 py-2 px-4 rounded-full inline-block">
                    "{transcript}"
                  </p>
                )}
                {isProcessing && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest animate-pulse">
                    <Network size={14} className="animate-spin" />
                    <span>Agentic Intent Extraction...</span>
                  </div>
                )}
              </div>
            </section>

            {/* Growth Dashboard Section */}
            <section className="bg-white dark:bg-[#1E1E1E] rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6 transition-colors">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Growth Analytics</h2>
                <div className={`flex items-center gap-1 text-[10px] font-bold uppercase ${financials.growth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {financials.growth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  <span>{Math.abs(financials.growth)}% MoM Growth</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Total Revenue</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">₹{(financials.totalRevenue ?? 0).toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Net Profit</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{(financials.netProfit ?? 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Jan', sales: 4000, expenses: 2400 },
                    { name: 'Feb', sales: financials.totalRevenue, expenses: financials.cogs },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'light' ? '#f1f5f9' : '#334155'} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: theme === 'light' ? '#94a3b8' : '#64748b' }} />
                    <YAxis hide />
                    <Tooltip cursor={{ fill: theme === 'light' ? '#f8fafc' : '#1e293b' }} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: theme === 'light' ? '#fff' : '#1e1e1e', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} name="Sales" />
                    <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase">Burn Rate</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Optimized (Low)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">COGS</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">₹{(financials.cogs ?? 0).toLocaleString()}</p>
                </div>
              </div>
            </section>

            {/* Smart Wallet Section */}
            <section className="bg-slate-900 dark:bg-[#000000] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet size={20} className="text-emerald-400" />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Smart Wallet</h2>
                  </div>
                  <div className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">OCEN 4.0 Ready</div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-slate-400 font-medium">Disposable Income</p>
                  <p className="text-4xl font-bold">₹{(financials.disposableIncome ?? 0).toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Trapped Capital</p>
                    <p className="text-lg font-bold text-orange-400">₹{(financials.trappedCapital ?? 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Inventory Value</p>
                    <p className="text-lg font-bold text-emerald-400">₹{(financials.inventoryValue ?? 0).toLocaleString()}</p>
                  </div>
                </div>

                <button className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20">
                  <Banknote size={18} />
                  Instant Sachet Loan (OCEN)
                </button>
              </div>
            </section>

            {/* Bank-Ready Speedometer */}
            <section className="bg-white dark:bg-[#1E1E1E] rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Bank-Ready Identity</h2>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase">
                  <ShieldCheck size={14} />
                  <span>AA Integrated</span>
                </div>
              </div>
              <ScoreGauge score={financials.score} theme={theme} />
              <div className="mt-6 flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Consistency</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">98%</p>
                </div>
                <div className="h-8 w-px bg-slate-100 dark:bg-slate-800" />
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Repayment</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">High</p>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'ledger' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <History size={24} className="text-slate-400" />
                Digital Ledger
              </h2>
              <button 
                onClick={downloadCSV}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-colors"
              >
                <Banknote size={16} />
                Download CSV
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {['All', 'Sale', 'Purchase', 'Credit'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type as any)}
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      filterType === type ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-white dark:bg-[#1E1E1E] text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search transactions (e.g. 'milk')"
                  className="w-full bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              {transactions
                .filter(tx => filterType === 'All' || tx.type === filterType)
                .filter(tx => tx.item.toLowerCase().includes(searchQuery.toLowerCase()) || tx.customer.toLowerCase().includes(searchQuery.toLowerCase()))
                .length === 0 ? (
                <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 transition-colors">
                  <History size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                  <p className="text-sm text-slate-400 dark:text-slate-600 font-medium">No matching transactions.</p>
                </div>
              ) : (
                transactions
                  .filter(tx => filterType === 'All' || tx.type === filterType)
                  .filter(tx => tx.item.toLowerCase().includes(searchQuery.toLowerCase()) || tx.customer.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((tx) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={tx.id}
                    className="bg-white dark:bg-[#1E1E1E] p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 group hover:border-emerald-200 dark:hover:border-emerald-900 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                          tx.type === 'Sale' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : (tx.type === 'Purchase' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400')
                        }`}>
                          {tx.type === 'Sale' ? <ArrowUpRight size={28} /> : (tx.type === 'Purchase' ? <ArrowDownRight size={28} /> : <ArrowRightLeft size={28} />)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-lg">{tx.item}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{tx.qty} units</span>
                            <span className="w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                            <span className={`text-[10px] font-black uppercase tracking-wider ${tx.type === 'Sale' ? 'text-emerald-600 dark:text-emerald-400' : (tx.type === 'Purchase' ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400')}`}>{tx.type}</span>
                            {tx.customer && (
                              <>
                                <span className="w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{tx.customer}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-black ${tx.type === 'Sale' ? 'text-emerald-600 dark:text-emerald-400' : (tx.type === 'Purchase' ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400')}`}>
                          ₹{tx.price * tx.qty}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-widest mt-1">
                          {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    
                    {/* Audit Trail Section */}
                    <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                          <Mic size={12} />
                        </div>
                        <p className="text-[10px] italic text-slate-400 dark:text-slate-500">"{tx.intentProof || 'Ambient extraction'}"</p>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                        <ShieldCheck size={12} />
                        <span>Verified</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === 'stock' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Package size={24} className="text-slate-400 dark:text-slate-500" />
                Inventory Negotiator
              </h2>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-[10px] font-bold border border-emerald-100 dark:border-emerald-900/30 uppercase tracking-wider">
                ONDC Integrated
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {inventory.map(item => (
                <div key={item.id} className={`p-6 rounded-[2rem] border flex items-center justify-between transition-all relative overflow-hidden ${
                  item.stock <= item.min_stock 
                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 shadow-lg shadow-red-900/5 ring-1 ring-red-500/20' 
                    : 'bg-white dark:bg-[#1E1E1E] border-slate-100 dark:border-slate-800'
                }`}>
                  {item.stock <= item.min_stock && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                  )}
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      item.stock <= item.min_stock ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {item.stock <= item.min_stock ? <AlertCircle size={28} /> : <Package size={28} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 dark:text-white text-lg">{item.item}</p>
                        {item.stock <= item.min_stock && (
                          <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Low</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${item.stock <= item.min_stock ? 'text-red-700 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                          Stock: {item.stock}
                        </p>
                        <span className="w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Min: {item.min_stock}</p>
                      </div>
                    </div>
                  </div>
                  {item.stock <= item.min_stock ? (
                    <button className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black rounded-2xl uppercase tracking-widest shadow-lg shadow-red-900/20 active:scale-95 transition-all flex items-center gap-2">
                      <TrendingUp size={14} />
                      ONDC Bidding
                    </button>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck size={18} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'profile' && (
          <section className="space-y-8">
            <div className="bg-white dark:bg-[#1E1E1E] rounded-[3rem] p-10 text-center border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors">
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600" />
              <div className="w-32 h-32 rounded-[2.5rem] bg-slate-200 dark:bg-slate-800 mx-auto mb-6 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-900 shadow-xl">
                <User size={64} className="text-slate-500 dark:text-slate-400" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Kirana Store Owner</h2>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest mt-1">DPI Identity Verified</p>
              
              <div className="mt-10 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Member Since</p>
                  <p className="font-bold text-slate-900 dark:text-white">Feb 2024</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Location</p>
                  <p className="font-bold text-slate-900 dark:text-white">Indore, MP</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Visual Appearance</h3>
              <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500">
                      {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Display Theme</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Sync with environment</p>
                    </div>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1">
                    {(['light', 'dark', 'ultra'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                          theme === t ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'
                        }`}
                      >
                        {t === 'ultra' ? <Battery size={14} /> : t}
                      </button>
                    ))}
                  </div>
                </div>
                
                {theme === 'ultra' && (
                  <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <Zap size={18} className="text-emerald-400" />
                    <p className="text-[10px] text-emerald-400 font-bold uppercase leading-tight">
                      Ultra Dark Mode Active: OLED pixels turned off for maximum battery life.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Bank-Ready Certification</h3>
              <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Zuno Credit Certificate</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Valid for 6 Months • OCEN 4.0</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  This certificate acts as a verified proxy for Income Tax Returns (ITR), aggregating your ambient voice ledger into a bank-ready audit trail.
                </p>
                <button className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-white transition-colors">
                  <Banknote size={18} />
                  Download Certified PDF
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">DPI Integrations</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { icon: <Network size={20} />, label: 'Account Aggregator', status: 'Active' },
                  { icon: <CreditCard size={20} />, label: 'OCEN 4.0 Protocol', status: 'Active' },
                  { icon: <ArrowRightLeft size={20} />, label: 'ONDC Network', status: 'Active' },
                ].map((item, idx) => (
                  <button key={idx} className="w-full bg-white dark:bg-[#1E1E1E] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm hover:border-emerald-200 dark:hover:border-emerald-900 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-emerald-600">
                        {item.icon}
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full uppercase tracking-widest">{item.status}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className={`fixed bottom-6 left-6 right-6 backdrop-blur-xl border px-6 py-3 flex justify-between items-center z-40 rounded-[2.5rem] shadow-2xl transition-all duration-300 ${
        theme === 'ultra' 
          ? 'bg-black/90 border-slate-800 shadow-emerald-900/10' 
          : 'bg-white/90 dark:bg-[#1E1E1E]/90 border-slate-200 dark:border-slate-800 shadow-slate-300/50 dark:shadow-black/50'
      }`}>
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <TrendingUp size={22} />
          <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('ledger')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'ledger' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <History size={22} />
          <span className="text-[9px] font-black uppercase tracking-widest">Ledger</span>
        </button>
        
        {/* Central Record Button */}
        <div className="relative -top-6">
          <button 
            onClick={() => {
              setActiveTab('home');
              setTimeout(toggleListening, 100);
            }}
            className="w-14 h-14 bg-emerald-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-900/40 border-4 border-white dark:border-slate-900 active:scale-90 transition-all hover:bg-emerald-500"
          >
            <Mic size={28} />
          </button>
        </div>

        <button 
          onClick={() => setActiveTab('stock')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'stock' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <Package size={22} />
          <span className="text-[9px] font-black uppercase tracking-widest">Stock</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <User size={22} />
          <span className="text-[9px] font-black uppercase tracking-widest">Profile</span>
        </button>
      </nav>
    </div>
  );
}
