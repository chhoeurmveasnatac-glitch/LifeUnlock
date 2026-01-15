
import React, { useState, useEffect } from 'react';
import { Transaction, Bucket, TransactionType, Category } from '../types';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, Plus, Calendar, X, TrendingUp, TrendingDown, MoreVertical, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface Props {
  transactions: Transaction[];
  buckets: Bucket[];
  categories: Category[];
  onAddTransaction: (t: Transaction) => void;
  onUpdateBuckets: (buckets: Bucket[]) => void;
  onUpdateTransactions: (transactions: Transaction[]) => void;
  lang: 'EN' | 'KH';
}

const Transactions: React.FC<Props> = ({ transactions, buckets, categories, onAddTransaction, onUpdateBuckets, onUpdateTransactions, lang }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [newTx, setNewTx] = useState({
    amount: '',
    type: TransactionType.EXPENSE,
    category: '',
    bucketId: buckets[0]?.id || '',
    note: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openMenuId]);

  const t = {
    EN: {
      title: "Transactions",
      desc: "Every single movement of your wealth, recorded.",
      addTx: "Add Transaction",
      search: "Search by note or category...",
      filter: "Filter",
      statusNote: "Status & Note",
      bucket: "Bucket",
      category: "Category",
      date: "Date",
      amount: "Amount",
      noTx: "No transactions found",
      noTxDesc: "Try searching for something else or add a new entry.",
      modalTitle: "Add New Transaction",
      modalTitleEdit: "Edit Transaction",
      expense: "Expense",
      income: "Income",
      amountLabel: "Amount ($)",
      note: "Note",
      notePlaceholder: "What was this for?",
      save: "Save Transaction",
      update: "Update Transaction",
      selectBucket: "Select Bucket",
      edit: "Edit",
      delete: "Delete",
      confirmDeleteTitle: "Delete Transaction",
      confirmDeleteDesc: "Are you sure you want to delete this transaction? This will revert the balance in the associated bucket.",
      cancel: "Cancel",
      confirm: "Delete"
    },
    KH: {
      title: "ប្រតិបត្តិការ",
      desc: "រាល់ចលនានៃទ្រព្យសម្បត្តិរបស់អ្នកត្រូវបានកត់ត្រា។",
      addTx: "បន្ថែមប្រតិបត្តិការ",
      search: "ស្វែងរកតាមការកត់សម្គាល់ ឬប្រភេទ...",
      filter: "សម្រាំង",
      statusNote: "ស្ថានភាព & ចំណាំ",
      bucket: "កញ្ចប់",
      category: "ប្រភេទ",
      date: "កាលបរិច្ឆេទ",
      amount: "ចំនួនប្រាក់",
      noTx: "រកមិនឃើញប្រតិបត្តិការទេ",
      noTxDesc: "សាកល្បងស្វែងរកអ្វីផ្សេង ឬបន្ថែមថ្មី។",
      modalTitle: "បន្ថែមប្រតិបត្តិការថ្មី",
      modalTitleEdit: "កែប្រែប្រតិបត្តិការ",
      expense: "ចំណាយ",
      income: "ចំណូល",
      amountLabel: "ចំនួនប្រាក់ ($)",
      note: "ការកត់សម្គាល់",
      notePlaceholder: "តើចំណាយនេះសម្រាប់អ្វី?",
      save: "រក្សាទុក",
      update: "ធ្វើបច្ចុប្បន្នភាព",
      selectBucket: "ជ្រើសរើសកញ្ចប់",
      edit: "កែប្រែ",
      delete: "លុប",
      confirmDeleteTitle: "លុបប្រតិបត្តិការ",
      confirmDeleteDesc: "តើអ្នកប្រាកដថាចង់លុបប្រតិបត្តិការនេះទេ? វានឹងត្រឡប់សមតុល្យនៅក្នុងកញ្ចប់ថវិកាវិញ។",
      cancel: "បោះបង់",
      confirm: "លុប"
    }
  }[lang];

  const filteredTransactions = transactions.filter(t => 
    t.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFilteredCategories = (type: TransactionType) => {
    return categories.filter(c => c.type === type || c.type === 'BOTH');
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleEditOpen = (t: Transaction) => {
    setEditingId(t.id);
    setNewTx({
      amount: t.amount.toString(),
      type: t.type,
      category: t.category,
      bucketId: t.bucketId,
      note: t.note,
      date: t.date
    });
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const requestDelete = (id: string) => {
    setDeleteId(id);
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const id = deleteId;

    const tx = transactions.find(t => t.id === id);
    if (!tx) {
        setDeleteId(null);
        return;
    }

    try {
      // 1. Update Bucket Balance (Revert)
      const bucket = buckets.find(b => b.id === tx.bucketId);
      let updatedBuckets = [...buckets];

      if (bucket) {
        // Income adds to balance, so removing it subtracts. Expense subtracts, so removing it adds.
        const sign = tx.type === TransactionType.INCOME ? 1 : -1;
        const newBalance = bucket.currentBalance - (tx.amount * sign);

        const { error: bucketError } = await supabase.from('buckets').update({ current_balance: newBalance }).eq('id', bucket.id);
        if (bucketError) throw bucketError;
        
        updatedBuckets = buckets.map(b => b.id === bucket.id ? {...b, currentBalance: newBalance} : b);
      }

      // 2. Delete Transaction
      const { error: txError } = await supabase.from('transactions').delete().eq('id', id);
      if (txError) throw txError;
      
      // 3. Update Local State
      onUpdateBuckets(updatedBuckets);
      onUpdateTransactions(transactions.filter(t => t.id !== id));
      setDeleteId(null);

    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction: ' + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.amount || !newTx.bucketId || !newTx.category) return;

    const amount = parseFloat(newTx.amount);

    if (editingId) {
      // EDIT MODE
      const oldTx = transactions.find(t => t.id === editingId);
      if (!oldTx) return;

      try {
        let updatedBuckets = [...buckets];

        // 1. Revert changes to old bucket
        const oldBucket = buckets.find(b => b.id === oldTx.bucketId);
        if (oldBucket) {
          const oldSign = oldTx.type === TransactionType.INCOME ? 1 : -1;
          const revertAmount = oldTx.amount * oldSign;
          const revertedBalance = oldBucket.currentBalance - revertAmount;
          
          updatedBuckets = updatedBuckets.map(b => b.id === oldBucket.id ? {...b, currentBalance: revertedBalance} : b);
        }

        // 2. Apply changes to new bucket (could be same bucket)
        // Find the bucket in the already updated array to ensure we have the latest balance if it's the same bucket
        const newBucketIndex = updatedBuckets.findIndex(b => b.id === newTx.bucketId);
        
        if (newBucketIndex !== -1) {
          const newBucket = updatedBuckets[newBucketIndex];
          const newSign = newTx.type === TransactionType.INCOME ? 1 : -1;
          const applyAmount = amount * newSign;
          const finalBalance = newBucket.currentBalance + applyAmount;
          
          updatedBuckets[newBucketIndex] = { ...newBucket, currentBalance: finalBalance };
        }

        // 3. Update Supabase Buckets
        for (const b of updatedBuckets) {
          const original = buckets.find(orig => orig.id === b.id);
          // Only update if balance changed
          if (original && original.currentBalance !== b.currentBalance) {
            const { error } = await supabase.from('buckets').update({ current_balance: b.currentBalance }).eq('id', b.id);
            if (error) throw error;
          }
        }

        // 4. Update Supabase Transaction
        const transactionData = {
          amount: amount,
          type: newTx.type,
          category: newTx.category,
          bucket_id: newTx.bucketId,
          date: newTx.date,
          note: newTx.note || 'Updated Transaction'
        };

        const { error: txError } = await supabase.from('transactions').update(transactionData).eq('id', editingId);
        if (txError) throw txError;

        // 5. Update Local State
        onUpdateBuckets(updatedBuckets);
        onUpdateTransactions(transactions.map(t => t.id === editingId ? { 
          id: editingId,
          amount,
          type: newTx.type,
          category: newTx.category,
          bucketId: newTx.bucketId,
          date: newTx.date,
          note: newTx.note || 'Updated Transaction'
        } : t));

        setEditingId(null);
        setIsModalOpen(false);

      } catch (error: any) {
        console.error('Error updating transaction:', error);
        alert('Failed to update transaction: ' + error.message);
      }

    } else {
      // ADD MODE
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
        let updatedBuckets = [...buckets];

        if (bucket) {
          const newBalance = newTx.type === TransactionType.INCOME 
              ? bucket.currentBalance + amount 
              : bucket.currentBalance - amount;

          const { error: bucketError } = await supabase
              .from('buckets')
              .update({ current_balance: newBalance })
              .eq('id', newTx.bucketId);
          
          if (bucketError) throw bucketError;
          
          updatedBuckets = buckets.map(b => b.id === bucket.id ? {...b, currentBalance: newBalance} : b);
        }

        // 3. Update Local State
        onUpdateBuckets(updatedBuckets);
        onUpdateTransactions([{
          id: txId,
          amount: amount,
          type: newTx.type,
          category: newTx.category,
          bucketId: newTx.bucketId,
          date: newTx.date,
          note: newTx.note || 'New Transaction'
        }, ...transactions]);

        setIsModalOpen(false);

      } catch (error: any) {
        console.error('Error adding transaction:', error);
        alert('Failed to save transaction: ' + error.message);
      }
    }
    
    // Reset form
    const expenseCats = getFilteredCategories(TransactionType.EXPENSE);
    setNewTx({
      amount: '',
      type: TransactionType.EXPENSE,
      category: expenseCats[0]?.name || '',
      bucketId: buckets[0]?.id || '',
      note: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleCreateOpen = () => {
    setEditingId(null);
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
    <div className="p-6 md:p-10 space-y-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.title}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t.desc}</p>
        </div>
        <button 
          onClick={handleCreateOpen}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 dark:shadow-none font-bold"
        >
          <Plus size={20} />
          <span>{t.addTx}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-visible">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder={t.search}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all border border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center space-x-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-700">
              <Filter size={18} />
              <span>{t.filter}</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-700">
              <Calendar size={18} />
              <span>Oct 2023</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-8 py-4">{t.statusNote}</th>
                <th className="px-8 py-4">{t.bucket}</th>
                <th className="px-8 py-4">{t.category}</th>
                <th className="px-8 py-4">{t.date}</th>
                <th className="px-8 py-4 text-right">{t.amount}</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group relative">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === TransactionType.INCOME ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>
                        {tx.type === TransactionType.INCOME ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{tx.note}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-tighter">ID: {tx.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {buckets.find(b => b.id === tx.bucketId)?.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-bold uppercase tracking-tight">
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm text-slate-500 dark:text-slate-400">{tx.date}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <p className={`text-lg font-bold ${tx.type === TransactionType.INCOME ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                      {tx.type === TransactionType.INCOME ? '+' : '-'}${tx.amount.toLocaleString()}
                    </p>
                  </td>
                  <td className="px-8 py-5 text-right relative">
                    <button 
                      onClick={(e) => toggleMenu(e, tx.id)}
                      className={`p-2 rounded-xl transition-colors ${openMenuId === tx.id ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <MoreVertical size={20} />
                    </button>
                    
                    {openMenuId === tx.id && (
                      <div className="absolute right-8 top-12 mt-1 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-left">
                        <button 
                          onClick={() => handleEditOpen(tx)}
                          className="w-full text-left px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center"
                        >
                          <Edit2 size={14} className="mr-2" /> {t.edit}
                        </button>
                        <button 
                          onClick={() => requestDelete(tx.id)}
                          className="w-full text-left px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center"
                        >
                          <Trash2 size={14} className="mr-2" /> {t.delete}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="p-20 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-200 dark:text-slate-600">
                <Search size={40} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{t.noTx}</p>
                <p className="text-slate-400 dark:text-slate-500">{t.noTxDesc}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl p-6 border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-500 rounded-full flex items-center justify-center mb-2">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.confirmDeleteTitle}</h3>
              <p className="text-slate-500 dark:text-slate-400">{t.confirmDeleteDesc}</p>
              
              <div className="grid grid-cols-2 gap-3 w-full pt-4">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={confirmDelete}
                  className="w-full py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200 dark:shadow-none"
                >
                  {t.confirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{editingId ? t.modalTitleEdit : t.modalTitle}</h3>
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
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.amountLabel}</label>
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
                <span>{editingId ? t.update : t.save}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
