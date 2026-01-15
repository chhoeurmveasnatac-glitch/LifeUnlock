
import React, { useState } from 'react';
import { 
  Bucket, 
  Transaction, 
  Goal, 
  UserProfile, 
  TransactionType,
  Category
} from '../types';
import { ICON_MAP } from '../constants';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  ChevronRight,
  Plus,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';
import { supabase } from '../services/supabaseClient';

interface Props {
  buckets: Bucket[];
  transactions: Transaction[];
  goals: Goal[];
  categories: Category[];
  totalBalance: number;
  profile: UserProfile | null;
  onAddTransaction: (t: Transaction) => void;
  onNavigate: (page: string) => void;
  theme: 'light' | 'dark';
  lang: 'EN' | 'KH';
}

const Dashboard: React.FC<Props> = ({ buckets, transactions, goals, categories, totalBalance, profile, onAddTransaction, onNavigate, theme, lang }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTx, setNewTx] = useState({
    amount: '',
    type: TransactionType.EXPENSE,
    category: '', // Will be set when opening modal or changing type
    bucketId: buckets[0]?.id || '',
    note: '',
    date: new Date().toISOString().split('T')[0]
  });

  const t = {
    EN: {
      hello: "Hello",
      overview: `Here's your financial overview for`,
      addTx: "Transaction",
      netWorth: "Total Net Worth",
      income: "Income",
      expenses: "Expenses",
      bucketBreakdown: "Bucket Breakdown",
      viewAll: "View All",
      goals: "Life Goals",
      target: "Target",
      recentTx: "Recent Transactions",
      modalTitle: "Add New Transaction",
      expense: "Expense",
      category: "Category",
      bucket: "Bucket",
      note: "Note",
      notePlaceholder: "What was this for?",
      date: "Date",
      save: "Save Transaction",
      selectBucket: "Select Bucket",
      amount: "Amount ($)",
      selectCategory: "Select Category"
    },
    KH: {
      hello: "សួស្តី",
      overview: "នេះគឺជាទិដ្ឋភាពហិរញ្ញវត្ថុរបស់អ្នកសម្រាប់",
      addTx: "ប្រតិបត្តិការ",
      netWorth: "ទ្រព្យសម្បត្តិសរុប",
      income: "ចំណូល",
      expenses: "ចំណាយ",
      bucketBreakdown: "ការវិភាគកញ្ចប់ថវិកា",
      viewAll: "មើលទាំងអស់",
      goals: "គោលដៅជីវិត",
      target: "គោលដៅ",
      recentTx: "ប្រតិបត្តិការថ្មីៗ",
      modalTitle: "បន្ថែមប្រតិបត្តិការថ្មី",
      expense: "ចំណាយ",
      category: "ប្រភេទ",
      bucket: "កញ្ចប់",
      note: "ចំណាំ",
      notePlaceholder: "តើចំណាយនេះសម្រាប់អ្វី?",
      date: "កាលបរិច្ឆេទ",
      save: "រក្សាទុកប្រតិបត្តិការ",
      selectBucket: "ជ្រើសរើសកញ្ចប់",
      amount: "ចំនួនប្រាក់ ($)",
      selectCategory: "ជ្រើសរើសប្រភេទ"
    }
  }[lang];

  const monthNames = {
    EN: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    KH: ['ខែមករា', 'ខែកុម្ភៈ', 'ខែមីនា', 'ខែមេសា', 'ខែឧសភា', 'ខែមិថុនា', 'ខែកក្កដា', 'ខែសីហា', 'ខែកញ្ញា', 'ខែតុលា', 'ខែវិច្ឆិកា', 'ខែធ្នូ']
  };
  
  const currentMonthIndex = new Date().getMonth();
  const currentMonth = monthNames[lang][currentMonthIndex];
  
  // Calculate monthly stats
  const monthlyIncome = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, t) => acc + t.amount, 0);
  
  const monthlyExpenses = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, t) => acc + t.amount, 0);

  const chartData = buckets.map(b => ({
    name: b.name,
    balance: b.currentBalance
  }));

  const COLORS = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const getFilteredCategories = (type: TransactionType) => {
    return categories.filter(c => c.type === type || c.type === 'BOTH');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.amount || !newTx.bucketId || !newTx.category) return;

    const amount = parseFloat(newTx.amount);
    const txId = 't' + Date.now();

    const transactionData = {
      id: txId,
      amount: amount,
      type: newTx.type,
      category: newTx.category,
      bucket_id: newTx.bucketId,
      date: newTx.date,
      note: newTx.note || 'New Transaction'
    };

    try {
      // 1. Insert Transaction into Supabase
      const { error: txError } = await supabase.from('transactions').insert([transactionData]);
      if (txError) throw txError;

      // 2. Update Bucket Balance in Supabase
      const bucket = buckets.find(b => b.id === newTx.bucketId);
      if (bucket) {
        const newBalance = newTx.type === TransactionType.INCOME 
            ? bucket.currentBalance + amount 
            : bucket.currentBalance - amount;

        const { error: bucketError } = await supabase
            .from('buckets')
            .update({ current_balance: newBalance })
            .eq('id', newTx.bucketId);
        
        if (bucketError) throw bucketError;
      }

      // 3. Update Local State
      onAddTransaction({
        id: txId,
        amount: amount,
        type: newTx.type,
        category: newTx.category,
        bucketId: newTx.bucketId,
        date: newTx.date,
        note: newTx.note || 'New Transaction'
      });

      setNewTx({
        amount: '',
        type: TransactionType.EXPENSE,
        category: getFilteredCategories(TransactionType.EXPENSE)[0]?.name || '',
        bucketId: buckets[0]?.id || '',
        note: '',
        date: new Date().toISOString().split('T')[0]
      });
      setIsModalOpen(false);

    } catch (error: any) {
      console.error('Error adding transaction:', error);
      alert('Failed to save transaction: ' + error.message);
    }
  };

  const handleOpenModal = () => {
    // Set default category based on expense type when opening
    const expenseCats = getFilteredCategories(TransactionType.EXPENSE);
    setNewTx({
        amount: '',
        type: TransactionType.EXPENSE,
        category: expenseCats[0]?.name || '',
        bucketId: buckets[0]?.id || '',
        note: '',
        date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 md:p-10 space-y-8 relative dark:text-slate-100">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.hello}, {profile?.name || 'User'}!</h1>
          <p className="text-slate-500 dark:text-slate-400">{t.overview} {currentMonth}.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleOpenModal}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-sm font-semibold"
          >
            <Plus size={18} />
            <span>{t.addTx}</span>
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center space-x-4 transition-colors">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.netWorth}</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">${totalBalance.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center space-x-4 transition-colors">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.income} ({currentMonth})</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${monthlyIncome.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center space-x-4 transition-colors">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.expenses} ({currentMonth})</p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">${monthlyExpenses.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bucket Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.bucketBreakdown}</h3>
            <button 
              onClick={() => onNavigate('buckets')}
              className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:underline"
            >
              {t.viewAll}
            </button>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff'
                  }}
                />
                <Bar dataKey="balance" radius={[10, 10, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goals Progress */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.goals}</h3>
            <button 
              onClick={() => onNavigate('goals')}
              className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="space-y-6">
            {goals.slice(0, 3).map(goal => {
              const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              return (
                <div key={goal.id} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center transition-colors">
                        {ICON_MAP[goal.icon]}
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{goal.name}</span>
                    </div>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden transition-colors">
                    <div 
                      className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-1000"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{t.target}: ${goal.targetAmount.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.recentTx}</h3>
          <button 
            onClick={() => onNavigate('transactions')}
            className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:underline"
          >
            {t.viewAll}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="pb-4">{t.addTx}</th>
                <th className="pb-4">{t.category}</th>
                <th className="pb-4">{t.date}</th>
                <th className="pb-4 text-right">{t.amount}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {transactions.slice(0, 5).map(t => (
                <tr key={t.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === TransactionType.INCOME ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>
                        {t.type === TransactionType.INCOME ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-200">{t.note}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{buckets.find(b => b.id === t.bucketId)?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium">
                      {t.category}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-slate-500 dark:text-slate-400">{t.date}</td>
                  <td className={`py-4 text-right font-bold ${t.type === TransactionType.INCOME ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'}${t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.modalTitle}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    const newType = TransactionType.EXPENSE;
                    setNewTx({
                        ...newTx, 
                        type: newType,
                        category: getFilteredCategories(newType)[0]?.name || ''
                    });
                  }}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${newTx.type === TransactionType.EXPENSE ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  {t.expense}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newType = TransactionType.INCOME;
                    setNewTx({
                        ...newTx, 
                        type: newType,
                        category: getFilteredCategories(newType)[0]?.name || ''
                    });
                  }}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${newTx.type === TransactionType.INCOME ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  {t.income}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.amount}</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full text-3xl font-bold p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all"
                  value={newTx.amount}
                  onChange={(e) => setNewTx({...newTx, amount: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.category}</label>
                  <select 
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl border border-transparent focus:border-indigo-500 outline-none transition-all"
                    value={newTx.category}
                    onChange={(e) => setNewTx({...newTx, category: e.target.value})}
                  >
                    {getFilteredCategories(newTx.type).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.bucket}</label>
                  <select 
                    required
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl border border-transparent focus:border-indigo-500 outline-none transition-all"
                    value={newTx.bucketId}
                    onChange={(e) => setNewTx({...newTx, bucketId: e.target.value})}
                  >
                    <option value="" disabled>{t.selectBucket}</option>
                    {buckets.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.note}</label>
                <input 
                  type="text" 
                  placeholder={t.notePlaceholder}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl border border-transparent focus:border-indigo-500 outline-none transition-all"
                  value={newTx.note}
                  onChange={(e) => setNewTx({...newTx, note: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.date}</label>
                <input 
                  type="date" 
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl border border-transparent focus:border-indigo-500 outline-none transition-all"
                  value={newTx.date}
                  onChange={(e) => setNewTx({...newTx, date: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 dark:shadow-none flex items-center justify-center space-x-2 mt-4"
              >
                <span>{t.save}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
