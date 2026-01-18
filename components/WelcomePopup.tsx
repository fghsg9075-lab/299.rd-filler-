
import React from 'react';
import { BrainCircuit, CheckCircle, X, Crown, Zap, Sparkles } from 'lucide-react';

interface Props {
  onStart: () => void;
  isResume: boolean;
  title?: string;
  message?: string;
  footerText?: string;
}

export const WelcomePopup: React.FC<Props> = ({ onStart, isResume, title, message, footerText }) => {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-500">
       <div className="flex min-h-full items-center justify-center p-4">
       <div className="relative w-full max-w-4xl bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row md:max-h-[90vh]">
           
           {/* LEFT: FREE PLAN */}
           <div className="flex-1 p-8 bg-slate-50 flex flex-col border-r border-slate-100">
               <div className="text-center mb-6">
                   <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500">
                       <Zap size={32} />
                   </div>
                   <h3 className="text-2xl font-black text-slate-800">Free Account</h3>
                   <p className="text-sm text-slate-500 font-medium">Basic Access for Everyone</p>
               </div>

               <div className="flex-1 space-y-4 md:overflow-y-auto pr-2 custom-scrollbar">
                   {[
                       'Study Dashboard Access',
                       'Daily Practice MCQs (Limit)',
                       'Basic Chapter Notes',
                       'Public Chat Room',
                       'Daily Spin Wheel (2x)',
                       'Profile Customization',
                       'Leaderboard Access',
                       'Subject Syllabus View'
                   ].map((feat, i) => (
                       <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
                           <CheckCircle size={18} className="text-slate-400 shrink-0" />
                           <span>{feat}</span>
                       </div>
                   ))}
                   {[
                       'Deep Concept Videos',
                       'Premium AI Studio',
                       'Weekly Mock Tests',
                       'Unlimited Downloads'
                   ].map((feat, i) => (
                       <div key={`no-${i}`} className="flex items-center gap-3 text-sm text-slate-400 opacity-60">
                           <X size={18} className="shrink-0" />
                           <span>{feat}</span>
                       </div>
                   ))}
               </div>
           </div>

           {/* RIGHT: PREMIUM PLAN (HIGHLIGHTED) */}
           <div className="flex-1 p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white flex flex-col relative overflow-hidden">
               {/* Background FX */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
               
               <div className="text-center mb-6 relative z-10">
                   <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-orange-500/30 animate-bounce-slow">
                       <Crown size={32} />
                   </div>
                   <h3 className="text-2xl font-black text-white flex items-center justify-center gap-2">
                       Ultra Premium <Sparkles size={18} className="text-yellow-400" />
                   </h3>
                   <p className="text-sm text-blue-200 font-medium">Unlock Your Full Potential</p>
               </div>

               <div className="flex-1 space-y-4 md:overflow-y-auto pr-2 custom-scrollbar relative z-10">
                   {[
                       'Everything in Free Plan',
                       'Unlimited AI Studio Generation',
                       'Full HD Video Lectures',
                       'Detailed Premium Notes',
                       'Weekly Test Series 2.0',
                       'Daily Challenges 2.0',
                       'Unlimited Spin Wheel',
                       'Offline Downloads',
                       'Priority Teacher Support',
                       'No Ads Experience'
                   ].map((feat, i) => (
                       <div key={i} className="flex items-center gap-3 text-sm text-white font-medium">
                           <div className="bg-green-500/20 p-1 rounded-full text-green-400">
                               <CheckCircle size={14} />
                           </div>
                           <span>{feat}</span>
                       </div>
                   ))}
               </div>

               <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                   <button 
                       onClick={onStart}
                       className="w-full py-4 bg-white text-blue-900 font-black rounded-xl shadow-lg shadow-white/10 hover:bg-blue-50 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                   >
                       {isResume ? "Continue Learning" : "Get Started Now"} 
                       <span className="group-hover:translate-x-1 transition-transform">→</span>
                   </button>
                   <p className="text-[10px] text-center text-blue-300 mt-3 opacity-60">
                       {footerText || "Join thousands of students achieving their dreams."}
                   </p>
               </div>
           </div>

       </div>
       </div>
    </div>
  );
};
