
import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Target, Wallet, Calendar, Calculator } from 'lucide-react';

interface Props {
  onComplete: (data: any) => void;
  lang: 'EN' | 'KH';
}

const Onboarding: React.FC<Props> = ({ onComplete, lang }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    income: 0,
    expenses: 0,
    debt: 0,
    emergencyGoal: 0,
    payday: 1,
    primaryGoal: ''
  });

  const t = {
    EN: {
      s1Title: "Welcome! Let's name your space.",
      s1Label: "What should we call you?",
      s1Place: "E.g. Somchai's Wealth",
      s2Title: "What's your monthly income?",
      s2Label: "Average take-home pay ($)",
      s3Title: "When is your payday?",
      s3Label: "Which day of the month do you get paid?",
      s4Title: "Essential Expenses",
      s4Label: "Rent, Bills, Food (Estimate)",
      prev: "Previous",
      next: "Next Step",
      finish: "Finish & Unlock"
    },
    KH: {
      s1Title: "សូមស្វាគមន៍! តោះដាក់ឈ្មោះឱ្យគណនីរបស់អ្នក។",
      s1Label: "តើពួកយើងគួរហៅអ្នកថាអ្វី?",
      s1Place: "ឧទាហរណ៍៖ ទ្រព្យសម្បត្តិរបស់សុខា",
      s2Title: "តើចំណូលប្រចាំខែរបស់អ្នកប៉ុន្មាន?",
      s2Label: "ប្រាក់ចំណូលជាមធ្យម ($)",
      s3Title: "តើអ្នកបើកប្រាក់ខែនៅថ្ងៃណា?",
      s3Label: "តើអ្នកទទួលបានប្រាក់ខែនៅថ្ងៃទីប៉ុន្មាននៃខែ?",
      s4Title: "ចំណាយចាំបាច់",
      s4Label: "ថ្លៃផ្ទះ ទឹកភ្លើង អាហារ (ប៉ាន់ស្មាន)",
      prev: "ត្រឡប់ក្រោយ",
      next: "បន្ទាប់",
      finish: "បញ្ចប់ & ចាប់ផ្តើម"
    }
  }[lang];

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const steps = [
    {
      title: t.s1Title,
      icon: <Target className="text-indigo-600" size={40} />,
      content: (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">{t.s1Label}</label>
          <input 
            type="text" 
            placeholder={t.s1Place}
            className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>
      )
    },
    {
      title: t.s2Title,
      icon: <Wallet className="text-emerald-600" size={40} />,
      content: (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">{t.s2Label}</label>
          <input 
            type="number" 
            placeholder="5000"
            className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.income || ''}
            onChange={(e) => setFormData({...formData, income: Number(e.target.value)})}
          />
        </div>
      )
    },
    {
      title: t.s3Title,
      icon: <Calendar className="text-blue-600" size={40} />,
      content: (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">{t.s3Label}</label>
          <input 
            type="range" 
            min="1" max="31"
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            value={formData.payday}
            onChange={(e) => setFormData({...formData, payday: Number(e.target.value)})}
          />
          <div className="text-center font-bold text-2xl text-indigo-600">{formData.payday}</div>
        </div>
      )
    },
    {
      title: t.s4Title,
      icon: <Calculator className="text-orange-600" size={40} />,
      content: (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">{t.s4Label}</label>
          <input 
            type="number" 
            placeholder="2500"
            className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.expenses || ''}
            onChange={(e) => setFormData({...formData, expenses: Number(e.target.value)})}
          />
        </div>
      )
    }
  ];

  const currentStepData = steps[step - 1];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-3xl shadow-xl w-full max-w-xl transition-colors">
        {/* Progress Bar */}
        <div className="flex space-x-2 mb-12">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 flex-1 rounded-full transition-all duration-500 ${i < step ? 'bg-indigo-600' : 'bg-slate-100 dark:bg-slate-700'}`} 
            />
          ))}
        </div>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">{currentStepData.icon}</div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{currentStepData.title}</h2>
        </div>

        <div className="mb-12">
          {currentStepData.content}
        </div>

        <div className="flex items-center justify-between">
          <button 
            disabled={step === 1}
            onClick={prevStep}
            className={`flex items-center font-semibold ${step === 1 ? 'opacity-0' : 'text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            <ArrowLeft className="mr-2" size={20} /> {t.prev}
          </button>
          
          {step < steps.length ? (
            <button 
              onClick={nextStep}
              className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all flex items-center shadow-lg shadow-indigo-100 dark:shadow-none"
            >
              {t.next} <ArrowRight className="ml-2" size={20} />
            </button>
          ) : (
            <button 
              onClick={() => onComplete(formData)}
              className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all flex items-center shadow-lg shadow-emerald-100 dark:shadow-none"
            >
              {t.finish} <ArrowRight className="ml-2" size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
