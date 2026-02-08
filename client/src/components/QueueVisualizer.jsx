import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QueueVisualizer = ({ data = [], headIndex = -1, tailIndex = -1 }) => {
    if (!data || !Array.isArray(data)) return null;

    return (
        <div className="flex flex-col items-center justify-center space-y-8 w-full">
            <div className="flex items-center space-x-1 border-y-2 border-slate-200 dark:border-slate-800 p-2 min-h-24 min-w-[300px] bg-slate-100/30 dark:bg-slate-900/10 rounded-lg">
                <AnimatePresence>
                    {data.map((val, i) => {
                        const isHead = i === headIndex;
                        const isTail = i === tailIndex;

                        return (
                            <motion.div
                                key={`${i}-${val}`}
                                layout
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -100, opacity: 0 }}
                                className={`w-14 h-14 rounded-lg shadow-lg flex items-center justify-center text-white font-bold relative ${isHead ? 'bg-orange-500' : (isTail ? 'bg-emerald-500' : 'bg-blue-500')
                                    }`}
                            >
                                {val}

                                {isHead && (
                                    <div className="absolute -top-6 text-[10px] text-orange-500 font-bold uppercase">Front</div>
                                )}
                                {isTail && (
                                    <div className="absolute -bottom-6 text-[10px] text-emerald-500 font-bold uppercase">Back</div>
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
