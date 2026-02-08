import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Move } from 'lucide-react';

const GraphVisualizer = ({ nodes = [], edges = [], activeNodeId = null }) => {
    if (!nodes || nodes.length === 0) return null;

    const [scale, setScale] = useState(1);

    // Calculate bounds to center the initial view if needed
    const minX = Math.min(...nodes.map(n => n.x || 0));
    const maxX = Math.max(...nodes.map(n => n.x || 0));
    const minY = Math.min(...nodes.map(n => n.y || 0));
    const maxY = Math.max(...nodes.map(n => n.y || 0));

    const width = maxX - minX + 200;
    const height = maxY - minY + 200;

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900/20 rounded-[3rem] relative overflow-hidden group">
            {/* Zoom Controls Overlay */}
            <div className="absolute bottom-10 right-10 flex flex-col space-y-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => setScale(s => Math.min(s + 0.2, 3))}
                    className="p-3 bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                    <ZoomIn size={20} className="text-blue-500" />
                </button>
                <button
                    onClick={() => setScale(s => Math.max(s - 0.2, 0.5))}
                    className="p-3 bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                    <ZoomOut size={20} className="text-blue-500" />
                </button>
            </div>

            <div className="absolute top-10 left-10 text-xs text-slate-400 font-mono flex items-center space-x-2 z-10">
                <Move size={14} />
                <span>Drag to explore the graph</span>
            </div>

            <div className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing">
                <motion.div
                    style={{ width: '100%', height: '100%', originX: 0.5, originY: 0.5 }}
                    drag
                    dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
                    animate={{ scale }}
                    className="relative flex items-center justify-center"
                >
                    <div className="relative" style={{ width, height }}>
                        <svg width={width} height={height} className="overflow-visible absolute inset-0">
                            <defs>
                                <marker id="graph-arrow" viewBox="0 0 10 10" refX="35" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                                </marker>
                            </defs>
                            {edges.map((edge, i) => {
                                const fromNode = nodes.find(n => n.id === edge.from);
                                const toNode = nodes.find(n => n.id === edge.to);
                                if (!fromNode || !toNode) return null;

                                // Offset to match the centered coordinate system
                                const x1 = (fromNode.x || 0) - minX + 100;
                                const y1 = (fromNode.y || 0) - minY + 100;
                                const x2 = (toNode.x || 0) - minX + 100;
                                const y2 = (toNode.y || 0) - minY + 100;

                                return (
                                    <motion.line
                                        key={`edge-${i}`}
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 0.3 }}
                                        x1={x1}
                                        y1={y1}
                                        x2={x2}
                                        y2={y2}
                                        stroke="#3b82f6"
                                        strokeWidth="3"
                                        markerEnd="url(#graph-arrow)"
                                    />
                                );
                            })}
                        </svg>

                        {nodes.map(node => {
                            const x = (node.x || 0) - minX + 100;
                            const y = (node.y || 0) - minY + 100;
                            const isActive = activeNodeId === node.id;

                            return (
                                <motion.div
                                    key={node.id}
                                    layout
                                    initial={{ scale: 0 }}
                                    animate={{
                                        scale: 1,
                                        left: x - 30,
                                        top: y - 30,
                                        backgroundColor: isActive ? '#ef4444' : '#3b82f6',
                                        boxShadow: isActive ? '0 0 30px rgba(239, 68, 68, 0.5)' : '0 10px 20px rgba(59, 130, 246, 0.3)'
                                    }}
                                    className="absolute w-16 h-16 rounded-full flex flex-col items-center justify-center text-white font-black text-lg z-10 border-4 border-white dark:border-slate-800 shadow-2xl transition-colors"
                                >
                                    {node.val}

                                    {isActive && (
                                        <motion.div
                                            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            className="absolute inset-0 rounded-full border-4 border-red-500"
                                        />
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default GraphVisualizer;
