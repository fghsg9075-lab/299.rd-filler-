import React, { useState, useEffect } from 'react';
import { X, Crown, Star, Check, Sparkles, Zap, ChevronRight, Shield } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const ProfessionalStartupPopup: React.FC<Props> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'FREE' | 'BASIC' | 'ULTRA'>('ULTRA');
  const [timeLeft, setTimeLeft] = useState(9);
  const [canSkip, setCanSkip] = useState(false);

  // Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose(); // Auto close
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Enable skip after 5 seconds (Wait 5s, so at 9-5 = 4s left? No, "skip button after 5s")
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, 5000);

    // Carousel Auto-Rotate
    const rotateTimer = setInterval(() => {
      setActiveTab((prev) => {
        if (prev === 'ULTRA') return 'BASIC';
        if (prev === 'BASIC') return 'FREE';
        return 'ULTRA';
      });
    }, 3000); // Rotate every 3s

    return () => {
      clearInterval(timer);
      clearTimeout(skipTimer);
      clearInterval(rotateTimer);
    };
  }, [onClose]);

  const features = {
    FREE: [
      'Basic Subject Notes',
      'Limited Practice MCQs (50)',
      'Daily Login Bonus',
      'Community Chat (Limited)'
    ],
    BASIC: [
      'Everything in Free',
      'Full Chapter MCQs (100)',
      'Detailed MCQ Analysis',
      'Ad-Free Experience',
      'Priority Support'
    ],
    ULTRA: [
      'Everything in Basic',
      'Unlimited MCQs & Tests',
      'Deep Concept Videos (3D)',
      'Premium Notes (AI Studio)',
      'VIP Badge & Custom Profile',
      'Direct Mentor Access'
    ]
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="w-full max-w-sm mx-4 relative">
        
        {/* TIMER BAR */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 9) * 100}%` }}
          />
        </div>

        {/* MAIN CARD */}
        <div className="bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden mt-6">
          
          {/* HEADER */}
          <div className="p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 to-transparent" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4 animate-bounce">
                <Crown size={32} className="text-white" fill="white" />
              </div>
              <h2 className="text-2xl font-black text-white mb-1">Upgrade Your Learning</h2>
              <p className="text-slate-400 text-xs">Unlock your true potential today</p>
            </div>
          </div>

          {/* TABS (CAROUSEL INDICATORS) */}
          <div className="flex justify-center gap-2 mb-4">
            {(['FREE', 'BASIC', 'ULTRA'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                  activeTab === tab 
                    ? tab === 'ULTRA' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                    : tab === 'BASIC' ? 'bg-blue-600 text-white' 
                    : 'bg-slate-600 text-white'
                    : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* CONTENT AREA */}
          <div className="px-6 pb-6 min-h-[220px]">
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300" key={activeTab}>
               {/* BANNER */}
               <div className={`p-3 rounded-xl mb-4 flex items-center gap-3 border ${
                 activeTab === 'ULTRA' ? 'bg-purple-500/10 border-purple-500/30' :
                 activeTab === 'BASIC' ? 'bg-blue-500/10 border-blue-500/30' :
                 'bg-slate-800 border-slate-700'
               }`}>
                 <div className={`p-2 rounded-lg ${
                    activeTab === 'ULTRA' ? 'bg-purple-500 text-white' :
                    activeTab === 'BASIC' ? 'bg-blue-500 text-white' :
                    'bg-slate-600 text-slate-300'
                 }`}>
                    {activeTab === 'ULTRA' ? <Sparkles size={18} /> : activeTab === 'BASIC' ? <Zap size={18} /> : <Shield size={18} />}
                 </div>
                 <div>
                   <h3 className={`font-black text-sm ${
                      activeTab === 'ULTRA' ? 'text-purple-400' :
                      activeTab === 'BASIC' ? 'text-blue-400' :
                      'text-slate-400'
                   }`}>
                     {activeTab === 'ULTRA' ? 'ULTRA PREMIUM' : activeTab === 'BASIC' ? 'BASIC PRO' : 'FREE STARTER'}
                   </h3>
                   <p className="text-[10px] text-slate-500">
                     {activeTab === 'ULTRA' ? 'Best for Toppers' : activeTab === 'BASIC' ? 'Good for Practice' : 'Forever Free'}
                   </p>
                 </div>
               </div>

               {/* FEATURES */}
               <div className="space-y-2">
                 {features[activeTab].map((feat, i) => (
                   <div key={i} className="flex items-center gap-3">
                     <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        activeTab === 'ULTRA' ? 'bg-purple-500/20 text-purple-400' :
                        activeTab === 'BASIC' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-700 text-slate-400'
                     }`}>
                       <Check size={10} strokeWidth={4} />
                     </div>
                     <span className={`text-xs font-bold ${activeTab === 'FREE' ? 'text-slate-500' : 'text-slate-300'}`}>{feat}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="p-4 bg-slate-800/50 border-t border-slate-800 flex items-center justify-between gap-4">
            <button 
              onClick={onClose}
              disabled={!canSkip}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                canSkip ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-600 cursor-not-allowed'
              }`}
            >
              {canSkip ? 'Skip for now' : `Skip in ${Math.max(0, timeLeft - 4)}s`}
            </button>

            <button 
              onClick={() => { onClose(); /* Navigate to Store trigger handled by parent mostly or just close */ }}
              className="bg-white text-black px-6 py-3 rounded-xl font-black text-xs shadow-lg shadow-white/10 flex items-center gap-2 hover:scale-105 transition-transform"
            >
              Upgrade Now <ChevronRight size={14} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
