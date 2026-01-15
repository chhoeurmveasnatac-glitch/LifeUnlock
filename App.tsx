
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Bucket, 
  Transaction, 
  Goal, 
  Budget, 
  Rule, 
  TransactionType, 
  UserProfile,
  SubscriptionTier 
} from './types';
import { NAV_ITEMS } from './constants';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Buckets from './pages/Buckets';
import Transactions from './pages/Transactions';
import RulesAI from './pages/RulesAI';
import Pricing from './pages/Pricing';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import { User, Target, Languages, Sun, Moon } from 'lucide-react';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  // Navigation, Language & Theme State
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [lang, setLang] = useState<'EN' | 'KH'>('EN');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleLang = () => setLang(prev => prev === 'EN' ? 'KH' : 'EN');
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // User Profile
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Data States with initial mock data fallback
  const [buckets, setBuckets] = useState<Bucket[]>([
    { id: '1', name: 'Education', currentBalance: 5000, icon: 'education', targetPercentage: 10 },
    { id: '2', name: 'Emergency', currentBalance: 12000, icon: 'emergency', targetPercentage: 20 },
    { id: '3', name: 'Daily Expenses', currentBalance: 8500, icon: 'food', targetPercentage: 50 },
    { id: '4', name: 'Dream Car', currentBalance: 15000, icon: 'car', targetPercentage: 15 },
    { id: '5', name: 'New Home', currentBalance: 45000, icon: 'home', targetPercentage: 5 },
  ]);

  // Fetch Buckets from Supabase and Seed if empty
  useEffect(() => {
    const fetchBuckets = async () => {
      const { data, error } = await supabase.from('buckets').select('*');
      
      if (!error) {
        if (data && data.length > 0) {
          const mappedBuckets: Bucket[] = data.map((b: any) => ({
            id: b.id,
            name: b.name,
            targetPercentage: b.target_percentage,
            fixedAmount: b.fixed_amount,
            currentBalance: b.current_balance,
            icon: b.icon
          }));
          setBuckets(mappedBuckets);
        } else {
          // SEED DATA: If buckets table is empty, insert default buckets
          // This ensures that Goals have valid foreign keys to reference.
          const defaultBuckets = [
            { id: '1', name: 'Education', current_balance: 5000, icon: 'education', target_percentage: 10, fixed_amount: 0 },
            { id: '2', name: 'Emergency', current_balance: 12000, icon: 'emergency', target_percentage: 20, fixed_amount: 0 },
            { id: '3', name: 'Daily Expenses', current_balance: 8500, icon: 'food', target_percentage: 50, fixed_amount: 0 },
            { id: '4', name: 'Dream Car', current_balance: 15000, icon: 'car', target_percentage: 15, fixed_amount: 0 },
            { id: '5', name: 'New Home', current_balance: 45000, icon: 'home', target_percentage: 5, fixed_amount: 0 },
          ];
          
          const { error: insertError } = await supabase.from('buckets').insert(defaultBuckets);
          if (insertError) {
            console.error('Failed to seed buckets:', insertError);
          } else {
            console.log('Seeded default buckets to Supabase');
            // We keep the initial state as it matches the seed data
          }
        }
      }
    };
    fetchBuckets();
  }, []);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 't1', amount: 45000, type: TransactionType.INCOME, category: 'Salary', bucketId: '3', date: '2023-10-01', note: 'Monthly Salary' },
    { id: 't2', amount: 120, type: TransactionType.EXPENSE, category: 'Food & Dining', bucketId: '3', date: '2023-10-02', note: 'Lunch' },
    { id: 't3', amount: 500, type: TransactionType.EXPENSE, category: 'Transport', bucketId: '3', date: '2023-10-03', note: 'Fuel' },
    { id: 't4', amount: 5000, type: TransactionType.EXPENSE, category: 'Education', bucketId: '1', date: '2023-10-05', note: 'Online Course' },
  ]);

  // Fetch Transactions from Supabase
  useEffect(() => {
    const fetchTransactions = async () => {
      const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
      if (!error && data && data.length > 0) {
        const mappedTransactions: Transaction[] = data.map((t: any) => ({
          id: t.id,
          amount: t.amount,
          type: t.type,
          category: t.category,
          bucketId: t.bucket_id,
          date: t.date,
          note: t.note
        }));
        setTransactions(mappedTransactions);
      }
    };
    fetchTransactions();
  }, []);

  const [goals, setGoals] = useState<Goal[]>([
    { id: 'g1', name: 'New Car', targetAmount: 800000, currentAmount: 15000, deadline: '2025-12-31', icon: 'car', bucketId: '4' },
    { id: 'g2', name: 'House Downpayment', targetAmount: 2000000, currentAmount: 45000, deadline: '2028-06-30', icon: 'home', bucketId: '5' },
    { id: 'g3', name: 'Japan Trip', targetAmount: 100000, currentAmount: 2000, deadline: '2024-04-15', icon: 'travel', bucketId: '1' },
  ]);

  // Fetch Goals from Supabase
  useEffect(() => {
    const fetchGoals = async () => {
      const { data, error } = await supabase.from('goals').select('*');
      if (!error && data && data.length > 0) {
        const mappedGoals: Goal[] = data.map((g: any) => ({
          id: g.id,
          name: g.name,
          targetAmount: g.target_amount,
          currentAmount: g.current_amount,
          deadline: g.deadline,
          icon: g.icon,
          bucketId: g.bucket_id
        }));
        setGoals(mappedGoals);
      }
    };
    fetchGoals();
  }, []);

  const [rules, setRules] = useState<Rule[]>([
    { id: 'r1', name: 'Emergency Auto-Save', type: 'PERCENTAGE', value: 20, targetBucketId: '2' },
    { id: 'r2', name: 'Fixed Education Fund', type: 'FIXED', value: 3000, targetBucketId: '1' },
  ]);

  const [budgets, setBudgets] = useState<Budget[]>([
    { id: 'b1', category: 'Food & Dining', monthlyLimit: 8000, currentSpending: 4500 },
    { id: 'b2', category: 'Transport', monthlyLimit: 3000, currentSpending: 1200 },
  ]);

  const handleAddTransaction = (t: Transaction) => {
    setTransactions([t, ...transactions]);
    setBuckets(prevBuckets => prevBuckets.map(bucket => {
      if (bucket.id === t.bucketId) {
        const adjustment = t.type === TransactionType.INCOME ? t.amount : -t.amount;
        return { ...bucket, currentBalance: bucket.currentBalance + adjustment };
      }
      return bucket;
    }));
  };

  const totalBalance = useMemo(() => buckets.reduce((acc, b) => acc + b.currentBalance, 0), [buckets]);

  const handleFinishOnboarding = (data: any) => {
    setProfile({
      name: data.name || 'User',
      monthlyIncome: data.income,
      subscription: 'STARTER',
      payday: data.payday
    });
    setCurrentPage('dashboard');
  };

  const renderPage = () => {
    if (currentPage === 'landing') return <Landing onGetStarted={() => setCurrentPage('onboarding')} lang={lang} toggleLang={toggleLang} theme={theme} toggleTheme={toggleTheme} />;
    if (currentPage === 'onboarding') return <Onboarding onComplete={handleFinishOnboarding} lang={lang} />;

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard 
                  buckets={buckets} 
                  transactions={transactions} 
                  goals={goals} 
                  totalBalance={totalBalance}
                  profile={profile}
                  onAddTransaction={handleAddTransaction}
                  onNavigate={(page) => setCurrentPage(page)}
                  theme={theme}
                  lang={lang}
                />;
      case 'goals':
        return <Goals 
                  goals={goals} 
                  buckets={buckets} 
                  onUpdateGoals={setGoals} 
                  lang={lang} 
                />;
      case 'buckets':
        return <Buckets buckets={buckets} onUpdateBuckets={setBuckets} lang={lang} />;
      case 'transactions':
        return <Transactions 
                  transactions={transactions} 
                  buckets={buckets}
                  onAddTransaction={handleAddTransaction}
                  onUpdateBuckets={setBuckets}
                  onUpdateTransactions={setTransactions} 
                  lang={lang}
                />;
      case 'rules':
        return <RulesAI 
                  rules={rules} 
                  buckets={buckets} 
                  income={profile?.monthlyIncome || 0} 
                  goals={goals} 
                  onAddRule={(r) => setRules([...rules, r])} 
                  onUpdateBuckets={setBuckets}
                  lang={lang}
                />;
      case 'pricing':
        return <Pricing 
          currentTier={profile?.subscription || 'STARTER'} 
          profile={profile}
          onUpgrade={(tier) => {
            if (profile) setProfile({ ...profile, subscription: tier });
          }} 
          lang={lang} 
        />;
      default:
        return <Dashboard 
                  buckets={buckets} 
                  transactions={transactions} 
                  goals={goals} 
                  totalBalance={totalBalance}
                  profile={profile}
                  onAddTransaction={handleAddTransaction}
                  onNavigate={(page) => setCurrentPage(page)}
                  theme={theme}
                  lang={lang}
                />;
    }
  };

  const isAuthPage = currentPage === 'landing' || currentPage === 'onboarding';

  return (
    <div className={`min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-300 ${!isAuthPage ? 'pb-20 md:pb-0' : ''}`}>
      {!isAuthPage && (
        <>
          {/* Mobile Top Header */}
          <div className="md:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Target size={18} />
              </div>
              <span className="font-bold text-lg tracking-tight dark:text-white">LifeUnlock</span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleTheme}
                className="w-8 h-8 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg flex items-center justify-center"
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
              <button 
                onClick={toggleLang}
                className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center font-bold text-[10px]"
              >
                {lang}
              </button>
              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500">
                 <User size={16} />
              </div>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden md:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col p-6 h-screen sticky top-0 transition-colors duration-300">
            <div className="flex items-center space-x-3 mb-10">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                <Target size={24} />
              </div>
              <span className="font-bold text-xl tracking-tight text-indigo-900 dark:text-white">LifeUnlock</span>
            </div>

            <nav className="flex-1 space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.path}
                  onClick={() => setCurrentPage(item.path)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${currentPage === item.path 
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}
                  `}
                >
                  {item.icon}
                  <span>{lang === 'EN' ? item.label : (item.label === 'Dashboard' ? 'ផ្ទាំងគ្រប់គ្រង' : item.label === 'Goals' ? 'គោលដៅ' : item.label === 'Buckets' ? 'កញ្ចប់ថវិកា' : item.label === 'Transactions' ? 'ប្រតិបត្តិការ' : item.label === 'Rules & AI' ? 'ច្បាប់ និង AI' : 'តម្លៃ')}</span>
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <button 
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-600 dark:text-slate-300 text-sm font-bold"
              >
                <div className="flex items-center space-x-2">
                  {theme === 'light' ? <Moon size={18} className="text-indigo-500" /> : <Sun size={18} className="text-amber-400" />}
                  <span>{lang === 'EN' ? (theme === 'light' ? 'Dark Mode' : 'Light Mode') : (theme === 'light' ? 'របៀបងងឹត' : 'របៀបពន្លឺ')}</span>
                </div>
              </button>

              <button 
                onClick={toggleLang}
                className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-600 dark:text-slate-300 text-sm font-bold"
              >
                <div className="flex items-center space-x-2">
                  <Languages size={18} className="text-indigo-500" />
                  <span>{lang === 'EN' ? 'Language' : 'ភាសា'}</span>
                </div>
                <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-lg text-[10px]">
                  {lang === 'EN' ? 'ENGLISH' : 'ខ្មែរ'}
                </span>
              </button>

              <div className="flex items-center space-x-3 p-2 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600">
                  <User size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">{profile?.name || 'Guest User'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{profile?.subscription || 'FREE'}</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Bottom Navigation */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 flex items-center justify-around px-2 py-3 safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.path}
                onClick={() => setCurrentPage(item.path)}
                className={`
                  flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all
                  ${currentPage === item.path ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}
                `}
              >
                <div className={`${currentPage === item.path ? 'bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-xl mb-1' : 'p-2'}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {lang === 'EN' ? item.label.slice(0, 3) : item.label === 'Dashboard' ? 'មេ' : item.label === 'Goals' ? 'ដៅ' : 'ថវិ'}
                </span>
              </button>
            ))}
          </nav>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
