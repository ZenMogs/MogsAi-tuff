import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Trash2, Copy, Check, ShieldCheck, Download, AlertCircle } from 'lucide-react';

export interface LogLine {
  text: string;
  type: 'info' | 'warn' | 'error' | 'success';
  timestamp: string;
}

interface BuildConsoleProps {
  logs: LogLine[];
  onClear: () => void;
  isBuilding: boolean;
}

export const BuildConsole: React.FC<BuildConsoleProps> = ({ logs, onClear, isBuilding }) => {
  const [filter, setFilter] = useState<'all' | 'error' | 'warn'>('all');
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCopyLogs = () => {
    const raw = logs.map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = logs.filter((l) => {
    if (filter === 'error') return l.type === 'error';
    if (filter === 'warn') return l.type === 'warn' || l.type === 'error';
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#080b11] border-t border-[#1a2233] text-gray-300 font-mono text-xs select-text">
      {/* Console Header Bar */}
      <div className="min-h-9 px-3 py-1 bg-[#0d121c] border-b border-[#1a2233] flex items-center justify-between select-none gap-2 min-w-0">
        <div className="flex items-center space-x-1.5 min-w-0 truncate">
          <Terminal className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span className="font-semibold text-gray-300 text-[11px] uppercase tracking-wider font-sans truncate">
            Compiler Sandbox
          </span>
          <span className="hidden sm:inline-flex items-center space-x-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
            <ShieldCheck className="h-3 w-3" />
            <span>Sandbox</span>
          </span>
        </div>

        {/* Filter and controls */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <div className="flex items-center bg-[#141b27] border border-[#222b3e] rounded p-0.5 text-[10px]">
            <button
              onClick={() => setFilter('all')}
              className={`px-1.5 sm:px-2 py-0.5 rounded ${filter === 'all' ? 'bg-[#222b3e] text-white font-medium' : 'text-gray-400'}`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setFilter('warn')}
              className={`px-1.5 sm:px-2 py-0.5 rounded ${filter === 'warn' ? 'bg-amber-950/40 text-amber-300' : 'text-gray-400'}`}
            >
              Warn
            </button>
            <button
              onClick={() => setFilter('error')}
              className={`px-1.5 sm:px-2 py-0.5 rounded ${filter === 'error' ? 'bg-red-950/40 text-red-300' : 'text-gray-400'}`}
            >
              Error
            </button>
          </div>

          <button
            onClick={handleCopyLogs}
            className="p-1 rounded hover:bg-[#1a2233] text-gray-400 hover:text-white transition-colors"
            title="Copy logs"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={onClear}
            className="p-1 rounded hover:bg-[#1a2233] text-gray-400 hover:text-white transition-colors"
            title="Clear logs"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal log view */}
      <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] leading-5 space-y-0.5 custom-scrollbar">
        {filteredLogs.map((log, idx) => {
          let color = 'text-gray-300';
          if (log.type === 'success') color = 'text-emerald-400 font-medium';
          if (log.type === 'warn') color = 'text-amber-300 font-medium';
          if (log.type === 'error') color = 'text-red-400 font-bold';

          return (
            <div key={idx} className="flex items-start space-x-2.5 hover:bg-[#0f1420] px-1 py-0.5 rounded">
              <span className="text-gray-600 select-none shrink-0 font-mono text-[10px]">{log.timestamp}</span>
              <span className={`flex-1 break-all ${color}`}>{log.text}</span>
            </div>
          );
        })}

        {isBuilding && (
          <div className="flex items-center space-x-2 text-cyan-400 pt-1">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono text-xs">MogsAI Agent pipeline executing tasks in isolated sandbox...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
