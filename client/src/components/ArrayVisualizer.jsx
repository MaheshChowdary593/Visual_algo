import React from 'react';
import { motion } from 'framer-motion';

const ArrayVisualizer = ({ data = [], activeIndices = [], pivotIndex = null }) => {
    if (!data || !Array.isArray(data)) return null;

    return (
        <div className="flex items-end justify-center space-x-2 h-64 p-4">
            {data.map((val, i) => {
                const isActive = activeIndices.includes(i);
                const isPivot = i === pivotIndex;
                const height = Math.max((val / Math.max(...data, 1)) * 150, 20);

                return (
                    <div key={i} className="flex flex-col items-center">
                        <motion.div
                            layout
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                height: height,
                            }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className={`w-12 flex flex-col items-center justify-end relative rounded-t-lg transition-colors overflow-visible ${isPivot ? 'bg-purple-500' : (isActive ? 'bg-red-500' : 'bg-blue-500')
                                } shadow-lg`}
                        >
                            <span className="mb-2 font-bold text-white text-sm">{val}</span>

                            {/* Pointer Labels for Two Pointers */}
                            {isActive && i === activeIndices[0] && (
                                <div className="absolute -top-10 bg-red-100 text-red-600 px-1 rounded text-[10px] font-black uppercase whitespace-nowrap border border-red-200">
                                    {activeIndices.length > 1 ? 'P1' : 'PTR'}
                                </div>
                            )}
                            {isActive && i === activeIndices[1] && (
                                <div className="absolute -top-10 bg-orange-100 text-orange-600 px-1 rounded text-[10px] font-black uppercase whitespace-nowrap border border-orange-200">
                                    P2
                                </div>
                            )}
                        </motion.div>
                        <div className="mt-2 text-[10px] font-mono text-slate-400">[{i}]</div>
                    </div>
                );
            })}
        </div>
    );
};

export default ArrayVisualizer;
