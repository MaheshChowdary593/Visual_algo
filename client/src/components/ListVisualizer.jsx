import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const ListVisualizer = ({ nodes = [], activeNodeId = null }) => {
    if (!nodes || nodes.length === 0) return null;

    return (
        <div className="flex items-center justify-center space-x-12 p-12 overflow-x-auto w-full scrollbar-hide">
            <AnimatePresence>
                {nodes.map((node, i) => (
                    <React.Fragment key={node.id}>
                        <div className="relative group shrink-0">
                            <motion.div
                                layout
                                initial={{ scale: 0, x: -50 }}
                                animate={{
                                    scale: 1,
                                    x: 0,
                                    backgroundColor: activeNodeId === node.id ? '#ef4444' : '#3b82f6',
                                    borderColor: activeNodeId === node.id ? '#fecaca' : '#bfdbfe'
                                }}
                                className="w-24 h-24 rounded-2xl border-4 flex flex-col items-center justify-center text-white font-black shadow-2xl overflow-hidden"
                            >
                                <div className="flex-1 flex items-center justify-center text-2xl">{node.val}</div>
                                <div className="w-full h-1/4 bg-white/20 text-[10px] flex items-center justify-center font-bold uppercase tracking-widest">NEXT</div>
                            </motion.div>

                            {/* Pointer indication */}
                            {activeNodeId === node.id && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg"
                                >
                                    POINTER
                                </motion.div>
                            )}
                        </div>

                        {node.next && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                className="shrink-0"
                            >
                                <ArrowRight className="text-blue-500/40" size={48} strokeWidth={4} />
                            </motion.div>
                        )}

                        {!node.next && i === nodes.length - 1 && (
                            <div className="text-slate-400 font-black text-xl self-center px-4 border-l-4 border-slate-300 ml-4 py-2">NULL</div>
                        )}
                    </React.Fragment>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ListVisualizer;
