import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StackVisualizer = ({ data = [], action = null }) => {
    if (!data || !Array.isArray(data)) return null;

    const n = data.length;
    // Dynamic height to fit more items in the bucket
    const itemHeight = Math.max(24, Math.min(48, 400 / (n + 1)));
    const fontSize = Math.max(10, Math.min(18, itemHeight * 0.45));
    const labelSize = Math.max(8, Math.min(10, itemHeight * 0.3));

    return (
        <div className="flex flex-col items-center justify-center h-full w-full py-8">
            <div
                className="relative w-48 h-[450px] border-x-4 border-b-4 border-slate-300 dark:border-slate-700养成 r-b-3xl bg-slate-50/50 dark:bg-slate-900/20 flex flex-col-reverse items-center p-4 space-y-reverse overflow-hidden"
                style={{ gap: `${Math.max(2, 8 - n / 2)}px` }}
            >
                <AnimatePresence>
                    {data.map((val, i) => (
                        <motion.div
                            key={`${i}-${val}`}
                            layout
                            initial={{ y: -400, opacity: 0, scale: 0.8 }}
                            animate={{
                                y: 0,
                                opacity: 1,
                                scale: 1,
                                height: itemHeight
                            }}
                            exit={{ y: -400, opacity: 0, scale: 0.8 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className={`w-full rounded-xl flex items-center justify-center text-white font-black shadow-md flex-shrink-0 relative ${i === n - 1 ? 'bg-orange-500 ring-4 ring-orange-200 dark:ring-orange-900/50' : 'bg-blue-500'
                                }`}
                            style={{ fontSize: `${fontSize}px` }}
                        >
                            <span>{val}</span>
                            {i === n - 1 && (
                                <div
                                    className="absolute -right-12 bg-orange-100 text-orange-600 px-2 py-0.5 rounded font-black uppercase tracking-tighter"
                                    style={{ fontSize: `${labelSize}px` }}
                                >
                                    Top
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="mt-8 flex space-x-6">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-sm" />
                    <span className="text-xs text-slate-500 font-bold uppercase">LIFO (Last In, First Out)</span>
                </div>
            </div>
        </div>
    );
};

export default StackVisualizer;
