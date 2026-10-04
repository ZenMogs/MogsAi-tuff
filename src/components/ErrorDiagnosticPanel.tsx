import React from 'react';
import { Bug, CheckCircle, AlertTriangle, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { DebugEntry } from '../types/mogsai';

interface ErrorDiagnosticPanelProps {
  debugHistory: DebugEntry[];
  onTriggerAutoFix?: () => void;
}

export const ErrorDiagnosticPanel: React.FC<ErrorDiagnosticPanelProps> = ({
  debugHistory,
  onTriggerAutoFix,
}) => {
  return (
    <div className="p-3 sm:p-4 space-y-4 text-xs font-mono text-gray-300">
      <div className="flex flex-wrap items-center justify-between border-b border-[#1f293d] pb-3 gap-2">
        <div className="flex items-center space-x-2">
          <Bug className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="font-semibold text-white text-sm font-sans">
            Error Diagnostics
          </span>
        </div>
        <span className="text-[10px] sm:text-[11px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
          {debugHistory.length} Issue(s) Diagnosed & Resolved
        </span>
      </div>

      {debugHistory.length === 0 ? (
        <div className="bg-[#0f1422] border border-[#1f293d] rounded-lg p-6 text-center text-gray-400 space-y-2">
          <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto" />
          <h4 className="text-white font-medium text-sm font-sans">Clean Build & Zero Errors</h4>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            The project passed all compilation, YAML schema, bytecode target, and sandbox checks without requiring autonomous patching.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {debugHistory.map((entry) => (
            <div
              key={entry.id}
              className="bg-[#0f1422] border border-[#232f48] rounded-lg p-4 space-y-3 shadow-lg"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="p-1 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    <ShieldAlert className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-bold text-red-300 text-xs">{entry.errorType}</span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">{entry.timestamp}</span>
              </div>

              {/* Grid breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] bg-[#090d15] p-3 rounded border border-[#1a2336]">
                <div>
                  <span className="text-gray-500 uppercase tracking-wider block font-semibold text-[10px] mb-1">
                    Failed File & Location:
                  </span>
                  <span className="text-amber-300 font-mono">{entry.file}</span>
                </div>

                <div>
                  <span className="text-gray-500 uppercase tracking-wider block font-semibold text-[10px] mb-1">
                    Resolution Status:
                  </span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    AUTONOMOUSLY REPAIRED
                  </span>
                </div>
              </div>

              {/* Why it happened */}
              <div className="space-y-1">
                <span className="text-gray-400 font-semibold block text-[10px] uppercase tracking-wider">
                  Root Cause Diagnosis:
                </span>
                <p className="text-gray-300 bg-[#121826] p-2.5 rounded border border-[#1b253b] leading-relaxed">
                  {entry.cause}
                </p>
              </div>

              {/* What MogsAI changed */}
              <div className="space-y-1">
                <span className="text-emerald-400 font-semibold block text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Autonomous Code Patch Applied:
                </span>
                <p className="text-emerald-200 bg-emerald-950/20 p-2.5 rounded border border-emerald-500/30 leading-relaxed">
                  {entry.fixApplied}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
