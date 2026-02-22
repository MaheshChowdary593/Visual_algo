import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, Move } from 'lucide-react';

const TreeVisualizer = ({ nodes = [], activeNodeId = null }) => {
    if (!nodes || nodes.length === 0) return null;

    const [scale, setScale] = useState(1);
    const containerRef = React.useRef(null);

    const { layoutNodes, edges, totalWidth, totalHeight, nodeRadius } = useMemo(() => {
        const nodeMap = new Map();
        nodes.forEach(node => nodeMap.set(node.id, { ...node }));

        // Find root
        const childIds = new Set(nodes.flatMap(n => [n.left, n.right].filter(Boolean)));
        const root = nodes.find(n => !childIds.has(n.id)) || nodes[0];

        const positions = [];
        const internalEdges = [];

        const visited = new Set();
        let maxLevel = 0;
        const calculateDepth = (id, level = 0) => {
            if (!id || visited.has(id) || level > 20) return;
            visited.add(id);
            maxLevel = Math.max(maxLevel, level);
            const node = nodeMap.get(id);
            if (!node) return;
            if (node.left) calculateDepth(node.left, level + 1);
            if (node.right) calculateDepth(node.right, level + 1);
        };
        calculateDepth(root.id);
        visited.clear();

        // Adaptive spacing and sizing based on node count
        const nodeCount = nodes.length;
        const adaptiveRadius = Math.max(20, Math.min(30, 150 / Math.sqrt(nodeCount + 1)));
        const verticalSpacing = Math.max(60, Math.min(120, 400 / (maxLevel + 1)));
        const horizontalSpacing = adaptiveRadius * 2.5;

        // Simple recursive layout
        const computePositions = (id, level = 0, leftBoundary = 0) => {
            if (!id || visited.has(id) || level > 20) return 0;
            visited.add(id);

            const node = nodeMap.get(id);
            if (!node) return 0;

            const leftWidth = node.left ? computePositions(node.left, level + 1, leftBoundary) : 0;
            const rightStart = leftBoundary + Math.max(leftWidth, horizontalSpacing);
            const rightWidth = node.right ? computePositions(node.right, level + 1, rightStart) : 0;

            const currentX = leftBoundary + (Math.max(leftWidth + rightWidth, horizontalSpacing)) / 2;
            const currentY = level * verticalSpacing + 60;

            node.x = currentX;
            node.y = currentY;

            positions.push(node);

            if (node.left && nodeMap.has(node.left)) {
                internalEdges.push({ from: node, to: nodeMap.get(node.left) });
            }
            if (node.right && nodeMap.has(node.right)) {
                internalEdges.push({ from: node, to: nodeMap.get(node.right) });
            }

            return Math.max(leftWidth + rightWidth, horizontalSpacing);
        };

        const width = computePositions(root.id, 0, 50);
        const height = (maxLevel + 1) * verticalSpacing + 100;

        return {
            layoutNodes: positions,
            edges: internalEdges,
            totalWidth: width + 200,
            totalHeight: height + 100,
            nodeRadius: adaptiveRadius
        };
    }, [nodes]);

    // Auto-scale to fit on mount or nodes change
    React.useEffect(() => {
        if (containerRef.current) {
            const { offsetWidth, offsetHeight } = containerRef.current;
            const scaleX = (offsetWidth - 40) / totalWidth;
            const scaleY = (offsetHeight - 40) / totalHeight;
            const initialScale = Math.min(scaleX, scaleY, 1);
            setScale(initialScale);
        }
    }, [totalWidth, totalHeight]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900/20 rounded-3xl relative overflow-hidden group"
        >
            {/* Zoom Controls Overlay */}
            <div className="absolute bottom-6 right-6 flex flex-col space-y-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => setScale(s => Math.min(s + 0.2, 3))}
                    className="p-3 bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
                >
                    <ZoomIn size={20} className="text-blue-500" />
                </button>
                <button
                    onClick={() => setScale(s => Math.max(s - 0.2, 0.1))}
                    className="p-3 bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
                >
                    <ZoomOut size={20} className="text-blue-500" />
                </button>
            </div>

            <div className="absolute top-6 left-6 text-xs text-slate-400 font-mono flex items-center space-x-2 z-10">
                <Move size={14} />
                <span>Drag to explore the tree</span>
            </div>

            <div className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing">
                <motion.div
                    style={{ width: totalWidth, height: totalHeight, originX: 0, originY: 0 }}
                    drag
                    dragConstraints={containerRef}
                    animate={{ scale }}
                    className="relative"
                >
                    {/* SVG Layer for Edges */}
                    <svg width={totalWidth} height={totalHeight} className="overflow-visible absolute inset-0 pointer-events-none">
                        {edges.map((edge, i) => (
                            <motion.line
                                key={`edge-${edge.from.id}-${edge.to.id}`}
                                layout
                                x1={edge.from.x}
                                y1={edge.from.y}
                                x2={edge.to.x}
                                y2={edge.to.y}
                                stroke="#3b82f6"
                                strokeWidth="4"
                                strokeOpacity="0.3"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                            />
                        ))}
                    </svg>

                    {/* HTML Layer for Nodes (More reliable for text rendering) */}
                    {layoutNodes.map(node => {
                        const isActive = activeNodeId === node.id;
                        const fontSize = Math.max(12, nodeRadius * 0.7);
                        return (
                            <motion.div
                                key={node.id}
                                layout
                                initial={{ scale: 0 }}
                                animate={{
                                    scale: 1,
                                    left: node.x - nodeRadius,
                                    top: node.y - nodeRadius,
                                    width: nodeRadius * 2,
                                    height: nodeRadius * 2,
                                    backgroundColor: isActive ? '#ef4444' : '#3b82f6',
                                    boxShadow: isActive ? `0 0 ${nodeRadius}px rgba(239, 68, 68, 0.4)` : `0 ${nodeRadius / 3}px ${nodeRadius / 1.5}px rgba(59, 130, 246, 0.3)`
                                }}
                                className="absolute rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center text-white font-black shadow-2xl z-10 transition-colors"
                                style={{ fontSize: `${fontSize}px` }}
                            >
                                <span className="pointer-events-none drop-shadow-md">
                                    {node.val}
                                </span>

                                {isActive && (
                                    <motion.div
                                        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                        className="absolute inset-x-[-15px] inset-y-[-15px] rounded-full border-4 border-red-500 pointer-events-none"
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
};

export default TreeVisualizer;
