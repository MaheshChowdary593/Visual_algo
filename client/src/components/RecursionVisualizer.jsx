import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers } from 'lucide-react';

const RecursionVisualizer = ({ stack = [] }) => {
    if (!stack || !Array.isArray(stack)) return null;

    return (
        <div className="flex flex-col items-center justify-start h-full w-full py-8 space-y-4 overflow-y-auto">
            <div className="flex items-center space-x-2 text-slate-400 mb-4">
                <Layers size={18} />
                <span className="text-sm font-bold uppercase tracking-wider">Call Stack</span>
            </div>

            <div className="flex flex-col-reverse w-full max-w-lg space-y-reverse space-y-4 px-4">
                <AnimatePresence>
                    {stack.map((frame, i) => (
                        <motion.div
                            key={`${i}-${frame.fn}`}
                            layout
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 50, opacity: 0 }}
                            className={`p-4 rounded-2xl border-2 flex flex-col space-y-1 relative overflow-hidden ${i === stack.length - 1
                                    ? 'bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-500/20 z-10'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-300'
                                }`}
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-black font-mono text-sm">{frame.fn}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${i === stack.length - 1 ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'
                                    }`}>
                                    DEPTH {i}
                                </span>
                            </div>

                            <div className="flex space-x-4 text-xs opacity-80 italic font-mono">
                                <span>args: {JSON.stringify(frame.args)}</span>
                                {frame.val !== null && (
                                    <span className="font-bold">→ return: {frame.val}</span>
                                )}
                            </div>

                            {i === stack.length - 1 && (
                                <motion.div
                                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute inset-0 bg-white pointer-events-none"
                                />
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {stack.length === 0 && (
                <div className="text-slate-300 dark:text-slate-700 italic">No active frames.</div>
            )}
        </div>
    );
};

export default RecursionVisualizer;
