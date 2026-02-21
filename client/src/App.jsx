import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Code, Moon, Sun, Play, Pause, RotateCcw, ChevronRight, ChevronLeft, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ArrayVisualizer from './components/ArrayVisualizer';
import TreeVisualizer from './components/TreeVisualizer';
import ListVisualizer from './components/ListVisualizer';
import QueueVisualizer from './components/QueueVisualizer';
import StackVisualizer from './components/StackVisualizer';
import GraphVisualizer from './components/GraphVisualizer';
import MapVisualizer from './components/MapVisualizer';
import RecursionVisualizer from './components/RecursionVisualizer';
import CodePanel from './components/CodeModal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function App() {
    const [query, setQuery] = useState('');
    const [isDark, setIsDark] = useState(true);
    const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hello! I can help you visualize DSA concepts. Try asking "Explain bubble sort in detail".' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Visualization State
    const [vizData, setVizData] = useState(null);
    const [codeContent, setCodeContent] = useState('');
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const playbackRef = useRef(null);

    const chatEndRef = useRef(null);

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isPlaying && vizData && currentStep < vizData.steps.length - 1) {
            playbackRef.current = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 800);
        } else if (currentStep >= (vizData?.steps.length || 0) - 1) {
            setIsPlaying(false);
        }
        return () => clearTimeout(playbackRef.current);
    }, [isPlaying, currentStep, vizData]);

    const handleNewChat = () => {
        setMessages([
            { role: 'assistant', text: 'Hello! I can help you visualize DSA concepts. Try asking "Explain bubble sort in detail".' }
        ]);
        setVizData(null);
        setCodeContent('');
        setCurrentStep(0);
        setIsPlaying(false);
        setQuery('');
    };

    const handleSend = async () => {
        if (!query.trim()) return;

        const userMsg = { role: 'user', text: query };
        const currentHistory = [...messages];
        setMessages(prev => [...prev, userMsg]);
        setQuery('');
        setIsLoading(true);

        setIsPlaying(false);
        setError(null);

        try {
            const apiBase = import.meta.env.VITE_API_URL || '';
            const response = await axios.post(`${apiBase}/api/process-query`, {
                query,
                history: currentHistory.slice(-5)
            });
            const data = response.data;

            if (data.visualization && data.visualization.steps) {
                setVizData(data.visualization);
                setCodeContent(data.code || '');
                setCurrentStep(0);
            } else {
                setVizData(null);
                setCodeContent('');
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                text: data.message || "I've updated the visualization for you.",
                fullResponse: JSON.stringify(data)
            }]);

        } catch (error) {
            console.error('Error processing query:', error);
            setVizData(null);
            setError("Failed to process your request. Please try again.");
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: "Sorry, I encountered an error processing your request. Please try a more specific question."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const currentVizStep = vizData?.steps[currentStep] || null;

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
            {/* Sidebar for Chat */}
            <aside className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 shadow-xl z-10">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col space-y-3">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                            AlgoVision AI
                        </h1>
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>

                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                    >
                        <Plus size={16} />
                        <span>New Chat</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] p-4 rounded-2xl shadow-md transition-all ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
                                }`}>
                                <div className={`prose prose-sm dark:prose-invert max-w-none ${msg.role === 'user' ? 'text-white' : ''}`}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 flex space-x-1">
                                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="relative">
                        <textarea
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                            placeholder="Ask about an algorithm..."
                            className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                            rows="2"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading}
                            className="absolute right-3 bottom-3 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Visualization Area */}
            <main className="flex-1 relative flex flex-col items-center justify-start p-6">
                <div className="absolute top-4 right-4 space-x-2 z-20">
                    <button
                        onClick={() => setIsCodeModalOpen(true)}
                        disabled={!codeContent}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        <Code size={14} />
                        <span>VIEW CODE</span>
                    </button>
                </div>

                <div className="w-full max-w-6xl h-full flex flex-col">
                    <AnimatePresence mode="wait">
                        {vizData ? (
                            <motion.div
                                key="viz-panel"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="w-full flex-1 flex flex-col relative"
                            >
                                {/* Title at Top */}
                                <div className="w-full text-center py-2 border-b border-slate-100 dark:border-slate-800/50 mb-2">
                                    <div className="flex items-center justify-center space-x-3">
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white">{vizData.title}</h2>
                                        <div className="flex space-x-3 text-[10px] font-black uppercase tracking-widest text-blue-500 opacity-80">
                                            <span>Time: {vizData.timeComplexity}</span>
                                            <span>Space: {vizData.spaceComplexity}</span>
                                        </div>
                                    </div>
                                    <p className="text-slate-500 text-xs mt-1">{vizData.description}</p>
                                </div>

                                {/* Main Visualizer Content */}
                                <div className="flex-[2] w-full max-h-[55vh] bg-white dark:bg-slate-900/40 rounded-[3rem] p-4 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-x-auto overflow-y-hidden flex items-center justify-center relative scrollbar-hide">
                                    <AnimatePresence>
                                        {isLoading && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md z-30 flex flex-col items-center justify-center space-y-4"
                                            >
                                                <div className="flex space-x-2">
                                                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-3 h-3 bg-blue-500 rounded-full" />
                                                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-3 h-3 bg-blue-500 rounded-full" />
                                                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-3 h-3 bg-blue-500 rounded-full" />
                                                </div>
                                                <span className="text-sm font-black uppercase tracking-tighter text-blue-500">Preparing Next Example...</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {vizData.type === 'array' && (
                                        <ArrayVisualizer
                                            data={currentVizStep?.state || []}
                                            activeIndices={currentVizStep?.activeIndices || []}
                                            pivotIndex={currentVizStep?.pivotIndex}
                                        />
                                    )}
                                    {vizData.type === 'tree' && (
                                        <TreeVisualizer
                                            nodes={currentVizStep?.nodes}
                                            activeNodeId={currentVizStep?.activeNodeId}
                                        />
                                    )}
                                    {vizData.type === 'linked-list' && (
                                        <ListVisualizer
                                            nodes={currentVizStep?.nodes}
                                            activeNodeId={currentVizStep?.activeNodeId}
                                        />
                                    )}
                                    {vizData.type === 'queue' && (
                                        <QueueVisualizer
                                            data={currentVizStep?.state}
                                            headIndex={currentVizStep?.headIndex}
                                            tailIndex={currentVizStep?.tailIndex}
                                        />
                                    )}
                                    {vizData.type === 'stack' && (
                                        <StackVisualizer
                                            data={currentVizStep?.state}
                                            action={currentVizStep?.action}
                                        />
                                    )}
                                    {vizData.type === 'graph' && (
                                        <GraphVisualizer
                                            nodes={currentVizStep?.nodes}
                                            edges={currentVizStep?.edges}
                                            activeNodeId={currentVizStep?.activeNodeId}
                                        />
                                    )}
                                    {vizData.type === 'hashmap' && (
                                        <MapVisualizer
                                            entries={currentVizStep?.entries}
                                            size={currentVizStep?.size}
                                        />
                                    )}
                                    {vizData.type === 'recursion' && (
                                        <RecursionVisualizer
                                            stack={currentVizStep?.stack}
                                        />
                                    )}
                                    {(vizData.type === 'heap' || vizData.type === 'priority-queue') && (
                                        <TreeVisualizer
                                            nodes={currentVizStep?.nodes}
                                            activeNodeId={currentVizStep?.activeNodeId}
                                        />
                                    )}
                                </div>

                                {/* Controls at Bottom */}
                                <div className="w-full h-32 flex flex-col items-center justify-end space-y-2 pb-2">
                                    <div className="flex items-center space-x-8">
                                        <button
                                            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                                            className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-md hover:shadow-lg hover:scale-110 transition-all border border-slate-100 dark:border-slate-700 disabled:opacity-30"
                                            disabled={currentStep === 0}
                                        >
                                            <ChevronLeft size={24} className="text-blue-500" />
                                        </button>

                                        <button
                                            onClick={() => setIsPlaying(!isPlaying)}
                                            className="w-16 h-16 rounded-full bg-blue-600 text-white shadow-2xl hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all flex items-center justify-center group border-4 border-white dark:border-slate-800"
                                        >
                                            {isPlaying ?
                                                <Pause size={30} className="text-white fill-white" strokeWidth={4} /> :
                                                <Play size={30} className="text-white fill-white ml-1" strokeWidth={2} />
                                            }
                                        </button>

                                        <button
                                            onClick={() => setCurrentStep(Math.min((vizData?.steps.length || 1) - 1, currentStep + 1))}
                                            className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-md hover:shadow-lg hover:scale-110 transition-all border border-slate-100 dark:border-slate-700 disabled:opacity-30"
                                            disabled={currentStep >= (vizData?.steps.length || 1) - 1}
                                        >
                                            <ChevronRight size={24} className="text-blue-500" />
                                        </button>

                                        <button
                                            onClick={() => {
                                                setCurrentStep(0);
                                                setIsPlaying(false);
                                            }}
                                            className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-sm hover:shadow-md hover:scale-110 transition-all border border-slate-100 dark:border-slate-700"
                                        >
                                            <RotateCcw size={20} className="text-slate-400" />
                                        </button>
                                    </div>

                                    {/* Progress & Description Container */}
                                    <div className="w-full max-w-2xl px-8 flex flex-col items-center space-y-4">
                                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden shadow-inner">
                                            <motion.div
                                                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full"
                                                initial={false}
                                                animate={{ width: `${(currentStep / (vizData.steps.length - 1)) * 100}%` }}
                                            />
                                        </div>
                                        <div className="min-h-[40px] text-center">
                                            <AnimatePresence mode="wait">
                                                <motion.p
                                                    key={currentStep}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="text-lg font-bold text-slate-700 dark:text-slate-300"
                                                >
                                                    {currentVizStep?.description || "Ready to start"}
                                                </motion.p>
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty-state"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
                            >
                                <div className="w-32 h-32 bg-blue-100 dark:bg-blue-900/20 rounded-[2.5rem] flex items-center justify-center shadow-inner">
                                    <Search size={56} className="text-blue-500" />
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black mb-4">Visualize Concepts</h2>
                                    {error ? (
                                        <div className="p-6 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl max-w-md mx-auto">
                                            <p className="text-red-600 dark:text-red-400 font-bold mb-2">Something went wrong</p>
                                            <p className="text-red-500 dark:text-red-300 text-sm">
                                                {error}
                                            </p>
                                            <button
                                                onClick={() => setError(null)}
                                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-slate-500 max-w-md text-lg mx-auto">
                                            Ask me about any DSA concept to see interactive animations and production-ready code.
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <CodePanel
                isOpen={isCodeModalOpen}
                onClose={() => setIsCodeModalOpen(false)}
                code={codeContent || "// No code available yet. Try asking for a concept!"}
                title={vizData?.title || "Implementation"}
            />
        </div>
    );
}

export default App;
