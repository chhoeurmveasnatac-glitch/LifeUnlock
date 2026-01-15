
import React, { useState, useEffect } from 'react';
import { Bucket } from '../types';
import { ICON_MAP } from '../constants';
import { Plus, MoreVertical, Edit2, Trash2, X, Target, AlertTriangle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface Props {
  buckets: Bucket[];
  onUpdateBuckets: (buckets: Bucket[]) => void;
  lang: 'EN' | 'KH';
}

const Buckets: React.FC<Props> = ({ buckets, onUpdateBuckets, lang }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [newBucket, setNewBucket] = useState({
    name: '',
    targetPercentage: 0,
    icon: 'food'
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
      title: "Wealth Buckets",
      desc: "Divide your money into containers to avoid overspending.",
      newBucket: "New Bucket",
      edit: "Edit",
      delete: "Delete",
      autoFill: "Auto-fill",
      available: "Available Funds",
      createContainer: "Create New Container",
      createDesc: "Start a new savings or expense bucket.",
      modalTitleCreate: "Create New Bucket",
      modalTitleEdit: "Edit Bucket",
      bucketName: "Bucket Name",
      autoAlloc: "Auto-Allocation Percentage (%)",
      autoAllocDesc: "This is the portion of your income that goes here automatically.",
      selectIcon: "Select Icon",
      create: "Create Bucket",
      update: "Update Bucket",
      confirmDeleteTitle: "Delete Bucket",
      confirmDeleteDesc: "Are you sure you want to delete this bucket? This action cannot be undone.",
      cancel: "Cancel",
      confirm: "Delete"
    },
    KH: {
      title: "កញ្ចប់ថវិកា",
      desc: "បែងចែកប្រាក់របស់អ្នកដើម្បីជៀសវាងការចំណាយលើស។",
      newBucket: "កញ្ចប់ថ្មី",
      edit: "កែប្រែ",
      delete: "លុប",
      autoFill: "បែងចែកស្វ័យប្រវត្តិ",
      available: "ថវិកាដែលមាន",
      createContainer: "បង្កើតកញ្ចប់ថ្មី",
      createDesc: "ចាប់ផ្តើមសន្សំ ឬបង្កើតកញ្ចប់ចំណាយថ្មី។",
      modalTitleCreate: "បង្កើតកញ្ចប់ថ្មី",
      modalTitleEdit: "កែប្រែកញ្ចប់",
      bucketName: "ឈ្មោះកញ្ចប់",
      autoAlloc: "ភាគរយបែងចែកស្វ័យប្រវត្តិ (%)",
      autoAllocDesc: "នេះគឺជាផ្នែកនៃប្រាក់ចំណូលដែលនឹងចូលទីនេះដោយស្វ័យប្រវត្តិ។",
      selectIcon: "ជ្រើសរើសរូបតំណាង",
      create: "បង្កើតកញ្ចប់",
      update: "ធ្វើបច្ចុប្បន្នភាព",
      confirmDeleteTitle: "លុបកញ្ចប់ថវិកា",
      confirmDeleteDesc: "តើអ្នកប្រាកដថាចង់លុបកញ្ចប់នេះទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។",
      cancel: "បោះបង់",
      confirm: "លុប"
    }
  }[lang];

  const handleCreateOpen = () => {
    setEditingId(null);
    setNewBucket({ name: '', targetPercentage: 0, icon: 'food' });
    setIsModalOpen(true);
  };

  const handleEditOpen = (bucket: Bucket) => {
    setEditingId(bucket.id);
    setNewBucket({
      name: bucket.name,
      targetPercentage: bucket.targetPercentage || 0,
      icon: bucket.icon
    });
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBucket.name) return;

    if (editingId) {
      // Update existing bucket
      const updatedBuckets = buckets.map(b => 
        b.id === editingId 
          ? { ...b, name: newBucket.name, targetPercentage: newBucket.targetPercentage || 0, icon: newBucket.icon }
          : b
      );
      onUpdateBuckets(updatedBuckets);
      
      // Update in Supabase
      const { error } = await supabase.from('buckets').update({
        name: newBucket.name,
        target_percentage: newBucket.targetPercentage,
        icon: newBucket.icon
      }).eq('id', editingId);

      if (error) console.error('Error updating bucket:', error);
      
    } else {
      // Create new bucket
      const createdBucket: Bucket = {
        id: 'b' + Date.now(),
        name: newBucket.name,
        targetPercentage: newBucket.targetPercentage || 0,
        currentBalance: 0,
        icon: newBucket.icon
      };

      try {
        const { error } = await supabase.from('buckets').insert([
          {
            id: createdBucket.id,
            name: createdBucket.name,
            target_percentage: createdBucket.targetPercentage,
            current_balance: createdBucket.currentBalance,
            icon: createdBucket.icon,
            fixed_amount: 0
          }
        ]);

        if (error) {
          console.error('Supabase Error:', error);
          alert('Failed to save bucket to database: ' + error.message);
          return;
        }

        onUpdateBuckets([...buckets, createdBucket]);
      } catch (err) {
        console.error('Unexpected error:', err);
        return;
      }
    }

    setNewBucket({ name: '', targetPercentage: 0, icon: 'food' });
    setEditingId(null);
    setIsModalOpen(false);
  };

  // Triggered by the delete button in the dropdown
  const requestDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteId(id);
    setOpenMenuId(null);
  };

  // Actually delete from Supabase after confirmation
  const confirmDelete = async () => {
    if (!deleteId) return;

    const previousBuckets = [...buckets];
    // Optimistically update UI
    onUpdateBuckets(buckets.filter(b => b.id !== deleteId));
    setDeleteId(null);

    try {
      const { error } = await supabase.from('buckets').delete().eq('id', deleteId);
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Error deleting bucket:', error);
      alert('Failed to delete bucket from database. It might be linked to existing transactions.\n\nError: ' + error.message);
      // Revert UI if failed
      onUpdateBuckets(previousBuckets);
    }
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <div className="p-6 md:p-10 space-y-8 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.title}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t.desc}</p>
        </div>
        <button 
          onClick={handleCreateOpen}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 dark:shadow-none font-bold"
        >
          <Plus size={20} />
          <span>{t.newBucket}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buckets.map(bucket => (
          <div key={bucket.id} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center transition-colors">
                {ICON_MAP[bucket.icon] || <Target size={24} />}
              </div>
              <div className="relative">
                <button 
                  onClick={(e) => toggleMenu(e, bucket.id)}
                  className={`p-2 rounded-xl transition-colors ${openMenuId === bucket.id ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <MoreVertical size={20} />
                </button>
                
                {openMenuId === bucket.id && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <button 
                      onClick={() => handleEditOpen(bucket)}
                      className="w-full text-left px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center"
                    >
                      <Edit2 size={14} className="mr-2" /> {t.edit}
                    </button>
                    <button 
                      onClick={(e) => requestDelete(bucket.id, e)}
                      className="w-full text-left px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center"
                    >
                      <Trash2 size={14} className="mr-2" /> {t.delete}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1 mb-8">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{bucket.name}</h3>
              <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">{t.autoFill}: {bucket.targetPercentage}%</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">{t.available}</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">${bucket.currentBalance.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button 
          onClick={handleCreateOpen}
          className="border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 rounded-3xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-400 dark:hover:text-indigo-500 transition-all group min-h-[280px]"
        >
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
            <Plus size={32} />
          </div>
          <span className="font-bold">{t.createContainer}</span>
          <p className="text-xs mt-2 text-center px-4">{t.createDesc}</p>
        </button>
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

      {/* Add/Edit Bucket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{editingId ? t.modalTitleEdit : t.modalTitleCreate}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.bucketName}</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Travel Fund"
                  className="w-full text-xl font-bold p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all"
                  value={newBucket.name}
                  onChange={(e) => setNewBucket({...newBucket, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.autoAlloc}</label>
                <div className="flex items-center space-x-4">
                  <input 
                    type="range" 
                    min="0"
                    max="100"
                    className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    value={newBucket.targetPercentage}
                    onChange={(e) => setNewBucket({...newBucket, targetPercentage: parseInt(e.target.value)})}
                  />
                  <span className="w-12 text-right font-bold text-indigo-600 dark:text-indigo-400">{newBucket.targetPercentage}%</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">{t.autoAllocDesc}</p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.selectIcon}</label>
                <div className="grid grid-cols-6 gap-3">
                  {Object.keys(ICON_MAP).map(key => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setNewBucket({...newBucket, icon: key})}
                      className={`
                        w-12 h-12 flex items-center justify-center rounded-xl border-2 transition-all
                        ${newBucket.icon === key 
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                          : 'border-transparent bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}
                      `}
                    >
                      {ICON_MAP[key]}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 dark:shadow-none flex items-center justify-center space-x-2 mt-4"
              >
                <span>{editingId ? t.update : t.create}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Buckets;
