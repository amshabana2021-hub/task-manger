import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, Type, AlignLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Priority } from '../types';
import { Timestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => Promise<void>;
  initialTask?: Task;
}

export default function TaskDialog({ isOpen, onClose, onSave, initialTask }: TaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setPriority(initialTask.priority);
      if (initialTask.dueDate) {
        const date = (initialTask.dueDate as Timestamp).toDate 
          ? (initialTask.dueDate as Timestamp).toDate() 
          : new Date(initialTask.dueDate as any);
        setDueDate(date.toISOString().split('T')[0]);
      }
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setDueDate(new Date().toISOString().split('T')[0]);
    }
  }, [initialTask, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        title,
        description,
        priority,
        dueDate: new Date(dueDate),
        isCompleted: initialTask?.isCompleted ?? false,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#16162a]/90 backdrop-blur-3xl rounded-3xl sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border border-white/5 max-h-[90vh] flex flex-col mx-2"
          >
            <div className="p-5 sm:p-7 border-b border-white/5 flex items-center justify-between bg-white/5 shrink-0">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-widest uppercase">
                {initialTask ? 'Modify' : 'Initialize'}
              </h2>
              <button 
                onClick={onClose} 
                className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-purple-400/40 hover:text-white border border-transparent hover:border-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 sm:space-y-7 overflow-y-auto custom-scrollbar bg-[#0a0a16]/40">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-purple-400/50 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Type size={14} className="opacity-50" /> Identifier
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#050510] border border-white/5 rounded-xl sm:rounded-2xl px-5 py-3 sm:py-4 text-white placeholder-purple-400/20 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all font-bold text-sm sm:text-base shadow-inner"
                  placeholder="Task Name..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-purple-400/50 uppercase tracking-[0.2em] flex items-center gap-2">
                  <AlignLeft size={14} className="opacity-50" /> Parameters
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-[#050510] border border-white/5 rounded-xl sm:rounded-2xl px-5 py-3 sm:py-4 text-white placeholder-purple-400/20 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all resize-none font-bold text-sm sm:text-base shadow-inner"
                  placeholder="Details..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-7">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-purple-400/50 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Flag size={14} className="opacity-50" /> Urgency
                  </label>
                  <div className="relative">
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as Priority)}
                      className="w-full bg-[#050510] border border-white/5 rounded-xl sm:rounded-2xl px-5 py-3 sm:py-4 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all font-bold appearance-none cursor-pointer text-sm sm:text-base shadow-inner"
                    >
                      <option value="Low" className="bg-[#16162a]">Low</option>
                      <option value="Medium" className="bg-[#16162a]">Medium</option>
                      <option value="High" className="bg-[#16162a]">High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-purple-400/50 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Calendar size={14} className="opacity-50" /> Timeline
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#050510] border border-white/5 rounded-xl sm:rounded-2xl px-5 py-3 sm:py-4 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all font-bold [color-scheme:dark] text-sm sm:text-base shadow-inner"
                  />
                </div>
              </div>

              <div className="pt-6 sm:pt-8 flex gap-4 sm:gap-5 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-5 py-4 bg-white/5 text-purple-200/50 font-black uppercase tracking-widest text-[10px] rounded-xl sm:rounded-2xl hover:bg-white/10 border border-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[1.8] bg-gradient-to-r from-[#aa00ff] to-[#ff2d92] text-white font-black uppercase tracking-[0.2em] text-[10px] py-4 rounded-xl sm:rounded-2xl shadow-[0_10px_25px_rgba(170,0,255,0.3)] transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 border-b-4 border-black/20"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : (initialTask ? 'Synchronize' : 'Confirm')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
