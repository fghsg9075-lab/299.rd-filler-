
import React from 'react';
import { X, Check, Star, Crown, Zap } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  freeFeatures: string[];
  premiumFeatures: string[];
  onUpgrade: () => void;
}

export const FeatureComparisonModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  freeFeatures, 
  premiumFeatures,
  onUpgrade 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Crown className="text-yellow-400" size={32} />
            <h2 className="text-2xl font-black">Upgrade to Ultra</h2>
          </div>
          <p className="text-blue-100 font-medium">Get unlimited access to premium learning materials.</p>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-2 gap-6">
          {/* Free Tier */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Star size={18} />
              <h3 className="font-bold uppercase tracking-wider text-xs">Free Access</h3>
            </div>
            <ul className="space-y-3">
              {freeFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-500">
                  <Check size={16} className="text-slate-300 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Premium Tier */}
          <div className="space-y-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-2 text-blue-600">
              <Zap size={18} fill="currentColor" />
              <h3 className="font-bold uppercase tracking-wider text-xs">Ultra Premium</h3>
            </div>
            <ul className="space-y-3">
              {premiumFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                  <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
          <button 
            onClick={onUpgrade}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black rounded-2xl shadow-lg shadow-blue-200 hover:scale-[1.02] transition-transform active:scale-95"
          >
            Get Ultra Access Now
          </button>
          <button 
            onClick={onClose}
            className="w-full py-2 text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};
