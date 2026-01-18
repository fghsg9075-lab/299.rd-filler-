
import React, { useState, useEffect, useRef } from 'react';
import { User, Role, SystemSettings } from '../types';
import { Send, MessageSquare, Shield, Users, X, Lock, Trash2, Check, CheckCheck, Coins, Clock } from 'lucide-react';
import { ref, push, onValue, query, limitToLast, serverTimestamp, remove } from 'firebase/database';
import { rtdb, saveUserToLive } from '../firebase';

interface Props {
    user: User;
    onClose: () => void;
    isAdmin?: boolean;
    targetUser?: User; // For Admin DM context
    roomId?: string; // Optional: For specific rooms if needed later
    roomName?: string;
    settings?: SystemSettings; // To get chat cost and cooldown
    onUpdateUser?: (u: User) => void;
}

interface ChatMessage {
    id: string;
    text: string;
    userId: string;
    userName: string;
    role: Role;
    timestamp: number; // Storing as number for easier sorting
}

export const UniversalSupport: React.FC<Props> = ({ user, onClose, isAdmin, targetUser, roomId, roomName }) => {
    const [activeTab, setActiveTab] = useState<'GLOBAL' | 'SUPPORT'>(isAdmin ? 'SUPPORT' : 'GLOBAL');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // COOLDOWN & COST LOGIC
    const chatCost = settings?.chatCost || 0;
    const cooldownSeconds = settings?.chatCooldown || 0; // NEW SETTING (need to add to types)
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (user.lastChatTime && !isAdmin) {
            const lastTime = new Date(user.lastChatTime).getTime();
            const now = Date.now();
            const diff = Math.floor((now - lastTime) / 1000);
            if (diff < cooldownSeconds) {
                setTimeLeft(cooldownSeconds - diff);
                const timer = setInterval(() => {
                    setTimeLeft(prev => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
                return () => clearInterval(timer);
            }
        }
    }, [user.lastChatTime, cooldownSeconds, isAdmin]);

    // Determine the Firebase path based on the context
    // 1. Specific Room (e.g., from a group)
    // 2. Global Community (Public)
    // 3. Support (Private DM: always `chat/dm/<STUDENT_ID>`)
    
    let chatPath = '';
    if (roomId) {
        chatPath = `chat/rooms/${roomId}`;
    } else if (activeTab === 'GLOBAL') {
        chatPath = 'chat/universal';
    } else {
        // SUPPORT MODE
        // If Admin is viewing, they need a target user. If no target, show nothing or selection (handled by parent usually)
        // If Student is viewing, it's their own ID.
        const dmId = isAdmin ? targetUser?.id : user.id;
        if (dmId) {
            chatPath = `chat/dm/${dmId}`;
        }
    }

    // LISTENER
    useEffect(() => {
        if (!chatPath) {
            setMessages([]);
            return;
        }

        const q = query(ref(rtdb, chatPath), limitToLast(50));
        const unsubscribe = onValue(q, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list = Object.entries(data).map(([k, v]: any) => ({
                    id: k,
                    ...v
                })).sort((a, b) => a.timestamp - b.timestamp);
                setMessages(list);
            } else {
                setMessages([]);
            }
        }, (error) => {
            console.error("Chat Listener Error:", error);
        });

        return () => unsubscribe();
    }, [chatPath]);

    // AUTO SCROLL
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !chatPath) return;
        
        // Cost & Cooldown Check for Students
        if (!isAdmin && user.role !== 'SUB_ADMIN') {
            if (timeLeft > 0) return; // Cooldown active

            if (activeTab === 'GLOBAL' && user.credits < chatCost) {
                alert(`Insufficient Credits! Need ${chatCost} Coins to send message.`);
                return;
            }
        }

        setIsSending(true);
        
        try {
            const msg = {
                text: input.trim(),
                userId: user.id || 'anonymous',
                userName: user.name || 'User',
                role: user.role || 'STUDENT',
                timestamp: serverTimestamp() // Use server timestamp for consistency
            };

            await push(ref(rtdb, chatPath), msg);
            
            // Deduct Credits & Update Cooldown (Only for Global/Public Chat)
            if (!isAdmin && activeTab === 'GLOBAL') {
                const updatedUser = { 
                    ...user, 
                    credits: user.credits - chatCost,
                    lastChatTime: new Date().toISOString()
                };
                // Sync Update
                if (onUpdateUser) onUpdateUser(updatedUser);
                saveUserToLive(updatedUser);
            }

            setInput('');
        } catch (e: any) {
            console.error("Chat Send Error:", e);
            alert("Failed to send message: " + (e.message || "Unknown error"));
        } finally {
            setIsSending(false);
        }
    };

    const handleDelete = async (msgId: string) => {
        if (!isAdmin || !chatPath) return;
        if (!confirm("Delete this message?")) return;
        try {
            await remove(ref(rtdb, `${chatPath}/${msgId}`));
        } catch (e) {
            console.error("Delete Error", e);
        }
    };

    const getRoleBadge = (role: Role) => {
        if (role === 'ADMIN') return <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded flex items-center gap-0.5"><Shield size={8} /> ADMIN</span>;
        if (role === 'SUB_ADMIN') return <span className="text-[10px] bg-purple-100 text-purple-600 px-1 rounded flex items-center gap-0.5"><Shield size={8} /> STAFF</span>;
        return null; // Students don't need a badge usually, or maybe 'STUDENT'
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-md h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
                
                {/* HEADER */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 flex items-center justify-between shadow-md z-10">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${roomId ? 'bg-indigo-500/20' : activeTab === 'GLOBAL' ? 'bg-blue-500/20' : 'bg-green-500/20'} backdrop-blur-sm border border-white/10`}>
                            {roomId ? <MessageSquare size={20} className="text-indigo-200" /> : activeTab === 'GLOBAL' ? <Users size={20} className="text-blue-200" /> : <Shield size={20} className="text-green-200" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-sm leading-tight">
                                {roomId ? roomName : activeTab === 'GLOBAL' ? 'Community Chat' : isAdmin ? `Chat: ${targetUser?.name}` : 'Support & Help'}
                            </h3>
                            <p className="text-[10px] text-slate-400">
                                {roomId ? 'Group Discussion' : activeTab === 'GLOBAL' ? 'Public Global Channel' : 'Direct Line to Admin'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* TABS (If not in a specific room & not Admin looking at specific user) */}
                {!roomId && !(isAdmin && targetUser) && (
                    <div className="flex p-2 bg-slate-50 border-b border-slate-100">
                        <button 
                            onClick={() => setActiveTab('GLOBAL')} 
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'GLOBAL' ? 'bg-white shadow-sm text-blue-600 border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            <Users size={14} /> Community
                        </button>
                        <button 
                            onClick={() => setActiveTab('SUPPORT')} 
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'SUPPORT' ? 'bg-white shadow-sm text-green-600 border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            <Shield size={14} /> Support
                        </button>
                    </div>
                )}

                {/* MESSAGES AREA */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 relative">
                    {/* Watermark/Empty State */}
                    {messages.length === 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 pointer-events-none">
                            <MessageSquare size={64} className="mb-4 opacity-20" />
                            <p className="text-xs font-bold opacity-50">No messages yet. Start the conversation!</p>
                        </div>
                    )}

                    {messages.map((msg) => {
                        const isMe = msg.userId === user.id;
                        const isAdminMsg = msg.role === 'ADMIN';
                        const isSubAdminMsg = msg.role === 'SUB_ADMIN';
                        const isStaff = isAdminMsg || isSubAdminMsg;

                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm relative ${
                                    isMe 
                                        ? 'bg-blue-600 text-white rounded-tr-none' 
                                        : isStaff
                                            ? 'bg-slate-800 text-white rounded-tl-none border border-amber-500/30'
                                            : 'bg-white text-slate-700 rounded-tl-none border border-slate-200'
                                }`}>
                                    {/* Sender Info (Only if not me) */}
                                    {!isMe && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold ${isStaff ? 'text-amber-400' : 'text-slate-500'}`}>
                                                {msg.userName}
                                            </span>
                                            {getRoleBadge(msg.role)}
                                        </div>
                                    )}
                                    
                                    {/* Message Text */}
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                    
                                    {/* Timestamp */}
                                    <div className={`text-[9px] mt-1 text-right opacity-70 flex justify-end gap-1 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Sending...'}
                                        {isMe && <CheckCheck size={10} />}
                                    </div>
                                </div>
                                
                                {/* Admin Delete Action */}
                                {isAdmin && (
                                    <button 
                                        onClick={() => handleDelete(msg.id)} 
                                        className={`opacity-0 group-hover:opacity-100 transition-opacity text-xs text-red-400 hover:text-red-600 mt-1 px-2 flex items-center gap-1`}
                                    >
                                        <Trash2 size={10} /> Delete
                                    </button>
                                )}
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* INPUT AREA */}
                <div className="p-3 bg-white border-t border-slate-200 z-10">
                    {/* Cost/Cooldown Status */}
                    {!isAdmin && activeTab === 'GLOBAL' && (
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2 px-2">
                             <span className="flex items-center gap-1">
                                 <Coins size={10} className={user.credits < chatCost ? 'text-red-500' : 'text-slate-400'} /> 
                                 Cost: <span className="font-bold">{chatCost} Coins</span>
                             </span>
                             {timeLeft > 0 && (
                                 <span className="flex items-center gap-1 text-orange-500 font-bold">
                                     <Clock size={10} /> Wait {timeLeft}s
                                 </span>
                             )}
                        </div>
                    )}
                    
                    <div className="flex items-end gap-2">
                        <textarea 
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder={activeTab === 'SUPPORT' ? "Message Support..." : timeLeft > 0 ? `Wait ${timeLeft}s...` : "Type a message..."}
                            disabled={(!isAdmin && timeLeft > 0) || isSending}
                            className="flex-1 bg-slate-100 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none max-h-32 min-h-[48px] disabled:opacity-70"
                            rows={1}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!input.trim() || isSending || (!isAdmin && timeLeft > 0) || (!isAdmin && activeTab === 'GLOBAL' && user.credits < chatCost)}
                            className={`p-3 rounded-xl transition-all flex items-center justify-center ${
                                input.trim() && !isSending && (isAdmin || timeLeft === 0)
                                    ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:scale-105 active:scale-95' 
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            {isSending ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <Send size={20} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
