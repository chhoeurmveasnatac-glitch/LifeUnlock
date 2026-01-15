
import React from 'react';
import { Target, CheckCircle2, TrendingUp, ShieldCheck, ArrowRight, Languages, Sun, Moon } from 'lucide-react';

interface Props {
  onGetStarted: () => void;
  lang: 'EN' | 'KH';
  toggleLang: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Landing: React.FC<Props> = ({ onGetStarted, lang, toggleLang, theme, toggleTheme }) => {
  const t = {
    heroTitle1: lang === 'EN' ? "Unlock Your Life's" : "ដោះសោសក្តានុពល",
    heroTitle2: lang === 'EN' ? "Financial Potential" : "ហិរញ្ញវត្ថុរបស់អ្នក",
    heroDesc: lang === 'EN' ? "Stop guessing where your money goes. Use the bucket system to automate your savings, crush your life goals, and see your progress in real-time." : "ឈប់ស្មានថាប្រាក់របស់អ្នកចំណាយទៅណា។ ប្រើប្រព័ន្ធកញ្ចប់ថវិកាដើម្បីសន្សំប្រាក់ដោយស្វ័យប្រវត្តិ សម្រេចគោលដៅជីវិតរបស់អ្នក និងមើលការរីកចម្រើនក្នុងពេលជាក់ស្តែង។",
    ctaStart: lang === 'EN' ? "Start Your Plan for Free" : "ចាប់ផ្តើមគម្រោងឥតគិតថ្លៃ",
    ctaDemo: lang === 'EN' ? "Watch Demo" : "មើលការបង្ហាញ",
    featTitle1: lang === 'EN' ? "Goal Centric" : "ផ្តោតលើគោលដៅ",
    featDesc1: lang === 'EN' ? "Every dollar is tied to a life milestone. Car, House, Education – we track it all." : "រាល់ដុល្លារដែលសន្សំបានគឺផ្សារភ្ជាប់ទៅនឹងគោលដៅជីវិត។ ឡាន ផ្ទះ ការសិក្សា - យើងតាមដានទាំងអស់។",
    featTitle2: lang === 'EN' ? "Smart Rules" : "ច្បាប់ឆ្លាតវៃ",
    featDesc2: lang === 'EN' ? "Automate your income distribution. Set it once, and watch your buckets fill up." : "បែងចែកប្រាក់ចំណូលដោយស្វ័យប្រវត្តិ។ កំណត់តែម្តង ហើយមើលកញ្ចប់ថវិការបស់អ្នកកើនឡើង។",
    featTitle3: lang === 'EN' ? "Emergency Guard" : "ការការពារបន្ទាន់",
    featDesc3: lang === 'EN' ? "Prioritize safety with automated emergency fund guarding. Peace of mind built-in." : "ផ្តល់អាទិភាពដល់សុវត្ថិភាពជាមួយនឹងការការពារមូលនិធិបន្ទាន់។ ផ្តល់ភាពស្ងប់ចិត្តដល់អ្នក។",
  };

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen transition-colors duration-300">
      {/* Top Navbar for Landing */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Target size={24} />
          </div>
          <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">LifeUnlock</span>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleTheme}
            className="p-3 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="text-amber-400" />}
          </button>
          <button 
            onClick={toggleLang}
            className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl text-sm"
          >
            {lang === 'EN' ? 'KH' : 'EN'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
            {t.heroTitle1} <br />
            <span className="text-indigo-600 dark:text-indigo-500">{t.heroTitle2}</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            {t.heroDesc}
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center shadow-lg shadow-indigo-100 dark:shadow-none"
            >
              {t.ctaStart} <ArrowRight className="ml-2" size={20} />
            </button>
            
            <button 
              onClick={toggleLang}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all flex items-center justify-center border-2 border-indigo-100 dark:border-indigo-900/50"
            >
              <Languages size={20} className="mr-2" />
              {lang === 'EN' ? 'Switch to Khmer' : 'ប្តូរទៅជាភាសាអង់គ្លេស'}
            </button>

            <button className="w-full sm:w-auto px-8 py-4 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-all">
              {t.ctaDemo}
            </button>
          </div>
        </div>
        
        {/* Preview Image Placeholder */}
        <div className="mt-20 relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-50 dark:border-slate-800 max-w-5xl mx-auto">
          <img 
            src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=1200&h=600" 
            alt="Dashboard Preview" 
            className="w-full h-auto object-cover opacity-90 grayscale-[20%] dark:grayscale-[50%]"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-indigo-900/10 dark:bg-indigo-900/20 backdrop-blur-[2px]">
            <div className="bg-white/95 dark:bg-slate-900/95 p-8 rounded-2xl shadow-2xl max-w-sm transform -rotate-2 hover:rotate-0 transition-transform duration-500 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                  <TrendingUp />
                </div>
                <h3 className="font-bold text-xl dark:text-white">{lang === 'EN' ? 'Goal: New Home' : 'គោលដៅ: ផ្ទះថ្មី'}</h3>
              </div>
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-2 overflow-hidden">
                <div className="h-full bg-emerald-500 w-3/4 animate-pulse"></div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">75% {lang === 'EN' ? 'Achieved' : 'សម្រេចបាន'} • 14 {lang === 'EN' ? 'Months Ahead' : 'ខែទៀត'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-slate-50 dark:bg-slate-900/50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="p-10 bg-white dark:bg-slate-900 rounded-3xl shadow-sm hover:shadow-xl dark:hover:shadow-indigo-900/10 transition-shadow border border-slate-100 dark:border-slate-800 group">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Target size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">{t.featTitle1}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t.featDesc1}</p>
            </div>
            <div className="p-10 bg-white dark:bg-slate-900 rounded-3xl shadow-sm hover:shadow-xl dark:hover:shadow-indigo-900/10 transition-shadow border border-slate-100 dark:border-slate-800 group">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">{t.featTitle2}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t.featDesc2}</p>
            </div>
            <div className="p-10 bg-white dark:bg-slate-900 rounded-3xl shadow-sm hover:shadow-xl dark:hover:shadow-indigo-900/10 transition-shadow border border-slate-100 dark:border-slate-800 group">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">{t.featTitle3}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t.featDesc3}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
