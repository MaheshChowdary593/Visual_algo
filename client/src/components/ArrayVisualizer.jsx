import React from 'react';
import { motion } from 'framer-motion';

const ArrayVisualizer = ({ data = [], activeIndices = [], pivotIndex = null }) => {
    if (!data || !Array.isArray(data)) return null;

    const n = data.length;
    // Dynamic sizing based on number of elements
    const barWidth = Math.max(16, Math.min(48, 600 / n));
    const spacing = Math.max(2, Math.min(8, 100 / n));
    const fontSize = Math.max(8, Math.min(14, barWidth * 0.4));
    const labelFontSize = Math.max(8, Math.min(10, barWidth * 0.3));

    return (
        <div
            className="flex items-end justify-center h-64 p-4 overflow-x-auto scrollbar-hide"
            style={{ gap: `${spacing}px` }}
        >
            {data.map((val, i) => {
                const isActive = activeIndices.includes(i);
                const isPivot = i === pivotIndex;
                const height = Math.max((val / Math.max(...data, 1)) * 150, 20);

                return (
                    <div key={i} className="flex flex-col items-center flex-shrink-0">
                        <motion.div
                            layout
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                height: height,
                                width: barWidth
                            }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className={`flex flex-col items-center justify-end relative rounded-t-lg transition-colors overflow-visible ${isPivot ? 'bg-purple-500' : (isActive ? 'bg-red-500' : 'bg-blue-500')
                                } shadow-lg`}
                        >
                            {barWidth > 20 && (
                                <span
                                    className="mb-2 font-bold text-white uppercase tracking-tighter"
                                    style={{ fontSize: `${fontSize}px` }}
                                >
                                    {val}
                                </span>
                            )}

                            {/* Pointer Labels */}
                            {isActive && i === activeIndices[0] && (
                                <div
                                    className="absolute -top-10 bg-red-100 text-red-600 px-1 rounded font-black uppercase whitespace-nowrap border border-red-200 z-10"
                                    style={{ fontSize: `${labelFontSize}px` }}
                                >
                                    {activeIndices.length > 1 ? 'P1' : 'PTR'}
                                </div>
                            )}
                            {isActive && i === activeIndices[1] && (
                                <div
                                    className="absolute -top-10 bg-orange-100 text-orange-600 px-1 rounded font-black uppercase whitespace-nowrap border border-orange-200 z-10"
                                    style={{ fontSize: `${labelFontSize}px` }}
                                >
                                    P2
                                </div>
                            )}
                        </motion.div>
                        {barWidth > 25 && (
                            <div className="mt-2 font-mono text-slate-400" style={{ fontSize: `${labelFontSize}px` }}>[{i}]</div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ArrayVisualizer;
