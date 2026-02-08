import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StackVisualizer = ({ data = [], action = null }) => {
    if (!data || !Array.isArray(data)) return null;

    return (
        <div className="flex flex-col items-center justify-center h-full w-full py-12">
            <div className="relative w-48 h-96 border-x-4 border-b-4 border-slate-300 dark:border-slate-700 rounded-b-3xl bg-slate-50/50 dark:bg-slate-900/20 flex flex-col-reverse items-center p-4 space-y-reverse space-y-2 overflow-hidden">
                <AnimatePresence>
                    {data.map((val, i) => (
                        <motion.div
                            key={`${i}-${val}`}
                            layout
                            initial={{ y: -400, opacity: 0, scale: 0.8 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: -400, opacity: 0, scale: 0.8 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className={`w-full h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-md ${i === data.length - 1 ? 'bg-orange-500 ring-4 ring-orange-200 dark:ring-orange-900/50' : 'bg-blue-500'
                                }`}
                        >
                            <span className="text-lg">{val}</span>
                            {i === data.length - 1 && (
                                <div className="absolute -right-16 bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">Top</div>
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
