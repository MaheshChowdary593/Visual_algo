import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QueueVisualizer = ({ data = [], headIndex = -1, tailIndex = -1 }) => {
    if (!data || !Array.isArray(data)) return null;

    const n = data.length;
    // Dynamic size based on element count
    const size = Math.max(32, Math.min(56, 800 / n));
    const fontSize = Math.max(10, Math.min(18, size * 0.45));
    const labelSize = Math.max(8, Math.min(10, size * 0.25));

    return (
        <div className="flex flex-col items-center justify-center space-y-8 w-full p-4">
            <div
                className="flex items-center border-y-2 border-slate-200 dark:border-slate-800 p-4 min-h-32 w-full max-w-4xl bg-slate-100/30 dark:bg-slate-900/10 rounded-2xl overflow-x-auto scrollbar-hide justify-center"
                style={{ gap: `${Math.max(4, 12 - n / 2)}px` }}
            >
                <AnimatePresence>
                    {data.map((val, i) => {
                        const isHead = i === headIndex;
                        const isTail = i === tailIndex;

                        return (
                            <motion.div
                                key={`${i}-${val}`}
                                layout
                                initial={{ x: 100, opacity: 0 }}
                                animate={{
                                    x: 0,
                                    opacity: 1,
                                    width: size,
                                    height: size
                                }}
                                exit={{ x: -100, opacity: 0 }}
                                className={`rounded-xl shadow-lg flex-shrink-0 flex items-center justify-center text-white font-black relative ${isHead ? 'bg-orange-500' : (isTail ? 'bg-emerald-500' : 'bg-blue-500')
                                    }`}
                                style={{ fontSize: `${fontSize}px` }}
                            >
                                {val}

                                {isHead && (
                                    <div
                                        className="absolute -top-6 text-orange-500 font-bold uppercase tracking-tighter"
                                        style={{ fontSize: `${labelSize}px` }}
                                    >
                                        Front
                                    </div>
                                )}
                                {isTail && (
                                    <div
                                        className="absolute -bottom-6 text-emerald-500 font-bold uppercase tracking-tighter"
                                        style={{ fontSize: `${labelSize}px` }}
                                    >
                                        Back
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <div className="flex space-x-12 text-sm text-slate-500 font-mono">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-sm" />
                    <span>Head (Dequeue Side)</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
                    <span>Tail (Enqueue Side)</span>
                </div>
            </div>
        </div>
    );
};

export default QueueVisualizer;
