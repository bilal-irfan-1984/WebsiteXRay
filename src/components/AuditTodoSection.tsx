import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Filter,
  ListTodo,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { TodoItem, IssueCategory } from '../types.js';

interface AuditTodoSectionProps {
  initialTodos: TodoItem[];
  domain: string;
}

export const AuditTodoSection: React.FC<AuditTodoSectionProps> = ({ initialTodos, domain }) => {
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    // Attempt to load from localStorage for state persistence
    try {
      const stored = localStorage.getItem(`websitexray_todos_${domain}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return initialTodos;
  });

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);

  const toggleTodo = (id: string) => {
    const updated = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setTodos(updated);
    try {
      localStorage.setItem(`websitexray_todos_${domain}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const markAllComplete = () => {
    const updated = todos.map((t) => ({ ...t, completed: true }));
    setTodos(updated);
    try {
      localStorage.setItem(`websitexray_todos_${domain}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const resetAll = () => {
    const updated = todos.map((t) => ({ ...t, completed: false }));
    setTodos(updated);
    try {
      localStorage.setItem(`websitexray_todos_${domain}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleCopyMarkdown = () => {
    const md = [
      `# WebsiteXRay Implementation To-Do List for ${domain}`,
      `Generated under Strict Technical & SEO Marking Criteria\n`,
      ...todos.map(
        (t) => `- [${t.completed ? 'x' : ' '}] **[${t.category}]** (${t.priority} Priority): ${t.text}`
      ),
    ].join('\n');

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const progressPercent = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  const uniqueCategories: string[] = Array.from(new Set<string>(todos.map((t) => String(t.category))));
  const categories: string[] = ['ALL', ...uniqueCategories];

  const filteredTodos = activeCategory === 'ALL'
    ? todos
    : todos.filter((t) => t.category === activeCategory);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'High':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'Medium':
        return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
      default:
        return 'text-slate-400 border-white/10 bg-white/5';
    }
  };

  return (
    <div id="audit-todo-section" className="p-6 rounded-sm bg-[#0A0D12] border border-white/10 space-y-5 shadow-2xl">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-sm bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ListTodo className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black uppercase tracking-tight text-white">
                Implementation To-Do Checklist
              </h3>
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/30">
                Strict Criteria
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive task tracker for developers and webmasters to remediate flagged audit deficiencies.
            </p>
          </div>
        </div>

        {/* Progress & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-copy-todos-markdown"
            onClick={handleCopyMarkdown}
            className="px-3 py-1.5 rounded-sm bg-[#05070A] hover:bg-[#0D1117] border border-white/10 hover:border-cyan-500/40 text-xs font-mono font-bold uppercase text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Copy tasks as Markdown checklist"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Tasks' : 'Copy To-Dos'}</span>
          </button>

          {completedCount < todos.length ? (
            <button
              id="btn-mark-all-done"
              onClick={markAllComplete}
              className="px-3 py-1.5 rounded-sm bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-mono font-bold uppercase text-cyan-300 transition-all flex items-center gap-1 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Mark All Done
            </button>
          ) : (
            <button
              id="btn-reset-todos"
              onClick={resetAll}
              className="px-3 py-1.5 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold uppercase text-slate-400 transition-all flex items-center gap-1 cursor-pointer"
            >
              Reset Tasks
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 uppercase">
            Remediation Progress: <span className="text-white font-bold">{completedCount} of {todos.length} Done</span>
          </span>
          <span className={`font-black ${progressPercent === 100 ? 'text-emerald-400' : 'text-cyan-400'}`}>
            {progressPercent}% Complete
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#05070A] border border-white/10 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              progressPercent === 100 ? 'bg-emerald-400' : 'bg-gradient-to-r from-cyan-500 to-cyan-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] font-mono font-bold uppercase text-slate-500 mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            id={`filter-todo-${cat.toLowerCase()}`}
            onClick={() => setActiveCategory(cat)}
            className={`px-2.5 py-1 rounded-sm text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-cyan-500 text-black shadow-sm'
                : 'bg-[#05070A] text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2 pt-2">
        {filteredTodos.length === 0 ? (
          <div className="p-6 text-center text-xs font-mono text-slate-500">
            No to-do items found in this category.
          </div>
        ) : (
          filteredTodos.map((todo) => {
            const isDone = todo.completed;
            const priorityClass = getPriorityColor(todo.priority);

            return (
              <div
                key={todo.id}
                id={`todo-row-${todo.id}`}
                onClick={() => toggleTodo(todo.id)}
                className={`p-3 rounded-sm border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  isDone
                    ? 'bg-[#05070A]/50 border-white/5 opacity-60'
                    : 'bg-[#05070A] hover:bg-[#0D1117] border-white/10 hover:border-cyan-500/30'
                }`}
              >
                <div className="mt-0.5 text-cyan-400 flex-shrink-0">
                  {isDone ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500 hover:text-cyan-400" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-sm border ${priorityClass}`}
                    >
                      {todo.priority}
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                      [{todo.category}]
                    </span>
                  </div>

                  <p
                    className={`text-xs font-mono leading-relaxed transition-all ${
                      isDone ? 'line-through text-slate-500' : 'text-slate-200'
                    }`}
                  >
                    {todo.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
