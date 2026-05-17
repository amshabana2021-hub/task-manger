import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  LogOut, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Edit3, 
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  Search
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { taskService } from '../lib/taskService';
import { Task, Priority } from '../types';
import TaskDialog from './TaskDialog';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function DashboardScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = taskService.subscribeToTasks(auth.currentUser.uid, (fetchedTasks) => {
      setTasks(fetchedTasks);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => signOut(auth);

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (!auth.currentUser) return;

    try {
      if (editingTask?.id) {
        await taskService.updateTask(editingTask.id, taskData);
      } else {
        await taskService.createTask({
          ...taskData as Task,
          userId: auth.currentUser.uid,
        });
      }
      setEditingTask(undefined);
      setIsDialogOpen(false);
    } catch (err: any) {
      alert('Failed to save task. Please try again.');
      console.error(err);
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    if (!task.id) return;
    await taskService.updateTask(task.id, { isCompleted: !task.isCompleted });
  };

  const deleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await taskService.deleteTask(taskId);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'All' || 
      (filter === 'Completed' && task.isCompleted) || 
      (filter === 'Pending' && !task.isCompleted);
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'High': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Low': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    }
  };

  const parseDate = (date: any) => {
    if (date instanceof Timestamp) return date.toDate();
    return new Date(date);
  };

  return (
    <div className="flex h-screen overflow-hidden text-white relative">
      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 h-full bg-[#0a0a16] backdrop-blur-3xl border-r border-white/5 flex flex-col z-40 transition-transform duration-300 lg:relative lg:translate-x-0 shrink-0 shadow-[20px_0_50px_rgba(0,0,0,0.5)]",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#ff2d92] to-[#aa00ff] text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-[0_5px_15px_rgba(170,0,255,0.3)]">
                <CheckCircle size={24} />
              </div>
              <h1 className="text-xl font-black tracking-tighter text-white">TASKLY</h1>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 text-white/40 hover:text-white"
            >
              <ChevronRight className="rotate-180" size={24} />
            </button>
          </div>
          
          <nav className="space-y-4">
            {(['All', 'Pending', 'Completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setIsSidebarOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all text-left group relative overflow-hidden",
                  filter === f 
                    ? "bg-gradient-to-r from-[#aa00ff] to-[#ff2d92] text-white shadow-[0_10px_20px_rgba(170,0,255,0.2)]" 
                    : "text-purple-200/40 hover:bg-white/5 hover:text-white"
                )}
              >
                <span className={cn(
                  "w-5 h-5 flex items-center justify-center z-10",
                  filter === f ? "text-white" : "group-hover:text-white"
                )}>
                  {f === 'All' ? <Filter size={18} /> : f === 'Pending' ? <Clock size={18} /> : <CheckCircle size={18} />}
                </span> 
                <span className="z-10">{f}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-6">
          <div className="bg-white/5 rounded-[2rem] p-5 border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-5 text-left">
              <div className="shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center font-black text-purple-200 shadow-sm overflow-hidden uppercase">
                {auth.currentUser?.email?.[0] || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate leading-none mb-1">{auth.currentUser?.email?.split('@')[0]}</p>
                <p className="text-[10px] text-purple-400 font-black tracking-widest uppercase">Member</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full py-3 bg-white/5 hover:bg-rose-500/20 text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full flex flex-col min-w-0 relative z-10 overflow-hidden bg-[#050510]/40">
        <header className="h-20 lg:h-24 flex items-center justify-between px-6 lg:px-10 border-b border-white/5 shrink-0 bg-[#0a0a16]/40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 bg-white/5 rounded-xl text-white border border-white/10 shadow-lg backdrop-blur-md active:scale-95 transition-all"
            >
              <Filter size={20} />
            </button>
            <div>
              <h2 className="text-xl lg:text-3xl font-black text-white tracking-widest uppercase">
                {filter === 'All' ? 'Nexus' : filter === 'Pending' ? 'Active' : 'Archived'}
              </h2>
              <p className="hidden sm:block text-purple-300/40 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                {filteredTasks.length} System Records Identified
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="relative">
              <Search className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-purple-400/40" size={16} lg:size={18} />
              <input 
                type="text" 
                placeholder="Search Database..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl py-2 pl-9 pr-4 lg:pl-11 lg:pr-5 text-xs lg:text-sm text-white placeholder-purple-400/20 focus:outline-none focus:ring-1 focus:ring-purple-500/50 w-32 sm:w-48 lg:w-72 backdrop-blur-md transition-all font-bold"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 max-w-6xl mx-auto">
            <AnimatePresence mode="popLayout">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className={cn(
                      "group relative bg-[#131325]/60 backdrop-blur-2xl border rounded-[2rem] p-7 transition-all hover:bg-[#1a1a35]/80 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col justify-between h-[240px]",
                      task.isCompleted ? "border-white/5 opacity-50 bg-[#0a0a16]/40" : "border-white/10"
                    )}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-5">
                        <span className={cn(
                          "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 shadow-sm",
                          task.priority === 'High' ? 'bg-[#ff2d92]/10 text-[#ff2d92] border-[#ff2d92]/20' :
                          task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
                        )}>
                          {task.priority}
                        </span>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => { setEditingTask(task); setIsDialogOpen(true); }}
                            className="p-2.5 rounded-xl text-purple-400/40 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => task.id && deleteTask(task.id)}
                            className="p-2.5 rounded-xl text-purple-400/40 hover:text-rose-400 hover:bg-rose-500/5 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className={cn(
                        "text-xl font-black mb-2 tracking-tight line-clamp-1",
                        task.isCompleted ? "text-white/20 line-through" : "text-white"
                      )}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className={cn(
                          "text-[13px] leading-relaxed line-clamp-2 font-bold opacity-40",
                          task.isCompleted ? "text-purple-200/20" : "text-purple-100"
                        )}>
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-white/5">
                      <span className="text-[10px] font-black text-purple-400/30 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Clock size={14} className="opacity-50" />
                        {task.dueDate ? format(parseDate(task.dueDate), 'MMM dd') : 'Infinity'}
                      </span>
                      
                      <button 
                        onClick={() => toggleTaskStatus(task)}
                        className={cn(
                          "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all px-5 py-2.5 rounded-2xl border-2",
                          task.isCompleted 
                            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-transparent shadow-[0_5px_15px_rgba(6,182,212,0.3)]" 
                            : "bg-white/5 text-white border-white/10 hover:border-white/20 hover:bg-white/10"
                        )}
                      >
                        {task.isCompleted ? 'ARCHIVED' : 'OPERATE'}
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-24 flex flex-col items-center">
                   <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/20 mb-6 border border-white/10">
                     <Filter size={40} />
                   </div>
                   <h3 className="text-2xl font-bold text-white">Quiet in here...</h3>
                   <p className="text-white/40 mt-2 font-medium">No tasks found matching your current view.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Global FAB */}
        <button 
          onClick={() => { setEditingTask(undefined); setIsDialogOpen(true); }}
          className="absolute bottom-6 right-6 lg:bottom-10 lg:right-10 w-16 h-16 bg-gradient-to-br from-[#ff2d92] to-[#aa00ff] text-white rounded-2xl lg:rounded-3xl shadow-[0_15px_40px_rgba(170,0,255,0.4)] flex items-center justify-center transition-all hover:scale-110 hover:rotate-3 active:scale-95 group z-50 border-4 border-white/20"
        >
          <Plus size={32} className="group-hover:rotate-90 transition-transform duration-500" strokeWidth={4} />
        </button>
      </main>

      <TaskDialog 
        isOpen={isDialogOpen}
        onClose={() => { setIsDialogOpen(false); setEditingTask(undefined); }}
        onSave={handleSaveTask}
        initialTask={editingTask}
      />
    </div>
  );
}
