
import React, { useState, useEffect } from 'react';
import { Goal, Bucket } from '../types';
import { ICON_MAP } from '../constants';
import { Plus, Calculator, Calendar, Target as TargetIcon, X, MoreVertical, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface Props {
  goals: Goal[];
  buckets: Bucket[];
  onUpdateGoals: (goals: Goal[]) => void;
  lang: 'EN' | 'KH';
}

const Goals: React.FC<Props> = ({ goals, buckets, onUpdateGoals, lang }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    icon: 'car',
    bucketId: buckets[0]?.id || ''
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
      title: "Life Goals",
      desc: "Plan your future and track every milestone.",
      newGoal: "New Goal",
      onTrack: "On Track",
      achieved: "Achieved!",
      linkedTo: "Linked to",
      target: "Target",
      targetDate: "Target Date",
      monthlySave: "Monthly Save",
      addAnother: "Add Another Life Goal",
      addDesc: "Divide your future into achievable milestones.",
      modalTitle: "Create New Goal",
      modalTitleEdit: "Edit Goal",
      goalName: "Goal Name",
      targetAmount: "Target Amount ($)",
      deadline: "Deadline",
      linkedBucket: "Linked Bucket",
      selectBucket: "Select Bucket to save in",
      selectIcon: "Select Icon",
      save: "Save Goal",
      update: "Update Goal",
      edit: "Edit",
      delete: "Delete",
      confirmDeleteTitle: "Delete Goal",
      confirmDeleteDesc: "Are you sure you want to delete this goal? This action cannot be undone.",
      cancel: "Cancel",
      confirm: "Delete"
    },
    KH: {
      title: "គោលដៅជីវិត",
      desc: "រៀបចំផែនការអនាគត និងតាមដានរាល់សមិទ្ធផល។",
      newGoal: "គោលដៅថ្មី",
      onTrack: "ដំណើរការល្អ",
      achieved: "ជោគជ័យ!",
      linkedTo: "ភ្ជាប់ទៅ",
      target: "គោលដៅ",
      targetDate: "កាលបរិច្ឆេទ",
      monthlySave: "សន្សំប្រចាំខែ",
      addAnother: "បន្ថែមគោលដៅជីវិត",
      addDesc: "បែងចែកអនាគតរបស់អ្នកជាដំណាក់កាល។",
      modalTitle: "បង្កើតគោលដៅថ្មី",
      modalTitleEdit: "កែប្រែគោលដៅ",
      goalName: "ឈ្មោះគោលដៅ",
      targetAmount: "ចំនួនទឹកប្រាក់ ($)",
      deadline: "កាលបរិច្ឆេទកំណត់",
      linkedBucket: "កញ្ចប់ភ្ជាប់",
      selectBucket: "ជ្រើសរើសកញ្ចប់សន្សំ",
      selectIcon: "ជ្រើសរើសរូបតំណាង",
      save: "រក្សាទុកគោលដៅ",
      update: "ធ្វើបច្ចុប្បន្នភាព",
      edit: "កែប្រែ",
      delete: "លុប",
      confirmDeleteTitle: "លុបគោលដៅ",
      confirmDeleteDesc: "តើអ្នកប្រាកដថាចង់លុបគោលដៅនេះទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។",
      cancel: "បោះបង់",
      confirm: "លុប"
    }
  }[lang];

  const handleCreateOpen = () => {
    setEditingId(null);
    setNewGoal({
      name: '',
      targetAmount: '',
      deadline: '',
      icon: 'car',
      bucketId: buckets[0]?.id || ''
    });
    setIsModalOpen(true);
  };

  const handleEditOpen = (goal: Goal) => {
    setEditingId(goal.id);
    setNewGoal({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      deadline: goal.deadline,
      icon: goal.icon,
      bucketId: goal.bucketId
    });
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // Triggered by the delete button in the dropdown
  const requestDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteId(id);
    setOpenMenuId(null);
  };

  // Actually delete after confirmation
  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase.from('goals').delete().eq('id', deleteId);
      if (error) throw error;
      
      onUpdateGoals(goals.filter(g => g.id !== deleteId));
      setDeleteId(null);

    } catch (error: any) {
      console.error('Error deleting goal:', error);
      alert('Failed to delete goal: ' + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.deadline || !newGoal.bucketId) return;

    const targetVal = parseFloat(newGoal.targetAmount) || 0;

    if (editingId) {
      // Edit Logic
      try {
        const { error } = await supabase.from('goals').update({
          name: newGoal.name,
          target_amount: targetVal,
          deadline: newGoal.deadline,
          icon: newGoal.icon,
          bucket_id: newGoal.bucketId
        }).eq('id', editingId);

        if (error) throw error;

        const updatedGoals = goals.map(g => g.id === editingId ? {
          ...g,
          name: newGoal.name,
          targetAmount: targetVal,
          deadline: newGoal.deadline,
          icon: newGoal.icon,
          bucketId: newGoal.bucketId
        } : g);

        onUpdateGoals(updatedGoals);
        setIsModalOpen(false);

      } catch (error: any) {
        console.error('Error updating goal:', error);
        alert('Failed to update goal: ' + error.message);
      }

    } else {
      // Create Logic
      const goalId = 'g' + Date.now();
      const goalData = {
        id: goalId,
        name: newGoal.name,
        target_amount: targetVal,
        current_amount: 0,
        deadline: newGoal.deadline,
        icon: newGoal.icon,
        bucket_id: newGoal.bucketId
      };

      try {
        const { error } = await supabase.from('goals').insert([goalData]);
        
        if (error) {
          console.error('Error adding goal:', error);
          alert('Failed to save goal: ' + error.message);
          return;
        }

        onUpdateGoals([...goals, {
          id: goalId,
          name: newGoal.name,
          targetAmount: targetVal,
          currentAmount: 0,
          deadline: newGoal.deadline,
          icon: newGoal.icon,
          bucketId: newGoal.bucketId
        }]);

        setIsModalOpen(false);
      } catch (err: any) {
         console.error('Unexpected error:', err);
         alert('An unexpected error occurred: ' + err.message);
      }
    }
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
          <span>{t.newGoal}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {goals.map(goal => {
          const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const remaining = goal.targetAmount - goal.currentAmount;
          const deadlineDate = new Date(goal.deadline);
          const now = new Date();
          const monthsLeft = Math.max(1, (deadlineDate.getFullYear() - now.getFullYear()) * 12 + (deadlineDate.getMonth() - now.getMonth()));
          const monthlyTarget = Math.round(remaining / monthsLeft);

          return (
            <div key={goal.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col hover:shadow-md transition-all relative">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shadow-inner dark:shadow-none">
                  {ICON_MAP[goal.icon] || <TargetIcon size={24} />}
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${percent >= 100 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
                      {percent >= 100 ? t.achieved : t.onTrack}
                    </span>
                  </div>
                  
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleMenu(e, goal.id)}
                      className={`p-1.5 rounded-lg transition-colors ${openMenuId === goal.id ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    {openMenuId === goal.id && (
                      <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        <button 
                          onClick={() => handleEditOpen(goal)}
                          className="w-full text-left px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center"
                        >
                          <Edit2 size={14} className="mr-2" /> {t.edit}
                        </button>
                        <button 
                          onClick={(e) => requestDelete(goal.id, e)}
                          className="w-full text-left px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center"
                        >
                          <Trash2 size={14} className="mr-2" /> {t.delete}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6 flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{goal.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t.linkedTo}: {buckets.find(b => b.id === goal.bucketId)?.name}</p>
                
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-slate-900 dark:text-white">${goal.currentAmount.toLocaleString()}</span>
                  <span className="text-slate-400 dark:text-slate-500">${goal.targetAmount.toLocaleString()}</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${percent >= 100 ? 'bg-emerald-500' : 'bg-indigo-600 dark:bg-indigo-500'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-slate-400 dark:text-slate-500" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">{t.targetDate}</p>
                    <p className="text-sm font-semibold truncate text-slate-700 dark:text-slate-300">{goal.deadline}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calculator size={16} className="text-slate-400 dark:text-slate-500" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">{t.monthlySave}</p>
                    <p className="text-sm font-semibold truncate text-slate-700 dark:text-slate-300">${monthlyTarget.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* New Goal Placeholder */}
        <button 
          onClick={handleCreateOpen}
          className="border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 rounded-3xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-400 dark:hover:text-indigo-500 transition-all group min-h-[300px]"
        >
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
            <Plus size={32} />
          </div>
          <span className="font-bold">{t.addAnother}</span>
          <p className="text-xs mt-2 text-center px-4">{t.addDesc}</p>
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

      {/* Add/Edit Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{editingId ? t.modalTitleEdit : t.modalTitle}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.goalName}</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Dream House"
                  className="w-full text-xl font-bold p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.targetAmount}</label>
                  <input 
                    type="number" 
                    required
                    placeholder="0.00"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl border border-transparent focus:border-indigo-500 outline-none transition-all"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.deadline}</label>
                  <input 
                    type="date" 
                    required
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl border border-transparent focus:border-indigo-500 outline-none transition-all"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.linkedBucket}</label>
                <select 
                  required
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl border border-transparent focus:border-indigo-500 outline-none transition-all"
                  value={newGoal.bucketId}
                  onChange={(e) => setNewGoal({...newGoal, bucketId: e.target.value})}
                >
                  <option value="" disabled>{t.selectBucket}</option>
                  {buckets.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.selectIcon}</label>
                <div className="grid grid-cols-6 gap-3">
                  {Object.keys(ICON_MAP).map(key => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setNewGoal({...newGoal, icon: key})}
                      className={`
                        w-12 h-12 flex items-center justify-center rounded-xl border-2 transition-all
                        ${newGoal.icon === key 
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
                <span>{editingId ? t.update : t.save}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
