import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodePanel = ({ isOpen, onClose, code, title }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-40"
                    />

                    {/* Side Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-xl bg-white dark:bg-slate-900 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <div>
                                <h2 className="text-sm font-black uppercase tracking-widest text-blue-500 mb-1">Algorithm Code</h2>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{title}</h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900 transition-all shadow-sm"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Code Toolbar */}
                        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center bg-white dark:bg-slate-900">
                            <span className="text-xs font-mono text-slate-400">Implementation Details</span>
                            <button
                                onClick={handleCopy}
                                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                            </button>
                        </div>

                        {/* Code Content */}
                        <div className="flex-1 overflow-auto p-0 bg-slate-50 dark:bg-slate-950/30 font-mono text-sm leading-7">
                            <SyntaxHighlighter
                                language="java"
                                style={atomDark}
                                customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent', height: '100%' }}
                                wrapLines={true}
                                wrapLongLines={true}
                            >
                                {code}
                            </SyntaxHighlighter>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 text-center">
                            <p className="text-xs text-slate-400 italic">
                                AI-generated Java implementation for learning purposes.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CodePanel;
