import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash } from 'lucide-react';

const MapVisualizer = ({ entries = [], size = 8 }) => {
    const table = Array.from({ length: size }, (_, i) => {
        return entries.find(e => e.hash === i) || null;
    });

    return (
        <div className="flex flex-col items-center justify-center w-full p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
                {table.map((entry, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
                    >
                        <div className="bg-slate-50 dark:bg-slate-800 p-2 text-[10px] font-mono text-slate-400 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <span>INDEX {i}</span>
                            <Hash size={10} />
                        </div>
                        <div className="p-4 min-h-[60px] flex items-center justify-center bg-white dark:bg-slate-900">
                            <AnimatePresence mode="wait">
                                {entry ? (
                                    <motion.div
                                        key={`${entry.key}-${entry.val}`}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        className="flex flex-col items-center space-y-1"
                                    >
                                        <div className="text-xs font-bold text-blue-500 uppercase">{entry.key}</div>
                                        <div className="text-lg font-black text-slate-900 dark:text-white">{entry.val}</div>
                                    </motion.div>
                                ) : (
                                    <div className="text-[10px] text-slate-300 dark:text-slate-700 font-mono italic">EMPTY</div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    HashMap uses a hashing function to map keys to specific indices for O(1) average lookup time.
                </p>
            </div>
        </div>
    );
};

export default MapVisualizer;
