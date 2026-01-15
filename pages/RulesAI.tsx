
import React, { useState } from 'react';
import { Rule, Bucket, Goal } from '../types';
import { getAutoPlanRecommendation } from '../services/geminiService';
import { Sparkles, Settings, Bot, ArrowRight, CheckCircle, Info, X, Plus, Check, Trash2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface Props {
  rules: Rule[];
  buckets: Bucket[];
  income: number;
  goals: Goal[];
  onAddRule: (rule: Rule) => void;
  onUpdateBuckets: (buckets: Bucket[]) => void;
  onUpdateRules?: (rules: Rule[]) => void;
  lang: 'EN' | 'KH';
}

const RulesAI: React.FC<Props> = ({ rules, buckets, income, goals, onAddRule, onUpdateBuckets, onUpdateRules, lang }) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecs, setAiRecs] = useState<any[]>([]);
  const [appliedIndices, setAppliedIndices] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    value: '',
    targetBucketId: buckets[0]?.id || ''
  });

  const t = {
    EN: {
      title: "Rules & Automation",
      desc: "Let the system handle your money distribution automatically.",
      activeRules: "Active Rules",
      createNew: "Create New",
      destination: "Destination",
      autoAlloc: "Auto-Allocate",
      aiAdvisor: "AI Wealth Advisor",
      smartPlan: "Smart Allocation Plan",
      aiDesc: "Our Gemini-powered AI analyzes your goals and income to suggest the optimal distribution between emergency savings, daily living, and long-term dreams.",
      genPlan: "Generate AI Recommendations",
      generating: "Generating Plan...",
      recDist: "Recommended Distribution",
      applyAll: "Apply All Changes",
      apply: "Apply to Bucket",
      notFound: "Bucket not found",
      modalTitle: "New Automation Rule",
      ruleName: "Rule Name",
      percentage: "Percentage (%)",
      fixed: "Fixed Amount ($)",
      value: "Value",
      targetBucket: "Target Bucket",
      percentDesc: "This rule will take a portion of every incoming transaction.",
      fixedDesc: "This rule will move a set amount of money regularly.",
      activate: "Activate Rule",
      delete: "Delete"
    },
    KH: {
      title: "ច្បាប់ & ស្វ័យប្រវត្តិកម្ម",
      desc: "ឱ្យប្រព័ន្ធចាត់ចែងការបែងចែកប្រាក់របស់អ្នកដោយស្វ័យប្រវត្តិ។",
      activeRules: "ច្បាប់ដែលកំពុងដំណើរការ",
      createNew: "បង្កើតថ្មី",
      destination: "គោលដៅ",
      autoAlloc: "បែងចែកស្វ័យប្រវត្តិ",
      aiAdvisor: "ទីប្រឹក្សា AI",
      smartPlan: "ផែនការបែងចែកឆ្លាតវៃ",
      aiDesc: "AI របស់យើងវិភាគគោលដៅនិងចំណូលរបស់អ្នក ដើម្បីណែនាំការបែងចែកដ៏ល្អបំផុតរវាងប្រាក់សន្សំគ្រាអាសន្ន ការរស់នៅប្រចាំថ្ងៃ និងក្តីសុបិន្តរយៈពេលវែង។",
      genPlan: "បង្កើតការណែនាំពី AI",
      generating: "កំពុងបង្កើតផែនការ...",
      recDist: "ការបែងចែកដែលបានណែនាំ",
      applyAll: "អនុវត្តការផ្លាស់ប្តូរទាំងអស់",
      apply: "អនុវត្តទៅកញ្ចប់",
      notFound: "រកមិនឃើញកញ្ចប់",
      modalTitle: "ច្បាប់ស្វ័យប្រវត្តិកម្មថ្មី",
      ruleName: "ឈ្មោះច្បាប់",
      percentage: "ភាគរយ (%)",
      fixed: "ចំនួនថេរ ($)",
      value: "តម្លៃ",
      targetBucket: "កញ្ចប់គោលដៅ",
      percentDesc: "ច្បាប់នេះនឹងកាត់យកមួយផ្នែកនៃរាល់ចំណូលដែលចូលមក។",
      fixedDesc: "ច្បាប់នេះនឹងផ្លាស់ទីចំនួនប្រាក់កំណត់មួយជាទៀងទាត់។",
      activate: "ដំណើរការច្បាប់",
      delete: "លុប"
    }
  }[lang];

  const handleAskAI = async () => {
    setAiLoading(true);
    setAppliedIndices([]);
    const recs = await getAutoPlanRecommendation(income, goals, buckets);
    setAiRecs(recs);
    setAiLoading(false);
  };

  const handleApplyRec = (rec: any, index: number) => {
    const updatedBuckets = buckets.map(b => {
      // Find by name (case-insensitive)
      if (b.name.toLowerCase() === rec.bucketName.toLowerCase()) {
        return { ...b, targetPercentage: rec.suggestedPercentage };
      }
      return b;
    });
    
    onUpdateBuckets(updatedBuckets);
    setAppliedIndices(prev => [...prev, index]);
  };

  const handleApplyAll = () => {
    let updatedBuckets = [...buckets];
    aiRecs.forEach(rec => {
      updatedBuckets = updatedBuckets.map(b => {
        if (b.name.toLowerCase() === rec.bucketName.toLowerCase()) {
          return { ...b, targetPercentage: rec.suggestedPercentage };
        }
        return b;
      });
    });
    onUpdateBuckets(updatedBuckets);
    setAppliedIndices(aiRecs.map((_, i) => i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.name || !newRule.value || !newRule.targetBucketId) return;

    const ruleId = 'r' + Date.now();
    const val = parseFloat(newRule.value);

    try {
      const { error } = await supabase.from('rules').insert([
        {
          id: ruleId,
          name: newRule.name,
          type: newRule.type,
          value: val,
          target_bucket_id: newRule.targetBucketId
        }
      ]);

      if (error) throw error;

      onAddRule({
        id: ruleId,
        name: newRule.name,
        type: newRule.type,
        value: val,
        targetBucketId: newRule.targetBucketId
      });

      setNewRule({
        name: '',
        type: 'PERCENTAGE',
        value: '',
        targetBucketId: buckets[0]?.id || ''
      });
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error adding rule:', error);
      alert('Failed to add rule: ' + error.message);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    
    try {
      const { error } = await supabase.from('rules').delete().eq('id', id);
      if (error) throw error;
      
      if (onUpdateRules) {
        onUpdateRules(rules.filter(r => r.id !== id));
      }
    } catch (error: any) {
       console.error('Error deleting rule:', error);
       alert('Failed to delete rule: ' + error.message);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 relative">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.title}</h1>
        <p className="text-slate-500 dark:text-slate-400">{t.desc}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Rules */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
              <Settings className="mr-2 text-indigo-600 dark:text-indigo-400" size={24} /> {t.activeRules}
            </h3>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline flex items-center space-x-1"
            >
              <Plus size={16} />
              <span>{t.createNew}</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {rules.length === 0 && (
              <div className="text-center p-8 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400">
                 No active rules
              </div>
            )}
            {rules.map(rule => (
              <div key={rule.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <Info size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{rule.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t.destination}: {buckets.find(b => b.id === rule.targetBucketId)?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {rule.type === 'PERCENTAGE' ? `${rule.value}%` : `$${rule.value.toLocaleString()}`}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">{t.autoAlloc}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Advisor */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
            <Bot className="mr-2 text-indigo-600 dark:text-indigo-400" size={24} /> {t.aiAdvisor}
          </h3>

          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
            <Sparkles className="absolute top-4 right-4 text-indigo-200 opacity-20" size={80} />
            <div className="relative z-10">
              <h4 className="text-2xl font-bold mb-4">{t.smartPlan}</h4>
              <p className="text-indigo-100 mb-8 opacity-90">
                {t.aiDesc}
              </p>
              <button 
                onClick={handleAskAI}
                disabled={aiLoading}
                className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold flex items-center shadow-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {aiLoading ? t.generating : t.genPlan}
                <ArrowRight className="ml-2" size={20} />
              </button>
            </div>
          </div>

          {aiRecs.length > 0 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white">{t.recDist}</h4>
                {appliedIndices.length < aiRecs.length && (
                  <button 
                    onClick={handleApplyAll}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {t.applyAll}
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {aiRecs.map((rec, i) => {
                  const isApplied = appliedIndices.includes(i);
                  const bucketExists = buckets.some(b => b.name.toLowerCase() === rec.bucketName.toLowerCase());
                  
                  return (
                    <div key={i} className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-2xl flex items-start space-x-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isApplied ? 'bg-emerald-500 text-white' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}>
                        {isApplied ? <Check size={18} /> : <CheckCircle size={18} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-emerald-900 dark:text-emerald-300">{rec.bucketName}</span>
                            <span className="bg-emerald-200 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs px-2 py-0.5 rounded-full font-bold">
                              {rec.suggestedPercentage}%
                            </span>
                          </div>
                          {!isApplied && bucketExists && (
                            <button 
                              onClick={() => handleApplyRec(rec, i)}
                              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                              {t.apply}
                            </button>
                          )}
                          {!bucketExists && (
                            <span className="text-[10px] font-bold text-slate-400 italic">{t.notFound}</span>
                          )}
                        </div>
                        <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">{rec.reasoning}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.modalTitle}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.ruleName}</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Vacation Fund Auto-Save"
                  className="w-full text-xl font-bold p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all"
                  value={newRule.name}
                  onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                />
              </div>

              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setNewRule({...newRule, type: 'PERCENTAGE'})}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${newRule.type === 'PERCENTAGE' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  {t.percentage}
                </button>
                <button
                  type="button"
                  onClick={() => setNewRule({...newRule, type: 'FIXED'})}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${newRule.type === 'FIXED' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  {t.fixed}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.value}</label>
                  <input 
                    type="number" 
                    required
                    placeholder={newRule.type === 'PERCENTAGE' ? "20" : "500"}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl border border-transparent focus:border-indigo-500 outline-none transition-all"
                    value={newRule.value}
                    onChange={(e) => setNewRule({...newRule, value: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.targetBucket}</label>
                  <select 
                    required
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl border border-transparent focus:border-indigo-500 outline-none transition-all"
                    value={newRule.targetBucketId}
                    onChange={(e) => setNewRule({...newRule, targetBucketId: e.target.value})}
                  >
                    {buckets.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                {newRule.type === 'PERCENTAGE' 
                  ? t.percentDesc
                  : t.fixedDesc}
              </p>

              <button 
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 dark:shadow-none flex items-center justify-center space-x-2 mt-4"
              >
                <span>{t.activate}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RulesAI;
