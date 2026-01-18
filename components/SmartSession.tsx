
import React, { useState, useEffect } from 'react';
import { User, ClassLevel, Board, Stream, Subject, Chapter, LessonContent } from '../types';
import { Search, Book, Video, FileText, CheckCircle, X, Loader2, ArrowRight } from 'lucide-react';
import { getSubjectsList, STATIC_SYLLABUS } from '../constants';
import { fetchChapters } from '../services/gemini';
import { getChapterData } from '../firebase'; // or wherever content is fetched

interface Props {
  user: User;
  onClose: () => void;
  onNavigateToContent: (content: LessonContent) => void;
  isOpen: boolean;
}

// Helper to clean and normalize search terms
const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

export const SmartSession: React.FC<Props> = ({ user, onClose, onNavigateToContent, isOpen }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{
    subject: Subject;
    chapter: Chapter;
    content: LessonContent[];
  }[]>([]);
  
  // Only valid for Class 9-12
  const allowedClasses: ClassLevel[] = ['9', '10', '11', '12'];
  const userClass = user.classLevel as ClassLevel;

  useEffect(() => {
    if (isOpen && !allowedClasses.includes(userClass)) {
       // Auto-close if not eligible (should be handled by parent too)
       // onClose(); 
    }
  }, [isOpen, userClass]);

  const handleDeepSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    setResults([]);

    const query = normalize(searchTerm);
    const foundResults: any[] = [];
    
    // 1. Get All Subjects for User's Class & Stream
    // Note: We search ALL streams for Class 11/12 to be thorough, or just user's stream?
    // User asked: "Science me hai ya Physics me ... ya Social Science me" -> Search EVERYTHING available for that Class.
    
    // For Class 11/12, we might want to search all streams if user didn't specify, 
    // but usually app is locked to user's stream. 
    // However, the prompt says "har ek jagah khojega...". 
    // Let's stick to User's Class. If 11/12, maybe check all 3 streams? 
    // Let's start with User's Stream + Common Subjects.
    
    const streamsToCheck: Stream[] = (userClass === '11' || userClass === '12') 
        ? ['Science', 'Commerce', 'Arts'] 
        : ['Science']; // Dummy for 9/10

    // Deduplicate subjects across streams
    const allSubjects = new Map<string, {subject: Subject, stream: Stream | null}>();

    if (userClass === '11' || userClass === '12') {
        streamsToCheck.forEach(stream => {
            getSubjectsList(userClass, stream).forEach(sub => {
                if (!allSubjects.has(sub.name)) {
                    allSubjects.set(sub.name, {subject: sub, stream});
                }
            });
        });
    } else {
        getSubjectsList(userClass, null).forEach(sub => {
            allSubjects.set(sub.name, {subject: sub, stream: null});
        });
    }

    // 2. Iterate Subjects & Chapters
    const board = user.board || 'CBSE';

    // This part can be heavy, so we do it carefully.
    // We primarily check STATIC_SYLLABUS first for Chapter Titles matching the Topic.
    // AND we check if we have Content Data stored for those chapters.

    const searchPromises = Array.from(allSubjects.values()).map(async ({subject, stream}) => {
        // A. Get Chapters (Try Cache/Static first)
        const chapters = await fetchChapters(board, userClass, stream, subject, 'English');
        
        // B. Filter Chapters matching Query
        const matchedChapters = chapters.filter(ch => normalize(ch.title).includes(query));

        // C. If Match Found, Fetch Content
        for (const ch of matchedChapters) {
            // Construct Key
            const streamKey = (userClass === '11' || userClass === '12') && stream ? `-${stream}` : '';
            const key = `nst_content_${board}_${userClass}${streamKey}_${subject.name}_${ch.id}`;
            
            // Try Local Storage First (Fastest)
            let data = null;
            const stored = localStorage.getItem(key);
            if (stored) {
                data = JSON.parse(stored);
            } else {
                // Try Cloud (Slower)
                data = await getChapterData(key);
            }

            if (data) {
                // Compile Available Content
                const contentList: LessonContent[] = [];
                
                // PDF
                if (data.freeLink || data.premiumLink || data.schoolPdfLink || data.competitionPdfLink) {
                    contentList.push({
                        id: `pdf-${ch.id}`,
                        title: "Notes / PDF",
                        subtitle: "Study Material",
                        type: 'PDF_VIEWER',
                        content: data.premiumLink || data.freeLink || data.schoolPdfLink || '',
                        dateCreated: new Date().toISOString(),
                        subjectName: subject.name
                    });
                }

                // Video
                const vids = data.schoolVideoPlaylist || data.videoPlaylist || [];
                if (vids.length > 0) {
                     contentList.push({
                        id: `vid-${ch.id}`,
                        title: "Video Lectures",
                        subtitle: `${vids.length} Videos`,
                        type: 'VIDEO_LECTURE',
                        content: '', // Playlist handled in viewer
                        dateCreated: new Date().toISOString(),
                        subjectName: subject.name,
                        videoPlaylist: vids // Pass playlist
                    });
                }

                // MCQs
                const mcqs = data.manualMcqData || [];
                if (mcqs.length > 0) {
                    contentList.push({
                        id: `mcq-${ch.id}`,
                        title: "Practice Test",
                        subtitle: `${mcqs.length} Questions`,
                        type: 'MCQ_SIMPLE',
                        content: '',
                        dateCreated: new Date().toISOString(),
                        subjectName: subject.name,
                        mcqData: mcqs
                    });
                }

                if (contentList.length > 0) {
                    foundResults.push({
                        subject,
                        chapter: ch,
                        content: contentList
                    });
                }
            }
        }
    });

    await Promise.all(searchPromises);
    setResults(foundResults);
    setIsSearching(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            
            {/* HEADER */}
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Search size={120} textAnchor="middle" /></div>
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-white mb-1">Smart Session Search</h2>
                        <p className="text-indigo-200 text-xs font-medium">Deep scan across all subjects for Class {userClass}</p>
                    </div>
                    <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* SEARCH BAR */}
                <div className="mt-6 relative">
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleDeepSearch()}
                        placeholder="Enter Topic (e.g., Trigonometry, Light, Democracy)..." 
                        className="w-full pl-12 pr-4 py-4 rounded-xl border-none outline-none shadow-xl text-slate-800 font-bold placeholder:font-normal placeholder:text-slate-400"
                    />
                    <Search className="absolute left-4 top-4 text-indigo-500" size={24} />
                    
                    {searchTerm && (
                        <button 
                            onClick={handleDeepSearch}
                            disabled={isSearching}
                            className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-4 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all flex items-center gap-2"
                        >
                            {isSearching ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                            Search
                        </button>
                    )}
                </div>
            </div>

            {/* RESULTS AREA */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                {isSearching && (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <Loader2 size={40} className="animate-spin mb-4 text-indigo-500" />
                        <p className="text-sm font-medium animate-pulse">Scanning Syllabus across all subjects...</p>
                    </div>
                )}

                {!isSearching && results.length === 0 && searchTerm && (
                    <div className="text-center py-12 text-slate-400">
                        <Book size={48} className="mx-auto mb-4 opacity-30" />
                        <p className="font-bold text-slate-600">No matching topics found.</p>
                        <p className="text-xs mt-2 max-w-xs mx-auto">Try a different keyword or check if the content has been uploaded for your class.</p>
                    </div>
                )}

                {!isSearching && results.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-700">Found {results.length} Matches</h3>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">Deep Scan Complete</span>
                        </div>

                        {results.map((res, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 animate-in slide-in-from-bottom-2" style={{animationDelay: `${idx * 100}ms`}}>
                                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-50">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                                        {res.subject.name.substring(0, 2)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-lg leading-none">{res.chapter.title}</h4>
                                        <p className="text-xs text-slate-500 mt-1">{res.subject.name} • Class {userClass}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {res.content.map((item, cIdx) => (
                                        <button 
                                            key={cIdx}
                                            onClick={() => {
                                                onNavigateToContent(item);
                                                onClose();
                                            }}
                                            className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all group text-left"
                                        >
                                            <div className={`p-2 rounded-lg ${
                                                item.type.includes('VIDEO') ? 'bg-red-100 text-red-600' : 
                                                item.type.includes('MCQ') ? 'bg-purple-100 text-purple-600' : 
                                                'bg-blue-100 text-blue-600'
                                            }`}>
                                                {item.type.includes('VIDEO') ? <Video size={18} /> : 
                                                 item.type.includes('MCQ') ? <CheckCircle size={18} /> : 
                                                 <FileText size={18} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-700 group-hover:text-indigo-600 transition-colors">{item.title}</p>
                                                <p className="text-[10px] text-slate-400">{item.subtitle}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FOOTER */}
            <div className="p-4 bg-white border-t border-slate-200 text-center">
                <p className="text-[10px] text-slate-400">
                    Smart Search scans Notes, Videos, and Tests available in the app database for your class.
                </p>
            </div>
        </div>
    </div>
  );
};
