import React, { useState } from 'react';
import { X, Sparkles, Zap, Crown, CheckCircle, Smartphone, Globe, Shield, BookOpen, MessageSquare, BrainCircuit, Search, Play, FileText, Gift, Trophy } from 'lucide-react';

interface Props {
    onClose: () => void;
}

export const FeaturesShowcase: React.FC<Props> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'FREE' | 'BASIC' | 'ULTRA'>('ULTRA');

    const features = {
        FREE: [
            { icon: Play, title: "Standard Video Lectures", desc: "Access to foundation building video content." },
            { icon: FileText, title: "Basic PDF Notes", desc: "Standard chapter notes for revision." },
            { icon: Search, title: "Smart Session Search", desc: "Deep search for topics across the syllabus." },
            { icon: MessageSquare, title: "Community Chat", desc: "Connect with other students in public groups." },
            { icon: Gift, title: "Daily Login Bonus", desc: "Get 3 Coins every day you log in." },
            { icon: Globe, title: "Universal Playlist", desc: "Access to free featured lectures." }
        ],
        BASIC: [
            { icon: Crown, title: "Everything in Free", desc: "Includes all Free tier features." },
            { icon: Zap, title: "Priority Support", desc: "Faster response from Admin support." },
            { icon: Gift, title: "10 Daily Coins", desc: "Tripled daily login reward (10 Coins)." },
            { icon: CheckCircle, title: "Unlimited MCQs", desc: "Practice without limits (Standard Mode)." },
            { icon: Shield, title: "Ad-Free Experience", desc: "No interruptions while studying." },
            { icon: BookOpen, title: "Premium PDF Access", desc: "Unlock detailed, high-quality notes." }
        ],
        ULTRA: [
            { icon: Sparkles, title: "Everything in Basic", desc: "Includes all Free & Basic features." },
            { icon: BrainCircuit, title: "AI Studio Access", desc: "Generate custom Notes & Tests with AI." },
            { icon: Gift, title: "20 Daily Coins", desc: "Maximum daily reward (20 Coins)." },
            { icon: Trophy, title: "Competition Mode", desc: "Unlock competitive exam study material." },
            { icon: Smartphone, title: "Download Offline", desc: "Save videos and notes for offline use." },
            { icon: MessageSquare, title: "Direct Admin DM", desc: "Private direct messaging with Admin." },
            { icon: Zap, title: "Early Access", desc: "Get new features before everyone else." }
        ]
    };

    return (
        <div className="fixed inset-0 z-[150] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95">
            <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={100} /></div>
                    <h2 className="text-2xl font-black text-white mb-2 relative z-10">Choose Your Power</h2>
                    <p className="text-slate-300 text-sm relative z-10">Unlock the full potential of your learning journey.</p>
                    
                    <button onClick={onClose} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors z-20">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-2 bg-slate-50 border-b border-slate-100">
                    <button onClick={() => setActiveTab('FREE')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${activeTab === 'FREE' ? 'bg-white shadow-md text-slate-600' : 'text-slate-400 hover:bg-slate-100'}`}>Free</button>
                    <button onClick={() => setActiveTab('BASIC')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${activeTab === 'BASIC' ? 'bg-blue-500 shadow-md text-white shadow-blue-200' : 'text-slate-400 hover:bg-slate-100'}`}>Basic</button>
                    <button onClick={() => setActiveTab('ULTRA')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${activeTab === 'ULTRA' ? 'bg-purple-600 shadow-md text-white shadow-purple-200' : 'text-slate-400 hover:bg-slate-100'}`}>Ultra</button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    <div className="space-y-4">
                        {features[activeTab].map((feat, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 animate-in slide-in-from-bottom-2" style={{animationDelay: `${idx * 50}ms`}}>
                                <div className={`p-3 rounded-xl shrink-0 ${activeTab === 'ULTRA' ? 'bg-purple-100 text-purple-600' : activeTab === 'BASIC' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                                    <feat.icon size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{feat.title}</h4>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{feat.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="p-6 bg-white border-t border-slate-100">
                    {activeTab === 'FREE' ? (
                        <button onClick={onClose} className="w-full py-4 bg-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-300 transition-colors">
                            Continue with Free
                        </button>
                    ) : (
                        <button onClick={() => { onClose(); /* Trigger Store Navigation via Parent if possible, or user navigates manually */ }} className={`w-full py-4 font-bold text-white rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-95 ${activeTab === 'ULTRA' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-200' : 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-blue-200'}`}>
                            Upgrade to {activeTab}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
