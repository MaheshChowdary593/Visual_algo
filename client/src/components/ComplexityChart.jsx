import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Info, Activity } from 'lucide-react';

const ComplexityChart = ({ isOpen, onClose, currentComplexity, type = 'Time' }) => {
    // Standard Big O complexities for the chart
    const complexityLevels = [
        { id: 'O(1)', label: 'O(1)', color: '#10b981', desc: 'Constant', formula: (x) => 10 },
        { id: 'O(log n)', label: 'O(log n)', color: '#34d399', desc: 'Logarithmic', formula: (x) => Math.log2(x + 1) * 15 },
        { id: 'O(n)', label: 'O(n)', color: '#fbbf24', desc: 'Linear', formula: (x) => x },
        { id: 'O(n log n)', label: 'O(n log n)', color: '#f59e0b', desc: 'Linearithmic', formula: (x) => x * Math.log2(x + 1) * 0.2 },
        { id: 'O(n^2)', label: 'O(n²)', color: '#ef4444', desc: 'Quadratic', formula: (x) => (x * x) * 0.01 },
        { id: 'O(2^n)', label: 'O(2ⁿ)', color: '#b91c1c', desc: 'Exponential', formula: (x) => Math.pow(2, x * 0.1) * 2 },
        {
            id: 'O(n!)', label: 'O(n!)', color: '#7f1d1d', desc: 'Factorial', formula: (x) => {
                if (x < 10) return 0;
                return (x * 0.5) * (x * 0.4) * (x * 0.3);
            }
        },
    ];

    // Helper to check if a complexity matches currentComplexity
    const isHighlighted = (level) => {
        if (!currentComplexity) return false;
        const normalized = currentComplexity.toLowerCase().replace(/\s/g, '');
        const levelNormalized = level.toLowerCase().replace(/\s/g, '');
        return normalized.includes(levelNormalized) || levelNormalized.includes(normalized);
    };

    // Filter to only show relevant complexity
    const displayedLevels = complexityLevels.filter(comp => isHighlighted(comp.id));

    // Fallback logic for non-standard complexities like O(h), O(log V), etc.
    const finalLevels = displayedLevels.length > 0 ? displayedLevels : [{
        id: 'O(calc)',
        label: currentComplexity || 'Calculated',
        color: '#3b82f6',
        desc: 'Algorithm Specific',
        formula: (x) => MapAlgorithmToCurve(currentComplexity)(x)
    }];

    // Helper to map non-standard complexity to a visual curve shape
    function MapAlgorithmToCurve(complexity) {
        if (!complexity) return complexityLevels[2].formula; // Default to O(n)
        const low = complexity.toLowerCase();
        if (low.includes('log')) return complexityLevels[1].formula;
        if (low.includes('n^2') || low.includes('n2')) return complexityLevels[4].formula;
        if (low.includes('h') || low.includes('v') || low.includes('e')) return complexityLevels[2].formula; // Most O(h) are linear-ish in height
        return complexityLevels[2].formula;
    }

    // SVG parameters
    const width = 500;
    const height = 300;
    const padding = 40;

    const renderCurve = (level) => {
        const points = [];
        const steps = 50;
        const xMax = 100;

        for (let i = 0; i <= steps; i++) {
            const xVal = (i / steps) * xMax;
            const yVal = level.formula(xVal);

            // Map to SVG coordinates
            const x = padding + (i / steps) * (width - padding * 2);
            const y = (height - padding) - (yVal / 100) * (height - padding * 2);

            // Clamp y to container bounds
            const clampedY = Math.max(padding - 20, Math.min(height - padding, y));
            points.push(`${x},${clampedY}`);
        }

        const pathData = `M ${points.join(' L ')}`;

        // Calculate middle point for the label
        const midIndex = Math.floor(points.length / 2);
        const [midX, midY] = points[midIndex].split(',').map(Number);

        return (
            <g key={level.id} className="group">
                <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                    d={pathData}
                    stroke={level.color}
                    strokeWidth={4}
                    fill="none"
                    strokeLinecap="round"
                />

                {/* Arrow at the end */}
                <motion.circle
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.2 }}
                    cx={points[points.length - 1].split(',')[0]}
                    cy={points[points.length - 1].split(',')[1]}
                    r="4"
                    fill={level.color}
                />

                {/* Label in the middle of the curve */}
                <g>
                    {/* Background for text-readability */}
                    <rect
                        x={midX - 25}
                        y={midY - 25}
                        width="50"
                        height="20"
                        rx="4"
                        fill="white"
                        className="dark:fill-slate-900 opacity-80"
                    />
                    <text
                        x={midX}
                        y={midY - 10}
                        fill={level.color}
                        fontSize="12"
                        fontWeight="black"
                        textAnchor="middle"
                        className="drop-shadow-sm"
                    >
                        {level.label}
                    </text>
                </g>
            </g>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[60]"
                    />

                    <div className="fixed inset-0 flex items-center justify-center p-4 z-[70] pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 dark:border-slate-800 pointer-events-auto overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="flex items-center space-x-5">
                                    <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl text-white shadow-xl shadow-blue-500/30">
                                        <TrendingUp size={28} />
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{type} Complexity Analysis</h2>
                                        </div>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-80">Specific Growth Rate for Current Algorithm</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900 transition-all shadow-sm group"
                                >
                                    <X size={20} className="group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-8 flex flex-col lg:flex-row gap-10">
                                {/* SVG Chart */}
                                <div className="flex-1 min-w-0 bg-slate-50/50 dark:bg-black/20 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-6 relative overflow-visible flex items-center justify-center">
                                    <svg
                                        viewBox={`0 0 ${width} ${height}`}
                                        className="w-full h-auto overflow-visible"
                                    >
                                        {/* Axes */}
                                        <line x1={padding} y1={height - padding} x2={width - padding / 2} y2={height - padding} stroke="currentColor" strokeWidth="2" className="text-slate-300 dark:text-slate-700" />
                                        <line x1={padding} y1={height - padding} x2={padding} y2={padding / 2} stroke="currentColor" strokeWidth="2" className="text-slate-300 dark:text-slate-700" />

                                        {/* Axis Arrows */}
                                        <path d={`M ${width - padding / 2} ${height - padding - 4} L ${width - padding / 2 + 8} ${height - padding} L ${width - padding / 2} ${height - padding + 4}`} fill="currentColor" className="text-slate-300 dark:text-slate-700" />
                                        <path d={`M ${padding - 4} ${padding / 2} L ${padding} ${padding / 2 - 8} L ${padding + 4} ${padding / 2}`} fill="currentColor" className="text-slate-300 dark:text-slate-700" />

                                        {/* Axis Labels */}
                                        <text x={width - 20} y={height - padding + 20} className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right" textAnchor="end">Input Size (n)</text>
                                        <text x={padding - 15} y={padding / 2} className="text-[10px] font-black text-slate-400 uppercase tracking-widest [writing-mode:vertical-lr] rotate-180" textAnchor="end">Operations</text>

                                        {/* Complexity Line */}
                                        {finalLevels.map(renderCurve)}
                                    </svg>
                                </div>

                                {/* Legend Right Side */}
                                <div className="w-full lg:w-64 space-y-4">
                                    <div className="flex items-center space-x-2 text-blue-500 px-2">
                                        <Activity size={18} />
                                        <span className="text-xs font-black uppercase tracking-widest">Complexity Breakdown</span>
                                    </div>
                                    <div className="space-y-3">
                                        {finalLevels.map((comp) => (
                                            <div
                                                key={comp.id}
                                                className="bg-blue-600 text-white p-5 rounded-[2rem] shadow-xl shadow-blue-500/30 border border-transparent flex flex-col space-y-2"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <p className="font-black text-2xl">{comp.label}</p>
                                                    <div className="px-2 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-tighter">Current</div>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-widest opacity-80">{comp.desc}</p>
                                                    <p className="text-[11px] mt-2 font-medium leading-relaxed opacity-90">
                                                        {type} performance costs of your algorithm as the input grows.
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-2xl">
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-2">Technical Insight</p>
                                        <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                            Focusing only on the relevant complexity allows for cleaner visual validation of your algorithm's efficiency.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-center">
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] opacity-60">
                                    AlgoVision AI Complexity Analysis Engine
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence >
    );
};

export default ComplexityChart;
