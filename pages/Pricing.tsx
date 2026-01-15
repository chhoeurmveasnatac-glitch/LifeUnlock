
import React, { useState } from 'react';
import { SubscriptionTier, UserProfile, Plan } from '../types';
import { Check, Zap, Crown, Rocket, X, CreditCard, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface Props {
  plans: Plan[];
  currentTier: SubscriptionTier;
  profile: UserProfile | null;
  onUpgrade: (tier: SubscriptionTier) => void;
  lang: 'EN' | 'KH';
}

const Pricing: React.FC<Props> = ({ plans, currentTier, profile, onUpgrade, lang }) => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlanData, setSelectedPlanData] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const t: Record<string, any> = {
    EN: {
      title: "Choose Your Plan",
      desc: "Scale your financial system as you grow. Start for free and upgrade when you're ready for total financial automation.",
      starter: "Starter",
      pro: "Pro Monthly",
      lifetime: "Lifetime",
      free: "Free",
      monthly: "$9.99/mo",
      once: "$99 once",
      current: "Current Plan",
      select: "Select Plan",
      bestValue: "Best Value",
      checkoutTitle: "Secure Checkout",
      confirmPlan: "Confirming Plan:",
      price: "Price:",
      emailLabel: "Email Receipt To",
      emailPlace: "you@example.com",
      payBtn: "Confirm & Pay",
      processing: "Processing...",
      successTitle: "Payment Successful!",
      successDesc: "Your plan has been upgraded. Unlocking features now...",
      f1: "3 Active Goals",
      f2: "2 Automation Rules",
      f3: "Bucket System Basics",
      f4: "Standard Analytics",
      f5: "Manual CSV Import",
      p1: "Unlimited Goals",
      p2: "Unlimited Smart Rules",
      p3: "AI Advisory Access",
      p4: "Recurring Bill Tracking",
      p5: "Scenario Simulator",
      p6: "PDF/CSV Exports",
      l1: "All Pro Features Forever",
      l2: "Exclusive Themes",
      l3: "Goal Templates Library",
      l4: "Early Feature Access",
      l5: "Priority Support"
    },
    KH: {
      title: "ជ្រើសរើសគម្រោង",
      desc: "ពង្រីកប្រព័ន្ធហិរញ្ញវត្ថុរបស់អ្នក។ ចាប់ផ្តើមដោយឥតគិតថ្លៃ ហើយដំឡើងកម្រិតនៅពេលអ្នកត្រៀមខ្លួនសម្រាប់ស្វ័យប្រវត្តិកម្មពេញលេញ។",
      starter: "ចាប់ផ្តើម",
      pro: "Pro ប្រចាំខែ",
      lifetime: "មួយជីវិត",
      free: "ឥតគិតថ្លៃ",
      monthly: "$9.99/ខែ",
      once: "$99 ម្តង",
      current: "គម្រោងបច្ចុប្បន្ន",
      select: "ជ្រើសរើស",
      bestValue: "តម្លៃល្អបំផុត",
      checkoutTitle: "ការទូទាត់ដែលមានសុវត្ថិភាព",
      confirmPlan: "បញ្ជាក់គម្រោង៖",
      price: "តម្លៃ៖",
      emailLabel: "អ៊ីមែលសម្រាប់វិក្កយបត្រ",
      emailPlace: "you@example.com",
      payBtn: "បញ្ជាក់ & បង់ប្រាក់",
      processing: "កំពុងដំណើរការ...",
      successTitle: "ការទូទាត់ជោគជ័យ!",
      successDesc: "គម្រោងរបស់អ្នកត្រូវបានតម្លើង។ កំពុងដោះសោមុខងារ...",
      f1: "គោលដៅសកម្ម ៣",
      f2: "ច្បាប់ស្វ័យប្រវត្តិ ២",
      f3: "មូលដ្ឋានប្រព័ន្ធកញ្ចប់ថវិកា",
      f4: "ការវិភាគស្តង់ដារ",
      f5: "នាំចូល CSV ដោយដៃ",
      p1: "គោលដៅមិនកំណត់",
      p2: "ច្បាប់ឆ្លាតវៃមិនកំណត់",
      p3: "ការចូលប្រើទីប្រឹក្សា AI",
      p4: "តាមដានវិក្កយបត្រកើតឡើងដដែលៗ",
      p5: "ការក្លែងធ្វើសេណារីយ៉ូ",
      p6: "នាំចេញ PDF/CSV",
      l1: "មុខងារ Pro ទាំងអស់ជារៀងរហូត",
      l2: "រចនាប័ទ្មផ្តាច់មុខ",
      l3: "បណ្ណាល័យគំរូគោលដៅ",
      l4: "ការចូលប្រើមុខងារថ្មីមុនគេ",
      l5: "ជំនួយអាទិភាព"
    }
  }[lang];

  const getIcon = (key: string) => {
    switch(key) {
      case 'rocket': return <Rocket size={32} />;
      case 'zap': return <Zap size={32} />;
      case 'crown': return <Crown size={32} />;
      default: return <Rocket size={32} />;
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    if (plan.id === 'STARTER') {
      onUpgrade('STARTER');
      return;
    }
    setSelectedPlanData(plan);
    setIsCheckoutOpen(true);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !selectedPlanData) return;
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from('orders')
        .insert([
          {
            user_name: profile?.name || 'Guest User',
            email: email,
            plan_name: t[selectedPlanData.nameKey] || selectedPlanData.nameKey,
            price: selectedPlanData.rawPrice,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      setSuccess(true);
      
      setTimeout(() => {
        onUpgrade(selectedPlanData.id);
        setIsCheckoutOpen(false);
        setSuccess(false);
        setEmail('');
      }, 2500);

    } catch (error: any) {
      console.error('Checkout error:', error);
      alert('Checkout failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12 relative">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">{t.title}</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          {t.desc}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`
              relative flex flex-col p-8 bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-300
              ${plan.isPopular 
                ? 'border-indigo-600 shadow-xl scale-105 z-10' 
                : 'border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md'}
            `}
          >
            {plan.isPopular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                {t.bestValue}
              </div>
            )}

            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 
              ${plan.color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 
                plan.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              {getIcon(plan.iconKey)}
            </div>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t[plan.nameKey] || plan.nameKey}</h3>
            <div className="mb-8">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">{t[plan.priceKey] || plan.priceKey}</span>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((featureKey, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="w-5 h-5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={4} />
                  </div>
                  <span>{t[featureKey] || featureKey}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleSelectPlan(plan)}
              disabled={currentTier === plan.id}
              className={`
                w-full py-4 rounded-2xl font-bold transition-all
                ${currentTier === plan.id 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-default' 
                  : plan.isPopular 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none' 
                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'}
              `}
            >
              {currentTier === plan.id ? t.current : t.select}
            </button>
          </div>
        ))}
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && selectedPlanData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
            {success ? (
              <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center animate-bounce">
                  <Check size={40} strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t.successTitle}</h3>
                <p className="text-slate-500 dark:text-slate-400">{t.successDesc}</p>
              </div>
            ) : (
              <>
                <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CreditCard size={20} className="text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.checkoutTitle}</h3>
                  </div>
                  <button onClick={() => setIsCheckoutOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>
                
                <form onSubmit={handlePayment} className="p-8 space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-1 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">{t.confirmPlan}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{t[selectedPlanData.nameKey] || selectedPlanData.nameKey}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{t.price}</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{t[selectedPlanData.priceKey] || selectedPlanData.priceKey}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.emailLabel}</label>
                    <input 
                      type="email" 
                      required
                      placeholder={t.emailPlace}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 dark:shadow-none flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>{t.processing}</span>
                      </>
                    ) : (
                      <span>{t.payBtn}</span>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;
